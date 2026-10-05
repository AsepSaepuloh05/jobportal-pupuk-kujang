import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { kirimEmailBebas } from "@/lib/email";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const userRole = cookieStore.get("user_role")?.value;

        if (userRole !== "HR") {
            return NextResponse.json(
                { message: "Hanya HR yang bisa mengirim email" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        const subjek = body.subjek?.trim();
        const isi = body.isi?.trim();

        if (!subjek || !isi) {
            return NextResponse.json(
                { message: "Subjek dan isi email wajib diisi" },
                { status: 400 }
            );
        }

        const lamaran = await prisma.lamaran.findUnique({
            where: { id: Number(id) },
            include: {
                user: { select: { nama: true, email: true } },
            },
        });

        if (!lamaran) {
            return NextResponse.json(
                { message: "Lamaran tidak ditemukan" },
                { status: 404 }
            );
        }

        const result = await kirimEmailBebas({
            lamaranId: Number(id),
            penerima: lamaran.user.email,
            nama: lamaran.user.nama,
            subjek,
            isi,
        });

        if (!result.success) {
            return NextResponse.json(
                { message: result.message || "Gagal mengirim email" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST EMAIL BEBAS ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengirim email" },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const userRole = cookieStore.get("user_role")?.value;

        if (userRole !== "HR") {
            return NextResponse.json(
                { message: "Hanya HR yang bisa melihat histori email" },
                { status: 403 }
            );
        }

        const { id } = await params;

        const logs = await prisma.emailLog.findMany({
            where: { lamaranId: Number(id) },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error("GET EMAIL LOG ERROR:", error);

        return NextResponse.json(
            { message: "Gagal mengambil histori email" },
            { status: 500 }
        );
    }
}