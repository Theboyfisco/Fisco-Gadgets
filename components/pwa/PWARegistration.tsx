"use client";

import { useEffect } from "react";

export function PWARegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext && window.location.hostname !== "localhost") return;

    const shouldRegister = process.env.NODE_ENV === "production" || window.location.hostname === "localhost";
    if (!shouldRegister) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => null);
    });
  }, []);

  return null;
}
