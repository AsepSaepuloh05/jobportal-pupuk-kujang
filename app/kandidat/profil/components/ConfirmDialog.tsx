"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

/* ============================================================
   CONFIRM DIALOG
   Pengganti window.confirm() bawaan browser.

   Cara pakai (di dalam fungsi async):

     const ok = await confirmDialog({
       title: "Hapus Pengalaman",
       message: "Apakah Anda yakin ingin menghapus pengalaman ini?",
     });

     if (!ok) return;
============================================================ */

type ConfirmOptions = {
  title?: string;
  message: string;
  detail?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
};

type Pending = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

type Listener = (pending: Pending | null) => void;

let pending: Pending | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener(pending));
}

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  // Kalau ada dialog yang masih terbuka, anggap dibatalkan
  if (pending) pending.resolve(false);

  return new Promise<boolean>((resolve) => {
    pending = { ...options, resolve };
    emit();
  });
}

function settle(result: boolean) {
  if (!pending) return;

  const current = pending;

  pending = null;
  emit();

  current.resolve(result);
}

/* ============================================================
   STYLE PER VARIAN
============================================================ */

const variants = {
  danger: {
    icon: <Trash2 className="h-6 w-6" />,
    iconWrap: "bg-red-50 text-red-600 ring-8 ring-red-50/60",
    button:
      "bg-red-600 hover:bg-red-700 focus-visible:ring-red-200 shadow-[0_8px_20px_rgba(220,38,38,0.25)]",
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6" />,
    iconWrap: "bg-amber-50 text-amber-600 ring-8 ring-amber-50/60",
    button:
      "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-200 shadow-[0_8px_20px_rgba(245,158,11,0.25)]",
  },
};

/* ============================================================
   CONFIRM HOST
   Pasang SATU KALI saja, di halaman yang memakai confirmDialog
   (atau di app/layout.tsx).
============================================================ */

export function ConfirmDialog() {
  const [state, setState] = useState<Pending | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const listener: Listener = (next) => setState(next);

    listeners.add(listener);
    setState(pending);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Esc untuk batal, kunci scroll halaman, fokus ke tombol Batal
  useEffect(() => {
    if (!state) return;

    cancelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") settle(false);
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [state]);

  if (!state) return null;

  const variant = variants[state.variant ?? "danger"];

  return (
    <>
      <style>{`
        @keyframes confirm-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes confirm-card-in {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .confirm-overlay { animation: confirm-overlay-in 0.2s ease-out forwards; }
        .confirm-card { animation: confirm-card-in 0.25s cubic-bezier(0.21, 1.02, 0.73, 1) forwards; }
      `}</style>

      <div
        className="confirm-overlay fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
        onClick={() => settle(false)}
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
          onClick={(e) => e.stopPropagation()}
          className="confirm-card w-full max-w-[400px] rounded-3xl bg-white p-6 text-center shadow-[0_24px_70px_rgba(15,40,30,0.28)] sm:p-8"
        >
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${variant.iconWrap}`}
          >
            {variant.icon}
          </div>

          <h2
            id="confirm-title"
            className="mt-5 text-lg font-bold text-slate-900"
          >
            {state.title ?? "Konfirmasi"}
          </h2>

          <p
            id="confirm-message"
            className="mt-2 text-sm leading-6 text-slate-600"
          >
            {state.message}
          </p>

          {state.detail && (
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {state.detail}
            </p>
          )}

          <div className="mt-7 grid grid-cols-2 gap-3">
            <button
              ref={cancelRef}
              type="button"
              onClick={() => settle(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-100"
            >
              {state.cancelText ?? "Batal"}
            </button>

            <button
              type="button"
              onClick={() => settle(true)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition focus:outline-none focus-visible:ring-4 ${variant.button}`}
            >
              {state.confirmText ?? "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}