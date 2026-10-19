// Letakkan di: components/GantiPasswordModal.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, X } from "lucide-react";

import type { PasswordForm } from "../hooks/useGantiPassword";

type Field = keyof PasswordForm;

const FIELDS: { key: Field; label: string; autoComplete: string }[] = [
  { key: "passwordLama", label: "Password Lama", autoComplete: "current-password" },
  { key: "passwordBaru", label: "Password Baru", autoComplete: "new-password" },
  {
    key: "konfirmasiPassword",
    label: "Konfirmasi Password Baru",
    autoComplete: "new-password",
  },
];

export function GantiPasswordModal({
  open,
  form,
  setForm,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  form: PasswordForm;
  setForm: React.Dispatch<React.SetStateAction<PasswordForm>>;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [visible, setVisible] = useState<Record<Field, boolean>>({
    passwordLama: false,
    passwordBaru: false,
    konfirmasiPassword: false,
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Ganti Password
              </h2>
              <p className="text-xs text-slate-400">
                Minimal 8 karakter, huruf besar, huruf kecil, angka, dan karakter unik.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {FIELDS.map(({ key, label, autoComplete }) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                {label}
              </label>

              <div className="relative">
                <input
                  type={visible[key] ? "text" : "password"}
                  value={form[key]}
                  autoComplete={autoComplete}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() =>
                    setVisible((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {visible[key] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            Simpan Password
          </button>
        </div>
      </form>
    </div>
  );
}