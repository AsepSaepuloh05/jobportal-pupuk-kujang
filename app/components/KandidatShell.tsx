"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Menu } from "lucide-react";
import SidebarKandidat from "./sidebarkandidat";

const SIDEBAR_KEY = "kandidat-sidebar-collapsed";
const SIDEBAR_EVENT = "kandidat-sidebar-change";

const subscribeCollapsed = (callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener(SIDEBAR_EVENT, callback);

    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(SIDEBAR_EVENT, callback);
    };
};

const getCollapsedSnapshot = () => {
    try {
        return window.localStorage.getItem(SIDEBAR_KEY) === "1";
    } catch {
        return false;
    }
};

const getCollapsedServerSnapshot = () => false;

export default function KandidatShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const collapsed = useSyncExternalStore(
        subscribeCollapsed,
        getCollapsedSnapshot,
        getCollapsedServerSnapshot
    );

    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!mobileOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMobileOpen(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [mobileOpen]);

    const toggleCollapsed = () => {
        try {
            window.localStorage.setItem(SIDEBAR_KEY, collapsed ? "0" : "1");
        } catch {
            /* penyimpanan tidak tersedia, abaikan */
        }

        window.dispatchEvent(new Event(SIDEBAR_EVENT));
    };

    return (
        <main className="min-h-screen bg-slate-50">

            {/* OVERLAY (LAYAR KECIL) */}

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-[45] bg-slate-900/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* SIDEBAR */}

            <SidebarKandidat
                collapsed={collapsed}
                mobileOpen={mobileOpen}
                onToggleCollapse={toggleCollapsed}
                onCloseMobile={() => setMobileOpen(false)}
            />

            {/* CONTENT */}

            <section
                className={
                    "min-h-screen transition-[margin] duration-300 " +
                    (collapsed ? "lg:ml-[76px]" : "lg:ml-[250px]")
                }
            >

                {/* BAR ATAS (LAYAR KECIL) */}

                <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">

                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Buka menu"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    >
                        <Menu size={18} />
                    </button>

                    <span className="text-sm font-bold text-slate-800">SIO Karir</span>

                </div>

                {children}

            </section>

        </main>
    );
}