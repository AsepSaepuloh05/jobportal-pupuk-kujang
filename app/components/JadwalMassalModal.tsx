"use client";

import { useState } from "react";
import { X, CalendarClock, MapPin, Mail } from "lucide-react";

export interface KandidatJadwalItem {
    id: number;
    nama: string;
}

interface JadwalMassalModalProps {
    open: boolean;
    tahapanLabel: string;
    kandidat: KandidatJadwalItem[];
    dilewatiCount?: number;
    loading: boolean;
    onClose: () => void;
    onSubmit: (data: {
        jadwalTanggal: string;
        jadwalLokasi: string;
        jadwalCatatan: string;
        kirimEmail: boolean;
    }) => void;
}

export default function JadwalMassalModal({
    open,
    tahapanLabel,
    kandidat,
    dilewatiCount = 0,
    loading,
    onClose,
    onSubmit,
}: JadwalMassalModalProps) {
    const [tanggal, setTanggal] = useState("");
    const [jam, setJam] = useState("09:00");
    const [lokasi, setLokasi] = useState("");
    const [catatan, setCatatan] = useState("");
    const [kirimEmail, setKirimEmail] = useState(true);

    if (!open) return null;

    const labelTanggalPreview = tanggal
        ? new Date(`${tanggal}T${jam || "00:00"}`).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tanggal || !jam) return;

        onSubmit({
            jadwalTanggal: `${tanggal}T${jam}`,
            jadwalLokasi: lokasi,
            jadwalCatatan: catatan,
            kirimEmail,
        });
    };

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) onClose();
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <CalendarClock className="h-4.5 w-4.5 text-emerald-600" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">
                                Atur Jadwal Massal &middot; {tahapanLabel}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {kandidat.length} kandidat akan dijadwalkan
                                {dilewatiCount > 0
                                    ? ` (${dilewatiCount} dilewati karena sudah selesai/ditolak)`
                                    : ""}
                            </p>
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

                <form
                    onSubmit={handleSubmit}
                    className="flex-1 space-y-4 overflow-y-auto p-6"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                Tanggal
                            </label>
                            <input
                                type="date"
                                required
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                Jam
                            </label>
                            <input
                                type="time"
                                required
                                value={jam}
                                onChange={(e) => setJam(e.target.value)}
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <MapPin className="h-3.5 w-3.5" />
                            Lokasi (opsional)
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: Kantor Pusat, Cikampek / Zoom Meeting"
                            value={lokasi}
                            onChange={(e) => setLokasi(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            Catatan Tambahan (opsional)
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Contoh: Membawa dokumen asli, berpakaian rapi..."
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            disabled={loading}
                            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700">
                                Kandidat Terpilih ({kandidat.length})
                            </span>
                            {labelTanggalPreview && jam && (
                                <span className="text-xs font-semibold text-emerald-700">
                                    {labelTanggalPreview} &middot; {jam} WIB
                                </span>
                            )}
                        </div>
                        <div className="max-h-36 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70">
                            {kandidat.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between px-3.5 py-2 text-xs"
                                >
                                    <span className="font-medium text-slate-700">
                                        {idx + 1}. {item.nama}
                                    </span>
                                    <span className="text-slate-500">
                                        {labelTanggalPreview && jam
                                            ? `${labelTanggalPreview}, ${jam} WIB`
                                            : "-"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-slate-50 px-3.5 py-3">
                        <input
                            type="checkbox"
                            checked={kirimEmail}
                            onChange={(e) => setKirimEmail(e.target.checked)}
                            disabled={loading}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                            <Mail className="h-3.5 w-3.5" />
                            Kirim email undangan jadwal ke tiap kandidat
                        </span>
                    </label>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={loading || !tanggal || !jam}
                            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Menyimpan..." : "Simpan Jadwal"}
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
