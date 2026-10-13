"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
}

const buatDaftarHalaman = (halaman: number, total: number): (number | "...")[] => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const hasil: (number | "...")[] = [1];
    const mulai = Math.max(2, halaman - 1);
    const akhir = Math.min(total - 1, halaman + 1);

    if (mulai > 2) hasil.push("...");

    for (let i = mulai; i <= akhir; i++) {
        hasil.push(i);
    }

    if (akhir < total - 1) hasil.push("...");

    hasil.push(total);

    return hasil;
};

export default function Pagination({
    total,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 25, 50],
}: PaginationProps) {
    const totalHalaman = Math.max(1, Math.ceil(total / pageSize));
    const dari = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const sampai = Math.min(page * pageSize, total);

    const daftar = buatDaftarHalaman(page, totalHalaman);

    const tombolDasar =
        "flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition";

    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span>
                    Menampilkan{" "}
                    <strong className="font-semibold text-slate-700">
                        {dari}-{sampai}
                    </strong>{" "}
                    dari{" "}
                    <strong className="font-semibold text-slate-700">{total}</strong>
                </span>

                {onPageSizeChange && (
                    <label className="flex items-center gap-2">
                        <span>Baris per halaman</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-emerald-500"
                        >
                            {pageSizeOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            {totalHalaman > 1 && (
                <div className="flex items-center gap-1.5">

                    <button
                        type="button"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        aria-label="Halaman sebelumnya"
                        className={
                            tombolDasar +
                            " border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        }
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {daftar.map((item, index) =>
                        item === "..." ? (
                            <span
                                key={"gap-" + index}
                                className="px-1 text-xs text-slate-400"
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onPageChange(item)}
                                aria-current={item === page ? "page" : undefined}
                                className={
                                    tombolDasar +
                                    (item === page
                                        ? " border-emerald-600 bg-emerald-600 text-white"
                                        : " border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                                }
                            >
                                {item}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalHalaman}
                        aria-label="Halaman berikutnya"
                        className={
                            tombolDasar +
                            " border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        }
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                </div>
            )}

        </div>
    );
}