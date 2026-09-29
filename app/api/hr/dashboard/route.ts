import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TAHAPAN_LABEL: Record<string, string> = {
    SCREENING: "Screening",
    ASSESSMENT: "Assessment",
    INTERVIEW: "Interview",
    TECHNICAL_TEST: "Technical Test",
    MCU: "MCU",
    OFFERING: "Offering",
};

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

        const sekarang = new Date();

        const awalHariIni = new Date(sekarang);
        awalHariIni.setHours(0, 0, 0, 0);

        const tujuhHariLalu = new Date(
            sekarang.getTime() - 7 * 24 * 60 * 60 * 1000
        );

        const [
            lowonganAktif,
            totalLowongan,
            totalKandidat,
            kandidatBaruMingguIni,
            totalLamaran,
            lamaranHariIni,
            dalamSeleksi,
            menungguProses,
            lowonganKadaluarsa,
            lowonganTerbaru,
            lamaranTerbaru,
            kandidatTerbaru,
            tahapanTerbaru,
            lamaranDitolak,
        ] = await Promise.all([
            prisma.lowongan.count({ where: { status: "AKTIF" } }),
            prisma.lowongan.count(),
            prisma.user.count({ where: { role: "KANDIDAT", isActive: true } }),
            prisma.user.count({
                where: { role: "KANDIDAT", createdAt: { gte: tujuhHariLalu } },
            }),
            prisma.lamaran.count(),
            prisma.lamaran.count({ where: { createdAt: { gte: awalHariIni } } }),
            prisma.lamaran.count({
                where: { status: { in: ["DIPROSES", "INTERVIEW"] } },
            }),
            prisma.lamaran.count({ where: { status: "DIPROSES" } }),
            prisma.lowongan.count({
                where: { status: "AKTIF", tanggalBerakhir: { lt: awalHariIni } },
            }),
            prisma.lowongan.findMany({
                where: { status: "AKTIF" },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    posisi: true,
                    departemen: true,
                    pelamar: true,
                    tanggalBerakhir: true,
                },
            }),
            prisma.lamaran.findMany({
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    createdAt: true,
                    user: { select: { nama: true } },
                    lowongan: { select: { posisi: true } },
                },
            }),
            prisma.user.findMany({
                where: { role: "KANDIDAT" },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { id: true, nama: true, createdAt: true },
            }),
            prisma.lamaranTahapan.findMany({
                where: { selesaiPada: { not: null } },
                orderBy: { selesaiPada: "desc" },
                take: 5,
                select: {
                    id: true,
                    tahapan: true,
                    selesaiPada: true,
                    lamaran: {
                        select: {
                            user: { select: { nama: true } },
                            lowongan: { select: { posisi: true } },
                        },
                    },
                },
            }),
            prisma.lamaran.findMany({
                where: { status: "DITOLAK" },
                orderBy: { updatedAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    updatedAt: true,
                    user: { select: { nama: true } },
                    lowongan: { select: { posisi: true } },
                },
            }),
        ]);

        const aktivitas = [
            ...lamaranTerbaru.map((item) => ({
                key: `lamaran-${item.id}`,
                type: "lamaran",
                title: "Lamaran baru diterima",
                desc: `${item.user.nama} melamar posisi ${item.lowongan.posisi}`,
                time: item.createdAt.toISOString(),
            })),
            ...kandidatTerbaru.map((item) => ({
                key: `kandidat-${item.id}`,
                type: "kandidat",
                title: "Kandidat baru terdaftar",
                desc: `${item.nama} membuat akun`,
                time: item.createdAt.toISOString(),
            })),
            ...tahapanTerbaru.map((item) => ({
                key: `tahapan-${item.id}`,
                type: "tahapan",
                title: `Tahap ${TAHAPAN_LABEL[item.tahapan] || item.tahapan} selesai`,
                desc: `${item.lamaran.user.nama} - ${item.lamaran.lowongan.posisi}`,
                time: (item.selesaiPada as Date).toISOString(),
            })),
            ...lamaranDitolak.map((item) => ({
                key: `ditolak-${item.id}`,
                type: "ditolak",
                title: "Lamaran ditolak",
                desc: `${item.user.nama} - ${item.lowongan.posisi}`,
                time: item.updatedAt.toISOString(),
            })),
        ]
            .sort(
                (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
            )
            .slice(0, 6);

        return NextResponse.json({
            stats: {
                lowonganAktif,
                totalLowongan,
                totalKandidat,
                kandidatBaruMingguIni,
                totalLamaran,
                lamaranHariIni,
                dalamSeleksi,
                menungguProses,
            },
            lowonganKadaluarsa,
            lowonganTerbaru,
            aktivitas,
        });
    } catch (error) {
        console.error("GET DASHBOARD ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengambil data dashboard" },
            { status: 500 }
        );
    }
}