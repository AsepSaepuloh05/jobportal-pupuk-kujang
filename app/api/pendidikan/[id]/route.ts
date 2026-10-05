import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

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

function isYear4(value: string) {
  return /^\d{4}$/.test(value);
}

// SMA/SMK 0.01 - 100, jenjang lain (IPK) 0.01 - 4.00
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

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

// =====================================================
// GET - AMBIL DETAIL PENDIDIKAN
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const userId = await getUserId();

    if (!userId) return fail("Unauthorized", 401);

    const { id } = await params;
    const pendidikanId = Number(id);

    if (!Number.isInteger(pendidikanId) || pendidikanId <= 0) {
      return fail("ID pendidikan tidak valid", 400);
    }

    const pendidikan = await prisma.pendidikan.findFirst({
      where: {
        id: pendidikanId,
        userId: userId,
      },
    });

    if (!pendidikan) {
      return fail("Data pendidikan tidak ditemukan", 404);
    }

    return NextResponse.json({
      success: true,
      pendidikan: toClient(pendidikan),
    });
  } catch (error) {
    console.error("GET PENDIDIKAN DETAIL ERROR:", error);

    return fail("Gagal mengambil data pendidikan", 500);
  }
}

// =====================================================
// PUT - UPDATE DATA PENDIDIKAN
// =====================================================

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const userId = await getUserId();

    if (!userId) return fail("Unauthorized", 401);

    const { id } = await params;
    const pendidikanId = Number(id);

    if (!Number.isInteger(pendidikanId) || pendidikanId <= 0) {
      return fail("ID pendidikan tidak valid", 400);
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

    if (!jenjang) return fail("Jenjang pendidikan wajib diisi", 400);
    if (!institusi) return fail("Institusi pendidikan wajib diisi", 400);
    if (!jurusan) return fail("Jurusan wajib diisi", 400);

    if (!isYear4(tahunMulai)) {
      return fail("Tahun mulai harus 4 digit angka", 400);
    }

    if (!isYear4(tahunSelesai)) {
      return fail("Tahun selesai harus 4 digit angka", 400);
    }

    if (Number(tahunSelesai) < Number(tahunMulai)) {
      return fail(
        "Tahun selesai tidak boleh lebih kecil dari tahun mulai",
        400
      );
    }

    if (ipk === undefined) {
      return fail(
        jenjang === "SMA / SMK"
          ? "Nilai rata-rata harus antara 0.01 dan 100"
          : "IPK harus antara 0.01 dan 4.00",
        400
      );
    }

    // =================================================
    // CEK DATA MILIK USER
    // =================================================

    const existing = await prisma.pendidikan.findFirst({
      where: {
        id: pendidikanId,
        userId: userId,
      },
    });

    if (!existing) {
      return fail("Data pendidikan tidak ditemukan", 404);
    }

    // =================================================
    // UPDATE
    // =================================================

    const pendidikan = await prisma.pendidikan.update({
      where: {
        id: pendidikanId,
      },
      data: {
        jenjang,
        institusi,
        jurusan,
        tahunMulai,
        tahunSelesai,
        ipk,
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

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const userId = await getUserId();

    if (!userId) return fail("Unauthorized", 401);

    const { id } = await params;
    const pendidikanId = Number(id);

    if (!Number.isInteger(pendidikanId) || pendidikanId <= 0) {
      return fail("ID pendidikan tidak valid", 400);
    }

    const existing = await prisma.pendidikan.findFirst({
      where: {
        id: pendidikanId,
        userId: userId,
      },
    });

    if (!existing) {
      return fail("Data pendidikan tidak ditemukan", 404);
    }

    await prisma.pendidikan.delete({
      where: {
        id: pendidikanId,
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

    if (!userIdCookie) return null;

    const userId = Number(userIdCookie);

    if (!Number.isInteger(userId) || userId <= 0) return null;

    return userId;
  } catch (error) {
    console.error("GET USER ID ERROR:", error);

    return null;
  }
}