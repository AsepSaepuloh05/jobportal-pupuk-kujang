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
                { message: "Hanya HR yang bisa mengakses detail kandidat" },
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

        const pendidikan = await prisma.pendidikan.findMany({
            where: { userId: Number(userId) },
            orderBy: { tahunSelesai: "desc" },
        });

        const pengalaman = await prisma.pengalaman.findMany({
            where: { userId: Number(userId) },
            orderBy: { tahunMulai: "desc" },
        });

        const sertifikasi = await prisma.sertifikasi.findMany({
            where: { userId: Number(userId) },
            orderBy: { tanggalTerbit: "desc" },
        });

        return NextResponse.json({
            user,
            pendidikan,
            pengalaman,
            sertifikasi,
        });
    } catch (error) {
        console.error("GET DETAIL KANDIDAT ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengambil detail kandidat" },
            { status: 500 }
        );
    }
}