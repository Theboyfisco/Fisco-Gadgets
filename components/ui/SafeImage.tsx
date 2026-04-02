"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/normalize-product";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export function SafeImage({ src, fallbackSrc = DEFAULT_PRODUCT_IMAGE, alt, onError, ...rest }: SafeImageProps) {
  const [brokenSources, setBrokenSources] = useState<Set<string>>(() => new Set());
  const normalizedSrc = src || fallbackSrc;
  const resolvedSrc = brokenSources.has(normalizedSrc) ? fallbackSrc : normalizedSrc;

  return (
    <Image
      {...rest}
      src={resolvedSrc}
      alt={alt}
      onError={(event) => {
        if (resolvedSrc !== fallbackSrc) {
          setBrokenSources((prev) => {
            const next = new Set(prev);
            next.add(normalizedSrc);
            return next;
          });
        }
        onError?.(event);
      }}
    />
  );
}
