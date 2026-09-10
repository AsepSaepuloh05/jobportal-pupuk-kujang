import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const kandidat = await prisma.user.findMany({
      where: {
        role: "KANDIDAT",
      },
      select: {
        id: true,
        nama: true,
        email: true,
        nik: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(kandidat);
  } catch (error) {
    console.error("GET KANDIDAT ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data kandidat",
      },
      {
        status: 500,
      }
    );
  }
}