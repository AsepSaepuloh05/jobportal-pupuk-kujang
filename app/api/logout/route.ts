import { NextResponse } from "next/server";
import { NAMA_COOKIE_SESI } from "@/lib/session";

export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: "Logout berhasil",
    });

    const hapus = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 0,
    };

    response.cookies.set(NAMA_COOKIE_SESI, "", hapus);
    response.cookies.set("user_id", "", hapus);
    response.cookies.set("user_role", "", hapus);

    return response;
}