"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

/* ============================================================
   TOAST STORE
   Dipanggil dari mana saja (hook, handler, dll):
   toast.success("Berhasil!"), toast.error("Gagal"), dst.
============================================================ */

type ToastType = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
};

type Listener = (items: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let counter = 0;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function add(type: ToastType, message: string, duration = 4500) {
  const id = ++counter;

  // Maksimal 4 toast tampil bersamaan
  toasts = [...toasts, { id, type, message, duration }].slice(-4);
  emit();

  return id;
}

export function dismissToast(id: number) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

export const toast = {
  success: (message: string, duration?: number) =>
    add("success", message, duration),
  error: (message: string, duration?: number) =>
    add("error", message, duration ?? 6000),
  warning: (message: string, duration?: number) =>
    add("warning", message, duration ?? 6000),
  info: (message: string, duration?: number) =>
    add("info", message, duration),
};

/* ============================================================
   STYLE PER TIPE
============================================================ */

const styles: Record<
  ToastType,
  {
    title: string;
    icon: React.ReactNode;
    iconWrap: string;
    bar: string;
    border: string;
  }
> = {
  success: {
    title: "Berhasil",
    icon: <CheckCircle2 className="h-5 w-5" />,
    iconWrap: "bg-emerald-50 text-emerald-600",
    bar: "bg-emerald-500",
    border: "border-emerald-100",
  },
  error: {
    title: "Gagal",
    icon: <XCircle className="h-5 w-5" />,
    iconWrap: "bg-red-50 text-red-600",
    bar: "bg-red-500",
    border: "border-red-100",
  },
  warning: {
    title: "Perhatian",
    icon: <AlertTriangle className="h-5 w-5" />,
    iconWrap: "bg-amber-50 text-amber-600",
    bar: "bg-amber-500",
    border: "border-amber-100",
  },
  info: {
    title: "Informasi",
    icon: <Info className="h-5 w-5" />,
    iconWrap: "bg-blue-50 text-blue-600",
    bar: "bg-blue-500",
    border: "border-blue-100",
  },
};

/* ============================================================
   KARTU TOAST
   - Hilang otomatis dengan progress bar
   - Berhenti saat di-hover
============================================================ */

function ToastCard({ item }: { item: ToastItem }) {
  const style = styles[item.type];

  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const remaining = useRef(item.duration);
  const startedAt = useRef(0);

  const close = () => {
    setLeaving(true);
    setTimeout(() => dismissToast(item.id), 200);
  };

  useEffect(() => {
    if (paused) return;

    startedAt.current = Date.now();

    const timer = setTimeout(close, remaining.current);

    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  return (
    <div
      role={item.type === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl border bg-white shadow-[0_12px_40px_rgba(15,40,30,0.16)] ${style.border} ${
        leaving ? "toast-out" : "toast-in"
      }`}
    >
      <div className="flex items-start gap-3 p-4 pr-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
        >
          {style.icon}
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-bold text-slate-900">{style.title}</p>

          <p className="mt-0.5 text-[13px] leading-5 text-slate-600">
            {item.message}
          </p>
        </div>

        <button
          type="button"
          onClick={close}
          aria-label="Tutup notifikasi"
          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* PROGRESS BAR */}
      <div className="h-1 w-full bg-slate-100">
        <div
          className={`toast-progress h-full ${style.bar}`}
          style={{
            animationDuration: `${item.duration}ms`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   TOASTER
   Pasang SATU KALI saja, misalnya di app/layout.tsx
============================================================ */

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener: Listener = (next) => setItems(next);

    listeners.add(listener);
    setItems(toasts);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(24px) scale(0.98); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toast-out {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(24px) scale(0.98); }
        }
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .toast-in { animation: toast-in 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards; }
        .toast-out { animation: toast-out 0.2s ease-in forwards; }
        .toast-progress { animation-name: toast-progress; animation-timing-function: linear; animation-fill-mode: forwards; }
      `}</style>

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-[9999] flex flex-col items-end gap-3 p-4 sm:left-auto sm:right-0 sm:top-2 sm:w-[400px] sm:p-5"
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}