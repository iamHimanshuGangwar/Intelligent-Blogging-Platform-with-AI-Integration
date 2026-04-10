"use client";

import { useEffect, useRef } from "react";

/**
 * CursorGlow – a subtle radial gradient that follows the mouse pointer.
 * Uses requestAnimationFrame + CSS custom-property updates so it is
 * entirely GPU-composited and never causes a layout/paint flush.
 * The hue rotates as the cursor moves, giving a multi-colour swirl.
 */
export default function CursorGlow() {
  const blobRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const pos = useRef({ x: -120, y: -120, hue: 0 });
  const current = useRef({ x: -120, y: -120, hue: 0 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion || isCoarsePointer) {
      return;
    }

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - pos.current.x;
      const dy = e.clientY - pos.current.y;
      // Rotate hue proportionally to movement distance
      pos.current.hue = (pos.current.hue + Math.sqrt(dx * dx + dy * dy) * 0.25) % 360;
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };

    const tick = () => {
      // Keep the glow close to the cursor for a precise pointer-follow effect.
      current.current.x += (pos.current.x - current.current.x) * 0.24;
      current.current.y += (pos.current.y - current.current.y) * 0.24;
      current.current.hue += (pos.current.hue - current.current.hue) * 0.1;

      if (blobRef.current) {
        blobRef.current.style.transform = `translate(${current.current.x}px, ${current.current.y}px)`;
        blobRef.current.style.background = `radial-gradient(circle at center,
          hsla(${current.current.hue}, 88%, 66%, 0.28) 0%,
          hsla(${(current.current.hue + 45) % 360}, 84%, 62%, 0.14) 40%,
          hsla(${(current.current.hue + 90) % 360}, 78%, 56%, 0.06) 62%,
          transparent 76%)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={blobRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 50,
        willChange: "transform",
        marginLeft: "-15px",
        marginTop: "-15px",
        filter: "blur(2px)",
        opacity: 0.5,
      }}
    />
  );
}
