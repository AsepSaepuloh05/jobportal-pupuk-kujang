import { NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

function hashOtp(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

// Respons sukses selalu sama (baik email terdaftar maupun tidak)
// agar orang luar tidak bisa menebak email mana yang terdaftar.
const OK_MESSAGE =
  "Jika email terdaftar, kode OTP telah dikirim ke email Anda.";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email wajib diisi" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY belum tersedia di file .env");

      return NextResponse.json(
        { success: false, message: "Konfigurasi email belum tersedia" },
        { status: 500 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email },
      select: { nama: true, email: true },
    });

    // Email tidak terdaftar: tetap balas sukses tanpa kirim email
    if (!user) {
      return NextResponse.json({ success: true, message: OK_MESSAGE });
    }

    // Cooldown 60 detik (diam-diam, tanpa membocorkan status email)
    const existing = await prisma.passwordReset.findUnique({
      where: { email },
    });

    if (
      existing &&
      Date.now() - existing.lastSentAt.getTime() < 60 * 1000
    ) {
      return NextResponse.json({ success: true, message: OK_MESSAGE });
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const now = new Date();

    await prisma.passwordReset.upsert({
      where: { email },
      update: { otpHash, expiresAt, attempts: 0, lastSentAt: now },
      create: {
        email,
        otpHash,
        expiresAt,
        attempts: 0,
        lastSentAt: now,
      },
    });

    const emailFrom =
      process.env.EMAIL_FROM || "SIO Karir <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "Kode Reset Password - SIO Karir",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; color: #333;">
          <h2 style="color: #3e9d70; margin-bottom: 20px;">
            Reset Password SIO Karir
          </h2>

          <p>Halo <strong>${user.nama}</strong>,</p>

          <p>
            Kami menerima permintaan untuk mereset password akun Anda.
            Gunakan kode OTP berikut:
          </p>

          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; margin: 25px 0; background-color: #f0fdf4; border-radius: 10px; color: #3e9d70;">
            ${otp}
          </div>

          <p>Kode ini berlaku selama <strong>5 menit</strong>.</p>

          <p>Jangan berikan kode ini kepada siapa pun.</p>

          <p>
            Jika Anda tidak merasa meminta reset password,
            abaikan email ini. Password Anda tidak akan berubah.
          </p>

          <br />

          <p>Terima kasih,<br /><strong>SIO Karir</strong></p>
        </div>
      `,
    });

    if (error) {
      console.error("RESEND ERROR:", JSON.stringify(error, null, 2));

      return NextResponse.json(
        { success: false, message: "Gagal mengirim kode OTP ke email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: OK_MESSAGE });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}