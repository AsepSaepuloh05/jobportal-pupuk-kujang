import { NextResponse } from "next/server";
import { bacaIdentitas } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 40;

const JENIS_LABEL: Record<string, string> = {
    CV: "Curriculum Vitae (CV)",
    KTP: "Kartu Tanda Penduduk (KTP)",
    PAS_FOTO: "Pas Foto",
    IJAZAH: "Ijazah",
    TRANSKRIP: "Transkrip Nilai",
    LAINNYA: "Dokumen Lainnya",
};

const URUTAN_DOKUMEN: Record<string, number> = {
    CV: 1,
    KTP: 2,
    PAS_FOTO: 3,
    IJAZAH: 4,
    TRANSKRIP: 5,
    LAINNYA: 6,
};

async function tambahLabelPage(
    pdf: PDFDocument,
    font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
    label: string,
    sublabel?: string
) {
    const page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
    page.drawText(label, {
        x: MARGIN,
        y: A4_HEIGHT - MARGIN - 20,
        size: 16,
        font,
        color: rgb(0.02, 0.35, 0.24),
    });

    if (sublabel) {
        page.drawText(sublabel, {
            x: MARGIN,
            y: A4_HEIGHT - MARGIN - 42,
            size: 11,
            font,
            color: rgb(0.4, 0.45, 0.5),
        });
    }

    return page;
}

async function sisipkanFile(
    pdf: PDFDocument,
    absPath: string,
    tipeFile: string | null
) {
    const bytes = await fs.readFile(absPath);

    if (
        tipeFile === "application/pdf" ||
        absPath.toLowerCase().endsWith(".pdf")
    ) {
        const srcDoc = await PDFDocument.load(bytes, {
            ignoreEncryption: true,
        });
        const copiedPages = await pdf.copyPages(
            srcDoc,
            srcDoc.getPageIndices()
        );
        copiedPages.forEach((p) => pdf.addPage(p));
        return;
    }

    const isPng =
        tipeFile === "image/png" || absPath.toLowerCase().endsWith(".png");
    const image = isPng
        ? await pdf.embedPng(bytes)
        : await pdf.embedJpg(bytes);

    const maxWidth = A4_WIDTH - MARGIN * 2;
    const maxHeight = A4_HEIGHT - MARGIN * 2;
    const scale = Math.min(
        maxWidth / image.width,
        maxHeight / image.height,
        1
    );
    const width = image.width * scale;
    const height = image.height * scale;

    const page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
    page.drawImage(image, {
        x: (A4_WIDTH - width) / 2,
        y: (A4_HEIGHT - height) / 2,
        width,
        height,
    });
}

