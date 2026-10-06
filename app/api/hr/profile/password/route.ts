import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
    try {
        const cookieStore = await cookies();
        const userId = Number(cookieStore.get("user_id")?.value);
        const role = cookieStore.get("user_role")?.value;

        if (!Number.isInteger(userId) || userId <= 0 || role !== "HR") {
            return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
        }

        const body = await request.json();

        const passwordLama =
            typeof body.passwordLama === "string" ? body.passwordLama : "";
        const passwordBaru =
            typeof body.passwordBaru === "string" ? body.passwordBaru : "";

        if (!passwordLama || !passwordBaru) {
            return NextResponse.json(
                { message: "Password lama dan password baru wajib diisi" },
                { status: 400 }
            );
        }

        if (passwordBaru.length < 8) {
            return NextResponse.json(
                { message: "Password baru minimal 8 karakter" },
                { status: 400 }
            );
        }

        if (passwordBaru === passwordLama) {
            return NextResponse.json(
                { message: "Password baru tidak boleh sama dengan password lama" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Data user tidak ditemukan" },
                { status: 404 }
            );
        }

        const cocok = await bcrypt.compare(passwordLama, user.password);

        if (!cocok) {
            return NextResponse.json(
                { message: "Password lama salah" },
                { status: 400 }
            );
        }

        const hash = await bcrypt.hash(passwordBaru, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hash },
        });

        return NextResponse.json({ message: "Password berhasil diubah" });
    } catch (error) {
        console.error("PUT PASSWORD HR ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengubah password" },
            { status: 500 }
        );
    }
}