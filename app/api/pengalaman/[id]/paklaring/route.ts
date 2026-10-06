import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

type Params = {
  params: Promise<{ id: string }>;
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "paklaring");
const PUBLIC_PREFIX = "/uploads/paklaring";
const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
};

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

async function getUserId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get("user_id")?.value;
    const userId = Number(value);

    if (!value || !Number.isInteger(userId) || userId <= 0) return null;

    return userId;
  } catch {
    return null;
  }
}

async function removeFile(pathFile?: string | null) {
  if (!pathFile) return;

  try {
    await unlink(path.join(UPLOAD_DIR, path.basename(pathFile)));
  } catch {
    // file sudah tidak ada, abaikan
  }
}

// POST - upload / ganti paklaring
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId();
    if (!userId) return fail("Unauthorized", 401);

    const { id } = await params;
    const pengalamanId = Number(id);

    if (!Number.isInteger(pengalamanId) || pengalamanId <= 0) {
      return fail("ID pengalaman tidak valid", 400);
    }

    const existing = await prisma.pengalaman.findFirst({
      where: { id: pengalamanId, userId },
    });

    if (!existing) return fail("Data pengalaman tidak ditemukan", 404);

    const formData = await request.formData();
    const file = formData.get("paklaring");

    if (!(file instanceof File)) {
      return fail("File paklaring wajib dipilih", 400);
    }

    if (file.size === 0) return fail("File kosong", 400);
    if (file.size > MAX_SIZE) return fail("Ukuran paklaring maksimal 5 MB", 400);

    const ext = ALLOWED[file.type];

    if (!ext) return fail("Format harus PDF, JPG, atau PNG", 400);

    await mkdir(UPLOAD_DIR, { recursive: true });

    const namaFile = `paklaring-${userId}-${pengalamanId}-${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(path.join(UPLOAD_DIR, namaFile), buffer);

    // Hapus file lama setelah yang baru berhasil ditulis
    await removeFile(existing.paklaringPathFile);

    const pengalaman = await prisma.pengalaman.update({
      where: { id: pengalamanId },
      data: {
        paklaringNamaFile: namaFile,
        paklaringNamaAsli: file.name,
        paklaringPathFile: `${PUBLIC_PREFIX}/${namaFile}`,
        paklaringTipeFile: file.type,
        paklaringUkuranFile: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Paklaring berhasil diunggah",
      pengalaman,
    });
  } catch (error) {
    console.error("UPLOAD PAKLARING ERROR:", error);

    return fail("Terjadi kesalahan saat mengunggah paklaring", 500);
  }
}

// DELETE - hapus paklaring
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId();
    if (!userId) return fail("Unauthorized", 401);

    const { id } = await params;
    const pengalamanId = Number(id);

    if (!Number.isInteger(pengalamanId) || pengalamanId <= 0) {
      return fail("ID pengalaman tidak valid", 400);
    }

    const existing = await prisma.pengalaman.findFirst({
      where: { id: pengalamanId, userId },
    });

    if (!existing) return fail("Data pengalaman tidak ditemukan", 404);

    await removeFile(existing.paklaringPathFile);

    await prisma.pengalaman.update({
      where: { id: pengalamanId },
      data: {
        paklaringNamaFile: null,
        paklaringNamaAsli: null,
        paklaringPathFile: null,
        paklaringTipeFile: null,
        paklaringUkuranFile: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Paklaring berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE PAKLARING ERROR:", error);

    return fail("Terjadi kesalahan saat menghapus paklaring", 500);
  }
}