import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bacaIdentitas } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { deteksiBerkas } from "@/lib/file-signature";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// =====================================================
// KONFIGURASI
// =====================================================

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

// =====================================================
// POST - UPLOAD TRANSKRIP NILAI
// =====================================================

export async function POST(
  request: NextRequest,
  { params }: Params
) {
  try {
    // =================================================
    // CEK USER
    // =================================================

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // =================================================
    // AMBIL ID PENDIDIKAN
    // =================================================

    const { id } = await params;
    const pendidikanId = Number(id);

    if (!Number.isInteger(pendidikanId) || pendidikanId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID pendidikan tidak valid.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CEK DATA PENDIDIKAN MILIK USER
    // =================================================

    const pendidikan = await prisma.pendidikan.findFirst({
      where: {
        id: pendidikanId,
        userId: userId,
      },
    });

    if (!pendidikan) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pendidikan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // =================================================
    // AMBIL FILE
    // =================================================

    const formData = await request.formData();

    const file = formData.get("transkrip");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "File transkrip tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // VALIDASI TIPE FILE
    // =================================================

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format transkrip harus PDF, JPG, atau PNG.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // VALIDASI UKURAN
    // =================================================

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "File transkrip kosong.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Ukuran transkrip maksimal 5 MB.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // BUAT FOLDER UPLOAD
    // =================================================

    // Simpan di folder private (di luar public/)
    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      "pendidikan"
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    // =================================================
    // EXTENSION FILE
    // =================================================

    const originalName = file.name;

    const extension =
      path.extname(originalName).toLowerCase() ||
      getExtensionFromMime(file.type);

    // =================================================
    // NAMA FILE BARU
    // =================================================

    const fileName = `transkrip_${userId}_${pendidikanId}_${Date.now()}${extension}`;

    const filePath = path.join(
      uploadDir,
      fileName
    );

    // =================================================
    // SIMPAN FILE (VALIDASI MAGIC BYTES)
    // =================================================

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const tipeAsli = deteksiBerkas(buffer);
    if (!tipeAsli) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Format berkas transkrip tidak valid atau rusak. Hanya file PDF, JPG, dan PNG asli yang diperbolehkan.",
        },
        { status: 400 }
      );
    }

    await fs.writeFile(
      filePath,
      buffer
    );

    // =================================================
    // HAPUS FILE TRANSKRIP LAMA
    // =================================================

    if (pendidikan.transkripPathFile) {
      try {
        const oldPath = getPhysicalPath(
          pendidikan.transkripPathFile
        );

        if (oldPath) {
          await fs.unlink(oldPath);
        }
      } catch (error) {
        console.warn(
          "FILE TRANSKRIP LAMA TIDAK DAPAT DIHAPUS:",
          error
        );
      }
    }

    // =================================================
    // PATH UNTUK DATABASE
    // =================================================

    // Path diakses melalui API berkas yang terautentikasi
    const publicPath =
      `/api/berkas/pendidikan/${fileName}`;

    // =================================================
    // UPDATE DATABASE
    // =================================================

    const updatedPendidikan =
      await prisma.pendidikan.update({
        where: {
          id: pendidikanId,
        },
        data: {
          transkripNamaFile: fileName,
          transkripNamaAsli: originalName,
          transkripPathFile: publicPath,
          transkripTipeFile: file.type,
          transkripUkuranFile: file.size,
        },
      });

    // =================================================
    // RESPONSE
    // =================================================

    return NextResponse.json({
      success: true,
      message: "Transkrip berhasil diunggah.",
      pendidikan: updatedPendidikan,
      transkrip: {
        namaFile: fileName,
        namaAsli: originalName,
        pathFile: publicPath,
        tipeFile: file.type,
        ukuranFile: file.size,
      },
    });
  } catch (error) {
    console.error(
      "UPLOAD TRANSKRIP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan saat mengunggah transkrip.",
        error:
          process.env.NODE_ENV === "development"
            ? String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - HAPUS TRANSKRIP NILAI
// =====================================================

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    // =================================================
    // CEK USER
    // =================================================

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // =================================================
    // AMBIL ID PENDIDIKAN
    // =================================================

    const { id } = await params;
    const pendidikanId = Number(id);

    if (!Number.isInteger(pendidikanId) || pendidikanId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID pendidikan tidak valid.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CEK DATA MILIK USER
    // =================================================

    const pendidikan = await prisma.pendidikan.findFirst({
      where: {
        id: pendidikanId,
        userId: userId,
      },
    });

    if (!pendidikan) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pendidikan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // =================================================
    // HAPUS FILE FISIK
    // =================================================

    if (pendidikan.transkripPathFile) {
      try {
        const physicalPath = getPhysicalPath(
          pendidikan.transkripPathFile
        );

        if (physicalPath) {
          await fs.unlink(
            physicalPath
          );
        }
      } catch (error) {
        console.warn(
          "FILE TRANSKRIP TIDAK DAPAT DIHAPUS:",
          error
        );
      }
    }

    // =================================================
    // KOSONGKAN DATA TRANSKRIP
    // =================================================

    const updatedPendidikan =
      await prisma.pendidikan.update({
        where: {
          id: pendidikanId,
        },
        data: {
          transkripNamaFile: null,
          transkripNamaAsli: null,
          transkripPathFile: null,
          transkripTipeFile: null,
          transkripUkuranFile: null,
        },
      });

    // =================================================
    // RESPONSE
    // =================================================

    return NextResponse.json({
      success: true,
      message: "Transkrip berhasil dihapus.",
      pendidikan: updatedPendidikan,
    });
  } catch (error) {
    console.error(
      "DELETE TRANSKRIP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan saat menghapus transkrip.",
        error:
          process.env.NODE_ENV === "development"
            ? String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}

// =====================================================
// GET USER ID DARI COOKIE
// =====================================================

async function getUserId(): Promise<number | null> {
  try {
    const { userId: userIdCookie } = await bacaIdentitas();

    if (!userIdCookie) {
      return null;
    }

    const userId = Number(userIdCookie);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return null;
    }

    return userId;
  } catch (error) {
    console.error(
      "GET USER ID ERROR:",
      error
    );

    return null;
  }
}

// =====================================================
// KONVERSI MIME TYPE KE EXTENSION
// =====================================================

function getExtensionFromMime(
  mimeType: string
): string {
  switch (mimeType) {
    case "application/pdf":
      return ".pdf";

    case "image/jpeg":
    case "image/jpg":
      return ".jpg";

    case "image/png":
      return ".png";

    default:
      return "";
  }
}

// =====================================================
// PATH DATABASE -> PATH FISIK
// Mendukung format lama (/uploads/) dan baru (/api/berkas/)
// =====================================================

function getPhysicalPath(
  publicPath: string
): string | null {
  // Format baru: /api/berkas/pendidikan/namafile
  if (publicPath.startsWith("/api/berkas/")) {
    const relativePath = publicPath.replace(/^\/api\/berkas\//, "");
    return path.join(
      process.cwd(),
      "uploads",
      relativePath
    );
  }

  // Format lama: /uploads/pendidikan/namafile
  if (publicPath.startsWith("/uploads/")) {
    const relativePath = publicPath.replace(/^\/+/, "");
    return path.join(
      process.cwd(),
      "public",
      relativePath
    );
  }

  return null;
}