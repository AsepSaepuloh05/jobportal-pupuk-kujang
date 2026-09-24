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
                { message: "Hanya HR yang bisa mengubah status akun" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const isActive = body.isActive;

        if (typeof isActive !== "boolean") {
            return NextResponse.json(
                { message: "isActive wajib berupa boolean" },
                { status: 400 }
            );
        }

        const existing = await prisma.user.findUnique({
            where: { id: Number(id) },
        });

        if (!existing) {
            return NextResponse.json(
                { message: "Kandidat tidak ditemukan" },
                { status: 404 }
            );
        }

        if (existing.role !== "KANDIDAT") {
            return NextResponse.json(
                { message: "Hanya akun kandidat yang bisa dinonaktifkan" },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { isActive },
            select: {
                id: true,
                nama: true,
                email: true,
                isActive: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("PUT USER STATUS ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengubah status akun" },
            { status: 500 }
        );
    }
}