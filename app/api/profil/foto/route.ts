import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { deteksiBerkas } from "@/lib/file-signature";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];

function getExtension(type: string, fileName: string) {
  if (type === "image/png") return ".png";
  if (type === "image/jpeg" || type === "image/jpg") return ".jpg";

  const ext = path.extname(fileName).toLowerCase();

  if (ext === ".png") return ".png";
  if (ext === ".jpg" || ext === ".jpeg") return ".jpg";

  return null;
}

async function getUserId() {
  const cookieStore = await cookies();

  const userIdCookie = cookieStore.get("user_id");

  if (!userIdCookie?.value) {
    return null;
  }

  const userId = Number(userIdCookie.value);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

export async function POST(request: Request) {
  let newFilePath: string | null = null;

  try {
    // =====================================================
    // 1. CEK USER LOGIN
    // =====================================================

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User belum login atau cookie user_id tidak ditemukan",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // 2. CEK USER DI DATABASE
    // =====================================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Data user tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // 3. AMBIL FILE
    // =====================================================

    const formData = await request.formData();

    const foto = formData.get("foto");

    if (!(foto instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "File foto tidak ditemukan",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 4. VALIDASI TYPE
    // =====================================================

    if (!ALLOWED_TYPES.includes(foto.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format foto harus JPG, JPEG, atau PNG",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 5. VALIDASI UKURAN
    // =====================================================

    if (foto.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "File foto kosong",
        },
        { status: 400 }
      );
    }

    if (foto.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Ukuran foto maksimal 2 MB",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 6. TENTUKAN EXTENSION
    // =====================================================

    const extension = getExtension(
      foto.type,
      foto.name
    );

    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          message: "Extension foto tidak valid",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 7. FOLDER UPLOAD
    // =====================================================

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "profil"
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    // =====================================================
    // 8. CEK FOTO LAMA
    // =====================================================

    const fotoLama = await prisma.dokumenProfil.findUnique({
      where: {
        userId: userId,
      },
    });

    // =====================================================
    // 9. BUAT NAMA FILE BARU
    // =====================================================

    const namaFile = `${userId}-foto-${Date.now()}${extension}`;

    newFilePath = path.join(
      uploadDir,
      namaFile
    );

    const publicPath = `/uploads/profil/${namaFile}`;

    // =====================================================
    // 10. SIMPAN FILE
    // =====================================================

    const arrayBuffer = await foto.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    const tipeAsli = deteksiBerkas(buffer);
    const tipeKlaim = foto.type === "image/png" ? "png" : "jpeg";

    if (tipeAsli !== tipeKlaim) {
      return NextResponse.json(
        {
          success: false,
          message: "Isi file tidak sesuai dengan format foto yang dipilih",
        },
        { status: 400 }
      );
    }

    await writeFile(
      newFilePath,
      buffer
    );

    // =====================================================
    // 11. SIMPAN KE DATABASE
    // =====================================================

    const dokumenProfil =
      await prisma.dokumenProfil.upsert({
        where: {
          userId: userId,
        },

        update: {
          namaFile: namaFile,
          namaAsli: foto.name,
          pathFile: publicPath,
          tipeFile: foto.type,
          ukuranFile: foto.size,
        },

        create: {
          userId: userId,
          namaFile: namaFile,
          namaAsli: foto.name,
          pathFile: publicPath,
          tipeFile: foto.type,
          ukuranFile: foto.size,
        },
      });

    // =====================================================
    // 12. HAPUS FOTO LAMA
    // =====================================================

    if (
      fotoLama &&
      fotoLama.pathFile &&
      fotoLama.pathFile !== publicPath
    ) {
      try {
        const oldFilePath = path.join(
          process.cwd(),
          "public",
          fotoLama.pathFile.replace(
            /^\/+/,
            ""
          )
        );

        await unlink(oldFilePath);
      } catch (error) {
        console.error(
          "FOTO LAMA TIDAK DAPAT DIHAPUS:",
          error
        );
      }
    }

    // =====================================================
    // 13. RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,
      message: "Foto profil berhasil disimpan",

      fotoProfil: publicPath,

      dokumenProfil: {
        id: dokumenProfil.id,
        userId: dokumenProfil.userId,
        namaFile: dokumenProfil.namaFile,
        namaAsli: dokumenProfil.namaAsli,
        pathFile: dokumenProfil.pathFile,
        tipeFile: dokumenProfil.tipeFile,
        ukuranFile: dokumenProfil.ukuranFile,
        createdAt: dokumenProfil.createdAt,
        updatedAt: dokumenProfil.updatedAt,
      },
    });
  } catch (error) {
    console.error("UPLOAD FOTO PROFIL ERROR:", error);

    // =====================================================
    // HAPUS FILE BARU JIKA DATABASE GAGAL
    // =====================================================

    if (newFilePath) {
      try {
        await unlink(newFilePath);
      } catch {
        // abaikan
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan saat menyimpan foto profil",
      },
      {
        status: 500,
      }
    );
  }
}