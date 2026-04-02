"use client";

import { useSyncExternalStore } from "react";

let hydrated = false;
const subscribers = new Set<() => void>();

function subscribe(callback: () => void) {
  subscribers.add(callback);

  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    queueMicrotask(() => {
      for (const subscriber of subscribers) subscriber();
    });
  }

  return () => {
    subscribers.delete(callback);
  };
}

function getSnapshot() {
  return hydrated;
}

function getServerSnapshot() {
  return false;
}

export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

