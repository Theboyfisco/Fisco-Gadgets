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
    <Image src="/brand-mark.svg" alt="Fisco Gadgets" width={42} height={42} priority className="h-10 w-10" />
  ) : (
    <Image src="/brand-logo.svg" alt="Fisco Gadgets" width={220} height={62} priority className="h-10 w-auto sm:h-11" />
  );

  return (
    <Link href={href} onClick={onClick} className={`inline-flex items-center ${className}`.trim()}>
      {content}
    </Link>
  );
}
