import { NextRequest, NextResponse } from "next/server";
import { bacaSesi } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

// =====================================================
// FOLDER PRIVATE (di luar public/)
// =====================================================

const PRIVATE_UPLOAD_DIR = path.join(process.cwd(), "uploads");

// =====================================================
// MAPPING MIME TYPE
// =====================================================

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  return map[ext] ?? "application/octet-stream";
}

// =====================================================
// KEPEMILIKAN BERKAS
// Jalur berkas disimpan di database dalam format
// /api/berkas/<folder>/<namaFile>. Pemilik dicari dari
// kolom jalur tersebut di semua tabel yang menyimpan berkas.
// =====================================================

async function userPemilikBerkas(urlPath: string): Promise<number | null> {
  const [dokumen, pendidikan, pengalaman, sertifikasi] = await Promise.all([
    prisma.dokumenKandidat.findFirst({
      where: { pathFile: urlPath },
      select: { userId: true },
    }),
    prisma.pendidikan.findFirst({
      where: { ijazahPathFile: urlPath },
      select: { userId: true },
    }),
    prisma.pengalaman.findFirst({
      where: { paklaringPathFile: urlPath },
      select: { userId: true },
    }),
    prisma.sertifikasi.findFirst({
      where: { sertifikatPathFile: urlPath },
      select: { userId: true },
    }),
  ]);

  return (
    dokumen?.userId ??
    pendidikan?.userId ??
    pengalaman?.userId ??
    sertifikasi?.userId ??
    null
  );
}

// =====================================================
// GET /api/berkas/[...path]
// Hanya bisa diakses oleh user yang sudah login (HR atau KANDIDAT)
// =====================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Verifikasi sesi
  const sesi = await bacaSesi();

  if (!sesi) {
    return NextResponse.json(
      { success: false, message: "Akses ditolak. Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }

  // Ambil path segmen dari URL
  const { path: pathSegments } = await params;

  // Validasi path segmen — cegah directory traversal
  if (!pathSegments || pathSegments.length === 0) {
    return NextResponse.json(
      { success: false, message: "Path file tidak valid" },
      { status: 400 }
    );
  }

  // Pastikan tidak ada ".." dalam path untuk mencegah path traversal
  if (pathSegments.some((seg) => seg === ".." || seg === ".")) {
    return NextResponse.json(
      { success: false, message: "Path file tidak valid" },
      { status: 400 }
    );
  }

  // Bangun path fisik
  const filePath = path.join(PRIVATE_UPLOAD_DIR, ...pathSegments);

  // Pastikan file berada di dalam PRIVATE_UPLOAD_DIR (double check)
  const normalizedFilePath = path.normalize(filePath);
  const normalizedBase = path.normalize(PRIVATE_UPLOAD_DIR);

  if (!normalizedFilePath.startsWith(normalizedBase + path.sep) &&
    normalizedFilePath !== normalizedBase) {
    return NextResponse.json(
      { success: false, message: "Path file tidak valid" },
      { status: 400 }
    );
  }

  // Otorisasi kepemilikan: HR boleh membuka semua berkas,
  // kandidat hanya berkas miliknya sendiri.
  if (sesi.role !== "HR") {
    const urlPath = `/api/berkas/${pathSegments.join("/")}`;
    const pemilik = await userPemilikBerkas(urlPath);

    if (pemilik !== sesi.userId) {
      // Sengaja 404 (bukan 403) agar keberadaan file tidak bisa ditebak
      return NextResponse.json(
        { success: false, message: "File tidak ditemukan" },
        { status: 404 }
      );
    }
  }

  // Baca file
  try {
    const buffer = await readFile(filePath);
    const mimeType = getMimeType(pathSegments[pathSegments.length - 1]);
    const filename = pathSegments[pathSegments.length - 1];

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(buffer.length),
        // Untuk PDF: tampilkan inline; untuk gambar: tampilkan inline
        "Content-Disposition": `inline; filename="${filename}"`,
        // Cegah caching di browser untuk keamanan
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "ENOENT") {
      return NextResponse.json(
        { success: false, message: "File tidak ditemukan" },
        { status: 404 }
      );
    }

    console.error("BERKAS READ ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat membaca file" },
      { status: 500 }
    );
  }
}
