import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bacaIdentitas } from "@/lib/auth";

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
    const email = body.email?.trim();

    if (!name || !email) {
      return NextResponse.json(
        {
          message: "Nama dan email wajib diisi",
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
    const password = body.password || "default-hash";

    const user = await prisma.user.create({
      data: {
        nama: name,
        email,
        nik,
        password,
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