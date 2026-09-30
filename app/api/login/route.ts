import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
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
    // SIMPAN USER ID KE COOKIE
    // ==========================================

    response.cookies.set("user_id", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    // ==========================================
    // SIMPAN ROLE KE COOKIE
    // ==========================================

    response.cookies.set("user_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

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