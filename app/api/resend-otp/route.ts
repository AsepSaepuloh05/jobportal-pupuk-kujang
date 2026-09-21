import { NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

function hashOtp(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email wajib diisi",
        },
        { status: 400 }
      );
    }

    // Cari data registrasi yang masih menunggu verifikasi
    const verification = await prisma.emailVerification.findUnique({
      where: { email },
    });

    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data verifikasi tidak ditemukan. Silakan melakukan registrasi kembali.",
        },
        { status: 404 }
      );
    }

    // Cegah request OTP terlalu cepat
    if (verification.lastSentAt) {
      const elapsed =
        Date.now() - new Date(verification.lastSentAt).getTime();

      if (elapsed < 60 * 1000) {
        const remaining = Math.ceil((60 * 1000 - elapsed) / 1000);

        return NextResponse.json(
          {
            success: false,
            message: `Silakan tunggu ${remaining} detik sebelum meminta OTP baru.`,
          },
          { status: 429 }
        );
      }
    }

    // Buat OTP baru
    const otp = randomInt(100000, 1000000).toString();

    const otpHash = hashOtp(otp);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Update OTP
    await prisma.emailVerification.update({
      where: { email },
      data: {
        otpHash,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      },
    });

    // Kirim email
    const { error } = await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        "SIO Karir <onboarding@resend.dev>",
      to: email,
      subject: "Kode Verifikasi Email - SIO Karir",
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 30px;
          background-color: #f8fafc;
        ">
          <div style="
            background-color: white;
            padding: 30px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
          ">
            <h2 style="
              color: #3e9d70;
              margin-bottom: 10px;
            ">
              Verifikasi Email
            </h2>

            <p style="color: #374151;">
              Halo <strong>${verification.nama}</strong>,
            </p>

            <p style="color: #4b5563;">
              Berikut adalah kode OTP baru untuk verifikasi akun SIO Karir Anda:
            </p>

            <div style="
              margin: 25px 0;
              padding: 20px;
              background-color: #ecfdf5;
              border-radius: 10px;
              text-align: center;
            ">
              <span style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #3e9d70;
              ">
                ${otp}
              </span>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              Kode ini berlaku selama <strong>5 menit</strong>.
            </p>

            <p style="
              color: #6b7280;
              font-size: 13px;
              margin-top: 25px;
            ">
              Jika Anda tidak merasa melakukan registrasi, abaikan email ini.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("RESEND EMAIL ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengirim email OTP.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP baru berhasil dikirim ke email.",
    });
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}