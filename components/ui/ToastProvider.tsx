"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle } from "lucide-react";

type ToastVariant = "success" | "info" | "warning";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  pushToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_TTL = 3500;

function iconForVariant(variant: ToastVariant) {
  if (variant === "success") return CheckCircle2;
  if (variant === "warning") return AlertTriangle;
  return Info;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, TOAST_TTL);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-6 z-[120] flex flex-col items-center gap-3 sm:inset-auto sm:right-6 sm:bottom-6 sm:items-end"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = iconForVariant(toast.variant);
            return (
              <motion.div
                key={toast.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[var(--border-subtle)] bg-[var(--panel-bg-soft)] px-4 py-3 shadow-xl backdrop-blur-xl"
                role="status"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-full bg-primary/15 p-2 text-primary">
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{toast.title}</p>
                    {toast.description && <p className="text-xs text-secondary">{toast.description}</p>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
