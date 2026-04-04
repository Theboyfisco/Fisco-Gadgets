"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, summary, label[for], [data-cursor="interactive"]';

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!hasFinePointer.matches || prefersReducedMotion.matches) return;

    const root = document.documentElement;
    root.classList.add("custom-cursor-enabled");

    let rafId = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let visible = false;
    let interactive = false;
    let pressed = false;

    const render = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;

      if (dotRef.current) {
        const dotScale = visible ? (pressed ? 0.8 : 1) : 0.6;
        dotRef.current.style.opacity = visible ? "1" : "0";
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%) scale(${dotScale})`;
      }

      if (ringRef.current) {
        const ringScale = visible ? (pressed ? 0.78 : interactive ? 1.45 : 1) : 0.78;
        ringRef.current.style.opacity = visible ? "1" : "0";
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${ringScale})`;
      }

      rafId = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      targetX = event.clientX;
      targetY = event.clientY;
      visible = true;
    };

    const handlePointerLeave = () => {
      visible = false;
      interactive = false;
      pressed = false;
    };

    const handlePointerOver = (event: Event) => {
      const target = event.target as Element | null;
      interactive = Boolean(target?.closest(INTERACTIVE_SELECTOR));
    };

    const handlePointerDown = () => {
      pressed = true;
    };

    const handlePointerUp = () => {
      pressed = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handlePointerLeave);
    document.addEventListener("mouseleave", handlePointerLeave);
    document.addEventListener("pointercancel", handlePointerLeave);
    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("pointerup", handlePointerUp, { passive: true });
    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
      document.removeEventListener("mouseleave", handlePointerLeave);
      document.removeEventListener("pointercancel", handlePointerLeave);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      root.classList.remove("custom-cursor-enabled");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} aria-hidden className="custom-cursor-ring" />
      <div ref={dotRef} aria-hidden className="custom-cursor-dot" />
    </>
  );
}
