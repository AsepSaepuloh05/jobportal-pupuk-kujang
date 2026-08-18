import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
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

    const existingUser = await prisma.user.findUnique({
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

    const user = await prisma.user.create({
      data: {
        name,
        email,
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