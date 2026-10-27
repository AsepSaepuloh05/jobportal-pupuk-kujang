import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NAMA_COOKIE_SESI, verifikasiTokenSesi } from "@/lib/session";

/**
 * Penjaga halaman di sisi server (Next.js 16: proxy menggantikan middleware).
 *
 * - /hr/*        -> hanya role HR
 * - /kandidat/*  -> hanya role KANDIDAT
 *
 * Tanpa sesi valid pengguna diarahkan ke /login. Jika sesi valid tetapi
 * role-nya salah, pengguna diarahkan ke beranda role-nya sendiri.
 *
 * Catatan: ini lapisan pertama (cegah halaman terbuka). Setiap route API
 * tetap memverifikasi sesi sendiri, jadi API tidak bergantung pada proxy.
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get(NAMA_COOKIE_SESI)?.value;
    const sesi = token ? await verifikasiTokenSesi(token) : null;

    if (!sesi) {
        const response = NextResponse.redirect(new URL("/login", request.url));

        // Bersihkan cookie sesi yang rusak / kedaluwarsa
        if (token) {
            response.cookies.delete(NAMA_COOKIE_SESI);
        }

        return response;
    }

    const wilayahHr = pathname === "/hr" || pathname.startsWith("/hr/");
    const wilayahKandidat =
        pathname === "/kandidat" || pathname.startsWith("/kandidat/");

    if (wilayahHr && sesi.role !== "HR") {
        return NextResponse.redirect(new URL("/kandidat", request.url));
    }

    if (wilayahKandidat && sesi.role !== "KANDIDAT") {
        return NextResponse.redirect(new URL("/hr", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/hr/:path*", "/kandidat/:path*"],
};
