import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { BookOpen, FileText, Sparkles } from "lucide-react";
import TiltCard from "@/components/landing/TiltCard";

/**
 * Research — evidence-backed section. Cites Roediger & Karpicke (2006) and
 * Dunlosky et al. (Psychological Science in the Public Interest) without
 * making causal claims about TeachBack AI's effect on grades.
 */
export default function Research() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <section
      id="research"
      className="relative py-16 sm:py-20 lg:py-24 border-t border-white/5"
      data-testid="research-section"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[#00E5FF]/80">
            The research
          </p>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-white leading-[1.1]">
            Rereading feels safe.
            <span className="block text-white/55">Retrieval proves what you know.</span>
          </h2>
          <p className="mt-4 text-soft text-[15px] sm:text-base leading-relaxed">
            Students often feel prepared because their notes look familiar.
            But real understanding means being able to explain the idea
            without help.
          </p>
        </div>

        {/* Stat cards */}
        <div
          ref={ref}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5"
          data-testid="research-stats"
        >
          <StatCard
            inView={inView}
            reduce={reduce}
            value={61}
            suffix="%"
            label="recall after retrieval practice"
            tone="primary"
            testId="stat-retrieval"
            delay={0}
          />
          <StatCard
            inView={inView}
            reduce={reduce}
            value={40}
            suffix="%"
            label="recall after repeated studying"
            tone="muted"
            testId="stat-restudy"
            delay={0.08}
          />
          <StatCard
            inView={inView}
            reduce={reduce}
            value={50}
            prefix="≈"
            suffix="%"
            label="higher relative recall in the study"
            tone="accent"
            testId="stat-relative"
            delay={0.16}
          />
        </div>

        {/* Source + insight strip */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
        >
          <div
            className="rounded-[24px] border border-white/10 bg-[rgba(10,16,28,0.6)] backdrop-blur-xl p-5 sm:p-6"
            data-testid="research-source-1"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#00E5FF]" aria-hidden="true" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                Roediger &amp; Karpicke, 2006
              </p>
            </div>
            <p className="mt-3 text-[14px] sm:text-[15px] leading-relaxed text-white/90">
              In a well-known study, students who practiced retrieval
              remembered <span className="text-[#00E5FF] font-semibold">61%</span>{" "}
              of the material after one week, compared to{" "}
              <span className="text-white font-semibold">40%</span> for
              students who only restudied — about{" "}
              <span className="text-[#00E5FF] font-semibold">50% higher</span>{" "}
              relative recall.
            </p>
          </div>
          <div
            className="rounded-[24px] border border-white/10 bg-[rgba(10,16,28,0.6)] backdrop-blur-xl p-5 sm:p-6"
            data-testid="research-source-2"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#00E5FF]" aria-hidden="true" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                Psychological Science in the Public Interest
              </p>
            </div>
            <p className="mt-3 text-[14px] sm:text-[15px] leading-relaxed text-white/90">
              A landmark review ranked{" "}
              <span className="text-white/60">rereading</span> and{" "}
              <span className="text-white/60">highlighting</span> as{" "}
              <span className="text-white">low-utility</span> study methods
              for long-term retention, while{" "}
              <span className="text-[#00E5FF] font-semibold">practice testing</span>{" "}
              and{" "}
              <span className="text-[#00E5FF] font-semibold">distributed practice</span>{" "}
              were ranked as high-utility.
            </p>
          </div>
        </motion.div>

        {/* Bridge to product */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 rounded-[24px] border border-[rgba(0,229,255,0.22)] bg-[rgba(0,229,255,0.04)] p-5 sm:p-6"
          data-testid="research-bridge"
        >
          <div className="flex items-start gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.08)]">
              <Sparkles className="h-4 w-4 text-[#00E5FF]" aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading text-[15px] sm:text-[16px] font-semibold text-white leading-snug">
                Active self-explanation works — but only if you know where
                you&rsquo;re wrong.
              </p>
              <p className="mt-2 text-[14px] sm:text-[15px] text-soft leading-relaxed">
                TeachBack AI adds the missing feedback loop: explain it out
                loud, find the gaps, and know exactly what to study next.
              </p>
            </div>
          </div>
        </motion.div>

        <p className="mt-6 text-[11px] text-muted-soft max-w-3xl">
          Statistics are drawn from the cited studies. TeachBack AI applies
          retrieval-practice principles — individual results vary and we
          make no claims about specific grade improvements.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------ Helpers ------------------------------ */
function StatCard({
  value,
  prefix = "",
  suffix = "",
  label,
  tone,
  testId,
  inView,
  reduce,
  delay = 0,
}) {
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setShown(value);
      return;
    }
    let raf;
    const start = performance.now();
    const duration = 1000;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value]);

  const colorMap = {
    primary: "text-[#00E5FF]",
    accent: "text-[#2AF6D6]",
    muted: "text-white/80",
  };
  const barFromTo = {
    primary: "from-[#00E5FF] to-[#2AF6D6]",
    accent: "from-[#2AF6D6] to-[#00E5FF]",
    muted: "from-white/40 to-white/20",
  };

  return (
    <TiltCard maxTilt={4}>
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
        whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[24px] border border-white/10 bg-[rgba(10,16,28,0.62)] backdrop-blur-xl p-5 sm:p-6"
        data-testid={testId}
      >
        <div className="flex items-baseline gap-1">
          {prefix && (
            <span className={`font-heading text-2xl sm:text-3xl font-semibold ${colorMap[tone]}`}>
              {prefix}
            </span>
          )}
          <span
            className={`font-heading text-[44px] sm:text-[56px] leading-none font-bold ${colorMap[tone]}`}
          >
            {shown}
          </span>
          <span className={`font-heading text-2xl sm:text-3xl font-semibold ${colorMap[tone]}`}>
            {suffix}
          </span>
        </div>
        <p className="mt-3 text-[13px] sm:text-sm text-soft leading-relaxed">
          {label}
        </p>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barFromTo[tone]}`}
            style={{
              width: `${Math.min(100, (value / 70) * 100)}%`,
              transition: "width 80ms linear",
            }}
          />
        </div>
      </motion.div>
    </TiltCard>
  );
}
