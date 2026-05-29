import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * MobileCTA — small floating "Join Waitlist" button that appears only on
 * mobile after the visitor scrolls past the hero, and hides itself when the
 * waitlist section is in view. Respects iOS safe-area-inset-bottom.
 */
export default function MobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const waitlist = document.getElementById("waitlist");
    if (!hero || !waitlist) return;

    let pastHero = false;
    let waitlistInView = false;

    const heroObs = new IntersectionObserver(
      ([entry]) => {
        pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setVisible(pastHero && !waitlistInView);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    const waitObs = new IntersectionObserver(
      ([entry]) => {
        waitlistInView = entry.isIntersecting;
        setVisible(pastHero && !waitlistInView);
      },
      { threshold: 0.15 }
    );
    heroObs.observe(hero);
    waitObs.observe(waitlist);
    return () => {
      heroObs.disconnect();
      waitObs.disconnect();
    };
  }, []);

  const scrollToWaitlist = () => {
    const el = document.getElementById("waitlist");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={`md:hidden fixed left-0 right-0 z-50 px-4 pointer-events-none transition-[opacity,transform] duration-300 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      data-testid="mobile-cta"
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={scrollToWaitlist}
        tabIndex={visible ? 0 : -1}
        className="pointer-events-auto group w-full inline-flex items-center justify-center gap-2 rounded-full h-12 px-5 bg-[#00E5FF] text-[#05070D] font-semibold text-[15px] shadow-[0_8px_30px_-6px_rgba(0,229,255,0.6),0_0_0_1px_rgba(0,229,255,0.25)] active:scale-[0.98] transition-transform"
        data-testid="mobile-cta-button"
      >
        Join the Waitlist
        <ArrowUp className="h-4 w-4 -rotate-45 transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden="true" />
      </button>
    </div>
  );
}
