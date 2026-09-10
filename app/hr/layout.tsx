"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  FileText,
  ClipboardCheck,
  UserCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface User {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
}

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
  // LOGOUT
  // =====================================================

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
      label: "Lamaran Masuk",
      path: "/hr/lamaran",
      icon: FileText,
    },
    {
      label: "Proses Seleksi",
      path: "/hr/seleksi",
      icon: ClipboardCheck,
    },
  ];

  return (
    <main className="flex min-h-screen bg-slate-50">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-slate-200 bg-white">

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="flex h-[72px] items-center border-b border-slate-100 px-5">

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

            <div className="flex flex-col">

              <span className="text-[15px] font-bold tracking-tight text-slate-800">
                JobPortal
              </span>

              <span className="text-[11px] font-medium text-slate-400">
                HR Management
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 overflow-y-auto px-3 py-6">

          {/* MENU UTAMA */}

          <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.08em] text-slate-400">
            MENU UTAMA
          </p>

          <div className="space-y-1">

            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => router.push(item.path)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
                    active
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
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

                    <span>
                      {item.label}
                    </span>

                  </div>

                  {active && (
                    <ChevronRight
                      size={16}
                      strokeWidth={2.2}
                      className="text-emerald-500"
                    />
                  )}

                </button>
              );
            })}

          </div>

          {/* =================================================
              LAINNYA
          ================================================= */}

          <p className="mb-3 mt-8 px-3 text-[10px] font-bold tracking-[0.08em] text-slate-400">
            LAINNYA
          </p>

          {/* PROFILE */}

          <button
            type="button"
            onClick={() => router.push("/hr/profile")}
            className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
              isActive("/hr/profile")
                ? "bg-emerald-50 text-emerald-600"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >

            <div className="flex items-center gap-3">

              <UserCircle
                size={19}
                strokeWidth={
                  isActive("/hr/profile") ? 2.3 : 2
                }
                className={
                  isActive("/hr/profile")
                    ? "text-emerald-600"
                    : "text-slate-400 transition-colors group-hover:text-slate-600"
                }
              />

              <span>
                Profil Saya
              </span>

            </div>

            {isActive("/hr/profile") && (
              <ChevronRight
                size={16}
                strokeWidth={2.2}
                className="text-emerald-500"
              />
            )}

          </button>

        </nav>

        {/* =================================================
            BOTTOM SIDEBAR
        ================================================= */}

        <div className="border-t border-slate-100 p-3">

          {/* USER */}

          <div className="mb-2 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">

            {/* AVATAR */}

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
              {user.nama.charAt(0).toUpperCase()}
            </div>

            {/* USER INFO */}

            <div className="min-w-0 flex-1">

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
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
          >

            <LogOut
              size={18}
              strokeWidth={2}
              className="text-slate-400 transition-colors group-hover:text-red-500"
            />

            <span>
              Keluar
            </span>

          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="ml-[250px] min-h-screen w-[calc(100%-250px)]">

        {children}

      </section>

    </main>
  );
}