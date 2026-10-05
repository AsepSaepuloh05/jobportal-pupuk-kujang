"use client";

import { useEffect, useState } from "react";
import { X, Mail, CheckCircle2, XCircle, Inbox } from "lucide-react";

interface EmailLogItem {
    id: number;
    tipe: "UNDANGAN" | "HASIL_LOLOS" | "HASIL_DITOLAK" | "BEBAS";
    tahapan: string | null;
    penerima: string;
    subjek: string;
    isi: string;
    status: "TERKIRIM" | "GAGAL";
    errorMessage: string | null;
    createdAt: string;
}

interface EmailHistoryModalProps {
    open: boolean;
    lamaranId: number | null;
    namaKandidat: string;
    onClose: () => void;
}

const TIPE_LABEL: Record<string, string> = {
    UNDANGAN: "Undangan Jadwal",
    HASIL_LOLOS: "Hasil - Lolos",
    HASIL_DITOLAK: "Hasil - Ditolak",
    BEBAS: "Email Bebas",
};

const TIPE_BADGE: Record<string, string> = {
    UNDANGAN: "bg-blue-100 text-blue-700",
    HASIL_LOLOS: "bg-emerald-100 text-emerald-700",
    HASIL_DITOLAK: "bg-red-100 text-red-700",
    BEBAS: "bg-slate-100 text-slate-700",
};

export default function EmailHistoryModal({
    open,
    lamaranId,
    namaKandidat,
    onClose,
}: EmailHistoryModalProps) {
    const [logs, setLogs] = useState<EmailLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        if (!open || !lamaranId) return;

        const getLogs = async () => {
            try {
                setLoading(true);

                const response = await fetch(`/api/lamaran/${lamaranId}/email`);

                if (!response.ok) {
                    throw new Error("Gagal mengambil histori email");
                }

                setLogs(await response.json());
            } catch (error) {
                console.error("GET EMAIL LOG ERROR:", error);
            } finally {
                setLoading(false);
            }
        };

        getLogs();
    }, [open, lamaranId]);

    if (!open) return null;

    const formatTanggalJam = (date: string) => {
        return (
            new Date(date).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }) + " WIB"
        );
    };

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="max-h-[85vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <Mail className="h-4.5 w-4.5 text-emerald-600" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">
                                Histori Email
                            </h3>
                            <p className="text-xs text-slate-500">Kepada {namaKandidat}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 transition hover:text-slate-600"
                    >
                        <X className="h-4.5 w-4.5" />
                    </button>
                </div>

                <div className="max-h-[calc(85vh-70px)] overflow-y-auto p-4">

                    {loading ? (

                        <div className="flex flex-col items-center gap-3 py-12">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                            <span className="text-sm text-slate-500">Memuat histori...</span>
                        </div>

                    ) : logs.length === 0 ? (

                        <div className="flex flex-col items-center gap-2 py-12">
                            <Inbox className="h-7 w-7 text-slate-300" strokeWidth={1.8} />
                            <p className="text-sm text-slate-500">
                                Belum ada email yang terkirim ke kandidat ini.
                            </p>
                        </div>

                    ) : (

                        <div className="space-y-2">
                            {logs.map((log) => {
                                const isExpanded = expandedId === log.id;

                                return (
                                    <div
                                        key={log.id}
                                        className="overflow-hidden rounded-xl border border-slate-200"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedId(isExpanded ? null : log.id)
                                            }
                                            className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                                        >
                                            <div className="min-w-0">
                                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIPE_BADGE[log.tipe]}`}
                                                    >
                                                        {TIPE_LABEL[log.tipe]}
                                                    </span>

                                                    {log.status === "TERKIRIM" ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Terkirim
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600">
                                                            <XCircle className="h-3 w-3" />
                                                            Gagal
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="truncate text-xs font-semibold text-slate-700">
                                                    {log.subjek}
                                                </p>

                                                <p className="mt-0.5 text-[11px] text-slate-400">
                                                    {formatTanggalJam(log.createdAt)}
                                                </p>
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="border-t border-slate-100 bg-slate-50 p-4">
                                                {log.status === "GAGAL" && log.errorMessage && (
                                                    <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                                                        Error: {log.errorMessage}
                                                    </p>
                                                )}

                                                <div
                                                    className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-xs"
                                                    dangerouslySetInnerHTML={{ __html: log.isi }}
                                                />
                                            </div>
                                        )}

                                    </div>
                                );
                            })}
                        </div>

                    )}

                </div>

            </div>
        </div>
    );
}