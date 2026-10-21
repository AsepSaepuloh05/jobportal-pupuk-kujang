import { NextResponse } from "next/server";
import { bacaSesi } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sesi = await bacaSesi();

    const userIdValue = sesi ? String(sesi.userId) : undefined;

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
        // =================================================
        // DATA DASAR USER
        // =================================================

        id: true,
        nama: true,
        email: true,
        nik: true,
        role: true,
        isActive: true,

        // =================================================
        // NOMOR TELEPON
        // =================================================

        noTelepon: true,

        // =================================================
        // ALAMAT
        // =================================================

        alamat: true,

        // =================================================
        // RT / RW
        // =================================================

        rt: true,
        rw: true,

        // =================================================
        // WILAYAH
        // =================================================

        provinsiId: true,
        provinsi: true,

        kabupatenId: true,
        kabupaten: true,

        kecamatanId: true,
        kecamatan: true,

        desaId: true,
        desa: true,

        kodePos: true,

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

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun dinonaktifkan",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // FOTO PROFIL
    // =====================================================

    const fotoProfil = user.dokumenProfil ?? null;

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      user: {
        // =================================================
        // DATA DASAR
        // =================================================

        id: user.id,
        nama: user.nama,
        email: user.email,
        nik: user.nik,
        role: user.role,

        // =================================================
        // NOMOR TELEPON
        // =================================================

        noTelepon: user.noTelepon,

        // =================================================
        // ALAMAT
        // =================================================

        alamat: user.alamat,

        // =================================================
        // RT / RW
        // =================================================

        rt: user.rt,
        rw: user.rw,

        // =================================================
        // WILAYAH
        // =================================================

        provinsiId: user.provinsiId,
        provinsi: user.provinsi,

        kabupatenId: user.kabupatenId,
        kabupaten: user.kabupaten,

        kecamatanId: user.kecamatanId,
        kecamatan: user.kecamatan,

        desaId: user.desaId,
        desa: user.desa,

        kodePos: user.kodePos,

        // =================================================
        // FOTO / DOKUMEN PROFIL
        // =================================================

        dokumenProfil: fotoProfil,

        fotoProfil: fotoProfil
          ? {
            id: fotoProfil.id,
            namaFile: fotoProfil.namaFile,
            namaAsli: fotoProfil.namaAsli,
            pathFile: fotoProfil.pathFile,
            tipeFile: fotoProfil.tipeFile,
          }
          : null,

        // =================================================
        // DATA LAINNYA
        // =================================================

        pendidikan: user.pendidikan,
        pengalaman: user.pengalaman,
        sertifikasi: user.sertifikasi,
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