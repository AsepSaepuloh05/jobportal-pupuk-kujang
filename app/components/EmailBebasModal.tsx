"use client";

import { useState } from "react";
import { X, Mail } from "lucide-react";

interface EmailBebasModalProps {
    open: boolean;
    namaKandidat: string;
    loading: boolean;
    onClose: () => void;
    onSubmit: (data: { subjek: string; isi: string }) => void;
}

export default function EmailBebasModal({
    open,
    namaKandidat,
    loading,
    onClose,
    onSubmit,
}: EmailBebasModalProps) {
    const [subjek, setSubjek] = useState("");
    const [isi, setIsi] = useState("");

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjek.trim() || !isi.trim()) return;
        onSubmit({ subjek, isi });
    };

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) onClose();
            }}
        >
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <Mail className="h-4.5 w-4.5 text-emerald-600" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">
                                Kirim Email
                            </h3>
                            <p className="text-xs text-slate-500">Kepada {namaKandidat}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="text-slate-400 transition hover:text-slate-600"
                    >
                        <X className="h-4.5 w-4.5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            Subjek
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Informasi Tambahan Lamaran Kamu"
                            value={subjek}
                            onChange={(e) => setSubjek(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            Isi Pesan
                        </label>
                        <textarea
                            rows={6}
                            required
                            placeholder="Tulis pesan untuk kandidat..."
                            value={isi}
                            onChange={(e) => setIsi(e.target.value)}
                            disabled={loading}
                            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={loading || !subjek.trim() || !isi.trim()}
                            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Mengirim..." : "Kirim Email"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}