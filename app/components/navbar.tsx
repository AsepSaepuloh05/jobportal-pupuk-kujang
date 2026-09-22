"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

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
            <span className="cursor-pointer transition hover:text-white">
              ⓘ Tentang Kami
            </span>

            <span className="cursor-pointer transition hover:text-white">
              ♧ Kontak
            </span>
          </div>

        </div>
      </div>


      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <nav className="sticky top-0 z-50 border-b border-[#e2eee8] bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[78px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">

          {/* =================================================
              LOGO
          ================================================= */}
          <Link
            href="/public"
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
                SIO Karir
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

            {/* BERANDA */}
            <Link
              href="/"
              className={`relative flex h-[78px] items-center text-xs font-bold transition sm:text-sm ${
                pathname === "/public"
                  ? "text-[#3e9c70]"
                  : "text-[#61756b] hover:text-[#3e9c70]"
              }`}
            >

              Beranda

              {pathname === "/" && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-[#62bb8d]" />
              )}

            </Link>


            {/* LOWONGAN */}
            <Link
              href="/lowongan"
              className={`relative flex h-[78px] items-center text-xs font-bold transition sm:text-sm ${
                pathname.startsWith("/lowongan")
                  ? "text-[#3e9c70]"
                  : "text-[#61756b] hover:text-[#3e9c70]"
              }`}
            >

              Lowongan Pekerjaan

              {pathname.startsWith("/lowongan") && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-[#62bb8d]" />
              )}

            </Link>


            {/* LOGIN */}
            <Link
              href="/login"
              className={`rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(61,157,112,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#328861] hover:shadow-[0_12px_25px_rgba(61,157,112,0.3)] sm:px-6 sm:text-sm ${
                pathname.startsWith("/login")
                  ? "bg-[#328861]"
                  : "bg-[#3d9d70]"
              }`}
            >
              Login
            </Link>

          </div>

        </div>

      </nav>
    </>
  );
}