"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { CheckIcon, XIcon } from "../dashboard/dashboard-ui";

type ToastTone = "success" | "error";

type Toast = {
  id: string;
  tone: ToastTone;
  title: string;
  message?: string;
};

type ToastContextValue = {
  showToast: (tone: ToastTone, title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {}
});

function toneClassName(tone: ToastTone) {
  return tone === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-rose-200 bg-rose-50 text-rose-900";
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((current) => current.filter((entry) => entry.id !== toast.id));
      }, 4200)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts]);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast: (tone, title, message) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setToasts((current) => [...current.slice(-2), { id, tone, title, message }]);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] ${toneClassName(toast.tone)}`}
            role="status"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center">
                {toast.tone === "success" ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <XIcon className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.message ? <p className="mt-1 text-sm opacity-80">{toast.message}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setToasts((current) => current.filter((entry) => entry.id !== toast.id));
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-current opacity-70 transition hover:bg-black/5 hover:opacity-100"
                aria-label="Dismiss toast"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
