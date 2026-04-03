"use client";

import { Moon, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "noxtech-theme";
const THEME_CHANGED_EVENT = "noxtech-theme-changed";

type Theme = "dark" | "light";

function normalizeTheme(value: string | null): Theme | null {
  if (value === "light" || value === "dark") return value;
  return null;
}

function resolvePreferredTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "dark";

  const appliedTheme = normalizeTheme(document.documentElement.getAttribute("data-theme"));
  if (appliedTheme) {
    return appliedTheme;
  }

  const savedTheme = normalizeTheme(window.localStorage.getItem(THEME_KEY));
  if (savedTheme) return savedTheme;

  return resolvePreferredTheme();
}

function applyTheme(nextTheme: Theme, persist = true) {
  document.documentElement.setAttribute("data-theme", nextTheme);
  document.documentElement.classList.toggle("dark-theme", nextTheme === "dark");
  document.documentElement.classList.toggle("light-theme", nextTheme === "light");
  document.documentElement.style.colorScheme = nextTheme;
  if (persist) {
    window.localStorage.setItem(THEME_KEY, nextTheme);
  }
  window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const syncTheme = () => setTheme(getThemeSnapshot());
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleSystemThemeChange = () => {
      if (normalizeTheme(window.localStorage.getItem(THEME_KEY))) return;
      applyTheme(resolvePreferredTheme(), false);
      syncTheme();
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener(THEME_CHANGED_EVENT, syncTheme);
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener(THEME_CHANGED_EVENT, syncTheme);
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  return (
    <button
      onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="interactive-focus group relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--interactive-border)] bg-[var(--interactive-bg)] text-[var(--interactive-fg)] transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:border-[var(--interactive-border-strong)] hover:bg-[var(--interactive-active)] hover:shadow-[0_0_22px_-10px_var(--color-primary)] sm:h-10 sm:w-10"
    >
      <span className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/20 opacity-0 transition-opacity duration-[var(--motion-base)] ease-[var(--ease-standard)] group-hover:opacity-100" />

      {theme === "dark" ? (
        <SunMedium size={17} className="relative z-10 transition-transform duration-[var(--motion-base)] ease-[var(--ease-standard)] group-hover:rotate-12 sm:h-[18px] sm:w-[18px]" />
      ) : (
        <Moon size={17} className="relative z-10 transition-transform duration-[var(--motion-base)] ease-[var(--ease-standard)] group-hover:-rotate-12 sm:h-[18px] sm:w-[18px]" />
      )}
    </button>
  );
}
