import { NextResponse } from "next/server";
import { bacaIdentitas } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/lib/password";
import {
    buatTokenSesi,
    NAMA_COOKIE_SESI,
    opsiCookieSesi,
} from "@/lib/session";

export async function PUT(request: Request) {
    try {
        const { userId: userIdSesi, userRole: role } = await bacaIdentitas();
        const userId = Number(userIdSesi);

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

        const passwordError = validatePassword(passwordBaru);

        if (passwordError) {
            return NextResponse.json({ message: passwordError }, { status: 400 });
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

        // tokenVersion dinaikkan agar semua sesi lain dicabut. Sesi perangkat
        // ini diganti dengan token baru di bawah.
        const diperbarui = await prisma.user.update({
            where: { id: userId },
            data: { password: hash, tokenVersion: { increment: 1 } },
            select: { tokenVersion: true },
        });

        const tokenBaru = await buatTokenSesi({
            userId,
            role: "HR",
            versi: diperbarui.tokenVersion,
        });

        const response = NextResponse.json({ message: "Password berhasil diubah" });

        response.cookies.set(NAMA_COOKIE_SESI, tokenBaru, opsiCookieSesi());

        return response;
    } catch (error) {
        console.error("PUT PASSWORD HR ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengubah password" },
            { status: 500 }
        );
    }
}