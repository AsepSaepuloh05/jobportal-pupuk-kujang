import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hashOtp, hashOtpSama, MAKS_PERCOBAAN_OTP } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = checkRateLimit(`verify-otp:ip:${ip}`, 15, 10 * 60);

    if (!ipLimit.allowed) {
      const menit = Math.ceil(ipLimit.retryAfterSeconds / 60);
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan verifikasi dari perangkat ini. Silakan coba lagi dalam ${menit} menit.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const otp = body.otp?.trim();

    // ==========================================
    // VALIDASI INPUT
    // ==========================================

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Email dan OTP wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP harus terdiri dari 6 digit",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // CARI DATA VERIFIKASI
    // ==========================================

    const verification =
      await prisma.emailVerification.findUnique({
        where: {
          email,
        },
      });

    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          message: "Data verifikasi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // KLAIM SATU PERCOBAAN SECARA ATOMIK
    // Pengecekan batas + penambahan counter terjadi dalam
    // SATU query UPDATE, sehingga request paralel tidak bisa
    // melewati batas percobaan (tidak ada celah check-then-update).
    // Percobaan dihitung sebelum OTP dibandingkan.
    // ==========================================

    const klaim = await prisma.emailVerification.updateMany({
      where: {
        email,
        attempts: { lt: MAKS_PERCOBAAN_OTP },
        expiresAt: { gt: new Date() },
      },
      data: {
        attempts: { increment: 1 },
      },
    });

    if (klaim.count === 0) {
      if (new Date() > verification.expiresAt) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Kode OTP sudah kedaluwarsa. Silakan kirim ulang OTP.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "Terlalu banyak percobaan. Silakan daftar ulang.",
        },
        { status: 429 }
      );
    }

    // ==========================================
    // CEK OTP
    // ==========================================

    const otpHash = hashOtp(email, otp);

    if (!hashOtpSama(otpHash, verification.otpHash)) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode OTP tidak valid",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // OTP BENAR → PAKAI SEKALI (ATOMIK)
    // Hanya satu request yang berhasil menghapus data OTP,
    // jadi OTP yang benar tidak bisa dipakai dua kali.
    // ==========================================

    const dipakai = await prisma.emailVerification.deleteMany({
      where: {
        email,
        otpHash: verification.otpHash,
      },
    });

    if (dipakai.count === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode OTP tidak valid",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // CEK NIK
    // EMAIL TIDAK DICEK KARENA SEMENTARA
    // DIPERBOLEHKAN DUPLIKAT
    // ==========================================

    const existingNik = await prisma.user.findUnique({
      where: {
        nik: verification.nik,
      },
    });

    if (existingNik) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK sudah terdaftar",
        },
        { status: 409 }
      );
    }

    // ==========================================
    // BUAT USER
    // ==========================================

    const user = await prisma.user.create({
      data: {
        nama: verification.nama,
        email: verification.email,
        nik: verification.nik,
        password: verification.passwordHash,
        role: "KANDIDAT",
      },
    });

    // ==========================================
    // BERHASIL
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Email berhasil diverifikasi dan akun berhasil dibuat",
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          nik: user.nik,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      { status: 500 }
    );
  }
}
