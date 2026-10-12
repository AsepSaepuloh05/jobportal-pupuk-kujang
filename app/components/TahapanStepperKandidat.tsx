"use client";

import { Check, X, MapPin } from "lucide-react";

export interface ProgressKandidat {
    tahapan: string;
    urutan: number;
    selesaiPada: string | null;
    jadwalTanggal: string | null;
    jadwalLokasi: string | null;
    jadwalCatatan: string | null;
}

interface TahapanStepperKandidatProps {
    tahapanList: string[];
    progressList: ProgressKandidat[];
    ditolak: boolean;
}

interface StepItem {
    tahapan: string;
    nomor: number;
    selesai: string | null;
    jadwal: string | null;
    lokasi: string | null;
    isSaatIni: boolean;
    isTitikTolak: boolean;
    isSetelahTolak: boolean;
    garisKiri: boolean;
    garisKanan: boolean;
}

const TAHAPAN_LABEL: Record<string, string> = {
    SCREENING: "Screening",
    ASSESSMENT: "Assessment",
    INTERVIEW: "Interview",
    TECHNICAL_TEST: "Technical Test",
    MCU: "MCU",
    OFFERING: "Offering",
};

export const formatTanggalWib = (iso: string) => {
    return new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta",
    });
};

export const formatJamWib = (iso: string) => {
    const jam = new Date(iso).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
    });

    return jam.replace(".", ":") + " WIB";
};

