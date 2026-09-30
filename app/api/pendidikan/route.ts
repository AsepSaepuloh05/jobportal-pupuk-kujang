import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// =====================================================
// HELPER
// =====================================================

// Kolom database: ipk (Float). Frontend memakai: nilai (string).
function toClient<T extends { ipk?: number | null }>(item: T) {
  return {
    ...item,
    nilai:
      item.ipk !== null && item.ipk !== undefined
        ? item.ipk.toFixed(2)
        : null,
  };
}

// Validasi tahun: tepat 4 digit
function isYear4(value: string) {
  return /^\d{4}$/.test(value);
}

// Parse nilai: SMA/SMK 0.01 - 100, jenjang lain (IPK) 0.01 - 4.00
// Return: number | null (kosong) | undefined (tidak valid)
function parseNilai(
  raw: unknown,
  jenjang: string
): number | null | undefined {
  if (raw === null || raw === undefined) return null;

  const str = String(raw).trim().replace(",", ".");

  if (str === "") return null;

  if (!/^\d{1,3}(\.\d{1,2})?$/.test(str)) return undefined;

  const value = Number(str);
  const max = jenjang === "SMA / SMK" ? 100 : 4;

  if (!(value > 0 && value <= max)) return undefined;

  return value;
}

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
      pendidikan: pendidikan.map(toClient),
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

    const jenjang = String(body.jenjang ?? "").trim();
    const institusi = String(body.institusi ?? "").trim();
    const jurusan = String(body.jurusan ?? "").trim();
    const tahunMulai = String(body.tahunMulai ?? "").trim();
    const tahunSelesai = String(body.tahunSelesai ?? "").trim();
    const ipk = parseNilai(body.nilai, jenjang);

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

    if (!isYear4(tahunMulai)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tahun mulai harus 4 digit angka",
        },
        { status: 400 }
      );
    }

    if (!isYear4(tahunSelesai)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tahun selesai harus 4 digit angka",
        },
        { status: 400 }
      );
    }

    if (Number(tahunSelesai) < Number(tahunMulai)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tahun selesai tidak boleh lebih kecil dari tahun mulai",
        },
        { status: 400 }
      );
    }

    if (ipk === undefined) {
      return NextResponse.json(
        {
          success: false,
          message:
            jenjang === "SMA / SMK"
              ? "Nilai rata-rata harus antara 0.01 dan 100"
              : "IPK harus antara 0.01 dan 4.00",
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
        ipk: ipk,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pendidikan berhasil ditambahkan",
        pendidikan: toClient(pendidikan),
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

    const id = Number(body.id);

    const jenjang = String(body.jenjang ?? "").trim();
    const institusi = String(body.institusi ?? "").trim();
    const jurusan = String(body.jurusan ?? "").trim();
    const tahunMulai = String(body.tahunMulai ?? "").trim();
    const tahunSelesai = String(body.tahunSelesai ?? "").trim();
    const ipk = parseNilai(body.nilai, jenjang);

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

    if (!isYear4(tahunMulai)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tahun mulai harus 4 digit angka",
        },
        { status: 400 }
      );
    }

    if (!isYear4(tahunSelesai)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tahun selesai harus 4 digit angka",
        },
        { status: 400 }
      );
    }

    if (Number(tahunSelesai) < Number(tahunMulai)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tahun selesai tidak boleh lebih kecil dari tahun mulai",
        },
        { status: 400 }
      );
    }

    if (ipk === undefined) {
      return NextResponse.json(
        {
          success: false,
          message:
            jenjang === "SMA / SMK"
              ? "Nilai rata-rata harus antara 0.01 dan 100"
              : "IPK harus antara 0.01 dan 4.00",
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
        ipk: ipk,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pendidikan berhasil diperbarui",
      pendidikan: toClient(pendidikan),
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