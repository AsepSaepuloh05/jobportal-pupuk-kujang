"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastDetail {
    type: ToastType;
    message: string;
}

interface GayaToast {
    border: string;
    iconBox: string;
    icon: React.ElementType;
}

const TOAST_EVENT = "app-toast";

const GAYA: Record<ToastType, GayaToast> = {
    success: {
        border: "border-emerald-200",
        iconBox: "bg-emerald-100 text-emerald-600",
        icon: CheckCircle2,
    },
    error: {
        border: "border-red-200",
        iconBox: "bg-red-100 text-red-600",
        icon: AlertTriangle,
    },
    info: {
        border: "border-slate-200",
        iconBox: "bg-blue-100 text-blue-600",
        icon: Info,
    },
};

const kirim = (type: ToastType, message: string) => {
    if (typeof window === "undefined") return;

    window.dispatchEvent(
        new CustomEvent(TOAST_EVENT, { detail: { type, message } })
    );
};

export const toast = {
    success: (message: string) => kirim("success", message),
    error: (message: string) => kirim("error", message),
    info: (message: string) => kirim("info", message),
};

export default function ToastViewport() {
    const [items, setItems] = useState<ToastItem[]>([]);

    useEffect(() => {
        let counter = 0;
        const timers: ReturnType<typeof setTimeout>[] = [];

        const onToast = (e: Event) => {
            const detail = (e as CustomEvent<ToastDetail>).detail;

            counter += 1;

            const id = Date.now() + counter;

            setItems((prev) =>
                [...prev, { id, type: detail.type, message: detail.message }].slice(-4)
            );

            const lama = detail.type === "error" ? 6000 : 4000;

            timers.push(
                setTimeout(() => {
                    setItems((prev) => prev.filter((item) => item.id !== id));
                }, lama)
            );
        };

        window.addEventListener(TOAST_EVENT, onToast);

        return () => {
            window.removeEventListener(TOAST_EVENT, onToast);
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, []);

    const tutup = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed right-4 top-4 z-[300] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6 sm:top-6"
        >
            {items.map((item) => {
                const gaya = GAYA[item.type];
                const Icon = gaya.icon;

                return (
                    <div
                        key={item.id}
                        role={item.type === "error" ? "alert" : "status"}
                        className={
                            "pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 shadow-lg animate-in fade-in slide-in-from-right-4 duration-200 " +
                            gaya.border
                        }
                    >
                        <span
                            className={
                                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full " +
                                gaya.iconBox
                            }
                        >
                            <Icon className="h-3.5 w-3.5" />
                        </span>

                        <p className="flex-1 text-sm font-medium leading-5 text-slate-700">
                            {item.message}
                        </p>

                        <button
                            type="button"
                            onClick={() => tutup(item.id)}
                            aria-label="Tutup notifikasi"
                            className="shrink-0 text-slate-300 transition hover:text-slate-500"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}