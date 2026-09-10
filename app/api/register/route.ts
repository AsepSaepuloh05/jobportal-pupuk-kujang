import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const nama = body.nama?.trim();
    const email = body.email?.trim();
    const nik = body.nik?.trim();
    const password = body.password;

    // Validasi input
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

    // Cek apakah email sudah terdaftar
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

    // Cek apakah NIK sudah terdaftar
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru dengan role default KANDIDAT
    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        nik,
        password: hashedPassword,
        role: "KANDIDAT",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil",
        user: {
          id: newUser.id,
          nama: newUser.nama,
          email: newUser.email,
          nik: newUser.nik,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      { status: 500 }
    );
  }
}