"use client";

import { Plus, ChevronRight } from "lucide-react";

/* ============================================================
   INFO CARD
============================================================ */

export function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 transition hover:border-slate-200 hover:bg-slate-50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-100">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   ADD BUTTON
============================================================ */

export function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
    >
      <Plus className="h-3.5 w-3.5" />

      <span className="hidden sm:inline">{label}</span>

      <span className="sm:hidden">Tambah</span>
    </button>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

export function EmptyState({
  icon,
  title,
  description,
  button,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-bold text-slate-700">{title}</h3>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600"
      >
        <Plus className="h-3.5 w-3.5" />

        {button}

        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ============================================================
   MODERN SECTION
============================================================ */

export function ModernSection({
  icon,
  iconStyle,
  title,
  description,
  action,
  children,
}: {
  icon: React.ReactNode;
  iconStyle: "emerald" | "teal" | "amber";
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <section className="rounded-[22px] border border-slate-200/80 bg-white px-5 py-5 shadow-[0_3px_18px_rgba(15,23,42,0.025)] sm:px-7 sm:py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles[iconStyle]}`}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-slate-900 sm:text-base">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {action}
      </div>

      <div>{children}</div>
    </section>
  );
}
