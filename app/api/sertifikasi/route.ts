import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

/* ============================================================
   KONFIGURASI UPLOAD
============================================================ */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

/* ============================================================
   GET
============================================================ */

export async function GET() {
  try {
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

    const sertifikasi = await prisma.sertifikasi.findMany({
      where: {
        userId,
      },
      orderBy: {
        tanggalTerbit: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      sertifikasi,
    });
  } catch (error) {
    console.error("GET SERTIFIKASI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data sertifikasi",
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   POST
============================================================ */

export async function POST(request: NextRequest) {
  try {
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

    const formData = await request.formData();

    const nama = String(formData.get("nama") ?? "").trim();

    const penerbit = String(
      formData.get("penerbit") ?? ""
    ).trim();

    const nomorValue = formData.get("nomor");

    const nomor =
      nomorValue &&
      String(nomorValue).trim() !== ""
        ? String(nomorValue).trim()
        : null;

    const tanggalTerbitValue =
      formData.get("tanggalTerbit");

    const tanggalTerbit =
      tanggalTerbitValue &&
      String(tanggalTerbitValue).trim() !== ""
        ? String(tanggalTerbitValue).trim()
        : null;

    const tanggalKadaluarsaValue =
      formData.get("tanggalKadaluarsa");

    const tanggalKadaluarsa =
      tanggalKadaluarsaValue &&
      String(tanggalKadaluarsaValue).trim() !== ""
        ? String(tanggalKadaluarsaValue).trim()
        : null;

    const file = formData.get("file");

    /* ========================================================
       VALIDASI DATA
    ======================================================== */

    if (!nama) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama sertifikasi wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!penerbit) {
      return NextResponse.json(
        {
          success: false,
          message: "Penerbit sertifikasi wajib diisi",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       VALIDASI FILE
    ======================================================== */

    let fileData:
      | {
          namaFile: string;
          namaAsli: string;
          pathFile: string;
          tipeFile: string;
          ukuranFile: number;
        }
      | null = null;

    if (file instanceof File && file.size > 0) {
      validateFile(file);

      fileData = await saveFile(file);
    }

    /* ========================================================
       CEK USER
    ======================================================== */

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      if (fileData) {
        await deleteFile(fileData.pathFile);
      }

      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    /* ========================================================
       CREATE
    ======================================================== */

    const sertifikasi =
      await prisma.sertifikasi.create({
        data: {
          userId,

          nama,

          penerbit,

          nomor,

          tanggalTerbit,

          tanggalKadaluarsa,

          sertifikatNamaFile:
            fileData?.namaFile ?? null,

          sertifikatNamaAsli:
            fileData?.namaAsli ?? null,

          sertifikatPathFile:
            fileData?.pathFile ?? null,

          sertifikatTipeFile:
            fileData?.tipeFile ?? null,

          sertifikatUkuranFile:
            fileData?.ukuranFile ?? null,
        },
      });

    return NextResponse.json(
      {
        success: true,

        message: "Sertifikasi berhasil ditambahkan",

        sertifikasi,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST SERTIFIKASI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal menambahkan sertifikasi",
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   PUT
============================================================ */

export async function PUT(request: NextRequest) {
  try {
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

    const formData = await request.formData();

    const id = Number(formData.get("id"));

    const nama = String(
      formData.get("nama") ?? ""
    ).trim();

    const penerbit = String(
      formData.get("penerbit") ?? ""
    ).trim();

    const nomorValue = formData.get("nomor");

    const nomor =
      nomorValue &&
      String(nomorValue).trim() !== ""
        ? String(nomorValue).trim()
        : null;

    const tanggalTerbitValue =
      formData.get("tanggalTerbit");

    const tanggalTerbit =
      tanggalTerbitValue &&
      String(tanggalTerbitValue).trim() !== ""
        ? String(tanggalTerbitValue).trim()
        : null;

    const tanggalKadaluarsaValue =
      formData.get("tanggalKadaluarsa");

    const tanggalKadaluarsa =
      tanggalKadaluarsaValue &&
      String(tanggalKadaluarsaValue).trim() !== ""
        ? String(tanggalKadaluarsaValue).trim()
        : null;

    const file = formData.get("file");

    /* ========================================================
       VALIDASI ID
    ======================================================== */

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID sertifikasi tidak valid",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       VALIDASI FIELD
    ======================================================== */

    if (!nama) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama sertifikasi wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!penerbit) {
      return NextResponse.json(
        {
          success: false,
          message: "Penerbit sertifikasi wajib diisi",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       CEK DATA
    ======================================================== */

    const existing =
      await prisma.sertifikasi.findFirst({
        where: {
          id,
          userId,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Sertifikasi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    /* ========================================================
       FILE BARU
    ======================================================== */

    let newFileData:
      | {
          namaFile: string;
          namaAsli: string;
          pathFile: string;
          tipeFile: string;
          ukuranFile: number;
        }
      | null = null;

    if (file instanceof File && file.size > 0) {
      validateFile(file);

      newFileData = await saveFile(file);
    }

    /* ========================================================
       UPDATE DATABASE
    ======================================================== */

    const sertifikasi =
      await prisma.sertifikasi.update({
        where: {
          id,
        },

        data: {
          nama,

          penerbit,

          nomor,

          tanggalTerbit,

          tanggalKadaluarsa,

          ...(newFileData
            ? {
                sertifikatNamaFile:
                  newFileData.namaFile,

                sertifikatNamaAsli:
                  newFileData.namaAsli,

                sertifikatPathFile:
                  newFileData.pathFile,

                sertifikatTipeFile:
                  newFileData.tipeFile,

                sertifikatUkuranFile:
                  newFileData.ukuranFile,
              }
            : {}),
        },
      });

    /* ========================================================
       HAPUS FILE LAMA JIKA ADA FILE BARU
    ======================================================== */

    if (
      newFileData &&
      existing.sertifikatPathFile
    ) {
      await deleteFile(
        existing.sertifikatPathFile
      );
    }

    return NextResponse.json({
      success: true,

      message: "Sertifikasi berhasil diperbarui",

      sertifikasi,
    });
  } catch (error) {
    console.error("PUT SERTIFIKASI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui sertifikasi",
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   DELETE
============================================================ */

export async function DELETE(request: NextRequest) {
  try {
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

    const body = await request.json();

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID sertifikasi tidak valid",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.sertifikasi.findFirst({
        where: {
          id,
          userId,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Sertifikasi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    /* ========================================================
       HAPUS DATABASE
    ======================================================== */

    await prisma.sertifikasi.delete({
      where: {
        id,
      },
    });

    /* ========================================================
       HAPUS FILE
    ======================================================== */

    if (existing.sertifikatPathFile) {
      await deleteFile(
        existing.sertifikatPathFile
      );
    }

    return NextResponse.json({
      success: true,

      message: "Sertifikasi berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE SERTIFIKASI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus sertifikasi",
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   VALIDASI FILE
============================================================ */

function validateFile(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Ukuran sertifikat maksimal 5 MB"
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Format sertifikat harus PDF, JPG, JPEG, atau PNG"
    );
  }
}

/* ============================================================
   SIMPAN FILE
============================================================ */

async function saveFile(file: File) {
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "sertifikasi"
  );

  await fs.mkdir(uploadDir, {
    recursive: true,
  });

  const originalName = file.name;

  const extension =
    path.extname(originalName).toLowerCase();

  const randomName =
    `${Date.now()}-${crypto.randomUUID()}${extension}`;

  const filePath = path.join(
    uploadDir,
    randomName
  );

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  await fs.writeFile(filePath, buffer);

  return {
    namaFile: randomName,

    namaAsli: originalName,

    pathFile: `/uploads/sertifikasi/${randomName}`,

    tipeFile: file.type,

    ukuranFile: file.size,
  };
}

/* ============================================================
   HAPUS FILE
============================================================ */

async function deleteFile(
  filePath: string
) {
  try {
    const relativePath =
      filePath.replace(/^[/\\]+/, "");

    const absolutePath = path.join(
      process.cwd(),
      "public",
      relativePath
    );

    await fs.unlink(absolutePath);
  } catch (error: unknown) {
    const err = error as {
      code?: string;
    };

    if (err?.code !== "ENOENT") {
      console.error(
        "GAGAL MENGHAPUS FILE:",
        error
      );
    }
  }
}

/* ============================================================
   GET USER ID
============================================================ */

async function getUserId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();

    const userIdCookie =
      cookieStore.get("user_id")?.value;

    if (!userIdCookie) {
      console.error(
        "COOKIE user_id TIDAK DITEMUKAN"
      );

      return null;
    }

    const userId = Number(userIdCookie);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      console.error(
        "COOKIE user_id TIDAK VALID:",
        userIdCookie
      );

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