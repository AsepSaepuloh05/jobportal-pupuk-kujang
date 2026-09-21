import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * ============================================================
 * GET - Mengambil seluruh sertifikasi milik user yang login
 * ============================================================
 */
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
        userId: userId,
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

/**
 * ============================================================
 * POST - Menambahkan sertifikasi baru
 * ============================================================
 */
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

    const body = await request.json();

    const nama = String(body.nama ?? "").trim();
    const penerbit = String(body.penerbit ?? "").trim();

    const nomor =
      body.nomor !== undefined &&
      body.nomor !== null &&
      String(body.nomor).trim() !== ""
        ? String(body.nomor).trim()
        : null;

    const tanggalTerbit =
      body.tanggalTerbit !== undefined &&
      body.tanggalTerbit !== null &&
      String(body.tanggalTerbit).trim() !== ""
        ? String(body.tanggalTerbit).trim()
        : null;

    const tanggalKadaluarsa =
      body.tanggalKadaluarsa !== undefined &&
      body.tanggalKadaluarsa !== null &&
      String(body.tanggalKadaluarsa).trim() !== ""
        ? String(body.tanggalKadaluarsa).trim()
        : null;

    // Validasi field wajib
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

    // Pastikan user masih ada
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Simpan sertifikasi
    const sertifikasi = await prisma.sertifikasi.create({
      data: {
        userId,
        nama,
        penerbit,
        nomor,
        tanggalTerbit,
        tanggalKadaluarsa,
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
        message: "Gagal menambahkan sertifikasi",
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================
 * PUT - Mengubah sertifikasi
 *
 * Frontend harus mengirim:
 * {
 *   id: 1,
 *   nama: "...",
 *   penerbit: "...",
 *   nomor: "...",
 *   tanggalTerbit: "...",
 *   tanggalKadaluarsa: "..."
 * }
 *
 * Endpoint:
 * PUT /api/sertifikasi
 * ============================================================
 */
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

    const body = await request.json();

    // Ambil ID dari body
    const id = Number(body.id);

    const nama = String(body.nama ?? "").trim();
    const penerbit = String(body.penerbit ?? "").trim();

    const nomor =
      body.nomor !== undefined &&
      body.nomor !== null &&
      String(body.nomor).trim() !== ""
        ? String(body.nomor).trim()
        : null;

    const tanggalTerbit =
      body.tanggalTerbit !== undefined &&
      body.tanggalTerbit !== null &&
      String(body.tanggalTerbit).trim() !== ""
        ? String(body.tanggalTerbit).trim()
        : null;

    const tanggalKadaluarsa =
      body.tanggalKadaluarsa !== undefined &&
      body.tanggalKadaluarsa !== null &&
      String(body.tanggalKadaluarsa).trim() !== ""
        ? String(body.tanggalKadaluarsa).trim()
        : null;

    // Validasi ID
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID sertifikasi tidak valid",
        },
        { status: 400 }
      );
    }

    // Validasi field wajib
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

    // Pastikan sertifikasi memang milik user yang login
    const existing = await prisma.sertifikasi.findFirst({
      where: {
        id: id,
        userId: userId,
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

    // Update sertifikasi
    const sertifikasi = await prisma.sertifikasi.update({
      where: {
        id: id,
      },
      data: {
        nama,
        penerbit,
        nomor,
        tanggalTerbit,
        tanggalKadaluarsa,
      },
    });

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
        message: "Gagal memperbarui sertifikasi",
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================
 * DELETE - Menghapus sertifikasi
 *
 * Frontend mengirim:
 * {
 *   id: 1
 * }
 *
 * Endpoint:
 * DELETE /api/sertifikasi
 * ============================================================
 */
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

    // Validasi ID
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID sertifikasi tidak valid",
        },
        { status: 400 }
      );
    }

    // Pastikan sertifikasi milik user yang login
    const existing = await prisma.sertifikasi.findFirst({
      where: {
        id: id,
        userId: userId,
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

    // Hapus sertifikasi
    await prisma.sertifikasi.delete({
      where: {
        id: id,
      },
    });

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

/**
 * ============================================================
 * HELPER - Mengambil user ID dari cookie
 * ============================================================
 */
async function getUserId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();

    const userIdCookie = cookieStore.get("user_id")?.value;

    if (!userIdCookie) {
      console.error("COOKIE user_id TIDAK DITEMUKAN");
      return null;
    }

    const userId = Number(userIdCookie);

    if (!Number.isInteger(userId) || userId <= 0) {
      console.error(
        "COOKIE user_id TIDAK VALID:",
        userIdCookie
      );

      return null;
    }

    return userId;
  } catch (error) {
    console.error("GET USER ID ERROR:", error);

    return null;
  }
}