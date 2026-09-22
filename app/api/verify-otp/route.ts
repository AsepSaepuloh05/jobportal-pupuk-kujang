import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

function hashOtp(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

export async function POST(request: Request) {
  try {
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
    // BATAS PERCOBAAN OTP
    // ==========================================

    if (verification.attempts >= 5) {
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
    // CEK MASA BERLAKU OTP
    // ==========================================

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

    // ==========================================
    // CEK OTP
    // ==========================================

    const otpHash = hashOtp(otp);

    if (otpHash !== verification.otpHash) {
      await prisma.emailVerification.update({
        where: {
          email,
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

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
      await prisma.emailVerification.delete({
        where: {
          email,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "NIK sudah terdaftar",
        },
        { status: 409 }
      );
    }

    // ==========================================
    // OTP BENAR → BUAT USER
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
    // HAPUS DATA OTP
    // ==========================================

    await prisma.emailVerification.delete({
      where: {
        email,
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
