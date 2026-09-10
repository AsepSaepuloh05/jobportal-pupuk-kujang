import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// =====================================================
// GET - Ambil semua sertifikasi milik user yang login
// =====================================================

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
        message: "Terjadi kesalahan pada server",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Tambah sertifikasi
// =====================================================

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
    const nomor = body.nomor ? String(body.nomor).trim() : null;
    const tanggalTerbit = body.tanggalTerbit
      ? String(body.tanggalTerbit).trim()
      : null;
    const tanggalKadaluarsa = body.tanggalKadaluarsa
      ? String(body.tanggalKadaluarsa).trim()
      : null;

    // =================================================
    // VALIDASI
    // =================================================

    if (!nama || !penerbit) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nama sertifikasi dan penerbit wajib diisi",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CEK USER
    // =================================================

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

    // =================================================
    // SIMPAN SERTIFIKASI
    // =================================================

    const sertifikasi = await prisma.sertifikasi.create({
      data: {
        userId: userId,
        nama: nama,
        penerbit: penerbit,
        nomor: nomor,
        tanggalTerbit: tanggalTerbit,
        tanggalKadaluarsa: tanggalKadaluarsa,
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
        message: "Terjadi kesalahan pada server",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Edit sertifikasi
// =====================================================

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

    const id = Number(body.id);

    const nama = String(body.nama ?? "").trim();
    const penerbit = String(body.penerbit ?? "").trim();
    const nomor = body.nomor ? String(body.nomor).trim() : null;
    const tanggalTerbit = body.tanggalTerbit
      ? String(body.tanggalTerbit).trim()
      : null;
    const tanggalKadaluarsa = body.tanggalKadaluarsa
      ? String(body.tanggalKadaluarsa).trim()
      : null;

    // =================================================
    // VALIDASI
    // =================================================

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID sertifikasi tidak valid",
        },
        { status: 400 }
      );
    }

    if (!nama || !penerbit) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nama sertifikasi dan penerbit wajib diisi",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CEK DATA MILIK USER
    // =================================================

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
          message: "Data sertifikasi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =================================================
    // UPDATE
    // =================================================

    const sertifikasi = await prisma.sertifikasi.update({
      where: {
        id: id,
      },
      data: {
        nama: nama,
        penerbit: penerbit,
        nomor: nomor,
        tanggalTerbit: tanggalTerbit,
        tanggalKadaluarsa: tanggalKadaluarsa,
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
        message: "Terjadi kesalahan pada server",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Hapus sertifikasi
// =====================================================

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

    // =================================================
    // CEK DATA MILIK USER
    // =================================================

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
          message: "Data sertifikasi tidak ditemukan",
        },
        { status: 404 }
      );
    }

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
        message: "Terjadi kesalahan pada server",
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
    const cookieStore = await cookies();

    const userIdCookie = cookieStore.get("user_id")?.value;

    if (!userIdCookie) {
      console.error("COOKIE user_id TIDAK DITEMUKAN");
      return null;
    }

    const userId = Number(userIdCookie);

    if (!Number.isInteger(userId) || userId <= 0) {
      console.error("COOKIE user_id TIDAK VALID:", userIdCookie);
      return null;
    }

    return userId;
  } catch (error) {
    console.error("GET USER ID ERROR:", error);
    return null;
  }
}