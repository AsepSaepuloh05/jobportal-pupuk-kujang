import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bacaIdentitas } from "@/lib/auth";

export async function GET() {
  try {
    const { userRole } = await bacaIdentitas();

    if (userRole !== "HR") {
      return NextResponse.json(
        { message: "Hanya HR yang bisa melihat daftar kandidat" },
        { status: 403 }
      );
    }

    const kandidat = await prisma.user.findMany({
      where: {
        role: "KANDIDAT",
      },
      select: {
        id: true,
        nama: true,
        email: true,
        nik: true,
        noTelepon: true,
        alamat: true,
        desa: true,
        kecamatan: true,
        kabupaten: true,
        provinsi: true,
        role: true,
        isActive: true,
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