import { useEffect, useState } from "react";

/**
 * ScrollProgress — thin cyan-to-mint progress line at the very top of the page.
 * Pure CSS transform on a single element; no layout cost.
 */
export default function ScrollProgress() {
  const [scaled, setScaled] = useState(0);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setScaled(pct);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none"
      data-testid="scroll-progress"
    >
      <div
        className="h-full origin-left"
        style={{
          transform: `scaleX(${scaled})`,
          background: "linear-gradient(90deg, #00E5FF 0%, #2AF6D6 100%)",
          boxShadow: "0 0 10px rgba(0,229,255,0.55)",
          transition: "transform 80ms linear",
        }}
      />
    </div>
  );
}
