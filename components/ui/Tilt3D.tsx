"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { type ReactNode, useState } from "react";

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  spotlightOpacity?: number;
}

export function Tilt3D({ children, className = "", maxTilt = 9, spotlightOpacity = 0.32 }: Tilt3DProps) {
  const prefersReducedMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 18, mass: 0.45 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 18, mass: 0.45 });

  const shadowX = useTransform(springY, [-maxTilt * 2, maxTilt * 2], [22, -22]);
  const shadowY = useTransform(springX, [-maxTilt * 2, maxTilt * 2], [-24, 24]);
  const dynamicShadow = useMotionTemplate`${shadowX}px ${shadowY}px 42px rgba(0, 0, 0, 0.36)`;

  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    rotateX.set((0.5 - py) * maxTilt * 2);
    rotateY.set((px - 0.5) * maxTilt * 2);
    setGlare({ x: px * 100, y: py * 100, opacity: spotlightOpacity });
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onTouchEnd={onLeave}
      style={
        prefersReducedMotion
          ? undefined
          : {
              rotateX: springX,
              rotateY: springY,
              transformStyle: "preserve-3d",
              boxShadow: dynamicShadow,
            }
      }
      className={`relative [perspective:1200px] ${className}`}
    >
      <div className="relative h-full w-full [transform-style:preserve-3d]">
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 [border-radius:inherit]"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.30), transparent 45%)`,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 [border-radius:inherit]"
          style={{
            opacity: glare.opacity * 0.6,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, transparent 32%, rgba(0,0,0,0.22) 90%)`,
          }}
        />
      </div>
    </motion.div>
  );
}
