"use client";

import { useReducedMotion } from "framer-motion";
import { useHydrated } from "./useHydrated";

/**
 * A safe version of useReducedMotion that prevents hydration errors.
 * It returns false on the server and initial client render, updates after mount.
 */
export function useSafeReducedMotion() {
  const hydrated = useHydrated();
  const prefersReducedMotion = useReducedMotion();
  return hydrated && prefersReducedMotion;
}
