import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// =====================================================
// GET - AMBIL SEMUA DATA PENDIDIKAN USER
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

    const pendidikan = await prisma.pendidikan.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        tahunMulai: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      pendidikan,
    });
  } catch (error) {
    console.error("GET PENDIDIKAN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data pendidikan",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - TAMBAH DATA PENDIDIKAN
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

    console.log("POST PENDIDIKAN BODY:", body);
    console.log("USER ID:", userId);

    const jenjang = String(body.jenjang ?? "").trim();
    const institusi = String(body.institusi ?? "").trim();
    const jurusan = String(body.jurusan ?? "").trim();
    const tahunMulai = String(body.tahunMulai ?? "").trim();
    const tahunSelesai = String(body.tahunSelesai ?? "").trim();

    const nilai =
      body.nilai !== null &&
      body.nilai !== undefined &&
      String(body.nilai).trim() !== ""
        ? String(body.nilai).trim()
        : null;

    // =================================================
    // VALIDASI
    // =================================================

    if (!jenjang) {
      return NextResponse.json(
        {
          success: false,
          message: "Jenjang pendidikan wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!institusi) {
      return NextResponse.json(
        {
          success: false,
          message: "Institusi pendidikan wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!jurusan) {
      return NextResponse.json(
        {
          success: false,
          message: "Jurusan wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!tahunMulai) {
      return NextResponse.json(
        {
          success: false,
          message: "Tahun mulai wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!tahunSelesai) {
      return NextResponse.json(
        {
          success: false,
          message: "Tahun selesai wajib diisi",
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
    // SIMPAN PENDIDIKAN
    // =================================================

    const pendidikan = await prisma.pendidikan.create({
      data: {
        userId: userId,
        jenjang: jenjang,
        institusi: institusi,
        jurusan: jurusan,
        tahunMulai: tahunMulai,
        tahunSelesai: tahunSelesai,
        nilai: nilai,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pendidikan berhasil ditambahkan",
        pendidikan: pendidikan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST PENDIDIKAN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
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
// PUT - UPDATE DATA PENDIDIKAN
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

    console.log("PUT PENDIDIKAN BODY:", body);

    const id = Number(body.id);

    const jenjang = String(body.jenjang ?? "").trim();
    const institusi = String(body.institusi ?? "").trim();
    const jurusan = String(body.jurusan ?? "").trim();
    const tahunMulai = String(body.tahunMulai ?? "").trim();
    const tahunSelesai = String(body.tahunSelesai ?? "").trim();

    const nilai =
      body.nilai !== null &&
      body.nilai !== undefined &&
      String(body.nilai).trim() !== ""
        ? String(body.nilai).trim()
        : null;

    // =================================================
    // VALIDASI ID
    // =================================================

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID pendidikan tidak valid",
        },
        { status: 400 }
      );
    }

    // =================================================
    // VALIDASI DATA
    // =================================================

    if (!jenjang) {
      return NextResponse.json(
        {
          success: false,
          message: "Jenjang pendidikan wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!institusi) {
      return NextResponse.json(
        {
          success: false,
          message: "Institusi pendidikan wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!jurusan) {
      return NextResponse.json(
        {
          success: false,
          message: "Jurusan wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!tahunMulai) {
      return NextResponse.json(
        {
          success: false,
          message: "Tahun mulai wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!tahunSelesai) {
      return NextResponse.json(
        {
          success: false,
          message: "Tahun selesai wajib diisi",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CEK DATA MILIK USER
    // =================================================

    const existing = await prisma.pendidikan.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pendidikan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =================================================
    // UPDATE
    // =================================================

    const pendidikan = await prisma.pendidikan.update({
      where: {
        id: id,
      },
      data: {
        jenjang: jenjang,
        institusi: institusi,
        jurusan: jurusan,
        tahunMulai: tahunMulai,
        tahunSelesai: tahunSelesai,
        nilai: nilai,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pendidikan berhasil diperbarui",
      pendidikan: pendidikan,
    });
  } catch (error) {
    console.error("PUT PENDIDIKAN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
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
// DELETE - HAPUS DATA PENDIDIKAN
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
          message: "ID pendidikan tidak valid",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CEK DATA MILIK USER
    // =================================================

    const existing = await prisma.pendidikan.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pendidikan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =================================================
    // DELETE
    // =================================================

    await prisma.pendidikan.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pendidikan berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE PENDIDIKAN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus pendidikan",
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
    const cookieStore = await cookies();

    // Ambil cookie user_id (harus sama persis dengan nama
    // cookie yang di-set di app/api/login/route.ts)
    const userIdCookie = cookieStore.get("user_id")?.value;

    console.log("COOKIE user_id:", userIdCookie);

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