"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const PROMPT_DELAY_MS = 30000;
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 5;
const DISMISS_KEY = "noxtech_pwa_prompt_dismissed_at";
const INSTALLED_KEY = "noxtech_pwa_installed";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const standaloneMatch = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return standaloneMatch || iosStandalone;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  const canShowPrompt = () => {
    if (typeof window === "undefined") return false;
    if (isStandaloneMode()) return false;
    if (window.localStorage.getItem(INSTALLED_KEY) === "true") return false;
    const dismissedAtRaw = window.localStorage.getItem(DISMISS_KEY);
    if (!dismissedAtRaw) return true;
    const dismissedAt = Number(dismissedAtRaw);
    if (!Number.isFinite(dismissedAt)) return true;
    return Date.now() - dismissedAt > DISMISS_COOLDOWN_MS;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      if (!canShowPrompt()) return;
      window.setTimeout(() => {
        setVisible(true);
      }, PROMPT_DELAY_MS);
    };

    const handleAppInstalled = () => {
      window.localStorage.setItem(INSTALLED_KEY, "true");
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!deferredPrompt || !visible || !canShowPrompt()) {
    return null;
  }

  const dismissPrompt = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(INSTALLED_KEY, "true");
        }
        setVisible(false);
      } else {
        dismissPrompt();
      }
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-[75] w-[min(25rem,calc(100vw-1.5rem))] rounded-[1.1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 shadow-[0_24px_58px_rgba(var(--shadow-neutral-rgb),0.24)] backdrop-blur-xl sm:p-4"
        aria-live="polite"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)]">Install NOXTECH app</p>
            <p className="mt-1 text-xs leading-relaxed text-secondary">
              Faster launch, full-screen experience, and quick access from your home screen.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissPrompt}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-soft)] text-secondary transition-colors hover:text-[var(--foreground)]"
            aria-label="Dismiss install prompt"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            disabled={installing}
            onClick={handleInstall}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary-contrast)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={14} />
            {installing ? "Preparing..." : "Install"}
          </button>
          <button
            type="button"
            onClick={dismissPrompt}
            className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]"
          >
            Not now
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

