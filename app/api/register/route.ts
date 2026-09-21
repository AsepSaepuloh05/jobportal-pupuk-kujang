import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

    const nama = body.nama?.trim();
    const email = body.email?.trim().toLowerCase();
    const nik = body.nik?.trim();
    const password = body.password;

    // ==========================================
    // VALIDASI INPUT
    // ==========================================

    if (!nama || !email || !nik || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua kolom wajib diisi",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password minimal 6 karakter",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // CEK EMAIL SUDAH TERDAFTAR
    // ==========================================

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar",
        },
        { status: 409 }
      );
    }

    // ==========================================
    // CEK NIK SUDAH TERDAFTAR
    // ==========================================

    const existingNik = await prisma.user.findUnique({
      where: { nik },
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
    // CEK OTP SEBELUMNYA
    // ==========================================

    const existingVerification =
      await prisma.emailVerification.findUnique({
        where: { email },
      });

    if (existingVerification?.lastSentAt) {
      const elapsed =
        Date.now() -
        existingVerification.lastSentAt.getTime();

      // Cooldown 60 detik
      if (elapsed < 60 * 1000) {
        const remaining = Math.ceil(
          (60 * 1000 - elapsed) / 1000
        );

        return NextResponse.json(
          {
            success: false,
            message: `Silakan tunggu ${remaining} detik sebelum meminta OTP lagi`,
          },
          { status: 429 }
        );
      }
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const passwordHash = await bcrypt.hash(password, 10);

    // ==========================================
    // GENERATE OTP 6 DIGIT
    // ==========================================

    const otp = randomInt(100000, 1000000).toString();

    const otpHash = hashOtp(otp);

    // OTP berlaku selama 5 menit
    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    const now = new Date();

    // ==========================================
    // SIMPAN DATA VERIFIKASI SEMENTARA
    // ==========================================

    await prisma.emailVerification.upsert({
      where: {
        email,
      },

      update: {
        nama,
        nik,
        passwordHash,
        otpHash,
        expiresAt,
        attempts: 0,
        lastSentAt: now,
      },

      create: {
        email,
        nama,
        nik,
        passwordHash,
        otpHash,
        expiresAt,
        attempts: 0,
        lastSentAt: now,
      },
    });

    // ==========================================
    // CEK RESEND API KEY
    // ==========================================

    if (!process.env.RESEND_API_KEY) {
      console.error(
        "RESEND_API_KEY belum tersedia di file .env"
      );

      return NextResponse.json(
        {
          success: false,
          message: "Konfigurasi email belum tersedia",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // EMAIL PENGIRIM
    // ==========================================

    const emailFrom =
      process.env.EMAIL_FROM ||
      "SIO Karir <onboarding@resend.dev>";

    console.log("====================================");
    console.log("MENGIRIM OTP");
    console.log("Email tujuan :", email);
    console.log("Email pengirim:", emailFrom);
    console.log("====================================");

    // ==========================================
    // KIRIM EMAIL OTP
    // ==========================================

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "Kode Verifikasi Email - SIO Karir",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            color: #333;
          "
        >

          <h2
            style="
              color: #3e9d70;
              margin-bottom: 20px;
            "
          >
            Verifikasi Email SIO Karir
          </h2>

          <p>
            Halo <strong>${nama}</strong>,
          </p>

          <p>
            Terima kasih telah melakukan registrasi
            pada Sistem Informasi Outsourcing Karir.
          </p>

          <p>
            Gunakan kode OTP berikut untuk
            memverifikasi alamat email kamu:
          </p>

          <div
            style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              text-align: center;
              padding: 20px;
              margin: 25px 0;
              background-color: #f0fdf4;
              border-radius: 10px;
              color: #3e9d70;
            "
          >
            ${otp}
          </div>

          <p>
            Kode OTP ini berlaku selama
            <strong>5 menit</strong>.
          </p>

          <p>
            Jangan berikan kode ini kepada orang lain.
          </p>

          <p>
            Jika kamu tidak merasa melakukan registrasi,
            silakan abaikan email ini.
          </p>

          <br />

          <p>
            Terima kasih,
            <br />
            <strong>SIO Karir</strong>
          </p>

        </div>
      `,
    });

    // ==========================================
    // CEK HASIL RESEND
    // ==========================================

    console.log("RESEND DATA:", data);
    console.log("RESEND ERROR:", error);

    if (error) {
      console.error(
        "RESEND ERROR DETAIL:",
        JSON.stringify(error, null, 2)
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengirim kode OTP ke email",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // ==========================================
    // BERHASIL
    // ==========================================

    console.log(
      "OTP berhasil dikirim ke:",
      email
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Kode OTP berhasil dikirim ke email",
        email,
        emailId: data?.id ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan pada server",
      },
      { status: 500 }
    );
  }
}
