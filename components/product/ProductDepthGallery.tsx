"use client";

import { useEffect, useMemo, useState } from "react";
import { Tilt3D } from "@/components/ui/Tilt3D";
import { trackEvent } from "@/lib/analytics-client";
import { SafeImage } from "@/components/ui/SafeImage";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

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
  const prefersReducedMotion = useSafeReducedMotion();

  useEffect(() => {
    if (activeIndex === 0) return;
    trackEvent({
      name: "pdp_engagement",
      payload: {
        event: "gallery_image_switch",
        productName: name,
        imageIndex: activeIndex,
      },
    });
  }, [activeIndex, name]);

  return (
    <div className="space-y-5">
      <Tilt3D maxTilt={prefersReducedMotion ? 0 : 8}>
        <div className="relative h-[320px] w-full overflow-hidden rounded-[2rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-soft))] p-4 shadow-[0_24px_80px_rgba(var(--shadow-neutral-rgb),0.16)] sm:h-[420px] sm:p-5 lg:h-[610px]">
          <div className="pointer-events-none absolute -left-8 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-[var(--carousel-glow-2)] blur-3xl" />

          <div className="absolute right-4 top-4 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary [transform:translateZ(38px)]">
            {condition}
          </div>

          <div className="absolute inset-0 [transform-style:preserve-3d]">
            <SafeImage
              src={activeImage}
              alt={`${name} background`}
              fill
              quality={75}
              className="object-cover opacity-20 blur-xl [transform:translateZ(10px)_scale(1.15)]"
            />
            <SafeImage
              src={activeImage}
              alt={name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={88}
              priority
              className="object-contain p-6 sm:p-10 [transform:translateZ(52px)_scale(1.03)]"
            />
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-contrast)] p-4 shadow-[0_16px_40px_rgba(var(--shadow-neutral-rgb),0.2)] backdrop-blur-md [transform:translateZ(46px)]">
            <p className="text-xs uppercase tracking-[0.18em] text-secondary">Studio view</p>
            <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{name}</p>
          </div>
        </div>
      </Tilt3D>

      <div className="no-scrollbar overflow-x-auto pb-1">
        <div className="mx-auto flex w-max gap-3 px-2">
          {safeImages.slice(0, 8).map((image, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-20 w-20 overflow-hidden rounded-[1.25rem] border transition-all duration-300 ${
                  active
                    ? "z-20 -translate-y-1 rotate-0 border-primary/50 shadow-[0_0_25px_var(--carousel-glow-1)]"
                    : "z-10 border-[var(--border-subtle)] hover:-translate-y-0.5 hover:rotate-0 hover:border-[var(--border-strong)]"
                }`}
                aria-label={`Select image ${index + 1}`}
              >
                <SafeImage src={image} alt={`${name} thumbnail ${index + 1}`} fill quality={70} className="object-cover" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

