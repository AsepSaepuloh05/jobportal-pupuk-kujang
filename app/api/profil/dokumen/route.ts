import { NextResponse } from "next/server";
import { bacaIdentitas } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JenisDokumen } from "@/app/generated/prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { deteksiBerkas } from "@/lib/file-signature";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES: Record<string, string[]> = {
  CV: ["application/pdf"],
  KTP: ["application/pdf", "image/jpeg", "image/png"],
  IJAZAH: ["application/pdf", "image/jpeg", "image/png"],
  TRANSKRIP: ["application/pdf", "image/jpeg", "image/png"],
  LAINNYA: ["application/pdf", "image/jpeg", "image/png"],
};

async function getUserId() {
  const { userId } = await bacaIdentitas();
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const tipeAsli = deteksiBerkas(buffer);

    if (!tipeAsli) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Format berkas tidak valid atau rusak. Hanya file PDF, JPG, dan PNG asli yang diperbolehkan.",
        },
        { status: 400 }
      );
    }

    if (jenisDokumen === "CV" && tipeAsli !== "pdf") {
      return NextResponse.json(
        {
          success: false,
          message: "Dokumen CV harus berupa berkas PDF asli.",
        },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || (tipeAsli === "pdf" ? ".pdf" : tipeAsli === "png" ? ".png" : ".jpg");
    const namaFile = `${userId}-${jenisDokumen}-${Date.now()}${ext}`;

    // Simpan di folder private (di luar public/)
    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      "dokumen"
    );
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, namaFile);
    await writeFile(filePath, buffer);

    // Path diakses melalui API berkas yang terautentikasi
    const pathFile = `/api/berkas/dokumen/${namaFile}`;

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