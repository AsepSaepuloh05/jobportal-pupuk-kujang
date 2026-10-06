import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getHrUserId() {
    const cookieStore = await cookies();
    const userId = Number(cookieStore.get("user_id")?.value);
    const role = cookieStore.get("user_role")?.value;

    if (!Number.isInteger(userId) || userId <= 0 || role !== "HR") {
        return null;
    }

    return userId;
}

async function ambilProfil(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            nama: true,
            email: true,
            nik: true,
            role: true,
            noTelepon: true,
            createdAt: true,
            dokumenProfil: { select: { pathFile: true } },
        },
    });

    if (!user) {
        return null;
    }

    const { dokumenProfil, ...data } = user;

    return { ...data, fotoPath: dokumenProfil?.pathFile ?? null };
}

export async function GET() {
    try {
        const userId = await getHrUserId();

        if (!userId) {
            return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
        }

        const profil = await ambilProfil(userId);

        if (!profil) {
            return NextResponse.json(
                { message: "Data user tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json(profil);
    } catch (error) {
        console.error("GET PROFIL HR ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengambil data profil" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const userId = await getHrUserId();

        if (!userId) {
            return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
        }

        const body = await request.json();

        const nama = typeof body.nama === "string" ? body.nama.trim() : "";
        const noTeleponInput =
            typeof body.noTelepon === "string" ? body.noTelepon.trim() : "";

        if (!nama) {
            return NextResponse.json(
                { message: "Nama wajib diisi" },
                { status: 400 }
            );
        }

        if (nama.length > 100) {
            return NextResponse.json(
                { message: "Nama maksimal 100 karakter" },
                { status: 400 }
            );
        }

        const noTelepon = noTeleponInput.replace(/[\s-]/g, "");

        if (noTelepon && !/^\+?\d{8,15}$/.test(noTelepon)) {
            return NextResponse.json(
                { message: "Nomor telepon tidak valid (8-15 digit angka)" },
                { status: 400 }
            );
        }

        await prisma.user.update({
            where: { id: userId },
            data: { nama, noTelepon: noTelepon || null },
        });

        const profil = await ambilProfil(userId);

        return NextResponse.json(profil);
    } catch (error) {
        console.error("PUT PROFIL HR ERROR:", error);

        return NextResponse.json(
            { message: "Gagal menyimpan profil" },
            { status: 500 }
        );
    }
}