import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || "SIO Karir <onboarding@resend.dev>";

const TAHAPAN_LABEL: Record<string, string> = {
    SCREENING: "Screening",
    ASSESSMENT: "Assessment",
    INTERVIEW: "Interview",
    TECHNICAL_TEST: "Technical Test",
    MCU: "MCU",
    OFFERING: "Offering",
};

function wrapTemplate(nama: string, bodyHtml: string) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <p style="font-size: 12px; font-weight: 700; letter-spacing: 1.5px; color: #4da477; text-transform: uppercase; margin: 0;">
          PT Pupuk Kujang &middot; SIO Karir
        </p>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px;">
        <p style="margin: 0 0 16px; font-size: 15px;">Halo, <strong>${nama}</strong>,</p>
        ${bodyHtml}
      </div>

      <p style="margin-top: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
        Email ini dikirim otomatis oleh sistem SIO Karir PT Pupuk Kujang. Mohon tidak membalas email ini.
      </p>
    </div>
  `;
}

function formatTanggalJam(date: Date) {
    return new Date(date).toLocaleString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
    }) + " WIB";
}

interface KirimEmailParams {
    lamaranId: number;
    penerima: string;
    nama: string;
    tipe: "UNDANGAN" | "HASIL_LOLOS" | "HASIL_DITOLAK" | "BEBAS";
    tahapan?: string;
    subjek: string;
    bodyHtml: string;
}

async function kirimDanCatat({
    lamaranId,
    penerima,
    nama,
    tipe,
    tahapan,
    subjek,
    bodyHtml,
}: KirimEmailParams) {
    const htmlLengkap = wrapTemplate(nama, bodyHtml);

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: penerima,
            subject: subjek,
            html: htmlLengkap,
        });

        await prisma.emailLog.create({
            data: {
                lamaranId,
                tipe,
                tahapan: tahapan || null,
                penerima,
                subjek,
                isi: htmlLengkap,
                status: "TERKIRIM",
            },
        });

        return { success: true };
    } catch (error) {
        console.error("KIRIM EMAIL ERROR:", error);

        await prisma.emailLog.create({
            data: {
                lamaranId,
                tipe,
                tahapan: tahapan || null,
                penerima,
                subjek,
                isi: htmlLengkap,
                status: "GAGAL",
                errorMessage: error instanceof Error ? error.message : "Unknown error",
            },
        });

        return {
            success: false,
            message: error instanceof Error ? error.message : "Gagal mengirim email",
        };
    }
}

export async function kirimEmailUndangan({
    lamaranId,
    penerima,
    nama,
    posisi,
    tahapan,
    jadwalTanggal,
    jadwalLokasi,
    jadwalCatatan,
}: {
    lamaranId: number;
    penerima: string;
    nama: string;
    posisi: string;
    tahapan: string;
    jadwalTanggal: Date;
    jadwalLokasi?: string | null;
    jadwalCatatan?: string | null;
}) {
    const labelTahapan = TAHAPAN_LABEL[tahapan] || tahapan;

    const bodyHtml = `
    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.7;">
      Selamat! Kamu diundang untuk mengikuti tahap <strong>${labelTahapan}</strong>
      pada proses seleksi posisi <strong>${posisi}</strong> di PT Pupuk Kujang.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 0 0 16px;">
      <tr>
        <td style="padding: 8px 0; font-size: 13px; color: #64748b; width: 100px;">Tanggal &amp; Jam</td>
        <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">${formatTanggalJam(jadwalTanggal)}</td>
      </tr>
      ${jadwalLokasi
            ? `<tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;">Lokasi</td>
              <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">${jadwalLokasi}</td>
            </tr>`
            : ""
        }
    </table>

    ${jadwalCatatan
            ? `<div style="background: #f8fafc; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">${jadwalCatatan.replace(/\n/g, "<br/>")}</p>
          </div>`
            : ""
        }

    <p style="margin: 0; font-size: 14px; line-height: 1.7;">
      Mohon hadir tepat waktu. Terima kasih.
    </p>
  `;

    return kirimDanCatat({
        lamaranId,
        penerima,
        nama,
        tipe: "UNDANGAN",
        tahapan,
        subjek: `Undangan ${labelTahapan} - ${posisi} | PT Pupuk Kujang`,
        bodyHtml,
    });
}

export async function kirimEmailBebas({
    lamaranId,
    penerima,
    nama,
    subjek,
    isi,
}: {
    lamaranId: number;
    penerima: string;
    nama: string;
    subjek: string;
    isi: string;
}) {
    const bodyHtml =
        "<div style=\"font-size: 14px; line-height: 1.7; white-space: pre-line;\">" +
        isi +
        "</div>";

    return kirimDanCatat({
        lamaranId,
        penerima,
        nama,
        tipe: "BEBAS",
        subjek,
        bodyHtml,
    });
}