export default function TahapanStepperKandidat({
    tahapanList,
    progressList,
    ditolak,
}: TahapanStepperKandidatProps) {
    const tahapanSaatIni = [...progressList]
        .sort((a, b) => a.urutan - b.urutan)
        .find((p) => p.selesaiPada === null)?.tahapan;

    const cari = (tahapan: string) =>
        progressList.find((p) => p.tahapan === tahapan);

    const items: StepItem[] = tahapanList.map((tahapan, index) => {
        const progress = cari(tahapan);
        const selesai = progress?.selesaiPada || null;

        return {
            tahapan,
            nomor: index + 1,
            selesai,
            jadwal: progress?.jadwalTanggal || null,
            lokasi: progress?.jadwalLokasi || null,
            isSaatIni: !ditolak && tahapanSaatIni === tahapan,
            isTitikTolak: ditolak && tahapanSaatIni === tahapan,
            isSetelahTolak: ditolak && !selesai && tahapanSaatIni !== tahapan,
            garisKiri:
                index > 0
                    ? Boolean(cari(tahapanList[index - 1])?.selesaiPada)
                    : false,
            garisKanan: Boolean(selesai),
        };
    });

    const gridStyle = {
        gridTemplateColumns: "repeat(" + items.length + ", minmax(0, 1fr))",
    };

    const renderLingkaran = (it: StepItem, kecil: boolean) => {
        const ukuran = kecil ? "h-8 w-8" : "h-10 w-10";
        const ikon = kecil ? "h-4 w-4" : "h-5 w-5";

        if (it.selesai) {
            return (
                <span
                    className={
                        "flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm " +
                        ukuran
                    }
                >
                    <Check className={ikon} strokeWidth={3} />
                </span>
            );
        }

        if (it.isTitikTolak) {
            return (
                <span
                    className={
                        "flex items-center justify-center rounded-full bg-red-500 text-white shadow-sm " +
                        ukuran
                    }
                >
                    <X className={ikon} strokeWidth={3} />
                </span>
            );
        }

        if (it.isSetelahTolak) {
            return (
                <span
                    className={
                        "flex items-center justify-center rounded-full bg-slate-100 text-slate-300 " +
                        ukuran
                    }
                >
                    <X className="h-3.5 w-3.5" />
                </span>
            );
        }

        if (it.isSaatIni) {
            return (
                <span
                    className={
                        "flex items-center justify-center rounded-full border-[3px] border-emerald-500 bg-white ring-4 ring-emerald-100 " +
                        ukuran
                    }
                >
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                </span>
            );
        }

        return (
            <span
                className={
                    "flex items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400 " +
                    ukuran
                }
            >
                {it.nomor}
            </span>
        );
    };

    const renderPanggilan = (it: StepItem, tengah: boolean) => {
        if (!it.jadwal) return null;

        const aktif = it.isSaatIni;

        return (
            <div
                className={
                    "w-full rounded-lg border px-2.5 py-2 " +
                    (tengah ? "max-w-[170px] text-center " : "max-w-xs text-left ") +
                    (aktif
                        ? "border-blue-100 bg-blue-50"
                        : "border-slate-200 bg-slate-50")
                }
            >
                <p
                    className={
                        "text-[9.5px] font-bold uppercase leading-tight tracking-wide " +
                        (aktif ? "text-blue-700" : "text-slate-400")
                    }
                >
                    Panggilan {TAHAPAN_LABEL[it.tahapan]}
                </p>

                <p
                    className={
                        "mt-1 text-[11px] font-semibold " +
                        (aktif ? "text-slate-900" : "text-slate-500")
                    }
                >
                    {formatTanggalWib(it.jadwal)}
                </p>

                <p
                    className={
                        "text-[10px] " + (aktif ? "text-slate-600" : "text-slate-400")
                    }
                >
                    {formatJamWib(it.jadwal)}
                </p>

                {it.lokasi && (
                    <p
                        title={it.lokasi}
                        className={
                            "mt-1 flex items-center gap-1 text-[10px] text-slate-500 " +
                            (tengah ? "justify-center" : "justify-start")
                        }
                    >
                        <MapPin className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{it.lokasi}</span>
                    </p>
                )}
            </div>
        );
    };

    const renderStatus = (it: StepItem) => {
        if (it.selesai) {
            return (
                <span className="text-[10px] font-medium text-emerald-600">
                    Selesai {formatTanggalWib(it.selesai)}
                </span>
            );
        }

        if (it.isTitikTolak) {
            return (
                <span className="text-[10px] font-semibold text-red-500">
                    Tidak dilanjutkan
                </span>
            );
        }

        if (it.isSaatIni) {
            return (
                <span className="text-[10px] font-medium text-emerald-600">
                    Sedang berjalan
                </span>
            );
        }

        return null;
    };

    return (
        <div className="@container w-full">

            {/* ======================================================
          TAMPILAN HORIZONTAL (KARTU CUKUP LEBAR)
      ====================================================== */}

            <div className="hidden @2xl:block">

                {/* BARIS 1 - PANGGILAN */}

                <div className="grid" style={gridStyle}>
                    {items.map((it) => (
                        <div
                            key={it.tahapan}
                            className="flex flex-col items-center justify-end px-1.5"
                        >
                            {renderPanggilan(it, true)}

                            {it.jadwal && (
                                <span
                                    className={
                                        "h-3 w-px " +
                                        (it.isSaatIni ? "bg-blue-200" : "bg-slate-200")
                                    }
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* BARIS 2 - GARIS DAN LINGKARAN */}

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
                                        (it.garisKiri ? "bg-emerald-400" : "bg-slate-200")
                                    }
                                />
                            )}

                            {index < items.length - 1 && (
                                <div
                                    className={
                                        "absolute left-1/2 right-0 top-1/2 h-1 -translate-y-1/2 " +
                                        (it.garisKanan ? "bg-emerald-400" : "bg-slate-200")
                                    }
                                />
                            )}

                            <div className="relative z-10">{renderLingkaran(it, false)}</div>
                        </div>
                    ))}
                </div>

                {/* BARIS 3 - NAMA TAHAPAN */}

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

                            {renderStatus(it)}
                        </div>
                    ))}
                </div>

            </div>

            {/* ======================================================
          TAMPILAN VERTIKAL (KARTU SEMPIT / HP)
      ====================================================== */}

            <ol className="@2xl:hidden">
                {items.map((it, index) => (
                    <li key={it.tahapan} className="flex gap-3">

                        <div className="flex flex-col items-center">
                            {renderLingkaran(it, true)}

                            {index < items.length - 1 && (
                                <span
                                    className={
                                        "my-1 min-h-[18px] w-0.5 flex-1 " +
                                        (it.selesai ? "bg-emerald-400" : "bg-slate-200")
                                    }
                                />
                            )}
                        </div>

                        <div className="min-w-0 flex-1 pb-4">
                            <p
                                className={
                                    "text-sm font-semibold " +
                                    (it.selesai || it.isSaatIni
                                        ? "text-slate-800"
                                        : "text-slate-400")
                                }
                            >
                                {TAHAPAN_LABEL[it.tahapan]}
                            </p>

                            <div className="mt-0.5">{renderStatus(it)}</div>

                            {it.jadwal && (
                                <div className="mt-2">{renderPanggilan(it, false)}</div>
                            )}
                        </div>

                    </li>
                ))}
            </ol>

        </div>
    );
}