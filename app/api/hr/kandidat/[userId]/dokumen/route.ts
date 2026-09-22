import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const cookieStore = await cookies();
        const userRole = cookieStore.get("user_role")?.value;

        if (userRole !== "HR") {
            return NextResponse.json(
                { message: "Hanya HR yang bisa mengakses berkas kandidat" },
                { status: 403 }
            );
        }

        const { userId } = await params;

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: {
                id: true,
                nama: true,
                email: true,
                nik: true,
                alamat: true,
                noTelepon: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Kandidat tidak ditemukan" },
                { status: 404 }
            );
        }

        const dokumenUmum = await prisma.dokumenKandidat.findMany({
            where: { userId: Number(userId) },
            orderBy: { jenisDokumen: "asc" },
        });

        const pendidikan = await prisma.pendidikan.findMany({
            where: {
                userId: Number(userId),
                ijazahPathFile: { not: null },
            },
            orderBy: { tahunSelesai: "desc" },
        });

        return NextResponse.json({
            user,
            dokumenUmum,
            ijazah: pendidikan.map((item) => ({
                id: item.id,
                label: `Ijazah ${item.jenjang} - ${item.institusi}`,
                namaAsli: item.ijazahNamaAsli,
                pathFile: item.ijazahPathFile,
                tipeFile: item.ijazahTipeFile,
            })),
        });
    } catch (error) {
        console.error("GET DOKUMEN KANDIDAT ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengambil berkas kandidat" },
            { status: 500 }
        );
    }
}