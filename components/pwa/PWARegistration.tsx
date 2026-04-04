"use client";

import { useEffect } from "react";

export function PWARegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext && window.location.hostname !== "localhost") return;

    const isProduction = process.env.NODE_ENV === "production";

    if (!isProduction) {
      (async () => {
        const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
        await Promise.all(registrations.map((registration) => registration.unregister().catch(() => false)));
        if ("caches" in window) {
          const keys = await caches.keys().catch(() => []);
          await Promise.all(keys.filter((key) => key.startsWith("noxtech-pwa-")).map((key) => caches.delete(key).catch(() => false)));
        }
      })().catch(() => null);
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => null);
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
