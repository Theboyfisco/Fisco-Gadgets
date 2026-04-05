"use client";

import dynamic from "next/dynamic";

const SupportSpeedDial = dynamic(() => import("@/components/ui/SupportSpeedDial").then((mod) => mod.SupportSpeedDial), {
  ssr: false,
});
const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor").then((mod) => mod.CustomCursor), {
  ssr: false,
});
const PWARegistration = dynamic(() => import("@/components/pwa/PWARegistration").then((mod) => mod.PWARegistration), {
  ssr: false,
});
const PWAInstallPrompt = dynamic(() => import("@/components/pwa/PWAInstallPrompt").then((mod) => mod.PWAInstallPrompt), {
  ssr: false,
});

export function ClientEnhancements() {
  return (
    <>
      <SupportSpeedDial />
      <CustomCursor />
      <PWAInstallPrompt />
      <PWARegistration />
    </>
  );
}
