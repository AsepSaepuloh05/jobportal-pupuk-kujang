import { NextResponse } from "next/server";
import { bacaIdentitas } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userRole } = await bacaIdentitas();

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

        const [dokumenUmum, pendidikan, pengalaman, sertifikasi] =
            await Promise.all([
                prisma.dokumenKandidat.findMany({
                    where: { userId: Number(userId) },
                    orderBy: { jenisDokumen: "asc" },
                }),
                prisma.pendidikan.findMany({
                    where: { userId: Number(userId) },
                    orderBy: { tahunSelesai: "desc" },
                }),
                prisma.pengalaman.findMany({
                    where: {
                        userId: Number(userId),
                        paklaringPathFile: { not: null },
                    },
                    orderBy: { tahunMulai: "desc" },
                }),
                prisma.sertifikasi.findMany({
                    where: {
                        userId: Number(userId),
                        sertifikatPathFile: { not: null },
                    },
                    orderBy: { tanggalTerbit: "desc" },
                }),
            ]);

        return NextResponse.json({
            user,
            dokumenUmum,
            ijazah: pendidikan
                .filter((item) => item.ijazahPathFile)
                .map((item) => ({
                    id: item.id,
                    label: `Ijazah ${item.jenjang} - ${item.institusi}`,
                    namaAsli: item.ijazahNamaAsli,
                    pathFile: item.ijazahPathFile,
                    tipeFile: item.ijazahTipeFile,
                })),
            skl: pendidikan
                .filter((item) => item.sklPathFile)
                .map((item) => ({
                    id: item.id,
                    label: `SKL ${item.jenjang} - ${item.institusi}`,
                    namaAsli: item.sklNamaAsli,
                    pathFile: item.sklPathFile,
                    tipeFile: item.sklTipeFile,
                })),
            transkrip: pendidikan
                .filter((item) => item.transkripPathFile)
                .map((item) => ({
                    id: item.id,
                    label: `Transkrip ${item.jenjang} - ${item.institusi}`,
                    namaAsli: item.transkripNamaAsli,
                    pathFile: item.transkripPathFile,
                    tipeFile: item.transkripTipeFile,
                })),
            paklaring: pengalaman.map((item) => ({
                id: item.id,
                label: `Paklaring ${item.posisi} - ${item.perusahaan}`,
                namaAsli: item.paklaringNamaAsli,
                pathFile: item.paklaringPathFile,
                tipeFile: item.paklaringTipeFile,
            })),
            sertifikat: sertifikasi.map((item) => ({
                id: item.id,
                label: `Sertifikat ${item.nama} - ${item.penerbit}`,
                namaAsli: item.sertifikatNamaAsli,
                pathFile: item.sertifikatPathFile,
                tipeFile: item.sertifikatTipeFile,
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
