import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Spotlight — soft cyan radial glow that follows the cursor over its parent.
 * Mount it inside a `position: relative` container. Touch / reduced-motion / small
 * screens fall back to an idle subtle glow (no event listeners attached).
 */
export default function Spotlight({
  color = "rgba(0,229,255,0.18)",
  size = 320,
  intensity = 1,
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;
    // No pointer support (touch only) — skip
    if (window.matchMedia("(hover: none)").matches) return;

    const node = ref.current;
    if (!node) return;
    const parent = node.parentElement;
    if (!parent) return;

    let raf = 0;
    let visible = false;
    let mx = 0;
    let my = 0;

    const onMove = (e) => {
      const rect = parent.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      if (!raf) {
        raf = window.requestAnimationFrame(() => {
          node.style.setProperty("--mx", `${mx}px`);
          node.style.setProperty("--my", `${my}px`);
          if (!visible) {
            node.style.opacity = "1";
            visible = true;
          }
          raf = 0;
        });
      }
    };
    const onLeave = () => {
      node.style.opacity = "0";
      visible = false;
    };

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 transition-opacity duration-300"
      style={{
        opacity: 0,
        background: `radial-gradient(${size}px circle at var(--mx, -100px) var(--my, -100px), ${color}, transparent 60%)`,
        mixBlendMode: "screen",
        zIndex: 1,
        filter: `saturate(${1 + intensity * 0.2}) blur(0.5px)`,
      }}
      data-testid="spotlight"
    />
  );
}
