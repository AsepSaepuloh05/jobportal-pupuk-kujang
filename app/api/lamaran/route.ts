import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;

        if (!userId) {
            return NextResponse.json(
                { message: "Belum login" },
                { status: 401 }
            );
        }

        const lamaran = await prisma.lamaran.findMany({
            where: {
                userId: Number(userId),
            },
            include: {
                lowongan: {
                    select: {
                        id: true,
                        posisi: true,
                        departemen: true,
                        lokasi: true,
                        tipe: true,
                        status: true,
                        deskripsi: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(lamaran);
    } catch (error) {
        console.error("GET LAMARAN ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengambil data lamaran" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;
        const userRole = cookieStore.get("user_role")?.value;

        if (!userId) {
            return NextResponse.json(
                { message: "Belum login" },
                { status: 401 }
            );
        }

        if (userRole !== "KANDIDAT") {
            return NextResponse.json(
                { message: "Hanya kandidat yang bisa melamar" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const lowonganId = Number(body.lowonganId);

        if (!lowonganId) {
            return NextResponse.json(
                { message: "lowonganId wajib diisi" },
                { status: 400 }
            );
        }

        const lowongan = await prisma.lowongan.findUnique({
            where: { id: lowonganId },
        });

        if (!lowongan) {
            return NextResponse.json(
                { message: "Lowongan tidak ditemukan" },
                { status: 404 }
            );
        }

        if (lowongan.status !== "AKTIF") {
            return NextResponse.json(
                { message: "Lowongan ini sudah tidak menerima lamaran" },
                { status: 400 }
            );
        }

        const existing = await prisma.lamaran.findUnique({
            where: {
                userId_lowonganId: {
                    userId: Number(userId),
                    lowonganId,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { message: "Kamu sudah pernah melamar ke lowongan ini" },
                { status: 409 }
            );
        }

        const dokumen = await prisma.dokumenKandidat.findMany({
            where: {
                userId: Number(userId),
                jenisDokumen: { in: ["CV", "KTP"] },
            },
        });

        const punyaCV = dokumen.some((d) => d.jenisDokumen === "CV");
        const punyaKTP = dokumen.some((d) => d.jenisDokumen === "KTP");

        if (!punyaCV || !punyaKTP) {
            return NextResponse.json(
                {
                    message:
                        "Lengkapi CV dan KTP di halaman Profil sebelum melamar",
                },
                { status: 400 }
            );
        }

        const [lamaran] = await prisma.$transaction([
            prisma.lamaran.create({
                data: {
                    userId: Number(userId),
                    lowonganId,
                },
            }),
            prisma.lowongan.update({
                where: { id: lowonganId },
                data: {
                    pelamar: { increment: 1 },
                },
            }),
        ]);

        return NextResponse.json(lamaran, { status: 201 });
    } catch (error) {
        console.error("POST LAMARAN ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengirim lamaran" },
            { status: 500 }
        );
    }
}