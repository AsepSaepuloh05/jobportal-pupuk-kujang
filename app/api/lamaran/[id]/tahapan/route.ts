import { NextResponse } from "next/server";
import { bacaIdentitas } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kirimEmailHasil } from "@/lib/email";

export const dynamic = "force-dynamic"

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userRole } = await bacaIdentitas();

        if (userRole !== "HR") {
            return NextResponse.json(
                { message: "Hanya HR yang bisa mengubah tahapan" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const tahapan = body.tahapan?.trim();
        const kirimEmail = Boolean(body.kirimEmail);

        if (!tahapan) {
            return NextResponse.json(
                { message: "Tahapan wajib diisi" },
                { status: 400 }
            );
        }

        const semuaTahapan = await prisma.lamaranTahapan.findMany({
            where: { lamaranId: Number(id) },
            orderBy: { urutan: "asc" },
        });

        const tahapanSaatIni = semuaTahapan.find(
            (item) => item.selesaiPada === null
        );

        if (!tahapanSaatIni) {
            return NextResponse.json(
                { message: "Semua tahapan sudah selesai" },
                { status: 400 }
            );
        }

        if (tahapanSaatIni.tahapan !== tahapan) {
            return NextResponse.json(
                {
                    message: `Tahapan saat ini adalah ${tahapanSaatIni.tahapan}, harus diselesaikan berurutan`,
                },
                { status: 400 }
            );
        }

        await prisma.lamaranTahapan.update({
            where: { id: tahapanSaatIni.id },
            data: { selesaiPada: new Date() },
        });

        const isTahapanTerakhir =
            tahapanSaatIni.urutan === semuaTahapan.length;

        if (isTahapanTerakhir) {
            await prisma.lamaran.update({
                where: { id: Number(id) },
                data: { status: "LOLOS" },
            });
        } else {
            await prisma.lamaran.update({
                where: { id: Number(id) },
                data: { status: "INTERVIEW" },
            });
        }

        let emailResult = null;

        if (kirimEmail) {
            const lamaranUser = await prisma.lamaran.findUnique({
                where: { id: Number(id) },
                include: {
                    user: { select: { nama: true, email: true } },
                    lowongan: { select: { posisi: true } },
                },
            });

            if (lamaranUser) {
                const tahapanSelanjutnya = isTahapanTerakhir
                    ? null
                    : semuaTahapan.find(
                        (item) => item.urutan === tahapanSaatIni.urutan + 1
                    )?.tahapan;

                emailResult = await kirimEmailHasil({
                    lamaranId: Number(id),
                    penerima: lamaranUser.user.email,
                    nama: lamaranUser.user.nama,
                    posisi: lamaranUser.lowongan.posisi,
                    tahapan: tahapanSaatIni.tahapan,
                    lolos: true,
                    tahapanSelanjutnya,
                });
            }
        }

        const lamaran = await prisma.lamaran.findUnique({
            where: { id: Number(id) },
            include: {
                tahapanProgress: {
                    orderBy: { urutan: "asc" },
                },
            },
        });

        return NextResponse.json({ lamaran, emailResult });
    } catch (error) {
        console.error("PUT TAHAPAN ERROR:", error);

        return NextResponse.json(
            { message: "Gagal memperbarui tahapan" },
            { status: 500 }
        );
    }
}