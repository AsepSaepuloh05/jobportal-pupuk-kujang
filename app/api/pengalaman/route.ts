import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// =====================================================
// GET - Ambil semua pengalaman milik user yang login
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

    const pengalaman = await prisma.pengalaman.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        tahunMulai: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      pengalaman,
    });
  } catch (error) {
    console.error("GET PENGALAMAN ERROR:", error);

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
// POST - Tambah pengalaman
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

    const posisi = String(body.posisi ?? "").trim();
    const perusahaan = String(body.perusahaan ?? "").trim();
    const lokasi = body.lokasi ? String(body.lokasi).trim() : null;
    const tahunMulai = String(body.tahunMulai ?? "").trim();
    const tahunSelesai = body.tahunSelesai
      ? String(body.tahunSelesai).trim()
      : null;
    const deskripsi = body.deskripsi
      ? String(body.deskripsi).trim()
      : null;

    // =================================================
    // VALIDASI
    // =================================================

    if (!posisi || !perusahaan || !tahunMulai) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Posisi, perusahaan, dan tahun mulai wajib diisi",
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
    // SIMPAN PENGALAMAN
    // =================================================

    const pengalaman = await prisma.pengalaman.create({
      data: {
        userId: userId,
        posisi: posisi,
        perusahaan: perusahaan,
        lokasi: lokasi,
        tahunMulai: tahunMulai,
        tahunSelesai: tahunSelesai,
        deskripsi: deskripsi,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pengalaman berhasil ditambahkan",
        pengalaman,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST PENGALAMAN ERROR:", error);

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
// PUT - Edit pengalaman
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

    const posisi = String(body.posisi ?? "").trim();
    const perusahaan = String(body.perusahaan ?? "").trim();
    const lokasi = body.lokasi ? String(body.lokasi).trim() : null;
    const tahunMulai = String(body.tahunMulai ?? "").trim();
    const tahunSelesai = body.tahunSelesai
      ? String(body.tahunSelesai).trim()
      : null;
    const deskripsi = body.deskripsi
      ? String(body.deskripsi).trim()
      : null;

    // =================================================
    // VALIDASI
    // =================================================

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID pengalaman tidak valid",
        },
        { status: 400 }
      );
    }

    if (!posisi || !perusahaan || !tahunMulai) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Posisi, perusahaan, dan tahun mulai wajib diisi",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CEK DATA MILIK USER
    // =================================================

    const existing = await prisma.pengalaman.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pengalaman tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =================================================
    // UPDATE
    // =================================================

    const pengalaman = await prisma.pengalaman.update({
      where: {
        id: id,
      },
      data: {
        posisi: posisi,
        perusahaan: perusahaan,
        lokasi: lokasi,
        tahunMulai: tahunMulai,
        tahunSelesai: tahunSelesai,
        deskripsi: deskripsi,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengalaman berhasil diperbarui",
      pengalaman,
    });
  } catch (error) {
    console.error("PUT PENGALAMAN ERROR:", error);

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
// DELETE - Hapus pengalaman
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
          message: "ID pengalaman tidak valid",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CEK DATA MILIK USER
    // =================================================

    const existing = await prisma.pengalaman.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pengalaman tidak ditemukan",
        },
        { status: 404 }
      );
    }

    await prisma.pengalaman.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengalaman berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE PENGALAMAN ERROR:", error);

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