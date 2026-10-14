export interface KolomExcel {
    header: string;
    key: string;
    lebar?: number;
    format?: string;
}

export type BarisExcel = Record<string, string | number | Date | null>;

interface OpsiEkspor {
    namaFile: string;
    namaSheet: string;
    kolom: KolomExcel[];
    baris: BarisExcel[];
}

export const stempelFile = () => {
    return new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Jakarta",
    });
};

export const tanggalExcel = (iso: string | null | undefined): Date | null => {
    if (!iso) return null;

    const kunci = new Date(iso).toLocaleDateString("en-CA", {
        timeZone: "Asia/Jakarta",
    });

    const [tahun, bulan, hari] = kunci.split("-").map(Number);

    return new Date(Date.UTC(tahun, bulan - 1, hari));
};

export const teksTanggalJam = (iso: string) => {
    const d = new Date(iso);

    const tanggal = d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta",
    });

    const jam = d
        .toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Jakarta",
        })
        .replace(".", ":");

    return tanggal + " " + jam + " WIB";
};

export async function eksporExcel({
    namaFile,
    namaSheet,
    kolom,
    baris,
}: OpsiEkspor) {
    const modul = await import("exceljs");
    const ExcelJS =
        (modul as unknown as { default?: typeof modul }).default ?? modul;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SIO Karir PT Pupuk Kujang";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(
        namaSheet.replace(/[\\/?*[\]:]/g, "").slice(0, 31)
    );

    sheet.columns = kolom.map((k) => ({
        header: k.header,
        key: k.key,
        width: k.lebar ?? 20,
        style: k.format ? { numFmt: k.format } : undefined,
    }));

    baris.forEach((b) => {
        sheet.addRow(b);
    });

    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF059669" },
    };
    header.alignment = { vertical: "middle" };
    header.height = 22;

    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: kolom.length },
    };

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = namaFile.replace(/[\\/:*?"<>|]+/g, "-") + ".xlsx";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}