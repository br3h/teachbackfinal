import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Confetti from "@/components/landing/Confetti";
import useWaitlistForm from "@/hooks/useWaitlistForm";
import {
  usePersonalization,
  STUDY_MODES,
  SUBJECTS,
  PERSONAS,
  DEFAULT_CTA,
} from "@/context/PersonalizationContext";

const API = "/api";
const CONSENT_VERSION = "v1.0";

export default function Waitlist() {
  const reduce = useReducedMotion();
  const {
    studyMode,
    setStudyMode,
    subject,
    setSubject,
    persona,
    setPersona,
    ctaHeadline,
  } = usePersonalization();
  const [showOptions, setShowOptions] = useState(false);

  const {
    email,
    setEmail,
    hp,
    setHp,
    consent,
    setConsent,
    status,
    message,
    isLoading,
    isSuccess,
    isDuplicate,
    isError,
    isDone,
    canSubmit,
    submit,
    reset,
  } = useWaitlistForm({
    apiBase: API,
    consentVersion: CONSENT_VERSION,
    extras: { persona, mainGoal: studyMode, subject },
  });

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    reset();
  };

  const handleConsentChange = (v) => {
    setConsent(!!v);
    if (isError && v) reset();
  };

  return (
    <section
      id="waitlist"
      className="relative py-20 sm:py-24 lg:py-28 border-t border-white/5"
      data-testid="waitlist-section"
    >
      {/* Subtle background accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(560px circle at 50% 0%, rgba(0,229,255,0.12), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#00E5FF]/80">
            Early access
          </p>
          <h2
            className="mt-3 font-heading text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-white leading-[1.1]"
            data-testid="waitlist-headline"
          >
            Find your gaps before the test does.
          </h2>
          <p
            className="mt-4 text-soft"
            data-testid="waitlist-cta-line"
          >
            {ctaHeadline === DEFAULT_CTA
              ? "Join the waitlist for early access to TeachBack AI."
              : ctaHeadline}
          </p>
        </motion.div>

        {/* Glowing CTA wrapper */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 mx-auto max-w-xl"
        >
          <div
            className="relative rounded-[28px] border border-white/10 bg-[rgba(10,16,28,0.6)] backdrop-blur-xl p-5 sm:p-6 text-left"
            style={{
              boxShadow:
                "0 0 0 1px rgba(0,229,255,0.14), 0 0 34px rgba(0,229,255,0.10)",
            }}
          >
            <form
              onSubmit={submit}
              noValidate
              data-testid="waitlist-form"
              aria-label="Join TeachBack AI waitlist"
            >
              {/* Honeypot field — hidden from real users */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  top: "auto",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                }}
              >
                <Label htmlFor="hp-field">Leave this field empty</Label>
                <Input
                  id="hp-field"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                />
              </div>

              <Label htmlFor="waitlist-email" className="sr-only">
                Your email address
              </Label>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <div className="relative flex-1">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
                    aria-hidden="true"
                  />
                  <Input
                    id="waitlist-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isLoading || isDone}
                    aria-invalid={isError}
                    aria-describedby="waitlist-status"
                    className={`h-12 min-h-[48px] rounded-[20px] pl-11 pr-4 text-base bg-[rgba(10,16,28,0.6)] border ${
                      isError ? "border-[#FF4D6D]/60" : "border-white/10"
                    } text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-[#00E5FF]/40 focus-visible:border-[#00E5FF]/40 transition-[box-shadow,border-color] duration-200`}
                    data-testid="waitlist-email-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="relative h-12 min-h-[48px] rounded-[20px] px-6 bg-[#00E5FF] text-[#05070D] font-semibold hover:bg-[#00E5FF] hover:brightness-105 hover:shadow-[0_0_0_1px_rgba(0,229,255,0.22),0_0_34px_rgba(0,229,255,0.16)] transition-[box-shadow,filter] duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#00E5FF]/40"
                  data-testid="waitlist-submit-button"
                >
                  {/* Confetti burst when submission succeeds */}
                  <Confetti trigger={isSuccess} />
                  <SubmitLabel isLoading={isLoading} isDone={isDone} />
                </Button>
              </div>

              {/* Optional personalization quick edit */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowOptions((s) => !s)}
                  className="text-xs text-muted-soft hover:text-white transition-colors"
                  data-testid="waitlist-toggle-options"
                  aria-expanded={showOptions}
                >
                  {showOptions ? "Hide personalization" : "Personalize my early access (optional)"}
                </button>

                {showOptions && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3" data-testid="waitlist-options">
                    <SelectField
                      label="I am a"
                      value={persona}
                      onChange={setPersona}
                      options={[{ id: "", label: "Choose" }, ...PERSONAS]}
                      testId="waitlist-persona-select"
                    />
                    <SelectField
                      label="Main goal"
                      value={studyMode}
                      onChange={setStudyMode}
                      options={[{ id: "", label: "Choose" }, ...STUDY_MODES]}
                      testId="waitlist-goal-select"
                    />
                    <SelectField
                      label="Subject"
                      value={subject}
                      onChange={setSubject}
                      options={SUBJECTS}
                      testId="waitlist-subject-select"
                    />
                  </div>
                )}
              </div>

              {/* Consent */}
              <div className="mt-5 flex items-start gap-3">
                <Checkbox
                  id="waitlist-consent"
                  checked={consent}
                  onCheckedChange={handleConsentChange}
                  disabled={isLoading || isDone}
                  className="mt-0.5 h-5 w-5 border-white/20 data-[state=checked]:bg-[#00E5FF] data-[state=checked]:text-[#05070D] data-[state=checked]:border-[#00E5FF] focus-visible:ring-[#00E5FF]/40"
                  data-testid="waitlist-consent-checkbox"
                />
                <label
                  htmlFor="waitlist-consent"
                  className="text-xs leading-relaxed text-soft cursor-pointer select-none"
                  data-testid="waitlist-consent-label"
                >
                  I agree to the{" "}
                  <Link
                    to="/privacy"
                    className="text-[#00E5FF] hover:underline"
                    target="_blank"
                    rel="noopener"
                    data-testid="waitlist-link-privacy"
                  >
                    Privacy Policy
                  </Link>
                  ,{" "}
                  <Link
                    to="/terms"
                    className="text-[#00E5FF] hover:underline"
                    target="_blank"
                    rel="noopener"
                    data-testid="waitlist-link-terms"
                  >
                    Terms and Conditions
                  </Link>
                  , and{" "}
                  <Link
                    to="/data-compliance"
                    className="text-[#00E5FF] hover:underline"
                    target="_blank"
                    rel="noopener"
                    data-testid="waitlist-link-compliance"
                  >
                    Data &amp; Compliance Notice
                  </Link>
                  .
                </label>
              </div>

              {/* Status / helper */}
              <div
                id="waitlist-status"
                role="status"
                aria-live="polite"
                className="mt-4 min-h-[24px] text-sm"
                data-testid="waitlist-status-text"
              >
                {isSuccess && (
                  <span className="inline-flex items-center gap-2 text-[#2AF6D6]">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {message}
                  </span>
                )}
                {isDuplicate && (
                  <span className="inline-flex items-center gap-2 text-[#00E5FF]">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {message}
                  </span>
                )}
                {isError && (
                  <span className="inline-flex items-center gap-2 text-[#FF4D6D]">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {message}
                  </span>
                )}
                {status === "idle" && (
                  <span className="inline-flex items-start gap-1.5 text-muted-soft">
                    <ShieldCheck className="h-3.5 w-3.5 mt-0.5 text-[#00E5FF]/80 shrink-0" aria-hidden="true" />
                    <span>
                      No spam. Just product updates and early access news from{" "}
                      <a
                        href="mailto:updates@teachback.dev"
                        className="hover:text-[#00E5FF] transition-colors break-words"
                      >
                        updates@teachback.dev
                      </a>
                      .
                    </span>
                  </span>
                )}
              </div>
            </form>
          </div>
        </motion.div>

        {/* Trust row */}
        <div className="mt-6 flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-xs text-muted-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
            Early invites in batches
          </span>
          <span className="hidden sm:inline text-white/15">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2AF6D6]" />
            Your email stays private
          </span>
          <span className="hidden sm:inline text-white/15">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            Built for serious learners
          </span>
        </div>
      </div>
    </section>
  );
}

function SubmitLabel({ isLoading, isDone }) {
  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Joining…
      </span>
    );
  }
  if (isDone) return "On the list";
  return "Join Waitlist";
}

function SelectField({ label, value, onChange, options, testId }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.16em] text-white/55 mb-1">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
        className="w-full h-11 min-h-[44px] rounded-[14px] bg-[rgba(10,16,28,0.6)] border border-white/10 text-white text-base px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/40 focus-visible:border-[#00E5FF]/40"
      >
        {options.map((o) => (
          <option key={o.id || "none"} value={o.id} className="bg-[#0A1019]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
