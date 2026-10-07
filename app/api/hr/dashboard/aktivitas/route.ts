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

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const userRole = cookieStore.get("user_role")?.value;

        if (userRole !== "HR") {
            return NextResponse.json(
                { message: "Hanya HR yang bisa mengakses aktivitas" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);

        const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
        const limit = Math.min(
            30,
            Math.max(1, Number(searchParams.get("limit")) || 6)
        );

        const ambil = offset + limit + 1;

        const [lamaranBaru, kandidatBaru, tahapanSelesai, lamaranDitolak] =
            await Promise.all([
                prisma.lamaran.findMany({
                    orderBy: { createdAt: "desc" },
                    take: ambil,
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
                    take: ambil,
                    select: { id: true, nama: true, createdAt: true },
                }),
                prisma.lamaranTahapan.findMany({
                    where: { selesaiPada: { not: null } },
                    orderBy: { selesaiPada: "desc" },
                    take: ambil,
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
                    take: ambil,
                    select: {
                        id: true,
                        updatedAt: true,
                        user: { select: { nama: true } },
                        lowongan: { select: { posisi: true } },
                    },
                }),
            ]);

        const semua = [
            ...lamaranBaru.map((item) => ({
                key: "lamaran-" + item.id,
                type: "lamaran",
                title: "Lamaran baru diterima",
                desc: item.user.nama + " melamar posisi " + item.lowongan.posisi,
                time: item.createdAt.toISOString(),
            })),
            ...kandidatBaru.map((item) => ({
                key: "kandidat-" + item.id,
                type: "kandidat",
                title: "Kandidat baru terdaftar",
                desc: item.nama + " membuat akun",
                time: item.createdAt.toISOString(),
            })),
            ...tahapanSelesai.map((item) => ({
                key: "tahapan-" + item.id,
                type: "tahapan",
                title:
                    "Tahap " +
                    (TAHAPAN_LABEL[item.tahapan] || item.tahapan) +
                    " selesai",
                desc: item.lamaran.user.nama + " - " + item.lamaran.lowongan.posisi,
                time: (item.selesaiPada as Date).toISOString(),
            })),
            ...lamaranDitolak.map((item) => ({
                key: "ditolak-" + item.id,
                type: "ditolak",
                title: "Lamaran ditolak",
                desc: item.user.nama + " - " + item.lowongan.posisi,
                time: item.updatedAt.toISOString(),
            })),
        ].sort((a, b) => {
            const selisih = new Date(b.time).getTime() - new Date(a.time).getTime();

            if (selisih !== 0) {
                return selisih;
            }

            return b.key.localeCompare(a.key);
        });

        return NextResponse.json({
            items: semua.slice(offset, offset + limit),
            hasMore: semua.length > offset + limit,
        });
    } catch (error) {
        console.error("GET AKTIVITAS DASHBOARD ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengambil aktivitas" },
            { status: 500 }
        );
    }
}