import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const userRole = cookieStore.get("user_role")?.value;

        if (userRole !== "HR") {
            return NextResponse.json(
                { message: "Hanya HR yang bisa mengubah status lamaran" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const status = body.status?.trim();

        const statusValid = ["DIPROSES", "INTERVIEW", "LOLOS", "DITOLAK"];

        if (!status || !statusValid.includes(status)) {
            return NextResponse.json(
                { message: "Status tidak valid" },
                { status: 400 }
            );
        }

        const existing = await prisma.lamaran.findUnique({
            where: { id: Number(id) },
        });

        if (!existing) {
            return NextResponse.json(
                { message: "Lamaran tidak ditemukan" },
                { status: 404 }
            );
        }

        const lamaran = await prisma.lamaran.update({
            where: { id: Number(id) },
            data: { status },
        });

        return NextResponse.json(lamaran);
    } catch (error) {
        console.error("PUT LAMARAN ERROR:", error);

        return NextResponse.json(
            { message: "Gagal memperbarui status lamaran" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const userRole = cookieStore.get("user_role")?.value;

        if (userRole !== "HR") {
            return NextResponse.json(
                { message: "Hanya HR yang bisa membatalkan lamaran" },
                { status: 403 }
            );
        }

        const { id } = await params;

        const existing = await prisma.lamaran.findUnique({
            where: { id: Number(id) },
        });

        if (!existing) {
            return NextResponse.json(
                { message: "Lamaran tidak ditemukan" },
                { status: 404 }
            );
        }

        await prisma.lamaran.delete({
            where: { id: Number(id) },
        });

        await prisma.lowongan.update({
            where: { id: existing.lowonganId },
            data: {
                pelamar: { decrement: 1 },
            },
        });

        return NextResponse.json({ message: "Lamaran berhasil dibatalkan" });
    } catch (error) {
        console.error("DELETE LAMARAN ERROR:", error);

        return NextResponse.json(
            { message: "Gagal membatalkan lamaran" },
            { status: 500 }
        );
    }
}