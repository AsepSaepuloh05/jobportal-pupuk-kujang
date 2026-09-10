"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface User {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-4 w-4 text-[#75867e] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M7 3.5h7L18.5 8V20a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 12.5h6M9 15.8h6M9 9.2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 10h17M8 3.2v3.6M16 3.2v3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8.3" cy="14" r="1.1" fill="currentColor" />
      <circle cx="12" cy="14" r="1.1" fill="currentColor" />
      <circle cx="15.7" cy="14" r="1.1" fill="currentColor" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M9 20H5.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 16.5 20.5 12 16 7.5M20.5 12H9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NavbarKandidat() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // =====================================================
  // CEK LOGIN
  // =====================================================

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await fetch("/api/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          if (data.user.role !== "KANDIDAT") {
            if (data.user.role === "HR") {
              router.replace("/hr");
            } else {
              router.replace("/login");
            }

            return;
          }

          setUser(data.user);
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error("CHECK LOGIN ERROR:", error);
        router.replace("/login");
      } finally {
        setCheckingLogin(false);
      }
    };

    checkLogin();
  }, [router]);

  // =====================================================
  // CLOSE DROPDOWN KETIKA KLIK DI LUAR
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      setUser(null);
      setProfileMenuOpen(false);

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (checkingLogin) {
    return (
      <div className="border-b border-[#e2eee8] bg-white">
        <div className="mx-auto flex h-[118px] max-w-[1600px] items-center justify-center px-5">
          <span className="text-sm text-[#91a199]">
            Memuat...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAccountSection =
    pathname.startsWith("/kandidat/profil") ||
    pathname.startsWith("/kandidat/lamaran") ||
    pathname.startsWith("/kandidat/jadwal");

  const initial = user.nama.charAt(0).toUpperCase();

  const accountMenu = [
    {
      href: "/kandidat/profil",
      label: "Profil & Dokumen",
      desc: "Kelola data dan dokumen",
      icon: <UserIcon />,
    },
    {
      href: "/kandidat/lamaran",
      label: "Lamaran Saya",
      desc: "Lihat riwayat lamaran",
      icon: <DocumentIcon />,
    },
    {
      href: "/kandidat/jadwal",
      label: "Jadwal Seleksi",
      desc: "Lihat jadwal seleksi",
      icon: <CalendarIcon />,
    },
  ];

  return (
    <>
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="bg-[#173c2d] text-white">
        <div className="mx-auto flex h-10 max-w-[1600px] items-center justify-between px-5 text-[11px] sm:px-8 lg:px-12">

          <div className="flex items-center gap-2 text-[#d8ebe2]">
            <span>✉</span>

            <span>
              info@jobportal.com
            </span>

            <span className="ml-4">
              ☎
            </span>

            <span>
              (021) 1234-5678
            </span>
          </div>

          <div className="hidden items-center gap-6 text-[#c9ded4] sm:flex">
            <span>
              ⓘ Tentang Kami
            </span>

            <span>
              ♧ Kontak
            </span>
          </div>

        </div>
      </div>


      {/* =====================================================
          NAVBAR KANDIDAT
      ===================================================== */}

      <nav className="sticky top-0 z-50 border-b border-[#e2eee8] bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[78px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">

          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            href="/kandidat"
            className="group flex items-center gap-3"
          >

            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#e0eee7] bg-white shadow-sm transition duration-300 group-hover:scale-105">

              <img
                src="/Logo_kujang.jpg"
                alt="Logo PT Pupuk Kujang"
                className="h-full w-full object-contain"
              />

            </div>

            <div className="hidden sm:block">

              <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#78a38f]">
                Career Portal
              </p>

              <p className="text-sm font-extrabold text-[#234236]">
                PT Pupuk Kujang
              </p>

            </div>

          </Link>


          {/* =================================================
              MENU
          ================================================= */}

          <div className="flex items-center gap-3 sm:gap-7">

            {/* =================================================
                BERANDA
            ================================================= */}

            <Link
              href="/kandidat"
              className={`relative flex h-[78px] items-center text-xs font-bold transition sm:text-sm ${
                pathname === "/kandidat"
                  ? "text-[#3e9c70]"
                  : "text-[#61756b] hover:text-[#3e9c70]"
              }`}
            >

              Beranda

              {pathname === "/kandidat" && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-[#62bb8d]" />
              )}

            </Link>


            {/* =================================================
                LOWONGAN
            ================================================= */}

            <Link
              href="/kandidat/lowongan"
              className={`relative flex h-[78px] items-center text-xs font-bold transition sm:text-sm ${
                pathname.startsWith("/kandidat/lowongan")
                  ? "text-[#3e9c70]"
                  : "text-[#61756b] hover:text-[#3e9c70]"
              }`}
            >

              Lowongan Pekerjaan

              {pathname.startsWith("/kandidat/lowongan") && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-[#62bb8d]" />
              )}

            </Link>


            {/* =================================================
                PROFILE / DROPDOWN
            ================================================= */}

            <div ref={profileRef} className="relative ml-1">

              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                aria-expanded={profileMenuOpen}
                className={`flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-3 transition duration-200 sm:gap-3 sm:pr-4 ${
                  profileMenuOpen || isAccountSection
                    ? "border-[#9fd6b8] bg-[#f0faf4] shadow-[0_6px_18px_-6px_rgba(23,81,58,0.35)]"
                    : "border-[#e2eee8] bg-white hover:border-[#b9dfca] hover:bg-[#f8fcfa]"
                }`}
              >

                {/* AVATAR */}

                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#43a675] to-[#3e9d70] text-sm font-black text-white shadow-sm">
                  {initial}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#4eae7c]" />
                </div>

                {/* USER INFO */}

                <div className="hidden max-w-[150px] text-left sm:block">
                  <p className="truncate text-sm font-extrabold leading-tight text-[#234236]">
                    {user.nama}
                  </p>
                  <p className="text-[11px] font-medium text-[#91a199]">
                    Kandidat
                  </p>
                </div>

                <ChevronIcon open={profileMenuOpen} />
              </button>


              {/* =================================================
                  DROPDOWN
              ================================================= */}

              {profileMenuOpen && (
                <div className="dropdown-in absolute right-0 top-[calc(100%+12px)] z-[9999] w-[320px] origin-top-right overflow-hidden rounded-[24px] border border-[#e0ece5] bg-white shadow-[0_25px_60px_-15px_rgba(23,81,58,0.35)]">

                  {/* HEADER */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#4eae7c] to-[#3e9d70] px-5 py-5 text-white">
                    <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/15" />
                    <div className="relative flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white font-black text-[#3e9d70] shadow-sm ring-2 ring-white/60">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold">
                          {user.nama}
                        </p>
                        <p className="mt-1 truncate text-xs text-white/80">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MENU ITEMS */}
                  <div className="p-2">
                    {accountMenu.map((item) => {
                      const active = pathname.startsWith(item.href);
                      return (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            router.push(item.href);
                          }}
                          className={`flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-left transition ${
                            active ? "bg-[#f0faf4]" : "hover:bg-[#f7faf8]"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              active ? "bg-[#3e9d70] text-white" : "bg-[#e8f6ee] text-[#3e9d70]"
                            }`}
                          >
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-[#234236]">
                              {item.label}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-[#91a199]">
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* DIVIDER */}
                  <div className="mx-4 h-px bg-[#e5eee9]" />

                  {/* LOGOUT */}
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-left text-red-600 transition hover:bg-red-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <LogoutIcon />
                      </div>
                      <p className="text-sm font-extrabold">
                        Keluar
                      </p>
                    </button>
                  </div>
                </div>
              )}

              <style jsx>{`
                @keyframes dropdownIn {
                  0% {
                    opacity: 0;
                    transform: translateY(-4px) scale(0.98);
                  }
                  60% {
                    opacity: 1;
                    transform: translateY(1px) scale(1.005);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                }
                .dropdown-in {
                  transform-origin: top right;
                  animation: dropdownIn 0.28s cubic-bezier(0.22, 1, 0.36, 1);
                }
                @media (prefers-reduced-motion: reduce) {
                  .dropdown-in {
                    animation: none;
                  }
                }
              `}</style>
            </div>

          </div>

        </div>

      </nav>
    </>
  );
}
