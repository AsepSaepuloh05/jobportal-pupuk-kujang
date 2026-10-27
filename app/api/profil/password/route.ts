// Letakkan di: app/api/profil/password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// SESUAIKAN dengan project Anda:
import { bacaIdentitas } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MIN_LENGTH = 8;

export async function PUT(req: Request) {
  try {
    // Sesi dibaca dari token bertanda tangan (bukan cookie biasa)
    const { userId: userIdValue } = await bacaIdentitas();

    if (!userIdValue) {
      return NextResponse.json(
        { success: false, message: "Belum login" },
        { status: 401 }
      );
    }

    const userId = Number(userIdValue);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "Session tidak valid" },
        { status: 401 }
      );
    }

    let body: {
      passwordLama?: string;
      passwordBaru?: string;
      konfirmasiPassword?: string;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request tidak valid." },
        { status: 400 }
      );
    }

    const { passwordLama, passwordBaru, konfirmasiPassword } = body;

    if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    if (passwordBaru.length < MIN_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: `Password baru minimal ${MIN_LENGTH} karakter.`,
        },
        { status: 400 }
      );
    }

    if (!/[A-Za-z]/.test(passwordBaru) || !/\d/.test(passwordBaru)) {
      return NextResponse.json(
        {
          success: false,
          message: "Password baru harus mengandung huruf dan angka.",
        },
        { status: 400 }
      );
    }

    if (passwordBaru !== konfirmasiPassword) {
      return NextResponse.json(
        { success: false, message: "Konfirmasi password tidak cocok." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    if (user.role !== "KANDIDAT") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const lamaBenar = await bcrypt.compare(passwordLama, user.password);

    if (!lamaBenar) {
      return NextResponse.json(
        { success: false, message: "Password lama salah." },
        { status: 400 }
      );
    }

    const samaDenganLama = await bcrypt.compare(passwordBaru, user.password);

    if (samaDenganLama) {
      return NextResponse.json(
        {
          success: false,
          message: "Password baru tidak boleh sama dengan password lama.",
        },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(passwordBaru, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah.",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}