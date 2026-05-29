import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AppPreview from "@/components/landing/AppPreview";
import IpadPreview from "@/components/landing/IpadPreview";
import Spotlight from "@/components/landing/Spotlight";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  const reduce = useReducedMotion();
  const sceneRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const scrollTo = (id) => () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Very subtle pointer parallax over the device composition (desktop only).
  useEffect(() => {
    if (reduce) return;
    const node = sceneRef.current;
    if (!node) return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const onMove = (e) => {
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      setTilt({
        x: Math.max(-1, Math.min(1, dy)) * -2.2,
        y: Math.max(-1, Math.min(1, dx)) * 2.2,
      });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    node.addEventListener("mousemove", onMove);
    node.addEventListener("mouseleave", onLeave);
    return () => {
      node.removeEventListener("mousemove", onMove);
      node.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce]);

  return (
    <section
      id="top"
      className="relative hero-bg noise-overlay overflow-hidden"
      data-testid="hero-section"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-14 sm:pb-20 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT: copy */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6"
          >
            <div
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(10,16,28,0.55)] px-3 py-1.5 text-xs text-soft"
              data-testid="hero-eyebrow"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#00E5FF]" aria-hidden="true" />
              <span>Built on the Feynman Technique</span>
            </div>

            <h1 className="mt-5 font-heading text-[40px] leading-[1.05] sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
              Learn it by
              <span className="block">
                teaching it{" "}
                <span className="tb-text-shimmer">out loud.</span>
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[15px] sm:text-base text-soft leading-relaxed">
              TeachBack AI listens while you explain your notes out loud, then
              shows what you actually understand, what you missed, and exactly
              what to study next.
            </p>

            <p className="mt-3 max-w-xl text-sm text-muted-soft">
              Built for students who want to stop rereading and start
              understanding.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                onClick={scrollTo("waitlist")}
                className="group rounded-[22px] h-12 min-h-[48px] px-6 bg-[#00E5FF] text-[#05070D] text-[15px] font-semibold hover:bg-[#00E5FF] hover:brightness-105 hover:shadow-[0_0_0_1px_rgba(0,229,255,0.22),0_0_34px_rgba(0,229,255,0.16)] transition-[box-shadow,filter] duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#00E5FF]/40"
                data-testid="hero-join-waitlist-button"
              >
                Join the Waitlist
                <ArrowRight
                  className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Button>
              <Button
                variant="ghost"
                onClick={scrollTo("solution")}
                className="rounded-[22px] h-12 min-h-[48px] px-5 text-white/85 hover:text-white hover:bg-white/5 transition-colors"
                data-testid="hero-see-how-it-works-button"
              >
                See how it works
              </Button>
            </div>

            {/* Trust strip */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-soft">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
                Mobile-first
              </span>
              <span className="hidden sm:inline text-white/15">•</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2AF6D6]" />
                Private by default
              </span>
              <span className="hidden sm:inline text-white/15">•</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                No spam
              </span>
            </div>
          </motion.div>

          {/* RIGHT: device composition (iPad + Pencil + Phone) */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="lg:col-span-6 flex justify-center lg:justify-end"
            data-testid="hero-devices"
          >
            <div
              ref={sceneRef}
              className="relative w-full max-w-[640px]"
              style={{ perspective: "1400px" }}
            >
              {/* Mouse-following spotlight (desktop, hover-capable only) */}
              <Spotlight color="rgba(0,229,255,0.18)" size={360} />

              <div
                className="relative h-[460px] sm:h-[520px] lg:h-[560px]"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  transition: "transform 240ms ease-out",
                }}
              >
                <div
                  className="absolute left-0 top-10 sm:top-14 lg:top-16 hidden sm:block"
                  style={{
                    transform: "rotate(-4deg)",
                    transformOrigin: "center center",
                  }}
                  data-testid="hero-ipad"
                >
                  <IpadPreview />
                </div>

                <div
                  className="absolute right-0 -bottom-4 sm:right-2 sm:bottom-0 lg:right-0 lg:-bottom-2 z-20"
                  style={{ transform: "rotate(2deg)" }}
                  data-testid="hero-phone"
                >
                  <AppPreview size="sm" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
