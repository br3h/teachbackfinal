import { motion, useReducedMotion } from "framer-motion";
import {
  Brain,
  Compass,
  CalendarRange,
  MessageCircleQuestion,
  Trophy,
  RotateCw,
} from "lucide-react";
import TiltCard from "@/components/landing/TiltCard";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Teaching Evaluation",
    body: "Your spoken explanation is compared against your notes line-by-line for a real score.",
  },
  {
    icon: Compass,
    title: "Warm-Up Questions",
    body: "Three quick prompts activate your thinking before you start teaching.",
  },
  {
    icon: CalendarRange,
    title: "Personalized Study Plan",
    body: "A 7, 14, or 21-day plan with specific tasks, methods, and time estimates.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Socratic Tutor",
    body: "An AI tutor that only asks guiding questions — never hands you the answer.",
  },
  {
    icon: Trophy,
    title: "XP, Streaks & Weekly Goals",
    body: "Stay consistent with levels, streak tracking, and a target you can actually hit.",
  },
  {
    icon: RotateCw,
    title: "Spaced Repetition & Retention",
    body: "Sessions resurface before you forget. Retention bars show what is fading.",
  },
];

export default function Features() {
  const reduce = useReducedMotion();
  return (
    <section
      id="features"
      className="relative py-16 sm:py-20 lg:py-24 border-t border-white/5"
      data-testid="features-section"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[#00E5FF]/80">
            Inside the app
          </p>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-white leading-[1.1]">
            Everything you need to study
            <span className="block text-white/55">with receipts.</span>
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <TiltCard key={f.title} maxTilt={5}>
                <motion.div
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative rounded-[24px] border border-white/10 bg-[rgba(10,16,28,0.6)] backdrop-blur-xl p-6 transition-[border-color,box-shadow] duration-200 hover:border-[rgba(0,229,255,0.25)] hover:shadow-[0_0_0_1px_rgba(0,229,255,0.14),0_0_24px_rgba(0,229,255,0.10)]"
                  data-testid={`feature-card-${i + 1}`}
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[rgba(0,229,255,0.06)]">
                    <Icon className="h-5 w-5 text-[#00E5FF]" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-heading text-[17px] font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-soft leading-relaxed">
                    {f.body}
                  </p>
                </motion.div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
