"use client";
import { useEffect, useRef } from "react";

export default function AuroraProvider() {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    let targetX = 50, targetY = 50;
    let currentX = 50, currentY = 50;

    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth)  * 100;
      targetY = (e.clientY / window.innerHeight) * 100;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      // Smooth lerp so the blob drifts lazily behind cursor
      currentX = lerp(currentX, targetX, 0.10);
      currentY = lerp(currentY, targetY, 0.10);

      document.documentElement.style.setProperty("--mx", `${currentX}%`);
      document.documentElement.style.setProperty("--my", `${currentY}%`);

      raf = requestAnimationFrame(tick);
    };

    // Scroll-reactive section tinting
    const sections = document.querySelectorAll("[data-section]");
    const observerOptions = { threshold: 0.35 };
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.body.setAttribute("data-active-section", (entry.target as HTMLElement).dataset.section || "");
        }
      });
    }, observerOptions);
    sections.forEach(s => sectionObserver.observe(s));

    window.addEventListener("mousemove", onMove, { passive: true });
    tick();

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* Aurora blob — follows cursor with soft multi-layer gradients */}
      <div
        ref={blobRef}
        className="aurora-bg"
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
      />
    </>
  );
}
