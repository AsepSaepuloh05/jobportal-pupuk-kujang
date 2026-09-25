import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();

        const userId = cookieStore.get("user_id")?.value;
        const userRole = cookieStore.get("user_role")?.value;

        if (!userId) {
            return NextResponse.json(
                { message: "Belum login" },
                { status: 401 }
            );
        }

        /*
         * =========================================================
         * GET LAMARAN - HR
         * =========================================================
         */

        if (userRole === "HR") {
            const { searchParams } = new URL(request.url);
            const lowonganIdParam = searchParams.get("lowonganId");

            const semuaLamaran = await prisma.lamaran.findMany({
                where: lowonganIdParam
                    ? {
                        lowonganId: Number(lowonganIdParam),
                    }
                    : undefined,

                include: {
                    user: {
                        select: {
                            id: true,
                            nama: true,
                            email: true,
                            nik: true,
                            alamat: true,
                            noTelepon: true,
                        },
                    },

                    lowongan: {
                        select: {
                            id: true,
                            posisi: true,
                            departemen: true,
                            lokasi: true,
                            tipe: true,
                            status: true,
                            tahapanSeleksi: true,
                        },
                    },

                    tahapanProgress: {
                        orderBy: {
                            urutan: "asc",
                        },
                    },
                },

                orderBy: {
                    createdAt: "desc",
                },
            });

            return NextResponse.json(semuaLamaran);
        }

        /*
         * =========================================================
         * GET LAMARAN - KANDIDAT
         * =========================================================
         */

        const lamaran = await prisma.lamaran.findMany({
            where: {
                userId: Number(userId),
            },

            include: {
                lowongan: {
                    select: {
                        id: true,
                        posisi: true,
                        departemen: true,
                        lokasi: true,
                        tipe: true,
                        status: true,
                        deskripsi: true,

                        // Tahapan yang dipilih HR pada lowongan
                        tahapanSeleksi: true,
                    },
                },

                // Progress setiap tahapan kandidat
                tahapanProgress: {
                    orderBy: {
                        urutan: "asc",
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(lamaran);
    } catch (error) {
        console.error("GET LAMARAN ERROR:", error);

        return NextResponse.json(
            {
                message: "Gagal mengambil data lamaran",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();

        const userId = cookieStore.get("user_id")?.value;
        const userRole = cookieStore.get("user_role")?.value;

        if (!userId) {
            return NextResponse.json(
                {
                    message: "Belum login",
                },
                {
                    status: 401,
                }
            );
        }

        if (userRole !== "KANDIDAT") {
            return NextResponse.json(
                {
                    message: "Hanya kandidat yang bisa melamar",
                },
                {
                    status: 403,
                }
            );
        }

        const body = await request.json();

        const lowonganId = Number(body.lowonganId);

        if (!lowonganId) {
            return NextResponse.json(
                {
                    message: "lowonganId wajib diisi",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * =========================================================
         * CEK LOWONGAN
         * =========================================================
         */

        const lowongan = await prisma.lowongan.findUnique({
            where: {
                id: lowonganId,
            },
        });

        if (!lowongan) {
            return NextResponse.json(
                {
                    message: "Lowongan tidak ditemukan",
                },
                {
                    status: 404,
                }
            );
        }

        if (lowongan.status !== "AKTIF") {
            return NextResponse.json(
                { message: "Lowongan ini sudah tidak menerima lamaran" },
                { status: 400 }
            );
        }

        if (lowongan.filterDomisiliAktif) {
            const kandidat = await prisma.user.findUnique({
                where: { id: Number(userId) },
                select: { desa: true },
            });

            const desaSesuai =
                kandidat?.desa && lowongan.desaDiizinkan.includes(kandidat.desa);

            if (!desaSesuai) {
                return NextResponse.json(
                    {
                        message:
                            "Lowongan ini khusus untuk kandidat dengan domisili tertentu",
                    },
                    { status: 403 }
                );
            }
        }

        /*
         * =========================================================
         * CEK LAMARAN DUPLIKAT
         * =========================================================
         */

        const existing = await prisma.lamaran.findUnique({
            where: {
                userId_lowonganId: {
                    userId: Number(userId),
                    lowonganId,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                {
                    message:
                        "Kamu sudah pernah melamar ke lowongan ini",
                },
                {
                    status: 409,
                }
            );
        }

        /*
         * =========================================================
         * CEK DOKUMEN
         * =========================================================
         */

        const dokumen = await prisma.dokumenKandidat.findMany({
            where: {
                userId: Number(userId),
                jenisDokumen: {
                    in: ["CV", "KTP"],
                },
            },
        });

        const punyaCV = dokumen.some(
            (d) => d.jenisDokumen === "CV"
        );

        const punyaKTP = dokumen.some(
            (d) => d.jenisDokumen === "KTP"
        );

        if (!punyaCV || !punyaKTP) {
            return NextResponse.json(
                {
                    message:
                        "Lengkapi CV dan KTP di halaman Profil sebelum melamar",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * =========================================================
         * URUTAN TAHAPAN
         * =========================================================
         */

        const TAHAPAN_URUTAN: Record<string, number> = {
            SCREENING: 1,
            ASSESSMENT: 2,
            INTERVIEW: 3,
            TECHNICAL_TEST: 4,
            MCU: 5,
            OFFERING: 6,
        };

        const tahapanTerurut = [
            ...lowongan.tahapanSeleksi,
        ].sort(
            (a, b) =>
                (TAHAPAN_URUTAN[a] ?? 999) -
                (TAHAPAN_URUTAN[b] ?? 999)
        );

        /*
         * =========================================================
         * BUAT LAMARAN
         * =========================================================
         */

        const lamaran = await prisma.lamaran.create({
            data: {
                userId: Number(userId),
                lowonganId,

                tahapanProgress: {
                    create: tahapanTerurut.map(
                        (tahapan, index) => ({
                            tahapan,
                            urutan: index + 1,
                        })
                    ),
                },
            },

            include: {
                lowongan: {
                    select: {
                        id: true,
                        posisi: true,
                        departemen: true,
                        lokasi: true,
                        tipe: true,
                        status: true,
                        deskripsi: true,
                        tahapanSeleksi: true,
                    },
                },

                tahapanProgress: {
                    orderBy: {
                        urutan: "asc",
                    },
                },
            },
        });

        /*
         * =========================================================
         * UPDATE JUMLAH PELAMAR
         * =========================================================
         */

        await prisma.lowongan.update({
            where: {
                id: lowonganId,
            },

            data: {
                pelamar: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json(
            lamaran,
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error("POST LAMARAN ERROR:", error);

        return NextResponse.json(
            {
                message: "Gagal mengirim lamaran",
            },
            {
                status: 500,
            }
        );
    }
}