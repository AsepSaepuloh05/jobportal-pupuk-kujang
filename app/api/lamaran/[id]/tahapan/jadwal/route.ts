import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { kirimEmailUndangan } from "@/lib/email";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const userRole = cookieStore.get("user_role")?.value;

        if (userRole !== "HR") {
            return NextResponse.json(
                { message: "Hanya HR yang bisa mengatur jadwal" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        const jadwalTanggal = body.jadwalTanggal
            ? new Date(body.jadwalTanggal)
            : null;
        const jadwalLokasi = body.jadwalLokasi?.trim() || null;
        const jadwalCatatan = body.jadwalCatatan?.trim() || null;
        const kirimEmail = Boolean(body.kirimEmail);

        if (!jadwalTanggal) {
            return NextResponse.json(
                { message: "Tanggal & jam wajib diisi" },
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

        if (tahapanSaatIni.tahapan === "SCREENING") {
            return NextResponse.json(
                { message: "Tahapan Screening tidak memerlukan jadwal" },
                { status: 400 }
            );
        }

        await prisma.lamaranTahapan.update({
            where: { id: tahapanSaatIni.id },
            data: { jadwalTanggal, jadwalLokasi, jadwalCatatan },
        });

        let emailResult = null;

        if (kirimEmail) {
            const lamaran = await prisma.lamaran.findUnique({
                where: { id: Number(id) },
                include: {
                    user: { select: { nama: true, email: true } },
                    lowongan: { select: { posisi: true } },
                },
            });

            if (lamaran) {
                emailResult = await kirimEmailUndangan({
                    lamaranId: Number(id),
                    penerima: lamaran.user.email,
                    nama: lamaran.user.nama,
                    posisi: lamaran.lowongan.posisi,
                    tahapan: tahapanSaatIni.tahapan,
                    jadwalTanggal,
                    jadwalLokasi,
                    jadwalCatatan,
                });
            }
        }

        const lamaran = await prisma.lamaran.findUnique({
            where: { id: Number(id) },
            include: {
                tahapanProgress: { orderBy: { urutan: "asc" } },
            },
        });

        return NextResponse.json({ lamaran, emailResult });
    } catch (error) {
        console.error("PUT JADWAL TAHAPAN ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengatur jadwal" },
            { status: 500 }
        );
    }
}