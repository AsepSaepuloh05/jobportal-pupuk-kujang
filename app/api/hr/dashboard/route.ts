import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const TAHAPAN_KEYS = [
    "SCREENING",
    "ASSESSMENT",
    "INTERVIEW",
    "TECHNICAL_TEST",
    "MCU",
    "OFFERING",
];

type PosisiTerkini = { tahapan: string; urutan: number };

function hitungAwalPeriode(sekarang: Date) {
    const wib = new Date(sekarang.getTime() + WIB_OFFSET_MS);
    const tahun = wib.getUTCFullYear();
    const bulan = wib.getUTCMonth();
    const tanggal = wib.getUTCDate();
    const selisihSenin = (wib.getUTCDay() + 6) % 7;

    return {
        hari: new Date(Date.UTC(tahun, bulan, tanggal) - WIB_OFFSET_MS),
        minggu: new Date(
            Date.UTC(tahun, bulan, tanggal - selisihSenin) - WIB_OFFSET_MS
        ),
        bulan: new Date(Date.UTC(tahun, bulan, 1) - WIB_OFFSET_MS),
    };
}

function ambilLowongan(dari: Date | null) {
    return prisma.lowongan.findMany({
        where: {
            status: "AKTIF",
            ...(dari ? { createdAt: { gte: dari } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
            id: true,
            posisi: true,
            departemen: true,
            pelamar: true,
            tanggalBerakhir: true,
        },
    });
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const userRole = cookieStore.get("user_role")?.value;

        if (userRole !== "HR") {
            return NextResponse.json(
                { message: "Hanya HR yang bisa mengakses dashboard" },
                { status: 403 }
            );
        }

        const awal = hitungAwalPeriode(new Date());

        const [
            lowonganAktif,
            totalLowongan,
            totalKandidat,
            kandidatBaruMingguIni,
            totalLamaran,
            lamaranHari,
            lamaranMinggu,
            lamaranBulan,
            sedangDiproses,
            lowonganKadaluarsa,
            lowonganSemua,
            lowonganHari,
            lowonganMinggu,
            lowonganBulan,
            tahapanBerjalan,
        ] = await Promise.all([
            prisma.lowongan.count({ where: { status: "AKTIF" } }),
            prisma.lowongan.count(),
            prisma.user.count({ where: { role: "KANDIDAT", isActive: true } }),
            prisma.user.count({
                where: {
                    role: "KANDIDAT",
                    isActive: true,
                    createdAt: { gte: awal.minggu },
                },
            }),
            prisma.lamaran.count(),
            prisma.lamaran.count({ where: { createdAt: { gte: awal.hari } } }),
            prisma.lamaran.count({ where: { createdAt: { gte: awal.minggu } } }),
            prisma.lamaran.count({ where: { createdAt: { gte: awal.bulan } } }),
            prisma.lamaran.count({
                where: { status: { in: ["DIPROSES", "INTERVIEW"] } },
            }),
            prisma.lowongan.count({
                where: { status: "AKTIF", tanggalBerakhir: { lt: awal.hari } },
            }),
            ambilLowongan(null),
            ambilLowongan(awal.hari),
            ambilLowongan(awal.minggu),
            ambilLowongan(awal.bulan),
            prisma.lamaranTahapan.findMany({
                where: {
                    selesaiPada: null,
                    lamaran: { status: { in: ["DIPROSES", "INTERVIEW"] } },
                },
                select: { lamaranId: true, tahapan: true, urutan: true },
            }),
        ]);

        const posisiTerkini = new Map<number, PosisiTerkini>();

        for (const item of tahapanBerjalan) {
            const saatIni = posisiTerkini.get(item.lamaranId);

            if (!saatIni || item.urutan < saatIni.urutan) {
                posisiTerkini.set(item.lamaranId, {
                    tahapan: item.tahapan,
                    urutan: item.urutan,
                });
            }
        }

        const sebaranTahapan: Record<string, number> = {};

        for (const key of TAHAPAN_KEYS) {
            sebaranTahapan[key] = 0;
        }

        for (const posisi of posisiTerkini.values()) {
            sebaranTahapan[posisi.tahapan] += 1;
        }

        return NextResponse.json({
            stats: {
                lowonganAktif,
                totalLowongan,
                totalKandidat,
                kandidatBaruMingguIni,
                totalLamaran,
                lamaranPeriode: {
                    hari: lamaranHari,
                    minggu: lamaranMinggu,
                    bulan: lamaranBulan,
                    semua: totalLamaran,
                },
                sedangDiproses,
            },
            sebaranTahapan,
            lowonganKadaluarsa,
            lowonganTerbaru: {
                semua: lowonganSemua,
                hari: lowonganHari,
                minggu: lowonganMinggu,
                bulan: lowonganBulan,
            },
        });
    } catch (error) {
        console.error("GET DASHBOARD ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengambil data dashboard" },
            { status: 500 }
        );
    }
}