import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { JenisDokumen } from "@/app/generated/prisma/client";
import { unlink } from "fs/promises";
import path from "path";

async function getUserId() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  return userId ? Number(userId) : null;
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Belum login" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const jenisRaw = body.jenisDokumen as string | undefined;

    if (!jenisRaw) {
      return NextResponse.json(
        { success: false, message: "Jenis dokumen wajib diisi" },
        { status: 400 }
      );
    }

    const jenisDokumen = jenisRaw.toUpperCase() as JenisDokumen;

    const dokumen = await prisma.dokumenKandidat.findUnique({
      where: {
        userId_jenisDokumen: {
          userId,
          jenisDokumen,
        },
      },
    });

    if (!dokumen) {
      return NextResponse.json(
        { success: false, message: "Dokumen tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus file fisik (abaikan error jika file sudah tidak ada)
    try {
      const filePath = path.join(process.cwd(), "public", dokumen.pathFile);
      await unlink(filePath);
    } catch (e) {
      console.warn("File fisik tidak ditemukan saat dihapus:", e);
    }

    await prisma.dokumenKandidat.delete({
      where: { id: dokumen.id },
    });

    return NextResponse.json({
      success: true,
      message: "Dokumen berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE DOKUMEN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}