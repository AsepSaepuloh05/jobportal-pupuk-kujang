"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
    onRetry: () => void;
    homeHref: string;
    homeLabel: string;
    fullScreen?: boolean;
}

export default function ErrorState({
    onRetry,
    homeHref,
    homeLabel,
    fullScreen = false,
}: ErrorStateProps) {
    return (
        <div
            className={
                "flex items-center justify-center px-6 " +
                (fullScreen ? "min-h-screen bg-[#f6faf8]" : "min-h-[60vh]")
            }
        >
            <div className="w-full max-w-md text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <AlertTriangle className="h-7 w-7" />
                </div>

                <h1 className="mt-5 text-xl font-bold text-slate-900">
                    Terjadi kesalahan
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Maaf, halaman ini tidak dapat ditampilkan. Coba muat ulang, dan
                    jika masalah berlanjut hubungi administrator.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={onRetry}
                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        Coba Lagi
                    </button>

                    <Link
                        href={homeHref}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        {homeLabel}
                    </Link>
                </div>

            </div>
        </div>
    );
}