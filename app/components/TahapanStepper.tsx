"use client";

import { Check, Hourglass, X, CalendarClock, MapPin } from "lucide-react";

interface ProgressItem {
    tahapan: string;
    urutan: number;
    selesaiPada: string | null;
    jadwalTanggal: string | null;
    jadwalLokasi: string | null;
    jadwalCatatan: string | null;
}

interface TahapanStepperProps {
    tahapanList: string[];
    progressList: ProgressItem[];
    ditolak: boolean;
    disabled?: boolean;
    onSelesaikan: (tahapan: string) => void;
    onSetJadwal: (tahapan: string) => void;
}

interface StepItem {
    tahapan: string;
    selesai: string | null;
    jadwal: string | null;
    lokasi: string | null;
    isSaatIni: boolean;
    isTitikTolak: boolean;
    isSetelahTolak: boolean;
    butuhJadwal: boolean;
    bisaSelesai: boolean;
    garisKiri: string;
    garisKanan: string;
}

const TAHAPAN_LABEL: Record<string, string> = {
    SCREENING: "Screening",
    ASSESSMENT: "Assessment",
    INTERVIEW: "Interview",
    TECHNICAL_TEST: "Technical Test",
    MCU: "MCU",
    OFFERING: "Offering",
};

const formatTanggal = (iso: string) => {
    return new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta",
    });
};

const formatJam = (iso: string) => {
    const jam = new Date(iso).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
    });

    return jam.replace(".", ":") + " WIB";
};

