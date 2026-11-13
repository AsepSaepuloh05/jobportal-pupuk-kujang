import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  buatTokenSesi,
  NAMA_COOKIE_SESI,
  opsiCookieSesi,
} from "@/lib/session";
import {
  checkRateLimit,
  getClientIp,
  resetRateLimit,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // ==========================================
    // 1. RATE LIMIT BERBASIS IP (Mencegah serangan DoS / flooding)
    // ==========================================
    const ipLimit = checkRateLimit(`login:ip:${ip}`, 30, 15 * 60);
    if (!ipLimit.allowed) {
      const menit = Math.ceil(ipLimit.retryAfterSeconds / 60);
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan dari perangkat ini. Silakan coba lagi dalam ${menit} menit.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    // ==========================================
    // VALIDASI INPUT
    // ==========================================

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email dan password wajib diisi",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 2. RATE LIMIT BERBASIS AKUN / EMAIL (Mencegah tebak password / credential stuffing)
    // Dua lapis batas agar akun tidak bisa dikunci oleh orang lain:
    // 1. Per kombinasi email + IP: maksimal 5 percobaan / 15 menit. Penyerang
    //    dari satu IP hanya mengunci dirinya sendiri, pemilik akun yang login
    //    dari IP lain tidak terdampak.
    // 2. Total per email dari semua IP: maksimal 20 percobaan / 15 menit
    //    untuk menahan tebakan password terdistribusi (banyak IP).
    // ==========================================
    const pasanganKey = `login:email-ip:${email}:${ip}`;
    const emailKey = `login:email:${email}`;
    const pasanganLimit = checkRateLimit(pasanganKey, 5, 15 * 60);
    // Batas total hanya dihitung jika batas pasangan belum habis, agar
    // percobaan yang sudah diblokir tidak ikut menghabiskan jatah total.
    const emailLimit = pasanganLimit.allowed
      ? checkRateLimit(emailKey, 20, 15 * 60)
      : pasanganLimit;

    if (!emailLimit.allowed) {
      const menit = Math.ceil(emailLimit.retryAfterSeconds / 60);
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan login yang gagal untuk akun ini. Silakan coba lagi dalam ${menit} menit.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(emailLimit.retryAfterSeconds) },
        }
      );
    }

    // ==========================================
    // CARI SEMUA USER DENGAN EMAIL YANG SAMA
    // ==========================================

    const users = await prisma.user.findMany({
      where: {
        email,
      },
      orderBy: {
        id: "asc",
      },
    });

    // ==========================================
    // USER TIDAK DITEMUKAN
    // ==========================================

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // CARI AKUN YANG PASSWORD-NYA COCOK
    // ==========================================

    let user = null;

    for (const candidate of users) {
      const passwordMatch = await bcrypt.compare(
        password,
        candidate.password
      );

      if (passwordMatch) {
        user = candidate;
        break;
      }
    }

    // ==========================================
    // PASSWORD TIDAK COCOK DENGAN AKUN MANAPUN
    // ==========================================

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // CEK STATUS AKUN
    // ==========================================

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akun kamu telah dinonaktifkan. Hubungi HR untuk informasi lebih lanjut.",
        },
        { status: 403 }
      );
    }

    // ==========================================
    // LOGIN BERHASIL: RESET PERCOBAAN GAGAL
    // ==========================================
    resetRateLimit(emailKey);
    resetRateLimit(pasanganKey);

    // ==========================================
    // BUAT SESI BERTANDA TANGAN
    // ==========================================

    const token = await buatTokenSesi({
      userId: user.id,
      role: user.role,
      versi: user.tokenVersion,
    });

    // ==========================================
    // RESPONSE LOGIN
    // ==========================================

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        nik: user.nik,
        role: user.role,
      },
    });

    // ==========================================
    // COOKIE SESI (BERTANDA TANGAN)
    // Satu-satunya sumber identitas. Cookie lama
    // user_id / user_role tidak dibuat lagi.
    // ==========================================

    response.cookies.set(NAMA_COOKIE_SESI, token, opsiCookieSesi());

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      { status: 500 }
    );
  }
}