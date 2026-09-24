"use client";

import {
  Check,
  ChevronDown,
  Pencil,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ============================================================
   MODAL
============================================================ */

export function Modal({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[3px]">
      <div className="flex h-[90vh] max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Pencil className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">
                {title}
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="ml-3 shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="px-5 py-5 pr-8 sm:px-6 sm:py-6 sm:pr-9">
              {children}
            </div>
          </ScrollArea>
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        {footer && (
          <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MODAL INPUT
============================================================ */

export function ModalInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  required = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      />
    </div>
  );
}

/* ============================================================
   MODAL SELECT
============================================================ */

export function ModalSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  disabled = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform"
        />
      </div>
    </div>
  );
}

/* ============================================================
   MODAL FOOTER
============================================================ */

export function ModalFooter({
  onCancel,
  onSave,
  loading = false,
}: {
  onCancel: () => void;
  onSave: () => void | Promise<void>;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Batal
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={loading}
        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Menyimpan...
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Simpan Perubahan
          </>
        )}
      </button>
    </div>
  );
}
