import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const lowongan = await prisma.lowongan.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!lowongan) {
            return NextResponse.json(
                {
                    message: "Lowongan tidak ditemukan",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(lowongan);
    } catch (error) {
        console.error("GET LOWONGAN BY ID ERROR:", error);

        return NextResponse.json(
            {
                message: "Gagal mengambil data lowongan",
            },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        if (!posisi || !departemen || !lokasi || !tipe || !status) {
            return NextResponse.json(
                {
                    message:
                        "Posisi, departemen, lokasi, tipe, dan status wajib diisi",
                },
                { status: 400 }
            );
        }

        const statusValid = ["AKTIF", "DRAFT", "DITUTUP"];

        if (!statusValid.includes(status)) {
            return NextResponse.json(
                {
                    message:
                        "Status tidak valid. Gunakan AKTIF, DRAFT, atau DITUTUP",
                },
                { status: 400 }
            );
        }

        const existing = await prisma.lowongan.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!existing) {
            return NextResponse.json(
                {
                    message: "Lowongan tidak ditemukan",
                },
                { status: 404 }
            );
        }

        const lowongan = await prisma.lowongan.update({
            where: {
                id: Number(id),
            },
            data: {
                posisi,
                departemen,
                lokasi,
                tipe,
                status,
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

        return NextResponse.json(lowongan);
    } catch (error) {
        console.error("PUT LOWONGAN ERROR:", error);

        return NextResponse.json(
            {
                message: "Gagal memperbarui lowongan",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const existing = await prisma.lowongan.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!existing) {
            return NextResponse.json(
                {
                    message: "Lowongan tidak ditemukan",
                },
                { status: 404 }
            );
        }

        await prisma.lowongan.delete({
            where: {
                id: Number(id),
            },
        });

        return NextResponse.json({
            message: "Lowongan berhasil dihapus",
        });
    } catch (error) {
        console.error("DELETE LOWONGAN ERROR:", error);

        return NextResponse.json(
            {
                message: "Gagal menghapus lowongan",
            },
            { status: 500 }
        );
    }
}