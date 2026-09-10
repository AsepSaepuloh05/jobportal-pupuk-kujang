import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { JenisDokumen } from "@/app/generated/prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES: Record<string, string[]> = {
  CV: ["application/pdf"],
  KTP: ["application/pdf", "image/jpeg", "image/png"],
  IJAZAH: ["application/pdf", "image/jpeg", "image/png"],
  TRANSKRIP: ["application/pdf", "image/jpeg", "image/png"],
  LAINNYA: ["application/pdf", "image/jpeg", "image/png"],
};

async function getUserId() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  return userId ? Number(userId) : null;
}

// GET -> daftar dokumen milik user yang sedang login
export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Belum login" },
        { status: 401 }
      );
    }

    const dokumen = await prisma.dokumenKandidat.findMany({
      where: { userId },
      select: {
        id: true,
        jenisDokumen: true,
        namaAsli: true,
        pathFile: true,
        tipeFile: true,
        ukuranFile: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, dokumen });
  } catch (error) {
    console.error("GET DOKUMEN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// POST -> upload / replace dokumen
export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Belum login" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jenisRaw = formData.get("jenisDokumen") as string | null;

    if (!file || !jenisRaw) {
      return NextResponse.json(
        { success: false, message: "File dan jenis dokumen wajib diisi" },
        { status: 400 }
      );
    }

    const jenisDokumen = jenisRaw.toUpperCase() as JenisDokumen;

    if (!Object.values(JenisDokumen).includes(jenisDokumen)) {
      return NextResponse.json(
        { success: false, message: "Jenis dokumen tidak valid" },
        { status: 400 }
      );
    }

    const allowedTypes = ALLOWED_TYPES[jenisDokumen];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Format file tidak didukung untuk ${jenisDokumen}`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran file maksimal 5 MB" },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || "";
    const namaFile = `${userId}-${jenisDokumen}-${Date.now()}${ext}`;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "dokumen"
    );
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, namaFile);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const pathFile = `/uploads/dokumen/${namaFile}`;

    const dokumen = await prisma.dokumenKandidat.upsert({
      where: {
        userId_jenisDokumen: {
          userId,
          jenisDokumen,
        },
      },
      update: {
        namaFile,
        namaAsli: file.name,
        pathFile,
        tipeFile: file.type,
        ukuranFile: file.size,
      },
      create: {
        userId,
        jenisDokumen,
        namaFile,
        namaAsli: file.name,
        pathFile,
        tipeFile: file.type,
        ukuranFile: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Dokumen berhasil diunggah",
      dokumen,
    });
  } catch (error) {
    console.error("UPLOAD DOKUMEN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}