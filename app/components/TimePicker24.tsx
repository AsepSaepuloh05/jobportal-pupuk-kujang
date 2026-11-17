"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface TimePicker24Props {
    value: string; // "HH:mm"
    onChange: (value: string) => void;
    disabled?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
);

const MINUTES = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
);

export default function TimePicker24({
    value,
    onChange,
    disabled = false,
}: TimePicker24Props) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const hourListRef = useRef<HTMLDivElement>(null);
    const minuteListRef = useRef<HTMLDivElement>(null);

    const [rawHour = "09", rawMinute = "00"] = (value || "09:00").split(":");
    const selectedHour = HOURS.includes(rawHour) ? rawHour : "09";
    const selectedMinute = MINUTES.includes(rawMinute) ? rawMinute : "00";

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const scrollColumn = (
            listEl: HTMLDivElement | null,
            activeVal: string
        ) => {
            if (!listEl) return;
            const activeBtn = listEl.querySelector<HTMLButtonElement>(
                `[data-val="${activeVal}"]`
            );
            if (activeBtn) {
                listEl.scrollTop =
                    activeBtn.offsetTop -
                    listEl.clientHeight / 2 +
                    activeBtn.clientHeight / 2;
            }
        };

        scrollColumn(hourListRef.current, selectedHour);
        scrollColumn(minuteListRef.current, selectedMinute);
    }, [open]);

    const pilihJam = (h: string) => {
        onChange(`${h}:${selectedMinute}`);
    };

    const pilihMenit = (m: string) => {
        onChange(`${selectedHour}:${m}`);
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((prev) => !prev)}
                className={
                    "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 " +
                    (open
                        ? "border-emerald-500 ring-2 ring-emerald-500/15"
                        : "border-slate-200 bg-white hover:border-slate-300")
                }
            >
                <span className="font-medium tracking-wide">
                    {selectedHour}:{selectedMinute}
                </span>
                <Clock className="h-4 w-4 text-slate-400" />
            </button>

            {open && (
                <div className="absolute right-0 z-[200] mt-1.5 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50 py-1.5 text-center text-[11px] font-semibold text-slate-500">
                        <span>Jam</span>
                        <span>Menit</span>
                    </div>

                    <div className="grid h-48 grid-cols-2 divide-x divide-slate-100">
                        {/* KOLOM GULIR JAM (00 - 23) */}
                        <div
                            ref={hourListRef}
                            className="overflow-y-auto p-1 scrollbar-thin"
                        >
                            {HOURS.map((h) => {
                                const aktif = h === selectedHour;
                                return (
                                    <button
                                        key={h}
                                        type="button"
                                        data-val={h}
                                        onClick={() => pilihJam(h)}
                                        className={
                                            "flex w-full items-center justify-center rounded-lg py-1.5 text-xs font-semibold transition " +
                                            (aktif
                                                ? "bg-emerald-600 text-white"
                                                : "text-slate-700 hover:bg-slate-100")
                                        }
                                    >
                                        {h}
                                    </button>
                                );
                            })}
                        </div>

                        {/* KOLOM GULIR MENIT (00 - 59) */}
                        <div
                            ref={minuteListRef}
                            className="overflow-y-auto p-1 scrollbar-thin"
                        >
                            {MINUTES.map((m) => {
                                const aktif = m === selectedMinute;
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        data-val={m}
                                        onClick={() => pilihMenit(m)}
                                        className={
                                            "flex w-full items-center justify-center rounded-lg py-1.5 text-xs font-semibold transition " +
                                            (aktif
                                                ? "bg-emerald-600 text-white"
                                                : "text-slate-700 hover:bg-slate-100")
                                        }
                                    >
                                        {m}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