export default function TahapanStepper({
    tahapanList,
    progressList,
    ditolak,
    disabled = false,
    onSelesaikan,
    onSetJadwal,
}: TahapanStepperProps) {
    const tahapanSaatIni = [...progressList]
        .sort((a, b) => a.urutan - b.urutan)
        .find((p) => p.selesaiPada === null)?.tahapan;

    const cari = (tahapan: string) =>
        progressList.find((p) => p.tahapan === tahapan);

    const items: StepItem[] = tahapanList.map((tahapan, index) => {
        const progress = cari(tahapan);
        const selesai = progress?.selesaiPada || null;
        const jadwal = progress?.jadwalTanggal || null;
        const lokasi = progress?.jadwalLokasi || null;

        const isSaatIni = !ditolak && tahapanSaatIni === tahapan;
        const isTitikTolak = ditolak && tahapanSaatIni === tahapan;
        const isSetelahTolak = ditolak && !selesai && !isTitikTolak;

        const butuhJadwal = tahapan !== "SCREENING";
        const bisaSelesai = isSaatIni && (!butuhJadwal || Boolean(jadwal));

        const prevSelesai =
            index > 0
                ? Boolean(cari(tahapanList[index - 1])?.selesaiPada)
                : false;

        return {
            tahapan,
            selesai,
            jadwal,
            lokasi,
            isSaatIni,
            isTitikTolak,
            isSetelahTolak,
            butuhJadwal,
            bisaSelesai,
            garisKiri: prevSelesai ? "bg-emerald-400" : "bg-slate-200",
            garisKanan: selesai ? "bg-emerald-400" : "bg-slate-200",
        };
    });

    const gridStyle = {
        gridTemplateColumns: "repeat(" + tahapanList.length + ", minmax(0, 1fr))",
    };

    const renderLingkaran = (it: StepItem) => {
        if (it.selesai) {
            return (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                    <Check className="h-5 w-5" strokeWidth={3} />
                </span>
            );
        }

        if (it.isTitikTolak) {
            return (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white shadow-sm">
                    <X className="h-5 w-5" strokeWidth={3} />
                </span>
            );
        }

        if (it.isSetelahTolak) {
            return (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                    <X className="h-4 w-4" />
                </span>
            );
        }

        if (it.isSaatIni) {
            return (
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-emerald-500 bg-white ring-4 ring-emerald-100">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
                </span>
            );
        }

        return (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                <Hourglass className="h-4 w-4" />
            </span>
        );
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[680px]">

                {/* BARIS 1 - PANGGILAN (DI ATAS GARIS) */}

                <div className="grid" style={gridStyle}>
                    {items.map((it) => (
                        <div
                            key={it.tahapan}
                            className="flex min-h-[8px] flex-col items-center justify-end px-2"
                        >
                            {it.jadwal ? (
                                <>
                                    <div className="w-full max-w-[160px] rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-2 text-center">
                                        <p className="text-[9.5px] font-bold uppercase leading-tight tracking-wide text-blue-600">
                                            Panggilan {TAHAPAN_LABEL[it.tahapan]}
                                        </p>
                                        <p className="mt-1 text-[11px] font-semibold text-slate-800">
                                            {formatTanggal(it.jadwal)}
                                        </p>
                                        <p className="text-[10px] text-slate-600">
                                            {formatJam(it.jadwal)}
                                        </p>

                                        {it.lokasi && (
                                            <p
                                                title={it.lokasi}
                                                className="mt-1 flex items-center justify-center gap-1 text-[10px] text-slate-500"
                                            >
                                                <MapPin className="h-2.5 w-2.5 shrink-0" />
                                                <span className="truncate">{it.lokasi}</span>
                                            </p>
                                        )}

                                        {it.isSaatIni && (
                                            <button
                                                type="button"
                                                disabled={disabled}
                                                onClick={() => onSetJadwal(it.tahapan)}
                                                className="mt-1.5 text-[10px] font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                                            >
                                                Ubah jadwal
                                            </button>
                                        )}
                                    </div>
                                    <span className="h-3 w-px bg-blue-200" />
                                </>
                            ) : it.isSaatIni && it.butuhJadwal ? (
                                <>
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onSetJadwal(it.tahapan)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                                    >
                                        <CalendarClock className="h-3.5 w-3.5" />
                                        Set Jadwal
                                    </button>
                                    <span className="h-3 w-px bg-emerald-200" />
                                </>
                            ) : null}
                        </div>
                    ))}
                </div>

                {/* BARIS 2 - GARIS + LINGKARAN */}

                <div className="grid" style={gridStyle}>
                    {items.map((it, index) => (
                        <div
                            key={it.tahapan}
                            className="relative flex h-12 items-center justify-center"
                        >
                            {index > 0 && (
                                <div
                                    className={
                                        "absolute left-0 right-1/2 top-1/2 h-1 -translate-y-1/2 " +
                                        it.garisKiri
                                    }
                                />
                            )}

                            {index < items.length - 1 && (
                                <div
                                    className={
                                        "absolute left-1/2 right-0 top-1/2 h-1 -translate-y-1/2 " +
                                        it.garisKanan
                                    }
                                />
                            )}

                            <div className="relative z-10">{renderLingkaran(it)}</div>
                        </div>
                    ))}
                </div>

                {/* BARIS 3 - NAMA TAHAPAN + STATUS */}

                <div className="grid" style={gridStyle}>
                    {items.map((it) => (
                        <div
                            key={it.tahapan}
                            className="mt-2 flex flex-col items-center px-1 text-center"
                        >
                            <span
                                className={
                                    "text-xs font-semibold " +
                                    (it.selesai || it.isSaatIni
                                        ? "text-slate-800"
                                        : "text-slate-400")
                                }
                            >
                                {TAHAPAN_LABEL[it.tahapan]}
                            </span>

                            {it.selesai && (
                                <span className="mt-0.5 text-[10px] font-medium text-emerald-600">
                                    {formatTanggal(it.selesai)}
                                </span>
                            )}

                            {it.isSaatIni && (
                                <span className="mt-0.5 text-[10px] font-medium text-emerald-600">
                                    Sedang berjalan
                                </span>
                            )}

                            {it.isTitikTolak && (
                                <span className="mt-0.5 text-[10px] font-semibold text-red-500">
                                    Ditolak di sini
                                </span>
                            )}

                            {it.bisaSelesai && (
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => onSelesaikan(it.tahapan)}
                                    className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Check className="h-3 w-3" strokeWidth={3} />
                                    Tandai selesai
                                </button>
                            )}

                            {it.isSaatIni && it.butuhJadwal && !it.jadwal && (
                                <span className="mt-1 text-[10px] text-slate-400">
                                    Set jadwal dulu
                                </span>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}