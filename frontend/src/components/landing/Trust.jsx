import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Bot,
  ServerCog,
  EyeOff,
  Check,
} from "lucide-react";
import TiltCard from "@/components/landing/TiltCard";

const CARDS = [
  {
    icon: ShieldCheck,
    title: "Secure authentication",
    body: "Passwords hashed, sessions expire, password-reset tokens are short-lived. No auth secrets ever reach the browser.",
    test: "trust-card-auth",
  },
  {
    icon: Lock,
    title: "Protected user data",
    body: "Every API request checks ownership before reading, modifying, or deleting any resource — IDOR protection by default.",
    test: "trust-card-data",
  },
  {
    icon: KeyRound,
    title: "Secrets stay server-side",
    body: "API keys and database credentials live in environment variables on the server, never in frontend code or the repo.",
    test: "trust-card-secrets",
  },
  {
    icon: Bot,
    title: "Bot & spam protection",
    body: "A hidden honeypot, server validation, and rate-friendly endpoints keep automated abuse and fake signups off the list.",
    test: "trust-card-bots",
  },
  {
    icon: ServerCog,
    title: "Secure deployment",
    body: "HTTPS-only traffic, database not exposed to the public internet, structured logging for auth attempts and unusual patterns.",
    test: "trust-card-deployment",
  },
  {
    icon: EyeOff,
    title: "Privacy-first waitlist",
    body: "We store your email and a salted hash of your IP — never the raw IP. No tracking, no selling, no surprises.",
    test: "trust-card-privacy",
  },
];

const CHECKLIST = [
  "Secure auth + sessions",
  "Ownership checks on every endpoint",
  "Secrets in env vars, never in frontend",
  "Rate-friendly, abuse-resistant endpoints",
  "HTTPS + monitoring + anomaly logging",
];

export default function Trust() {
  const reduce = useReducedMotion();
  return (
    <section
      id="trust"
      className="relative py-16 sm:py-20 lg:py-24 border-t border-white/5"
      data-testid="trust-section"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[#00E5FF]/80">
            Trust &amp; security
          </p>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-white leading-[1.1]">
            Built like a serious product.
            <span className="block text-white/55">Not a weekend prototype.</span>
          </h2>
          <p className="mt-4 text-soft text-[15px] sm:text-base leading-relaxed">
            Your study material is private. Your account should be too.
            Here&rsquo;s how TeachBack AI is built to keep both safe.
          </p>
        </div>

        {/* Cards grid */}
        <div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          data-testid="trust-cards"
        >
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <TiltCard key={c.title} maxTilt={5}>
                <motion.div
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.45,
                    delay: i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group relative rounded-[24px] border border-white/10 bg-[rgba(10,16,28,0.6)] backdrop-blur-xl p-5 sm:p-6 transition-[border-color,box-shadow] duration-200 hover:border-[rgba(0,229,255,0.25)] hover:shadow-[0_0_0_1px_rgba(0,229,255,0.14),0_0_24px_rgba(0,229,255,0.10)]"
                  data-testid={c.test}
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[rgba(0,229,255,0.06)]">
                    <Icon
                      className="h-5 w-5 text-[#00E5FF]"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-5 font-heading text-[16px] sm:text-[17px] font-semibold text-white">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[13px] sm:text-sm text-soft leading-relaxed">
                    {c.body}
                  </p>
                </motion.div>
              </TiltCard>
            );
          })}
        </div>

        {/* Ship-secure checklist */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 rounded-[28px] border border-white/10 bg-[rgba(10,16,28,0.62)] backdrop-blur-xl p-6 sm:p-7"
          data-testid="trust-checklist"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="h-4 w-4 text-[#00E5FF]"
              aria-hidden="true"
            />
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">
              Our ship-secure checklist
            </p>
          </div>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {CHECKLIST.map((item, i) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[14px] sm:text-[15px] text-white/90"
                data-testid={`trust-checklist-item-${i + 1}`}
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[rgba(0,229,255,0.35)] bg-[rgba(0,229,255,0.08)]"
                >
                  <Check className="h-3 w-3 text-[#00E5FF]" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
