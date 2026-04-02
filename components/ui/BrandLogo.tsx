"use client";

import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export function BrandLogo({ href = "/", compact = false, className = "", onClick }: BrandLogoProps) {
  const content = compact ? (
    <Image src="/brand-mark.png" alt="NOXTECH" width={42} height={42} className="h-10 w-10" />
  ) : (
    <Image src="/brand-logo.png" alt="NOXTECH" width={220} height={62} className="h-10 w-auto sm:h-11" />
  );

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`interactive-focus inline-flex items-center rounded-full border border-transparent px-1 py-1 transition-all hover:border-[var(--interactive-border)] hover:bg-[var(--interactive-hover)] ${className}`.trim()}
    >
      {content}
    </Link>
  );
}
