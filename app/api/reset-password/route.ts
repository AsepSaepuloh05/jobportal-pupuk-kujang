import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHash, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/lib/password";

const MAX_ATTEMPTS = 5;

function hashOtp(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

const INVALID_OTP = {
  success: false,
  message: "Kode OTP tidak valid atau sudah kedaluwarsa",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const otp = body.otp?.trim();
    const password = body.password;
    const confirmPassword = body.confirmPassword;

    if (!email || !otp || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Semua kolom wajib diisi" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: "Kode OTP harus 6 digit angka" },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return NextResponse.json(
        { success: false, message: passwordError },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Konfirmasi password tidak cocok" },
        { status: 400 }
      );
    }

    const reset = await prisma.passwordReset.findUnique({
      where: { email },
    });

    if (!reset || reset.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(INVALID_OTP, { status: 400 });
    }

    if (reset.attempts >= MAX_ATTEMPTS) {
      await prisma.passwordReset.delete({ where: { email } });

      return NextResponse.json(
        {
          success: false,
          message: "Terlalu banyak percobaan. Silakan minta kode OTP baru",
        },
        { status: 429 }
      );
    }

    if (!safeEqual(hashOtp(otp), reset.otpHash)) {
      await prisma.passwordReset.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json(INVALID_OTP, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // SESUAIKAN nama kolom password dengan model User Anda.
    // updateMany: semua akun dengan email ini ikut diperbarui,
    // karena pemilik email sudah terbukti lewat OTP.
    const [updated] = await prisma.$transaction([
      prisma.user.updateMany({
        where: { email },
        data: { password: passwordHash },
      }),
      prisma.passwordReset.delete({ where: { email } }),
    ]);

    if (updated.count === 0) {
      return NextResponse.json(
        { success: false, message: "Akun tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password berhasil direset. Silakan login.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}