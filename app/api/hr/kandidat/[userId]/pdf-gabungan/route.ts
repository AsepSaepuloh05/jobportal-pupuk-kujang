import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
    IJAZAH: "Ijazah",
    TRANSKRIP: "Transkrip Nilai",
    LAINNYA: "Dokumen Lainnya",
};

async function tambahLabelPage(
    pdf: PDFDocument,
    font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
    label: string
) {
    const page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
    page.drawText(label, {
        x: MARGIN,
        y: A4_HEIGHT - MARGIN - 20,
        size: 16,
        font,
        color: rgb(0.02, 0.35, 0.24),
    });
    return page;
}

async function sisipkanFile(
    pdf: PDFDocument,
    absPath: string,
    tipeFile: string | null
) {
    const bytes = await fs.readFile(absPath);

    if (tipeFile === "application/pdf") {
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

    const isPng = tipeFile === "image/png";
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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const cookieStore = await cookies();
        const userRole = cookieStore.get("user_role")?.value;

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
                noTelepon: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Kandidat tidak ditemukan" },
                { status: 404 }
            );
        }

        const dokumenUmum = await prisma.dokumenKandidat.findMany({
            where: { userId: Number(userId) },
        });

        const pendidikan = await prisma.pendidikan.findMany({
            where: {
                userId: Number(userId),
                ijazahPathFile: { not: null },
            },
        });

        const pdf = await PDFDocument.create();
        const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);

        // HALAMAN IDENTITAS
        const cover = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
        let cursorY = A4_HEIGHT - 80;

        cover.drawText("BERKAS LAMARAN KERJA", {
            x: MARGIN,
            y: cursorY,
            size: 10,
            font: fontBold,
            color: rgb(0.02, 0.5, 0.3),
        });

        cursorY -= 30;
        cover.drawText(user.nama, {
            x: MARGIN,
            y: cursorY,
            size: 22,
            font: fontBold,
        });

        cursorY -= 40;
        const baris = [
            `Email: ${user.email}`,
            `No. Telepon: ${user.noTelepon || "-"}`,
            `Domisili: ${user.alamat || "-"}`,
            `NIK: ${user.nik}`,
        ];

        for (const teks of baris) {
            cover.drawText(teks, {
                x: MARGIN,
                y: cursorY,
                size: 11,
                font: fontRegular,
                color: rgb(0.2, 0.2, 0.2),
            });
            cursorY -= 20;
        }

        // SISIPKAN TIAP DOKUMEN
        for (const dok of dokumenUmum) {
            if (!dok.pathFile) continue;

            try {
                await tambahLabelPage(
                    pdf,
                    fontBold,
                    JENIS_LABEL[dok.jenisDokumen] || dok.jenisDokumen
                );

                const absPath = path.join(
                    process.cwd(),
                    "public",
                    dok.pathFile
                );

                await sisipkanFile(pdf, absPath, dok.tipeFile);
            } catch (err) {
                console.error(`Gagal sisipkan ${dok.jenisDokumen}:`, err);
            }
        }

        for (const p of pendidikan) {
            if (!p.ijazahPathFile) continue;

            try {
                await tambahLabelPage(
                    pdf,
                    fontBold,
                    `Ijazah ${p.jenjang} - ${p.institusi}`
                );

                const absPath = path.join(
                    process.cwd(),
                    "public",
                    p.ijazahPathFile
                );

                await sisipkanFile(pdf, absPath, p.ijazahTipeFile);
            } catch (err) {
                console.error("Gagal sisipkan ijazah:", err);
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