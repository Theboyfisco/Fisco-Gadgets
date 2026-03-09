"use client";

import { motion } from "framer-motion";
import { MoonStar, SunMedium } from "lucide-react";

const STORAGE_KEY = "fisco-theme";

type Theme = "dark" | "light";

function getCurrentTheme(): Theme {
  const htmlTheme = document.documentElement.getAttribute("data-theme");
  return htmlTheme === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const toggleTheme = () => {
    const nextTheme: Theme = getCurrentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.04 }}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] text-secondary transition-all hover:border-primary/30 hover:bg-white/10 hover:text-white"
    >
      <SunMedium size={20} className="theme-icon-sun absolute" />
      <MoonStar size={20} className="theme-icon-moon absolute" />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-cyan-300/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:from-primary/10 group-hover:to-cyan-300/10" />
    </motion.button>
  );
}
