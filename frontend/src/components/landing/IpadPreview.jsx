import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { BookOpen, ListChecks, CalendarRange, Sparkles } from "lucide-react";
import { usePersonalization } from "@/context/PersonalizationContext";

/**
 * IpadPreview — Custom landscape iPad mockup showing the prep/study side
 * of TeachBack AI: current session, uploaded notes, warm-up questions, and
 * a weekly review schedule. Reflects the selected subject from context.
 */
export default function IpadPreview({ className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.2 });
  const { selections, studyMode } = usePersonalization();
  const subject = selections.subject;

  // Subtle progress bar for "Plan progress this week"
  const target = 48;
  const [progress, setProgress] = useState(reduce ? target : 0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setProgress(target);
      return;
    }
    setProgress(0);
    const start = performance.now();
    const duration = 1100;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, subject?.id]);

  const notes = NOTES_BY_SUBJECT[subject?.id] || NOTES_BY_SUBJECT.biology;
  const warmups = WARMUPS_BY_SUBJECT[subject?.id] || WARMUPS_BY_SUBJECT.biology;

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      data-testid="ipad-preview"
      aria-label="TeachBack AI iPad preview"
    >
      {/* Cyan glow behind iPad */}
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 rounded-[80px] blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,229,255,0.16), transparent 70%)",
        }}
      />

      {/* iPad frame (landscape) */}
      <div className={`relative ${reduce ? "" : "tb-float"}`} style={{ animationDelay: "-2s" }}>
        {/* Apple Pencil / stylus resting on iPad's top edge, slightly tilted */}
        <div
          aria-hidden="true"
          className="absolute z-30"
          style={{
            top: "-8px",
            left: "26%",
            transform: "rotate(-4deg)",
            transformOrigin: "center center",
            filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.55))",
          }}
          data-testid="hero-stylus"
        >
          <Stylus />
        </div>
        <div
          className="relative w-[400px] sm:w-[440px] md:w-[480px] lg:w-[500px] rounded-[28px] border border-white/10 p-[8px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
            boxShadow:
              "0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          {/* Screen — 16:11 landscape aspect */}
          <div
            className="relative overflow-hidden rounded-[20px] bg-[#05070D]"
            style={{ aspectRatio: "16 / 11" }}
          >
            {/* Subtle radial inside */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(420px circle at 10% 0%, rgba(0,229,255,0.10), transparent 55%), radial-gradient(360px circle at 90% 100%, rgba(42,246,214,0.08), transparent 60%)",
              }}
            />

            {/* Top bar */}
            <div className="relative z-10 flex items-center justify-between px-4 sm:px-5 pt-3">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] border border-white/10 bg-[rgba(0,229,255,0.08)]"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 6h16M4 12h12M4 18h8"
                      stroke="#00E5FF"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="font-heading text-[11px] font-semibold tracking-tight">
                  <span className="text-white">TeachBack</span>
                  <span className="text-[#00E5FF]"> AI</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase tracking-[0.18em] text-white/45">Prep</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span className="text-[9px] uppercase tracking-[0.18em] text-[#00E5FF]/80">Study Plan</span>
              </div>
            </div>

            {/* Session header */}
            <div className="relative z-10 px-4 sm:px-5 mt-2 flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-white/45">
                  Current Session
                </p>
                <h4
                  className="mt-0.5 font-heading text-[14px] sm:text-[16px] font-semibold text-white"
                  data-testid="ipad-preview-subject"
                >
                  {subject?.label || "Biology"}
                  <span className="text-white/45 font-medium"> · {subject?.topic?.split("·")[1]?.trim() || "Mitosis"}</span>
                </h4>
              </div>
              <span
                className="inline-flex items-center gap-1 rounded-full border border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.08)] px-2 py-0.5 text-[9px] font-medium text-[#00E5FF]"
                data-testid="ipad-preview-mode-badge"
              >
                <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                {studyMode
                  ? selections.mode?.label || "Focused Mode"
                  : "Focused Mode"}
              </span>
            </div>

            {/* Body grid */}
            <div className="relative z-10 mx-4 sm:mx-5 mt-3 grid grid-cols-12 gap-2.5">
              {/* LEFT: Uploaded Notes */}
              <div className="col-span-5 rounded-xl border border-white/10 bg-[rgba(10,16,28,0.6)] p-2.5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3 text-[#00E5FF]" aria-hidden="true" />
                  <p className="text-[9px] uppercase tracking-[0.16em] text-white/55">
                    Uploaded Notes
                  </p>
                </div>
                <ul className="mt-1.5 space-y-1 text-[10px] text-white/80">
                  {notes.map((n) => (
                    <li key={n} className="flex items-start gap-1.5">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                      <span className="truncate">{n}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* MIDDLE: Warm-up Questions */}
              <div className="col-span-7 rounded-xl border border-white/10 bg-[rgba(10,16,28,0.6)] p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ListChecks className="h-3 w-3 text-[#2AF6D6]" aria-hidden="true" />
                    <p className="text-[9px] uppercase tracking-[0.16em] text-white/55">
                      Warm-Up Questions
                    </p>
                  </div>
                  <span className="text-[9px] text-white/40">3 prompts</span>
                </div>
                <ol className="mt-1.5 space-y-1 text-[10px] text-white/85">
                  {warmups.map((q, i) => (
                    <li key={q} className="flex gap-1.5">
                      <span className="text-[#00E5FF]/85 font-medium">{i + 1}.</span>
                      <span className="truncate">{q}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Study Plan row */}
            <div className="relative z-10 mx-4 sm:mx-5 mt-2.5 rounded-xl border border-white/10 bg-[rgba(10,16,28,0.6)] p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CalendarRange className="h-3 w-3 text-[#00E5FF]" aria-hidden="true" />
                  <p className="text-[9px] uppercase tracking-[0.16em] text-white/55">
                    Study Plan · This Week
                  </p>
                </div>
                <span className="text-[9px] text-white/40">7-day plan</span>
              </div>
              <div className="mt-1.5 grid grid-cols-7 gap-1">
                {WEEK_DAYS.map((d, i) => (
                  <WeekDayCell key={d} day={d} dayIndex={i} todayIndex={3} />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  data-testid="ipad-preview-plan-progress"
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background:
                        "linear-gradient(90deg, #00E5FF 0%, #2AF6D6 100%)",
                    }}
                  />
                </div>
                <span className="text-[9px] font-medium text-[#00E5FF]">
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stylus() {
  // CSS-built stylus / pencil, brushed-aluminum body with subtle highlight + tip
  return (
    <div
      className="relative h-3 w-[200px] sm:w-[230px] rounded-full"
      style={{
        background:
          "linear-gradient(180deg, #6B7896 0%, #3E465A 38%, #232A3B 70%, #161B2A 100%)",
        boxShadow:
          "0 6px 14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.45)",
      }}
    >
      {/* Long highlight along top of the body */}
      <span
        className="absolute inset-x-3 top-[2px] h-[2px] rounded-full opacity-80"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 35%, rgba(255,255,255,0.85) 65%, transparent 100%)",
        }}
      />
      {/* Flat end cap (back) */}
      <span
        className="absolute left-0 top-0 h-3 w-[12px] rounded-l-full"
        style={{
          background:
            "linear-gradient(180deg, #5A6379 0%, #1B2030 100%)",
          boxShadow: "inset -1px 0 0 rgba(255,255,255,0.06)",
        }}
      />
      {/* Tapered tip with white plastic + cyan glow */}
      <span
        className="absolute -right-[16px] top-1/2 -translate-y-1/2 h-2.5 w-[22px]"
        style={{
          clipPath: "polygon(0% 0%, 100% 50%, 0% 100%)",
          background:
            "linear-gradient(90deg, #C7CDD8 0%, #EFF3FA 70%, #FFFFFF 100%)",
          filter: "drop-shadow(0 0 8px rgba(0,229,255,0.55))",
        }}
      />
      {/* Cyan ring near tip */}
      <span
        className="absolute right-[1px] top-1/2 -translate-y-1/2 h-3 w-[4px] rounded-sm"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,229,255,0.45), rgba(0,229,255,0.85))",
          boxShadow: "0 0 10px rgba(0,229,255,0.7)",
        }}
      />
    </div>
  );
}

/* ----------------------------- WeekDayCell ----------------------------- */
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCellClass({ isToday, isDone }) {
  if (isToday) return "border-[rgba(0,229,255,0.5)] bg-[rgba(0,229,255,0.1)]";
  if (isDone) return "border-white/10 bg-[rgba(42,246,214,0.06)]";
  return "border-white/10 bg-transparent";
}

function getDotClass({ isToday, isDone }) {
  if (isDone) return "bg-[#2AF6D6]";
  if (isToday) return "bg-[#00E5FF]";
  return "bg-white/15";
}

function WeekDayCell({ day, dayIndex, todayIndex }) {
  const isToday = dayIndex === todayIndex;
  const isDone = dayIndex < todayIndex;
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-md border px-1 py-1 ${getCellClass(
        { isToday, isDone }
      )}`}
    >
      <span
        className={`text-[8px] uppercase tracking-wider ${
          isToday ? "text-[#00E5FF]" : "text-white/45"
        }`}
      >
        {day}
      </span>
      <span
        className={`mt-0.5 h-1.5 w-1.5 rounded-full ${getDotClass({
          isToday,
          isDone,
        })}`}
      />
    </div>
  );
}

const NOTES_BY_SUBJECT = {
  biology: [
    "Mitosis vs Meiosis",
    "Phases: Prophase → Anaphase",
    "Cytokinesis details",
    "Cell cycle checkpoints",
    "Common exam pitfalls",
  ],
  chemistry: [
    "SN1 vs SN2 mechanisms",
    "Stereochemistry basics",
    "Leaving group strength",
    "Solvent effects",
    "Rate-limiting steps",
  ],
  physics: [
    "Newton's three laws",
    "Free-body diagrams",
    "Tension & friction",
    "Acceleration vectors",
    "Common derivations",
  ],
  math: [
    "Derivative rules",
    "Chain rule examples",
    "Implicit differentiation",
    "Optimization setup",
    "Common edge cases",
  ],
  history: [
    "Causes of WWII",
    "Major Pacific battles",
    "Lend-Lease and economics",
    "Postwar treaties",
    "Key figures",
  ],
  english: [
    "Themes vs motifs",
    "Narrative voice",
    "Symbolism examples",
    "Thesis structure",
    "Evidence integration",
  ],
  other: [
    "Concept summary",
    "Key terms",
    "Worked examples",
    "Common mistakes",
    "Edge cases",
  ],
};

const WARMUPS_BY_SUBJECT = {
  biology: [
    "Explain mitosis vs meiosis in one sentence.",
    "What ends prophase?",
    "Why do checkpoints exist?",
  ],
  chemistry: [
    "When does SN1 win over SN2?",
    "Pick the best leaving group.",
    "Effect of polar protic solvent?",
  ],
  physics: [
    "State Newton's 2nd law in your words.",
    "How do free-body diagrams help?",
    "Difference between mass and weight?",
  ],
  math: [
    "Why does the chain rule work?",
    "When is implicit differentiation needed?",
    "Set up an optimization problem.",
  ],
  history: [
    "Top 3 causes of WWII?",
    "What was the turning point in the Pacific?",
    "How did Lend-Lease shift the war?",
  ],
  english: [
    "Theme vs motif — in one line.",
    "How does voice shape meaning?",
    "What makes a strong thesis?",
  ],
  other: [
    "Define the topic in plain language.",
    "State one example you remember.",
    "Name one common mistake.",
  ],
};
