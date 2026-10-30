import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { bacaIdentitas } from "@/lib/auth";
import { validatePassword } from "@/lib/password";

export async function GET() {
  try {
    const { userRole } = await bacaIdentitas();

    if (userRole !== "HR") {
      return NextResponse.json(
        { message: "Hanya HR yang bisa melihat data user" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      // Jangan pernah kirim hash password ke klien
      omit: { password: true },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data user",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userRole } = await bacaIdentitas();

    if (userRole !== "HR") {
      return NextResponse.json(
        { message: "Hanya HR yang bisa menambah user" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const rawPassword = body.password;

    if (!name || !email || !rawPassword) {
      return NextResponse.json(
        {
          message: "Nama, email, dan password wajib diisi",
        },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(rawPassword);

    if (passwordError) {
      return NextResponse.json(
        {
          message: passwordError,
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "Email sudah digunakan",
        },
        { status: 409 }
      );
    }

    const nik = body.nik?.trim() || `NIK-${Date.now()}`;
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.create({
      data: {
        nama: name,
        email,
        nik,
        password: passwordHash,
      },
      omit: {
        password: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("POST USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal menambahkan user",
      },
      { status: 500 }
    );
  }
}
