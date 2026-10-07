"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  ClipboardCheck,
  UserCircle,
  LogOut,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
} from "lucide-react";

interface User {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
  fotoProfil?: { pathFile: string } | null;
}

const SIDEBAR_KEY = "hr-sidebar-collapsed";

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    try {
      return window.localStorage.getItem(SIDEBAR_KEY) === "1";
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // =====================================================
  // CEK USER
  // =====================================================

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/me");

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!data.user || data.user.role !== "HR") {
          router.replace("/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("GET USER ERROR:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  // =====================================================
  // REFRESH USER SAAT PROFIL DIPERBARUI
  // =====================================================

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const response = await fetch("/api/me", { cache: "no-store" });

        if (!response.ok) return;

        const data = await response.json();

        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("REFRESH USER ERROR:", error);
      }
    };

    window.addEventListener("hr-profile-updated", refreshUser);

    return () => {
      window.removeEventListener("hr-profile-updated", refreshUser);
    };
  }, []);

  // =====================================================
  // TUTUP DRAWER DENGAN TOMBOL ESCAPE
  // =====================================================

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

  // =====================================================
  // TOGGLE & LOGOUT
  // =====================================================

  const toggleCollapsed = () => {
    const next = !collapsed;

    setCollapsed(next);

    try {
      window.localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
    } catch {
      /* penyimpanan tidak tersedia, abaikan */
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      router.replace("/login");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

          <span className="text-sm font-medium text-slate-500">
            Memuat halaman...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // =====================================================
  // ACTIVE MENU
  // =====================================================

  const isActive = (path: string) => {
    if (path === "/hr") {
      return pathname === "/hr";
    }

    return pathname.startsWith(path);
  };

  const goTo = (path: string) => {
    setMobileOpen(false);
    router.push(path);
  };

  // =====================================================
  // MENU
  // =====================================================

  const menuItems = [
    {
      label: "Dashboard",
      path: "/hr",
      icon: LayoutDashboard,
    },
    {
      label: "Kelola Lowongan",
      path: "/hr/kelolalowongan",
      icon: BriefcaseBusiness,
    },
    {
      label: "Data Kandidat",
      path: "/hr/daftarkandidat",
      icon: Users,
    },
    {
      label: "Proses Seleksi",
      path: "/hr/seleksi",
      icon: ClipboardCheck,
    },
  ];

  const sembunyiSaatKecil = collapsed ? "lg:hidden" : "";

  const renderNavItem = (
    path: string,
    label: string,
    Icon: React.ElementType
  ) => {
    const active = isActive(path);

    return (
      <button
        key={path}
        type="button"
        onClick={() => goTo(path)}
        title={collapsed ? label : undefined}
        className={
          "group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200 " +
          (collapsed ? "lg:justify-center lg:px-0 " : "") +
          (active
            ? "bg-emerald-50 text-emerald-600"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")
        }
      >
        <div className="flex items-center gap-3">
          <Icon
            size={19}
            strokeWidth={active ? 2.3 : 2}
            className={
              active
                ? "text-emerald-600"
                : "text-slate-400 transition-colors group-hover:text-slate-600"
            }
          />

          <span className={sembunyiSaatKecil}>{label}</span>
        </div>

        {active && (
          <ChevronRight
            size={16}
            strokeWidth={2.2}
            className={"text-emerald-500 " + sembunyiSaatKecil}
          />
        )}
      </button>
    );
  };

  return (
    <main className="flex min-h-screen bg-slate-50">

      {/* =====================================================
          OVERLAY (LAYAR KECIL)
      ===================================================== */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={
          "fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-slate-200 bg-white transition-all duration-300 " +
          (collapsed ? "lg:w-[76px] " : "") +
          (mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
        }
      >

        {/* TOMBOL KECILKAN / PERLUAS (DESKTOP) */}

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Perluas sidebar" : "Kecilkan sidebar"}
          title={collapsed ? "Perluas sidebar" : "Kecilkan sidebar"}
          className="absolute -right-3 top-[60px] z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:text-emerald-600 lg:flex"
        >
          {collapsed ? (
            <ChevronsRight size={14} />
          ) : (
            <ChevronsLeft size={14} />
          )}
        </button>

        {/* =================================================
            BRAND
        ================================================= */}

        <div
          className={
            "flex h-[72px] items-center border-b border-slate-100 px-5 " +
            (collapsed ? "lg:justify-center lg:px-0" : "")
          }
        >

          <div className="flex items-center gap-3">

            {/* LOGO */}

            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">

              <img
                src="/Logo_kujang.jpg"
                alt="Logo Pupuk Kujang"
                className="h-full w-full object-cover"
              />

            </div>

            {/* BRAND TEXT */}

            <div className={"flex flex-col " + sembunyiSaatKecil}>

              <span className="text-[15px] font-bold tracking-tight text-slate-800">
                JobPortal
              </span>

              <span className="text-[11px] font-medium text-slate-400">
                HR Management
              </span>

            </div>

          </div>

          {/* TOMBOL TUTUP (LAYAR KECIL) */}

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 lg:hidden"
          >
            <X size={18} />
          </button>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 overflow-y-auto px-3 py-6">

          {/* MENU UTAMA */}

          <p
            className={
              "mb-3 px-3 text-[10px] font-bold tracking-[0.08em] text-slate-400 " +
              sembunyiSaatKecil
            }
          >
            MENU UTAMA
          </p>

          <div className="space-y-1">
            {menuItems.map((item) =>
              renderNavItem(item.path, item.label, item.icon)
            )}
          </div>

          {/* =================================================
              LAINNYA
          ================================================= */}

          <p
            className={
              "mb-3 mt-8 px-3 text-[10px] font-bold tracking-[0.08em] text-slate-400 " +
              sembunyiSaatKecil
            }
          >
            LAINNYA
          </p>

          {collapsed && (
            <div className="my-4 hidden border-t border-slate-100 lg:block" />
          )}

          {renderNavItem("/hr/profile", "Profil Saya", UserCircle)}

        </nav>

        {/* =================================================
            BOTTOM SIDEBAR
        ================================================= */}

        <div className="border-t border-slate-100 p-3">

          {/* USER */}

          <div
            className={
              "mb-2 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 " +
              (collapsed ? "lg:justify-center lg:px-0" : "")
            }
            title={collapsed ? user.nama : undefined}
          >

            {/* AVATAR */}

            {user.fotoProfil?.pathFile ? (
              <img
                src={user.fotoProfil.pathFile}
                alt={user.nama}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                {user.nama.charAt(0).toUpperCase()}
              </div>
            )}

            {/* USER INFO */}

            <div className={"min-w-0 flex-1 " + sembunyiSaatKecil}>

              <p className="truncate text-xs font-semibold text-slate-700">
                {user.nama}
              </p>

              <p className="mt-0.5 truncate text-[10.5px] text-slate-400">
                Human Resources
              </p>

            </div>

          </div>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Keluar" : undefined}
            className={
              "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 " +
              (collapsed ? "lg:justify-center lg:px-0" : "")
            }
          >

            <LogOut
              size={18}
              strokeWidth={2}
              className="text-slate-400 transition-colors group-hover:text-red-500"
            />

            <span className={sembunyiSaatKecil}>Keluar</span>

          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section
        className={
          "min-h-screen min-w-0 flex-1 transition-[margin] duration-300 " +
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

          <span className="text-sm font-bold text-slate-800">JobPortal</span>

        </div>

        {children}

      </section>

    </main>
  );
}