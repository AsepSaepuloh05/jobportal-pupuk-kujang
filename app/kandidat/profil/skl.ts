// =====================================================
// ATURAN SKL (Surat Keterangan Lulus)
// Kandidat memilih SATU dokumen kelulusan: ijazah ATAU SKL.
// SKL bersifat sementara: hanya berlaku 4 bulan sejak tanggal lulus.
// Setelah itu kandidat wajib beralih ke ijazah.
// Tanggal disimpan sebagai string "YYYY-MM-DD".
// =====================================================

export const SKL_BATAS_BULAN = 4;

const DAY_MS = 24 * 60 * 60 * 1000;

export type JenisKelulusan = "IJAZAH" | "SKL";

/**
 * Menyimpulkan dokumen kelulusan yang dipakai.
 * File yang baru dipilih didahulukan, lalu file yang sudah tersimpan.
 * Null jika belum ada ijazah maupun SKL.
 */
export function tentukanJenisKelulusan({
  ijazahBaru,
  sklBaru,
  ijazahTersimpan,
  sklTersimpan,
}: {
  ijazahBaru: boolean;
  sklBaru: boolean;
  ijazahTersimpan: boolean;
  sklTersimpan: boolean;
}): JenisKelulusan | null {
  if (ijazahBaru) return "IJAZAH";
  if (sklBaru) return "SKL";
  if (ijazahTersimpan) return "IJAZAH";
  if (sklTersimpan) return "SKL";

  return null;
}

/** Mengubah "YYYY-MM-DD" menjadi Date (waktu lokal). Null jika tidak valid. */
export function parseTanggal(value?: string | null): Date | null {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value).trim());

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/** Menambah bulan tanpa meluap ke bulan berikutnya (mis. 31 Okt + 4 bulan = 28/29 Feb). */
export function tambahBulan(date: Date, bulan: number): Date {
  const hasil = new Date(date.getFullYear(), date.getMonth() + bulan, 1);

  const hariTerakhir = new Date(
    hasil.getFullYear(),
    hasil.getMonth() + 1,
    0
  ).getDate();

  hasil.setDate(Math.min(date.getDate(), hariTerakhir));

  return hasil;
}

export type StatusSkl =
  | { status: "TANPA_TANGGAL" }
  | { status: "BERLAKU"; batas: Date; sisaHari: number }
  | { status: "KEDALUWARSA"; batas: Date };

export function getStatusSkl(
  tanggalLulus?: string | null,
  sekarang: Date = new Date()
): StatusSkl {
  const lulus = parseTanggal(tanggalLulus);

  if (!lulus) {
    return { status: "TANPA_TANGGAL" };
  }

  const batas = tambahBulan(lulus, SKL_BATAS_BULAN);

  const hariIni = new Date(
    sekarang.getFullYear(),
    sekarang.getMonth(),
    sekarang.getDate()
  );

  const selisih = batas.getTime() - hariIni.getTime();

  if (selisih < 0) {
    return { status: "KEDALUWARSA", batas };
  }

  return {
    status: "BERLAKU",
    batas,
    sisaHari: Math.round(selisih / DAY_MS),
  };
}

export function isSklMasihBerlaku(
  tanggalLulus?: string | null,
  sekarang: Date = new Date()
): boolean {
  return getStatusSkl(tanggalLulus, sekarang).status === "BERLAKU";
}

export function isTanggalDiMasaDepan(
  value?: string | null,
  sekarang: Date = new Date()
): boolean {
  const date = parseTanggal(value);

  if (!date) return false;

  const hariIni = new Date(
    sekarang.getFullYear(),
    sekarang.getMonth(),
    sekarang.getDate()
  );

  return date.getTime() > hariIni.getTime();
}

/** Tanggal hari ini dalam format "YYYY-MM-DD" (untuk atribut max pada input date). */
export function hariIniISO(sekarang: Date = new Date()): string {
  const y = sekarang.getFullYear();
  const m = String(sekarang.getMonth() + 1).padStart(2, "0");
  const d = String(sekarang.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export function formatTanggalIndo(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Memeriksa syarat kelulusan sesuai jenis dokumen yang dipakai.
 * Mengembalikan pesan error, atau null jika syarat terpenuhi.
 */
export function cekSyaratLulusan({
  jenis,
  tanggalLulus,
}: {
  jenis: JenisKelulusan | null;
  tanggalLulus?: string | null;
}): string | null {
  if (jenis === null) {
    return "Unggah ijazah, atau SKL jika ijazah belum diterima.";
  }

  if (jenis === "IJAZAH") return null;

  // Jenis SKL: tanggal lulus wajib dan SKL belum melewati batas
  const status = getStatusSkl(tanggalLulus);

  if (status.status === "TANPA_TANGGAL") {
    return "Isi tanggal lulus yang valid agar masa berlaku SKL dapat dihitung.";
  }

  if (status.status === "KEDALUWARSA") {
    return `SKL sudah melewati batas ${SKL_BATAS_BULAN} bulan (berakhir ${formatTanggalIndo(
      status.batas
    )}). Silakan pilih ijazah dan unggah ijazah Anda.`;
  }

  return null;
}