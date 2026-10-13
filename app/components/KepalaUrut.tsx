"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface KepalaUrutProps<T extends string> {
    label: string;
    kunci: T;
    aktif: T;
    arah: "asc" | "desc";
    onSort: (kunci: T) => void;
}

export default function KepalaUrut<T extends string>({
    label,
    kunci,
    aktif,
    arah,
    onSort,
}: KepalaUrutProps<T>) {
    const sedangAktif = aktif === kunci;

    return (
        <th
            aria-sort={
                sedangAktif
                    ? arah === "asc"
                        ? "ascending"
                        : "descending"
                    : "none"
            }
            className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
            <button
                type="button"
                onClick={() => onSort(kunci)}
                className={
                    "inline-flex items-center gap-1.5 uppercase tracking-wide transition hover:text-slate-800 " +
                    (sedangAktif ? "text-slate-800" : "")
                }
            >
                {label}

                {sedangAktif ? (
                    arah === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                    ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                    )
                ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-300" />
                )}
            </button>
        </th>
    );
}