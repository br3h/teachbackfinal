from fastapi import FastAPI, APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
from pymongo.errors import DuplicateKeyError
import asyncio
import os
import re
import csv
import io
import hashlib
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone
import httpx


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# IP hash salt (use env var, fallback only for dev)
IP_HASH_SALT = os.environ.get('IP_HASH_SALT', 'teachback-default-salt-change-me')
# Optional admin token to protect waitlist export endpoint
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '')
# Optional Make.com webhook URL for Google Sheets sync (server-side only \u2014
# never exposed to the frontend)
MAKE_WAITLIST_WEBHOOK_URL = os.environ.get('MAKE_WAITLIST_WEBHOOK_URL', '').strip()

# Current consent version
CONSENT_VERSION_CURRENT = "v1.0"

# Allowed personalization values (kept loose by default; we validate length/whitelist)
ALLOWED_PERSONAS = {"student", "parent", "tutor", ""}
ALLOWED_GOALS = {"exam-prep", "homework-help", "notes-review", "last-minute", ""}
ALLOWED_SUBJECTS = {
    "biology", "chemistry", "physics", "math", "history", "english", "other", ""
}

# Create the main app without a prefix
app = FastAPI(title="TeachBack AI Waitlist API", version="1.1.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ---------------------------------------------------------------------------
# Legacy status models (kept for backwards compatibility with template)
# ---------------------------------------------------------------------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str

# ---------------------------------------------------------------------------
# Waitlist models
# ---------------------------------------------------------------------------
EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")
MAX_EMAIL_LENGTH = 254  # RFC 5321


def _norm_choice(v: Optional[str], allowed: set, max_len: int = 40) -> str:
    """Trim, lowercase, validate against an allow-list."""
    if v is None:
        return ""
    if not isinstance(v, str):
        raise ValueError("Invalid value")
    s = v.strip().lower()
    if len(s) > max_len:
        raise ValueError("Value is too long")
    if s and s not in allowed:
        # Don't crash hard — just clear it. Keeps form forgiving.
        return ""
    return s


class WaitlistCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    email: str
    # Optional personalization fields
    persona: Optional[str] = Field(default="", max_length=40)
    mainGoal: Optional[str] = Field(default="", max_length=40)
    subject: Optional[str] = Field(default="", max_length=40)
    # Consent
    consentAccepted: bool = False
    consentVersion: Optional[str] = Field(default=CONSENT_VERSION_CURRENT, max_length=20)
    # Honeypot field - bots will fill it. Humans should leave it empty.
    hp: Optional[str] = Field(default=None, max_length=200)
    source: Optional[str] = Field(default="landing-page", max_length=80)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Email must be a string")
        v = v.strip().lower()
        if not v:
            raise ValueError("Email is required")
        if len(v) > MAX_EMAIL_LENGTH:
            raise ValueError("Email is too long")
        if not EMAIL_REGEX.match(v):
            raise ValueError("Please enter a valid email address")
        return v

    @field_validator("persona")
    @classmethod
    def v_persona(cls, v):
        return _norm_choice(v, ALLOWED_PERSONAS)

    @field_validator("mainGoal")
    @classmethod
    def v_goal(cls, v):
        return _norm_choice(v, ALLOWED_GOALS)

    @field_validator("subject")
    @classmethod
    def v_subject(cls, v):
        return _norm_choice(v, ALLOWED_SUBJECTS)

    @field_validator("consentVersion")
    @classmethod
    def v_consent_version(cls, v):
        if v is None:
            return CONSENT_VERSION_CURRENT
        v = str(v).strip()
        return v[:20] if v else CONSENT_VERSION_CURRENT


class WaitlistEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    persona: str = ""
    mainGoal: str = ""
    subject: str = ""
    source: str = "landing-page"
    status: str = "joined"
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    consentAccepted: bool = True
    consentVersion: str = CONSENT_VERSION_CURRENT
    consentTimestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    userAgent: Optional[str] = None
    ipHash: Optional[str] = None


class WaitlistResponse(BaseModel):
    status: Literal["success", "duplicate"]
    message: str

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _hash_ip(ip: Optional[str]) -> Optional[str]:
    if not ip:
        return None
    try:
        return hashlib.sha256(f"{IP_HASH_SALT}::{ip}".encode("utf-8")).hexdigest()
    except Exception:
        return None


def _client_ip(request: Request) -> Optional[str]:
    # Honor common reverse proxy headers (Kubernetes ingress, CDNs).
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    if request.client:
        return request.client.host
    return None


def _require_admin(request: Request) -> None:
    if not ADMIN_TOKEN:
        # If no admin token is configured, treat the export route as disabled.
        raise HTTPException(status_code=404, detail="Not found")
    provided = request.headers.get("x-admin-token", "")
    if provided != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


async def _post_to_make_webhook(email: str, registered_at_iso: str) -> None:
    """Send only {registeredAt, email} to the Make.com webhook.

    Fire-and-forget: this is scheduled as a background task so the user's
    waitlist response is never delayed. Failures are logged but never
    surfaced to the client because the email is already safely stored in
    the database.
    """
    if not MAKE_WAITLIST_WEBHOOK_URL:
        return  # Integration disabled \u2014 no-op
    payload = {
        "registeredAt": registered_at_iso,
        "email": email,
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                MAKE_WAITLIST_WEBHOOK_URL,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
        if 200 <= resp.status_code < 300:
            logger.info("Make webhook sync OK for %s (status %s)", email, resp.status_code)
        else:
            logger.error(
                "Make webhook sync FAILED for %s \u2014 status %s, body=%s",
                email, resp.status_code, (resp.text or "")[:300],
            )
    except Exception as exc:  # noqa: BLE001
        # Never propagate \u2014 the DB write already succeeded, the user gets success.
        logger.exception("Make webhook sync raised an exception for %s: %s", email, exc)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "TeachBack AI API is running"}


@api_router.get("/health")
async def health():
    try:
        # Ping mongo
        await db.command("ping")
        return {"status": "ok"}
    except Exception as exc:  # noqa: BLE001
        logger.exception("Health check failed: %s", exc)
        raise HTTPException(status_code=503, detail="Database unavailable")


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


SUCCESS_MESSAGE = "You're on the list. We'll email you when early access opens."
DUPLICATE_MESSAGE = "You're already on the waitlist. We'll email you when early access opens."
CONSENT_REQUIRED_MESSAGE = (
    "Please accept the Privacy Policy, Terms, and Data & Compliance Notice "
    "to join the waitlist."
)


def _build_waitlist_entry(payload: WaitlistCreate, request: Request) -> WaitlistEntry:
    """Build a normalized WaitlistEntry from the request payload + metadata."""
    user_agent = (request.headers.get("user-agent") or "")[:512] or None
    ip_hash = _hash_ip(_client_ip(request))
    now = datetime.now(timezone.utc)
    return WaitlistEntry(
        email=payload.email,
        persona=payload.persona or "",
        mainGoal=payload.mainGoal or "",
        subject=payload.subject or "",
        source=(payload.source or "landing-page")[:80],
        consentAccepted=True,
        consentVersion=payload.consentVersion or CONSENT_VERSION_CURRENT,
        consentTimestamp=now,
        createdAt=now,
        userAgent=user_agent,
        ipHash=ip_hash,
    )


def _entry_to_mongo_doc(entry: WaitlistEntry) -> dict:
    """Convert a WaitlistEntry to a MongoDB-friendly document (ISO datetimes)."""
    doc = entry.model_dump()
    doc["createdAt"] = doc["createdAt"].isoformat()
    doc["consentTimestamp"] = doc["consentTimestamp"].isoformat()
    return doc


def _schedule_make_sync(email: str, registered_at_iso: str) -> None:
    """Fire-and-forget background task to sync to Make.com (Google Sheets).

    Never raises \u2014 a failure here must not affect the user-facing response,
    because the email is already safely persisted in MongoDB.
    """
    try:
        asyncio.create_task(_post_to_make_webhook(email, registered_at_iso))
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to schedule Make webhook task: %s", exc)


@api_router.post("/waitlist", response_model=WaitlistResponse)
async def join_waitlist(payload: WaitlistCreate, request: Request):
    """Add an email to the TeachBack AI waitlist.

    Required: email, consentAccepted=True. Optional: persona, mainGoal, subject.
    Returns status \"success\" when newly added, \"duplicate\" when already present.
    """
    # Honeypot: pretend success without writing
    if payload.hp:
        logger.info("Honeypot triggered for waitlist signup; ignoring")
        return WaitlistResponse(status="success", message=SUCCESS_MESSAGE)

    # Consent is required
    if not payload.consentAccepted:
        raise HTTPException(status_code=400, detail=CONSENT_REQUIRED_MESSAGE)

    entry = _build_waitlist_entry(payload, request)
    doc = _entry_to_mongo_doc(entry)

    try:
        await db.waitlist.insert_one(doc)
    except DuplicateKeyError:
        return WaitlistResponse(status="duplicate", message=DUPLICATE_MESSAGE)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to insert waitlist entry: %s", exc)
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")

    logger.info(
        "Waitlist signup: %s (persona=%s goal=%s subject=%s)",
        entry.email, entry.persona, entry.mainGoal, entry.subject,
    )
    _schedule_make_sync(entry.email, doc["createdAt"])
    return WaitlistResponse(status="success", message=SUCCESS_MESSAGE)


@api_router.get("/waitlist/count")
async def waitlist_count():
    """Public counter — returns total waitlist signups."""
    try:
        count = await db.waitlist.count_documents({})
        return {"count": count}
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to count waitlist: %s", exc)
        raise HTTPException(status_code=500, detail="Unable to fetch count")


@api_router.get("/waitlist/export")
async def waitlist_export(request: Request):
    """Admin-only CSV export.

    Requires an `x-admin-token` header that matches the `ADMIN_TOKEN`
    environment variable. If the variable is not configured, the endpoint
    responds as 404 (effectively disabled).
    """
    _require_admin(request)
    try:
        cursor = db.waitlist.find({}, {"_id": 0}).sort("createdAt", ASCENDING)
        rows = await cursor.to_list(length=100000)
        # Build CSV in memory
        fieldnames = [
            "createdAt", "email", "persona", "mainGoal", "subject",
            "source", "status", "consentVersion", "consentTimestamp",
            "userAgent", "ipHash", "id",
        ]
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for r in rows:
            writer.writerow({k: r.get(k, "") for k in fieldnames})
        from fastapi.responses import Response
        return Response(
            content=buf.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=teachback_waitlist.csv"},
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to export waitlist: %s", exc)
        raise HTTPException(status_code=500, detail="Unable to export")


# Include the router in the main app
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Validation error handler returns clean JSON without leaking internals
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):  # noqa: ARG001
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
    )


@app.on_event("startup")
async def ensure_indexes():
    try:
        await db.waitlist.create_index([("email", ASCENDING)], unique=True, name="uniq_email")
        await db.waitlist.create_index([("createdAt", ASCENDING)], name="createdAt_idx")
        logger.info("Waitlist indexes ensured.")
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to ensure indexes: %s", exc)
    if MAKE_WAITLIST_WEBHOOK_URL:
        # Log only the host so the full URL is never written to logs in clear text
        try:
            from urllib.parse import urlparse
            host = urlparse(MAKE_WAITLIST_WEBHOOK_URL).netloc or "configured"
            logger.info("Make.com webhook sync ENABLED (host=%s)", host)
        except Exception:  # noqa: BLE001
            logger.info("Make.com webhook sync ENABLED")
    else:
        logger.info("Make.com webhook sync disabled (MAKE_WAITLIST_WEBHOOK_URL not set)")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
