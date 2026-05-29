import { useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * TiltCard — subtle 3D tilt + parallax shine on hover.
 * - Desktop & pointer-capable devices only (touch / mobile / reduced-motion fall back to static).
 * - No external deps; pure CSS transforms + JS for mouse tracking.
 * - Wrap any card with this component to add a premium hover interaction.
 */
export default function TiltCard({
  as: Tag = "div",
  className = "",
  maxTilt = 6,
  scale = 1.0,
  glow = true,
  children,
  ...rest
}) {
  const reduce = useReducedMotion();
  const cardRef = useRef(null);
  const shineRef = useRef(null);

  const supportsTilt =
    !reduce &&
    typeof window !== "undefined" &&
    !window.matchMedia("(max-width: 1023px)").matches &&
    !window.matchMedia("(hover: none)").matches;

  const onMove = (e) => {
    if (!supportsTilt) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    const rotY = (x - 0.5) * 2 * maxTilt; // -maxTilt..maxTilt
    const rotX = (0.5 - y) * 2 * maxTilt;
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
    if (shineRef.current) {
      shineRef.current.style.opacity = "1";
      shineRef.current.style.setProperty("--sx", `${x * 100}%`);
      shineRef.current.style.setProperty("--sy", `${y * 100}%`);
    }
  };

  const onLeave = () => {
    if (!supportsTilt) return;
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    if (shineRef.current) shineRef.current.style.opacity = "0";
  };

  return (
    <Tag
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`${className} relative will-change-transform transition-transform duration-300 ease-out`}
      style={{ transformStyle: "preserve-3d" }}
      {...rest}
    >
      {children}
      {supportsTilt && glow && (
        <span
          ref={shineRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: 0,
            background:
              "radial-gradient(240px circle at var(--sx, 50%) var(--sy, 50%), rgba(0,229,255,0.12), transparent 60%)",
            mixBlendMode: "screen",
          }}
        />
      )}
    </Tag>
  );
}
