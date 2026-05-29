import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Confetti — lightweight cyan/mint particle burst that runs once when `trigger`
 * flips from false to true. Uses pure CSS keyframes (no canvas) and removes
 * itself after the animation finishes. Respects prefers-reduced-motion.
 */
export default function Confetti({
  trigger = false,
  count = 16,
  duration = 900,
  testId = "confetti",
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger && !reduce) {
      setActive(true);
      const t = setTimeout(() => setActive(false), duration + 80);
      return () => clearTimeout(t);
    }
  }, [trigger, reduce, duration]);

  const particles = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
      const distance = 60 + Math.random() * 70;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const size = 5 + Math.random() * 5;
      const delay = Math.random() * 90;
      const isMint = Math.random() > 0.55;
      items.push({ i, dx, dy, size, delay, isMint });
    }
    return items;
  }, [count]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-visible"
      data-testid={testId}
    >
      <div className="absolute left-1/2 top-1/2">
        {particles.map((p) => (
          <span
            key={p.i}
            className="tb-confetti-particle absolute block rounded-full"
            style={{
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: 0,
              top: 0,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${duration}ms`,
              background: p.isMint
                ? "radial-gradient(circle, #2AF6D6 0%, rgba(42,246,214,0) 70%)"
                : "radial-gradient(circle, #00E5FF 0%, rgba(0,229,255,0) 70%)",
              boxShadow: p.isMint
                ? "0 0 12px rgba(42,246,214,0.55)"
                : "0 0 12px rgba(0,229,255,0.55)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
