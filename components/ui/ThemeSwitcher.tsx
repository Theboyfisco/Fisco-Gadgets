"use client";

import { Moon, SunMedium } from "lucide-react";
import { useSyncExternalStore } from "react";

const THEME_KEY = "fisco-theme";
const THEME_CHANGED_EVENT = "fisco-theme-changed";

type Theme = "dark" | "light";

function getServerSnapshot(): Theme {
  return "dark";
}

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "dark";

  const appliedTheme = document.documentElement.getAttribute("data-theme");
  if (appliedTheme === "light" || appliedTheme === "dark") {
    return appliedTheme;
  }

  const savedTheme = window.localStorage.getItem(THEME_KEY);
  if (savedTheme === "light") return "light";
  if (savedTheme === "dark") return "dark";

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function subscribe(callback: () => void) {
  const handleChange = () => callback();
  window.addEventListener("storage", handleChange);
  window.addEventListener(THEME_CHANGED_EVENT, handleChange);
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(THEME_CHANGED_EVENT, handleChange);
  };
}

function setTheme(nextTheme: Theme) {
  document.documentElement.setAttribute("data-theme", nextTheme);
  window.localStorage.setItem(THEME_KEY, nextTheme);
  window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
}

export function ThemeSwitcher() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="interactive-focus group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[var(--interactive-border)] bg-[var(--interactive-bg)] text-[var(--interactive-fg)] transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:border-[var(--interactive-border-strong)] hover:bg-[var(--interactive-active)] hover:shadow-[0_0_22px_-10px_var(--color-primary)]"
    >
      <span className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/20 opacity-0 transition-opacity duration-[var(--motion-base)] ease-[var(--ease-standard)] group-hover:opacity-100" />

      {theme === "dark" ? (
        <SunMedium size={18} className="relative z-10 transition-transform duration-[var(--motion-base)] ease-[var(--ease-standard)] group-hover:rotate-12" />
      ) : (
        <Moon size={18} className="relative z-10 transition-transform duration-[var(--motion-base)] ease-[var(--ease-standard)] group-hover:-rotate-12" />
      )}
    </button>
  );
}
