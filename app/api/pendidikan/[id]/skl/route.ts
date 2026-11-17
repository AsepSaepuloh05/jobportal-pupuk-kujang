import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bacaIdentitas } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { deteksiBerkas } from "@/lib/file-signature";
import { isSklMasihBerlaku } from "@/app/kandidat/profil/skl";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

// =====================================================
// POST - UPLOAD SKL
// =====================================================

export async function POST(
  request: NextRequest,
  { params }: Params
) {
  let filePath: string | null = null;

  try {
    // CEK USER
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // AMBIL ID PENDIDIKAN
    const { id } = await params;
    const pendidikanId = Number(id);

    if (!Number.isInteger(pendidikanId) || pendidikanId <= 0) {
      return NextResponse.json(
        { success: false, message: "ID pendidikan tidak valid." },
        { status: 400 }
      );
    }

    // CEK DATA PENDIDIKAN MILIK USER
    const pendidikan = await prisma.pendidikan.findFirst({
      where: {
        id: pendidikanId,
        userId,
      },
    });

    if (!pendidikan) {
      return NextResponse.json(
        { success: false, message: "Data pendidikan tidak ditemukan." },
        { status: 404 }
      );
    }

    // ATURAN: HANYA SATU DOKUMEN KELULUSAN (IJAZAH ATAU SKL)
    if (pendidikan.ijazahPathFile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ijazah sudah diunggah, sehingga SKL tidak diperlukan lagi.",
        },
        { status: 400 }
      );
    }

    // ATURAN: SKL HARUS PUNYA TANGGAL LULUS DAN MAKSIMAL 4 BULAN
    if (!pendidikan.tanggalLulus) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Isi tanggal lulus terlebih dahulu sebelum mengunggah SKL.",
        },
        { status: 400 }
      );
    }

    if (!isSklMasihBerlaku(pendidikan.tanggalLulus)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "SKL sudah melewati batas 4 bulan sejak tanggal lulus. Silakan unggah ijazah.",
        },
        { status: 400 }
      );
    }

    // AMBIL FILE
    const formData = await request.formData();
    const file = formData.get("skl");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "File SKL tidak ditemukan." },
        { status: 400 }
      );
    }

    // VALIDASI FORMAT
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format SKL harus PDF, JPG, atau PNG.",
        },
        { status: 400 }
      );
    }

    // VALIDASI UKURAN
    if (file.size === 0) {
      return NextResponse.json(
        { success: false, message: "File SKL kosong." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran SKL maksimal 5 MB." },
        { status: 400 }
      );
    }

    // BUAT FOLDER UPLOAD
    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      "pendidikan"
    );

    await fs.mkdir(uploadDir, { recursive: true });

    // NAMA FILE
    const originalName = file.name;

    const extension =
      path.extname(originalName).toLowerCase() ||
      getExtensionFromMime(file.type);

    const fileName = `skl_${userId}_${pendidikanId}_${Date.now()}${extension}`;

    filePath = path.join(uploadDir, fileName);

    // VALIDASI MAGIC BYTES
    const buffer = Buffer.from(await file.arrayBuffer());

    const tipeAsli = deteksiBerkas(buffer);

    if (!tipeAsli) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Format berkas SKL tidak valid atau rusak. Hanya file PDF, JPG, dan PNG asli yang diperbolehkan.",
        },
        { status: 400 }
      );
    }

    // SIMPAN FILE
    await fs.writeFile(filePath, buffer);

    // HAPUS FILE SKL LAMA
    if (pendidikan.sklPathFile) {
      try {
        const oldPath = getPhysicalPath(
          pendidikan.sklPathFile
        );

        if (oldPath) {
          await fs.unlink(oldPath);
        }
      } catch (error) {
        console.warn(
          "FILE SKL LAMA TIDAK DAPAT DIHAPUS:",
          error
        );
      }
    }

    // PATH DATABASE
    const publicPath =
      `/api/berkas/pendidikan/${fileName}`;

    // UPDATE DATABASE
    const updatedPendidikan = await prisma.pendidikan.update({
      where: {
        id: pendidikanId,
      },
      data: {
        sklNamaFile: fileName,
        sklNamaAsli: originalName,
        sklPathFile: publicPath,
        sklTipeFile: file.type,
        sklUkuranFile: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      message: "SKL berhasil diunggah.",
      pendidikan: updatedPendidikan,
      skl: {
        namaFile: fileName,
        namaAsli: originalName,
        pathFile: publicPath,
        tipeFile: file.type,
        ukuranFile: file.size,
      },
    });
  } catch (error) {
    // HAPUS FILE BARU JIKA PROSES GAGAL
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch {
        // File mungkin belum berhasil dibuat
      }
    }

    console.error("UPLOAD SKL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengunggah SKL.",
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
// DELETE - HAPUS SKL
// =====================================================

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const pendidikanId = Number(id);

    if (!Number.isInteger(pendidikanId) || pendidikanId <= 0) {
      return NextResponse.json(
        { success: false, message: "ID pendidikan tidak valid." },
        { status: 400 }
      );
    }

    const pendidikan = await prisma.pendidikan.findFirst({
      where: {
        id: pendidikanId,
        userId,
      },
    });

    if (!pendidikan) {
      return NextResponse.json(
        { success: false, message: "Data pendidikan tidak ditemukan." },
        { status: 404 }
      );
    }

    // HAPUS FILE FISIK
    if (pendidikan.sklPathFile) {
      try {
        const physicalPath = getPhysicalPath(
          pendidikan.sklPathFile
        );

        if (physicalPath) {
          await fs.unlink(physicalPath);
        }
      } catch (error) {
        console.warn(
          "FILE SKL TIDAK DAPAT DIHAPUS:",
          error
        );
      }
    }

    // KOSONGKAN DATA SKL
    const updatedPendidikan = await prisma.pendidikan.update({
      where: {
        id: pendidikanId,
      },
      data: {
        sklNamaFile: null,
        sklNamaAsli: null,
        sklPathFile: null,
        sklTipeFile: null,
        sklUkuranFile: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "SKL berhasil dihapus.",
      pendidikan: updatedPendidikan,
    });
  } catch (error) {
    console.error("DELETE SKL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menghapus SKL.",
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

    if (!Number.isInteger(userId) || userId <= 0) {
      return null;
    }

    return userId;
  } catch (error) {
    console.error("GET USER ID ERROR:", error);
    return null;
  }
}

// =====================================================
// KONVERSI MIME TYPE KE EXTENSION
// =====================================================

function getExtensionFromMime(mimeType: string): string {
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
// =====================================================

function getPhysicalPath(publicPath: string): string | null {
  if (publicPath.startsWith("/api/berkas/")) {
    const relativePath = publicPath.replace(
      /^\/api\/berkas\//,
      ""
    );

    return path.join(
      process.cwd(),
      "uploads",
      relativePath
    );
  }

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