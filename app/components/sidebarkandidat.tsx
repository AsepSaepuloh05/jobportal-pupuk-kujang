"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  UserRound,
  FileText,
  CalendarDays,
  LogOut,
} from "lucide-react";

type User = {
  id: number;
  nama: string;
  email: string;
  role: string;
  dokumenProfil?: {
    id: number;
    pathFile: string;
    namaFile?: string;
    namaAsli?: string;
    tipeFile?: string;
  } | null;
};

export default function SidebarKandidat() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fotoError, setFotoError] = useState(false);
  const [fotoVersion, setFotoVersion] = useState(Date.now());

  // ============================================================
  // GET DATA USER
  // ============================================================
  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (
          !data.success ||
          !data.user ||
          data.user.role !== "KANDIDAT"
        ) {
          router.replace("/login");
          return;
        }

        setUser(data.user);
        setFotoError(false);
        setFotoVersion(Date.now());
      } catch (error) {
        console.error("GET USER SIDEBAR ERROR:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  // ============================================================
  // LOGOUT
  // ============================================================
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  // ============================================================
  // MENU
  // ============================================================
  const menuItems = [
    {
      label: "Dashboard",
      href: "/kandidat",
      icon: LayoutDashboard,
    },
    {
      label: "Lowongan Pekerjaan",
      href: "/kandidat/lowongan",
      icon: BriefcaseBusiness,
    },
    {
      label: "Profil & Dokumen",
      href: "/kandidat/profil",
      icon: UserRound,
    },
    {
      label: "Lamaran Saya",
      href: "/kandidat/lamaran",
      icon: FileText,
    },
    
  ];

  // ============================================================
  // ACTIVE MENU
  // ============================================================
  const isActive = (href: string) => {
    if (href === "/kandidat") {
      return pathname === "/kandidat";
    }

    return pathname.startsWith(href);
  };

  // ============================================================
  // FOTO PROFIL
  // ============================================================
  const fotoPath = user?.dokumenProfil?.pathFile;

  const initial =
    user?.nama?.trim()?.charAt(0)?.toUpperCase() || "K";

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[250px] flex-col border-r border-slate-200 bg-white">

      {/* ======================================================
          HEADER / LOGO
      ====================================================== */}
      <div className="flex h-[76px] items-center border-b border-slate-100 px-5">
        <Link
          href="/kandidat"
          className="flex items-center gap-3"
        >
          {/* LOGO */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
            <img
              src="/Logo_kujang.jpg"
              alt="Logo Pupuk Kujang"
              className="h-full w-full object-cover"
            />
          </div>

          {/* NAMA SISTEM */}
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-bold text-slate-800">
              SIO Karir
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
              Sistem Informasi Karir
            </p>
          </div>
        </Link>
      </div>

      {/* ======================================================
          NAVIGATION
      ====================================================== */}
      <nav className="flex-1 overflow-y-auto px-4 py-5">

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Menu Utama
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.2 : 1.8}
                  className={
                    active
                      ? "text-emerald-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ======================================================
          BAGIAN ACCOUNT
      ====================================================== */}
      <div className="border-t border-slate-100 px-3 py-4">

        {/* LABEL ACCOUNT */}
        <p className="mb-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Account
        </p>

        {/* ====================================================
            PROFILE CARD
            SELURUH CARD BISA DIKLIK
        ==================================================== */}
        <Link
          href="/kandidat/profil"
          className={`group block rounded-2xl border p-2.5 transition-all ${
            pathname.startsWith("/kandidat/profil")
              ? "border-emerald-200 bg-emerald-50/60 shadow-sm"
              : "border-slate-200 bg-white shadow-sm hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-3">

            {/* FOTO PROFIL */}
            <div className="relative shrink-0">

              <div
                className={`h-10 w-10 overflow-hidden rounded-full bg-emerald-50 ring-2 ring-white ring-offset-1 ${
                  pathname.startsWith("/kandidat/profil")
                    ? "ring-offset-emerald-100"
                    : "ring-offset-slate-100"
                }`}
              >
                {!loading && fotoPath && !fotoError ? (
                  <img
                    src={`${fotoPath}?v=${fotoVersion}`}
                    alt={user?.nama || "Foto profil"}
                    className="h-full w-full object-cover"
                    onError={() => setFotoError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-emerald-600">
                    {initial}
                  </div>
                )}
              </div>

              {/* STATUS */}
              {!loading && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              )}

            </div>

            {/* DATA USER */}
            <div className="min-w-0 flex-1">

              {loading ? (
                <>
                  <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />

                  <div className="mt-1.5 h-3 w-16 animate-pulse rounded bg-slate-200" />
                </>
              ) : (
                <>
                  <p
                    className={`truncate text-[13px] font-semibold ${
                      pathname.startsWith("/kandidat/profil")
                        ? "text-emerald-700"
                        : "text-slate-800 group-hover:text-emerald-700"
                    }`}
                  >
                    {user?.nama || "Kandidat"}
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    Kandidat
                  </p>
                </>
              )}

            </div>

          </div>
        </Link>

        {/* ====================================================
            LOGOUT
        ==================================================== */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut
            size={17}
            strokeWidth={1.8}
          />

          <span>Keluar</span>
        </button>

      </div>
    </aside>
  );
}