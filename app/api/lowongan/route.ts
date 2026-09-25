import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;
        const userRole = cookieStore.get("user_role")?.value;

        let kandidatDesa: string | null = null;

        if (userId && userRole === "KANDIDAT") {
            const kandidat = await prisma.user.findUnique({
                where: { id: Number(userId) },
                select: { desa: true },
            });
            kandidatDesa = kandidat?.desa || null;
        }

        const whereClause = {
            ...(status
                ? { status: status as "AKTIF" | "DRAFT" | "DITUTUP" }
                : {}),
            ...(userRole === "KANDIDAT"
                ? {
                    OR: [
                        { filterDomisiliAktif: false },
                        {
                            desaDiizinkan: {
                                has: kandidatDesa || "___TIDAK_ADA_DESA___",
                            },
                        },
                    ],
                }
                : {}),
        };

        const lowongan = await prisma.lowongan.findMany({
            where: whereClause,
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(lowongan);
    } catch (error) {
        console.error("GET LOWONGAN ERROR:", error);

        return NextResponse.json(
            {
                message: "Gagal mengambil data lowongan",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const posisi = body.posisi?.trim();
        const departemen = body.departemen?.trim();
        const lokasi = body.lokasi?.trim();
        const tipe = body.tipe?.trim();
        const status = body.status?.trim();
        const deskripsi = body.deskripsi?.trim() || null;
        const persyaratan = body.persyaratan?.trim() || null;
        const kategori = body.kategori?.trim() || null;
        const pendidikan = body.pendidikan?.trim() || null;
        const pengalaman = body.pengalaman?.trim() || null;
        const tanggungJawab = body.tanggungJawab?.trim() || null;
        const gajiMin = body.gajiMin ? Number(body.gajiMin) : null;
        const gajiMax = body.gajiMax ? Number(body.gajiMax) : null;

        if (!posisi || !departemen || !lokasi || !tipe) {
            return NextResponse.json(
                {
                    message:
                        "Posisi, departemen, lokasi, dan tipe wajib diisi",
                },
                { status: 400 }
            );
        }

        const statusValid = ["AKTIF", "DRAFT", "DITUTUP"];

        if (status && !statusValid.includes(status)) {
            return NextResponse.json(
                {
                    message:
                        "Status tidak valid. Gunakan AKTIF, DRAFT, atau DITUTUP",
                },
                { status: 400 }
            );
        }

        const PENGALAMAN_VALID = [
            "Fresh Graduate / Tidak Diperlukan",
            "1-2 Tahun",
            "3-5 Tahun",
            "Lebih dari 5 Tahun",
        ];

        if (pengalaman && !PENGALAMAN_VALID.includes(pengalaman)) {
            return NextResponse.json(
                { message: "Pilihan pengalaman tidak valid" },
                { status: 400 }
            );
        }

        const PENDIDIKAN_VALID = [
            "SMA / SMK",
            "D1",
            "D2",
            "D3",
            "S1",
            "S2",
            "S3",
        ];

        if (pendidikan && !PENDIDIKAN_VALID.includes(pendidikan)) {
            return NextResponse.json(
                { message: "Pilihan pendidikan tidak valid" },
                { status: 400 }
            );
        }

        const DESA_VALID = ["Kalihurip", "Dawuan Tengah", "Dawuan Barat"];

        const filterDomisiliAktif = Boolean(body.filterDomisiliAktif);
        const desaDiizinkanInput = Array.isArray(body.desaDiizinkan)
            ? body.desaDiizinkan
            : [];

        if (filterDomisiliAktif && pendidikan !== "SMA / SMK") {
            return NextResponse.json(
                {
                    message:
                        "Filter domisili hanya berlaku untuk pendidikan SMA / SMK",
                },
                { status: 400 }
            );
        }

        const desaTidakValid = desaDiizinkanInput.filter(
            (d: string) => !DESA_VALID.includes(d)
        );

        if (desaTidakValid.length > 0) {
            return NextResponse.json(
                { message: `Desa tidak valid: ${desaTidakValid.join(", ")}` },
                { status: 400 }
            );
        }

        const desaDiizinkan = filterDomisiliAktif ? desaDiizinkanInput : [];

        const tanggalBerakhir = body.tanggalBerakhir
            ? new Date(body.tanggalBerakhir)
            : null;

        if (tanggalBerakhir) {
            const hariIni = new Date();
            hariIni.setHours(0, 0, 0, 0);

            if (tanggalBerakhir < hariIni) {
                return NextResponse.json(
                    {
                        message:
                            "Batas lowongan ditutup tidak boleh sebelum hari ini",
                    },
                    { status: 400 }
                );
            }
        }

        const tahapanSeleksi = Array.isArray(body.tahapanSeleksi)
            ? body.tahapanSeleksi
            : undefined;

        const lowongan = await prisma.lowongan.create({
            data: {
                posisi,
                departemen,
                lokasi,
                tipe,
                status: status || "DRAFT",
                deskripsi,
                persyaratan,
                kategori,
                pendidikan,
                pengalaman,
                tanggungJawab,
                gajiMin,
                gajiMax,
                tahapanSeleksi,
                filterDomisiliAktif,
                desaDiizinkan,
                tanggalBerakhir,
            },
        });

        return NextResponse.json(lowongan, { status: 201 });
    } catch (error) {
        console.error("POST LOWONGAN ERROR:", error);

        return NextResponse.json(
            {
                message: "Gagal menambahkan lowongan",
            },
            { status: 500 }
        );
    }
}