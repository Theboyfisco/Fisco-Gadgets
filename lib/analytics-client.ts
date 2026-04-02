"use client";

type TrackEventInput = {
  name: string;
  path?: string;
  userType?: "guest" | "customer" | "admin";
  payload?: Record<string, unknown>;
};

const SESSION_KEY = "noxtech_analytics_session_v1";

function getSessionId() {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return "";
  }
}

export function trackEvent(input: TrackEventInput) {
  if (typeof window === "undefined") return;
  if (!input.name.trim()) return;

  const payload = {
    name: input.name,
    path: input.path || window.location.pathname,
    userType: input.userType || "guest",
    sessionId: getSessionId(),
    payload: input.payload || {},
  };

  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics", blob);
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => null);
}
