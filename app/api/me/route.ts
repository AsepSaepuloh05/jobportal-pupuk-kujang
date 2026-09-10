import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const userIdValue = cookieStore.get("user_id")?.value;

    console.log("USER ID DARI COOKIE:", userIdValue);

    // =====================================================
    // CEK SESSION
    // =====================================================

    if (!userIdValue) {
      return NextResponse.json(
        {
          success: false,
          message: "Belum login",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // VALIDASI USER ID
    // =====================================================

    const userId = Number(userIdValue);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Session tidak valid",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // AMBIL DATA USER
    // =====================================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        nama: true,
        email: true,
        nik: true,
        alamat: true,
        role: true,

        // =================================================
        // FOTO / DOKUMEN PROFIL
        // =================================================

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

        // =================================================
        // DATA PENDIDIKAN
        // =================================================

        pendidikan: true,

        // =================================================
        // DATA PENGALAMAN
        // =================================================

        pengalaman: true,

        // =================================================
        // DATA SERTIFIKASI
        // =================================================

        sertifikasi: true,
      },
    });

    // =====================================================
    // USER TIDAK DITEMUKAN
    // =====================================================

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // FOTO PROFIL
    // =====================================================

    const fotoProfil = user.dokumenProfil ?? null;

    // =====================================================
    // DEBUG
    // =====================================================

    console.log("DATA USER:", user);

    console.log(
      "DATA DOKUMEN:",
      user.dokumenProfil
    );

    console.log(
      "FOTO PROFIL:",
      fotoProfil
    );

    console.log(
      "PATH FOTO:",
      fotoProfil?.pathFile
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      user: {
        ...user,

        fotoProfil: fotoProfil
          ? {
              id: fotoProfil.id,
              namaFile: fotoProfil.namaFile,
              namaAsli: fotoProfil.namaAsli,
              pathFile: fotoProfil.pathFile,
              tipeFile: fotoProfil.tipeFile,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("ME ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      { status: 500 }
    );
  }
}