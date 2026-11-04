import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/lib/password";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hashOtp, hashOtpSama, MAKS_PERCOBAAN_OTP } from "@/lib/otp";

const MAX_ATTEMPTS = MAKS_PERCOBAAN_OTP;

const INVALID_OTP = {
  success: false,
  message: "Kode OTP tidak valid atau sudah kedaluwarsa",
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = checkRateLimit(`reset-password:ip:${ip}`, 15, 10 * 60);

    if (!ipLimit.allowed) {
      const menit = Math.ceil(ipLimit.retryAfterSeconds / 60);
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan reset password dari perangkat ini. Silakan coba lagi dalam ${menit} menit.`,
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

    // Klaim satu percobaan secara ATOMIK: cek batas + tambah counter dalam
    // satu query UPDATE. Request paralel tidak bisa melewati batas percobaan.
    // Percobaan dihitung sebelum OTP dibandingkan.
    const klaim = await prisma.passwordReset.updateMany({
      where: {
        email,
        attempts: { lt: MAX_ATTEMPTS },
        expiresAt: { gt: new Date() },
      },
      data: { attempts: { increment: 1 } },
    });

    if (klaim.count === 0) {
      // Batas percobaan habis: hapus agar harus minta OTP baru
      await prisma.passwordReset.deleteMany({
        where: { email, attempts: { gte: MAX_ATTEMPTS } },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Terlalu banyak percobaan. Silakan minta kode OTP baru",
        },
        { status: 429 }
      );
    }

    if (!hashOtpSama(hashOtp(email, otp), reset.otpHash)) {
      return NextResponse.json(INVALID_OTP, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // OTP dipakai sekali (atomik): hanya satu request yang berhasil menghapus
    // data reset, request lain yang membawa OTP benar yang sama ditolak.
    // updateMany: semua akun dengan email ini ikut diperbarui,
    // karena pemilik email sudah terbukti lewat OTP.
    const updated = await prisma.$transaction(async (tx) => {
      const dipakai = await tx.passwordReset.deleteMany({
        where: { email, otpHash: reset.otpHash },
      });

      if (dipakai.count === 0) return null;

      return tx.user.updateMany({
        where: { email },
        data: { password: passwordHash },
      });
    });

    if (!updated) {
      return NextResponse.json(INVALID_OTP, { status: 400 });
    }

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
