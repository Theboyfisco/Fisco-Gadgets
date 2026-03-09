"use client";

import { Moon, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "fisco-theme";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(THEME_KEY);
  return savedTheme === "light" ? "light" : "dark";
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[var(--interactive-border)] bg-[var(--interactive-bg)] text-[var(--interactive-fg)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_0_22px_-10px_var(--color-primary)]"
    >
      <span className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {theme === "dark" ? (
        <SunMedium size={18} className="relative z-10 transition-transform duration-300 group-hover:rotate-12" />
      ) : (
        <Moon size={18} className="relative z-10 transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}
