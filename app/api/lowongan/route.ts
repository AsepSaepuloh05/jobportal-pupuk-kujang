import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const lowongan = await prisma.lowongan.findMany({
            where: status
                ? {
                    status: status as "AKTIF" | "DRAFT" | "DITUTUP",
                }
                : undefined,
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
        const TAHAPAN_VALID = [
            "SCREENING",
            "ASSESSMENT",
            "INTERVIEW",
            "TECHNICAL_TEST",
            "MCU",
            "OFFERING",
        ];

        const tahapanSeleksi = Array.isArray(body.tahapanSeleksi)
            ? body.tahapanSeleksi
            : undefined;

        if (tahapanSeleksi) {
            const invalid = tahapanSeleksi.filter(
                (item: string) => !TAHAPAN_VALID.includes(item)
            );

            if (invalid.length > 0) {
                return NextResponse.json(
                    {
                        message: `Tahapan tidak valid: ${invalid.join(", ")}`,
                    },
                    { status: 400 }
                );
            }
        }

        if (
            gajiMin !== null &&
            gajiMax !== null &&
            gajiMin > gajiMax
        ) {
            return NextResponse.json(
                {
                    message: "Gaji minimum tidak boleh lebih besar dari maksimum",
                },
                { status: 400 }
            );
        }
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