// Resolve path fisik dari nilai pathFile di database
// Mendukung format lama (/uploads/) dan baru (/api/berkas/)
function resolveFilePath(pathFile: string): string {
    if (pathFile.startsWith("/api/berkas/")) {
        const relativePath = pathFile.replace(/^\/api\/berkas\//, "");
        return path.join(process.cwd(), "uploads", relativePath);
    }
    // Format lama: /uploads/...
    return path.join(process.cwd(), "public", pathFile);
}

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
                nama: true,
                email: true,
                nik: true,
                alamat: true,
                rt: true,
                rw: true,
                desa: true,
                kecamatan: true,
                kabupaten: true,
                provinsi: true,
                kodePos: true,
                noTelepon: true,
                dokumenProfil: {
                    select: {
                        pathFile: true,
                        tipeFile: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Kandidat tidak ditemukan" },
                { status: 404 }
            );
        }

        const [dokumenUmumRaw, pendidikan, pengalaman, sertifikasi] =
            await Promise.all([
                prisma.dokumenKandidat.findMany({
                    where: { userId: Number(userId) },
                }),
                prisma.pendidikan.findMany({
                    where: { userId: Number(userId) },
                    orderBy: { tahunSelesai: "desc" },
                }),
                prisma.pengalaman.findMany({
                    where: { userId: Number(userId) },
                    orderBy: { tahunMulai: "desc" },
                }),
                prisma.sertifikasi.findMany({
                    where: { userId: Number(userId) },
                    orderBy: { tanggalTerbit: "desc" },
                }),
            ]);

        const dokumenUmum = [...dokumenUmumRaw].sort(
            (a, b) =>
                (URUTAN_DOKUMEN[a.jenisDokumen] || 99) -
                (URUTAN_DOKUMEN[b.jenisDokumen] || 99)
        );

        const pdf = await PDFDocument.create();
        const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);

        // HALAMAN IDENTITAS / RINGKASAN PROFIL
        const cover = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
        let cursorY = A4_HEIGHT - 60;

        // Sisipkan Foto Profil di pojok kanan atas cover jika ada
        if (user.dokumenProfil?.pathFile) {
            try {
                const fotoPath = resolveFilePath(user.dokumenProfil.pathFile);
                const fotoBytes = await fs.readFile(fotoPath);
                const isPng =
                    user.dokumenProfil.tipeFile === "image/png" ||
                    fotoPath.toLowerCase().endsWith(".png");
                const fotoImg = isPng
                    ? await pdf.embedPng(fotoBytes)
                    : await pdf.embedJpg(fotoBytes);
                const fotoW = 75;
                const fotoH = 95;
                cover.drawImage(fotoImg, {
                    x: A4_WIDTH - MARGIN - fotoW,
                    y: A4_HEIGHT - 60 - fotoH + 10,
                    width: fotoW,
                    height: fotoH,
                });
            } catch (err) {
                console.error("Gagal memuat foto profil ke cover PDF:", err);
            }
        }

        cover.drawText("BERKAS LAMARAN KERJA - SIO KARIR PT PUPUK KUJANG", {
            x: MARGIN,
            y: cursorY,
            size: 10,
            font: fontBold,
            color: rgb(0.02, 0.5, 0.3),
        });

        cursorY -= 26;
        cover.drawText(user.nama, {
            x: MARGIN,
            y: cursorY,
            size: 20,
            font: fontBold,
        });

        cursorY -= 28;
        const rtRw =
            user.rt !== null || user.rw !== null
                ? `RT ${user.rt ?? "-"} / RW ${user.rw ?? "-"}`
                : null;
        const wilayah = [
            user.desa ? `Desa/Kel. ${user.desa}` : null,
            user.kecamatan ? `Kec. ${user.kecamatan}` : null,
            user.kabupaten || null,
            user.provinsi || null,
            user.kodePos || null,
        ]
            .filter(Boolean)
            .join(", ");

        const barisIdentitas = [
            `NIK: ${user.nik}`,
            `Email: ${user.email}`,
            `No. Telepon: ${user.noTelepon || "-"}`,
            `Alamat: ${[user.alamat, rtRw].filter(Boolean).join(", ") || "-"}`,
            `Domisili Wilayah: ${wilayah || "-"}`,
        ];

        for (const teks of barisIdentitas) {
            cover.drawText(teks, {
                x: MARGIN,
                y: cursorY,
                size: 10.5,
                font: fontRegular,
                color: rgb(0.2, 0.2, 0.2),
            });
            cursorY -= 18;
        }

        // Ringkasan Pendidikan di Cover
        if (pendidikan.length > 0 && cursorY > 140) {
            cursorY -= 12;
            cover.drawText("RIWAYAT PENDIDIKAN", {
                x: MARGIN,
                y: cursorY,
                size: 11,
                font: fontBold,
                color: rgb(0.02, 0.35, 0.24),
            });
            cursorY -= 16;

            for (const p of pendidikan) {
                if (cursorY < 80) break;
                const infoNilai =
                    p.ipk !== null && p.ipk !== undefined
                        ? ` | IPK/Nilai: ${p.ipk}`
                        : "";
                const infoLulus = p.tanggalLulus
                    ? ` | Lulus: ${p.tanggalLulus}`
                    : "";
                cover.drawText(
                    `• ${p.jenjang} - ${p.institusi} (${p.jurusan}, ${p.tahunMulai}-${p.tahunSelesai})${infoNilai}${infoLulus}`,
                    {
                        x: MARGIN,
                        y: cursorY,
                        size: 9.5,
                        font: fontRegular,
                        color: rgb(0.25, 0.25, 0.25),
                    }
                );
                cursorY -= 15;
            }
        }

        // Ringkasan Pengalaman di Cover
        if (pengalaman.length > 0 && cursorY > 140) {
            cursorY -= 10;
            cover.drawText("PENGALAMAN KERJA", {
                x: MARGIN,
                y: cursorY,
                size: 11,
                font: fontBold,
                color: rgb(0.02, 0.35, 0.24),
            });
            cursorY -= 16;

            for (const peng of pengalaman) {
                if (cursorY < 80) break;
                cover.drawText(
                    `• ${peng.posisi} - ${peng.perusahaan} (${peng.tahunMulai}-${peng.tahunSelesai})${peng.lokasi ? ` · ${peng.lokasi}` : ""}`,
                    {
                        x: MARGIN,
                        y: cursorY,
                        size: 9.5,
                        font: fontRegular,
                        color: rgb(0.25, 0.25, 0.25),
                    }
                );
                cursorY -= 15;
            }
        }

        // Ringkasan Sertifikasi di Cover
        if (sertifikasi.length > 0 && cursorY > 140) {
            cursorY -= 10;
            cover.drawText("SERTIFIKASI", {
                x: MARGIN,
                y: cursorY,
                size: 11,
                font: fontBold,
                color: rgb(0.02, 0.35, 0.24),
            });
            cursorY -= 16;

            for (const s of sertifikasi) {
                if (cursorY < 80) break;
                cover.drawText(
                    `• ${s.nama} - ${s.penerbit}${s.nomor ? ` (No: ${s.nomor})` : ""}${s.tanggalTerbit ? ` · Terbit: ${s.tanggalTerbit}` : ""}`,
                    {
                        x: MARGIN,
                        y: cursorY,
                        size: 9.5,
                        font: fontRegular,
                        color: rgb(0.25, 0.25, 0.25),
                    }
                );
                cursorY -= 15;
            }
        }

        // 1. SISIPKAN DOKUMEN UMUM (CV, KTP, PAS_FOTO, LAINNYA)
        for (const dok of dokumenUmum) {
            if (!dok.pathFile) continue;

            try {
                await tambahLabelPage(
                    pdf,
                    fontBold,
                    JENIS_LABEL[dok.jenisDokumen] || dok.jenisDokumen,
                    dok.namaAsli || undefined
                );

                const absPath = resolveFilePath(dok.pathFile);
                await sisipkanFile(pdf, absPath, dok.tipeFile);
            } catch (err) {
                console.error(`Gagal sisipkan ${dok.jenisDokumen}:`, err);
            }
        }

        // 2. SISIPKAN BERKAS PENDIDIKAN (IJAZAH, SKL, TRANSKRIP NILAI)
        for (const p of pendidikan) {
            const labelPendidikan = `${p.jenjang} - ${p.institusi} (${p.jurusan})`;

            if (p.ijazahPathFile) {
                try {
                    await tambahLabelPage(
                        pdf,
                        fontBold,
                        `Ijazah ${p.jenjang} - ${p.institusi}`,
                        labelPendidikan
                    );
                    const absPath = resolveFilePath(p.ijazahPathFile);
                    await sisipkanFile(pdf, absPath, p.ijazahTipeFile);
                } catch (err) {
                    console.error("Gagal sisipkan ijazah:", err);
                }
            }

            if (p.sklPathFile) {
                try {
                    await tambahLabelPage(
                        pdf,
                        fontBold,
                        `Surat Keterangan Lulus (SKL) ${p.jenjang} - ${p.institusi}`,
                        p.tanggalLulus
                            ? `${labelPendidikan} · Tanggal Lulus: ${p.tanggalLulus}`
                            : labelPendidikan
                    );
                    const absPath = resolveFilePath(p.sklPathFile);
                    await sisipkanFile(pdf, absPath, p.sklTipeFile);
                } catch (err) {
                    console.error("Gagal sisipkan SKL:", err);
                }
            }

            if (p.transkripPathFile) {
                try {
                    await tambahLabelPage(
                        pdf,
                        fontBold,
                        `Transkrip Nilai ${p.jenjang} - ${p.institusi}`,
                        p.ipk !== null && p.ipk !== undefined
                            ? `${labelPendidikan} · IPK/Nilai: ${p.ipk}`
                            : labelPendidikan
                    );
                    const absPath = resolveFilePath(p.transkripPathFile);
                    await sisipkanFile(pdf, absPath, p.transkripTipeFile);
                } catch (err) {
                    console.error("Gagal sisipkan transkrip:", err);
                }
            }
        }

        // 3. SISIPKAN BERKAS PENGALAMAN KERJA (PAKLARING)
        for (const peng of pengalaman) {
            if (!peng.paklaringPathFile) continue;

            try {
                await tambahLabelPage(
                    pdf,
                    fontBold,
                    `Paklaring - ${peng.perusahaan}`,
                    `${peng.posisi} (${peng.tahunMulai} - ${peng.tahunSelesai})`
                );

                const absPath = resolveFilePath(peng.paklaringPathFile);
                await sisipkanFile(pdf, absPath, peng.paklaringTipeFile);
            } catch (err) {
                console.error("Gagal sisipkan paklaring:", err);
            }
        }

        // 4. SISIPKAN BERKAS SERTIFIKASI (SERTIFIKAT)
        for (const s of sertifikasi) {
            if (!s.sertifikatPathFile) continue;

            try {
                await tambahLabelPage(
                    pdf,
                    fontBold,
                    `Sertifikat - ${s.nama}`,
                    `Penerbit: ${s.penerbit}${s.nomor ? ` · No: ${s.nomor}` : ""}`
                );

                const absPath = resolveFilePath(s.sertifikatPathFile);
                await sisipkanFile(pdf, absPath, s.sertifikatTipeFile);
            } catch (err) {
                console.error("Gagal sisipkan sertifikat:", err);
            }
        }

        const pdfBytes = await pdf.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="Berkas-${user.nama.replace(/\s+/g, "_")}.pdf"`,
            },
        });
    } catch (error) {
        console.error("GENERATE PDF GABUNGAN ERROR:", error);

        return NextResponse.json(
            { message: "Gagal membuat PDF gabungan" },
            { status: 500 }
        );
    }
}
