"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Tilt3D } from "@/components/ui/Tilt3D";

interface ProductDepthGalleryProps {
  name: string;
  images: string[];
  condition?: string;
}

export function ProductDepthGallery({ name, images, condition = "New" }: ProductDepthGalleryProps) {
  const safeImages = useMemo(() => {
    if (images.length > 0) return images;
    return ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop"];
  }, [images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = safeImages[activeIndex] ?? safeImages[0];

  return (
    <div className="space-y-5">
      <Tilt3D maxTilt={8}>
        <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-b from-[var(--surface-cta)] to-[var(--surface-soft)] p-4 sm:h-[420px] sm:p-5 lg:h-[610px]">
          <div className="pointer-events-none absolute -left-8 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="absolute right-4 top-4 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary [transform:translateZ(38px)]">
            {condition}
          </div>

          <div className="absolute inset-0 [transform-style:preserve-3d]">
            <Image
              src={activeImage}
              alt={`${name} background`}
              fill
              quality={75}
              className="object-cover opacity-20 blur-xl [transform:translateZ(10px)_scale(1.15)]"
            />
            <Image
              src={activeImage}
              alt={name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={95}
              priority
              className="object-contain p-6 sm:p-10 [transform:translateZ(52px)_scale(1.03)]"
            />
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-contrast)] p-4 backdrop-blur-md [transform:translateZ(46px)]">
            <p className="text-xs uppercase tracking-[0.14em] text-secondary">Studio view</p>
            <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{name}</p>
          </div>
        </div>
      </Tilt3D>

      <div className="overflow-x-auto pb-1">
        <div className="mx-auto flex w-max -space-x-6 px-2">
          {safeImages.slice(0, 8).map((image, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-20 w-20 overflow-hidden rounded-xl border transition-all duration-300 ${
                  active
                    ? "z-20 -translate-y-1 rotate-0 border-primary/50 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                    : "z-10 rotate-[-4deg] border-[var(--border-subtle)] hover:-translate-y-0.5 hover:rotate-0 hover:border-[var(--border-strong)]"
                }`}
                aria-label={`Select image ${index + 1}`}
              >
                <Image src={image} alt={`${name} thumbnail ${index + 1}`} fill quality={85} className="object-cover" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
