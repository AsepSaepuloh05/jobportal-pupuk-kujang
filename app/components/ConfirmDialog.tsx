"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "default";
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmText = "Ya, Lanjutkan",
    cancelText = "Batal",
    variant = "default",
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) onCancel();
            }}
        >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${variant === "danger"
                            ? "bg-red-100 text-red-600"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                >
                    <AlertTriangle className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-800">
                    {title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-500">{description}</p>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${variant === "danger"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                    >
                        {loading ? "Memproses..." : confirmText}
                    </button>
                </div>

            </div>
        </div>
    );
}