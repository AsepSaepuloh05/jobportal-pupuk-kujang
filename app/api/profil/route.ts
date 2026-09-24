import { NextRequest, NextResponse } from "next/server";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

// ============================================================
// GET -> Ambil data profil + dokumen berdasarkan userId
// ============================================================

export async function GET(request: NextRequest) {
try {
const userIdValue = request.nextUrl.searchParams.get("userId");

if (!userIdValue) {
  return NextResponse.json(
    {
      success: false,
      message: "userId wajib diisi",
    },
    { status: 400 }
  );
}

const userId = Number(userIdValue);

if (!Number.isInteger(userId) || userId <= 0) {
  return NextResponse.json(
    {
      success: false,
      message: "userId tidak valid",
    },
    { status: 400 }
  );
}

const user = await prisma.user.findUnique({
  where: {
    id: userId,
  },

  select: {
    id: true,
    nama: true,
    nik: true,
    email: true,

    // ============================
    // NOMOR TELEPON
    // ============================

    noTelepon: true,

    alamat: true,

    // ============================
    // RT / RW
    // ============================

    rt: true,
    rw: true,

    // ============================
    // DATA WILAYAH
    // ============================

    provinsiId: true,
    provinsi: true,

    kabupatenId: true,
    kabupaten: true,

    kecamatanId: true,
    kecamatan: true,

    desaId: true,
    desa: true,

    kodePos: true,

    role: true,

    // ============================
    // DOKUMEN PROFIL
    // ============================

    dokumenProfil: {
      select: {
        id: true,
        userId: true,
        namaFile: true,
        namaAsli: true,
        pathFile: true,
        tipeFile: true,
        ukuranFile: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    },
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

return NextResponse.json({
  success: true,
  user,
});


} catch (error) {
console.error("GET PROFIL ERROR:", error);


return NextResponse.json(
  {
    success: false,
    message: "Gagal mengambil data profil",
  },
  { status: 500 }
);


}
}

// ============================================================
// GET USER ID DARI COOKIE
// ============================================================

async function getUserId() {
const cookieStore = await cookies();

const userIdValue = cookieStore.get("user_id")?.value;

if (!userIdValue) {
return null;
}

const userId = Number(userIdValue);

if (!Number.isInteger(userId) || userId <= 0) {
return null;
}

return userId;
}

// ============================================================
// VALIDASI
// ============================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+.[^\s@]+$/;

const NIK_REGEX = /^\d{16}$/;

// ============================================================
// PUT -> Update profil user yang sedang login
// ============================================================

export async function PUT(request: NextRequest) {
try {
// ----------------------------------------------------------
// Ambil user ID dari cookie
// ----------------------------------------------------------


const userId = await getUserId();

if (!userId) {
  return NextResponse.json(
    {
      success: false,
      message: "Belum login",
    },
    { status: 401 }
  );
}

// ----------------------------------------------------------
// Ambil body
// ----------------------------------------------------------

const body = await request.json();

const nama =
  typeof body.nama === "string"
    ? body.nama.trim()
    : "";

const email =
  typeof body.email === "string"
    ? body.email.trim()
    : "";

const noTelepon =
  typeof body.noTelepon === "string"
    ? body.noTelepon.trim()
    : "";

const nik =
  typeof body.nik === "string"
    ? body.nik.trim()
    : "";

const alamat =
  typeof body.alamat === "string"
    ? body.alamat.trim()
    : "";

// ==========================================================
// RT / RW
// ==========================================================

let rt: number | null = null;
let rw: number | null = null;

if (
  body.rt !== null &&
  body.rt !== undefined &&
  body.rt !== ""
) {
  rt = Number(body.rt);
}

if (
  body.rw !== null &&
  body.rw !== undefined &&
  body.rw !== ""
) {
  rw = Number(body.rw);
}

// ==========================================================
// DATA WILAYAH
// ==========================================================

const provinsiId =
  typeof body.provinsiId === "string"
    ? body.provinsiId.trim()
    : "";

const provinsi =
  typeof body.provinsi === "string"
    ? body.provinsi.trim()
    : "";

const kabupatenId =
  typeof body.kabupatenId === "string"
    ? body.kabupatenId.trim()
    : "";

const kabupaten =
  typeof body.kabupaten === "string"
    ? body.kabupaten.trim()
    : "";

const kecamatanId =
  typeof body.kecamatanId === "string"
    ? body.kecamatanId.trim()
    : "";

const kecamatan =
  typeof body.kecamatan === "string"
    ? body.kecamatan.trim()
    : "";

const desaId =
  typeof body.desaId === "string"
    ? body.desaId.trim()
    : "";

const desa =
  typeof body.desa === "string"
    ? body.desa.trim()
    : "";

const kodePos =
  typeof body.kodePos === "string"
    ? body.kodePos.trim()
    : "";

// ----------------------------------------------------------
// Validasi wajib
// ----------------------------------------------------------

if (!nama || !email || !nik) {
  return NextResponse.json(
    {
      success: false,
      message: "Nama, email, dan NIK wajib diisi",
    },
    { status: 400 }
  );
}

// ----------------------------------------------------------
// Validasi nama
// ----------------------------------------------------------

if (nama.length < 3) {
  return NextResponse.json(
    {
      success: false,
      message: "Nama minimal 3 karakter",
    },
    { status: 400 }
  );
}

// ----------------------------------------------------------
// Validasi email
// ----------------------------------------------------------

if (!EMAIL_REGEX.test(email)) {
  return NextResponse.json(
    {
      success: false,
      message: "Format email tidak valid",
    },
    { status: 400 }
  );
}

// ----------------------------------------------------------
// Validasi NIK
// ----------------------------------------------------------

if (!NIK_REGEX.test(nik)) {
  return NextResponse.json(
    {
      success: false,
      message: "NIK harus terdiri dari 16 digit angka",
    },
    { status: 400 }
  );
}

// ==========================================================
// Validasi RT
// ==========================================================

if (
  rt !== null &&
  (!Number.isInteger(rt) || rt < 0 || rt > 999)
) {
  return NextResponse.json(
    {
      success: false,
      message: "RT harus berupa angka maksimal 3 digit",
    },
    { status: 400 }
  );
}

// ==========================================================
// Validasi RW
// ==========================================================

if (
  rw !== null &&
  (!Number.isInteger(rw) || rw < 0 || rw > 999)
) {
  return NextResponse.json(
    {
      success: false,
      message: "RW harus berupa angka maksimal 3 digit",
    },
    { status: 400 }
  );
}

// ----------------------------------------------------------
// Pastikan user masih ada
// ----------------------------------------------------------

const existingUser = await prisma.user.findUnique({
  where: {
    id: userId,
  },
});

if (!existingUser) {
  return NextResponse.json(
    {
      success: false,
      message: "User tidak ditemukan",
    },
    { status: 404 }
  );
}

// ==========================================================
// UPDATE DATA USER
// ==========================================================

const updated = await prisma.user.update({
  where: {
    id: userId,
  },

  data: {
    nama,
    email,
    nik,

    // ============================
    // NOMOR TELEPON
    // ============================

    noTelepon: noTelepon || null,

    // ============================
    // ALAMAT
    // ============================

    alamat: alamat || null,

    // ============================
    // RT / RW
    // ============================

    rt,
    rw,

    // ============================
    // DATA WILAYAH
    // ============================

    provinsiId: provinsiId || null,
    provinsi: provinsi || null,

    kabupatenId: kabupatenId || null,
    kabupaten: kabupaten || null,

    kecamatanId: kecamatanId || null,
    kecamatan: kecamatan || null,

    desaId: desaId || null,
    desa: desa || null,

    kodePos: kodePos || null,
  },

  select: {
    id: true,
    nama: true,
    email: true,
    nik: true,

    // ============================
    // NOMOR TELEPON
    // ============================

    noTelepon: true,

    alamat: true,

    // ============================
    // RT / RW
    // ============================

    rt: true,
    rw: true,

    // ============================
    // DATA WILAYAH
    // ============================

    provinsiId: true,
    provinsi: true,

    kabupatenId: true,
    kabupaten: true,

    kecamatanId: true,
    kecamatan: true,

    desaId: true,
    desa: true,

    kodePos: true,

    role: true,

    // ============================
    // DOKUMEN
    // ============================

    dokumenProfil: {
      select: {
        id: true,
        namaFile: true,
        namaAsli: true,
        pathFile: true,
        tipeFile: true,
        ukuranFile: true,
        createdAt: true,
        updatedAt: true,
      },
    },
  },
});

// ----------------------------------------------------------
// Response berhasil
// ----------------------------------------------------------

return NextResponse.json({
  success: true,
  message: "Profil berhasil diperbarui",
  user: updated,
});


} catch (error: unknown) {
// ----------------------------------------------------------
// Unique constraint
// ----------------------------------------------------------


if (
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: string }).code === "P2002"
) {
  const target = (
    error as {
      meta?: {
        target?: string[];
      };
    }
  ).meta?.target;

  const field = target?.includes("email")
    ? "Email"
    : target?.includes("nik")
    ? "NIK"
    : "Data";

  return NextResponse.json(
    {
      success: false,
      message: `${field} sudah digunakan oleh akun lain`,
    },
    { status: 409 }
  );
}
}
}
