"use client";

import { PageTransition } from "@/components/ui/PageTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      <ScrollReveal>{children}</ScrollReveal>
    </PageTransition>
  );
}
