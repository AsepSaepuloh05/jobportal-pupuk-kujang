export function formatUkuran(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(date: string | null) {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

export function isImageFile(tipeFile: string) {
  return tipeFile?.startsWith("image/");
}

export function isPdfFile(tipeFile: string) {
  return tipeFile === "application/pdf";
}

export function calculateDuration(
  start: string,
  end: string | null
) {
  if (!start) return "";

  const startYear = Number(start);

  if (!startYear || Number.isNaN(startYear)) {
    return "";
  }

  const endYear =
    end && end !== ""
      ? Number(end)
      : new Date().getFullYear();

  if (!endYear || Number.isNaN(endYear)) {
    return "";
  }

  const totalMonths = Math.max(
    0,
    (endYear - startYear) * 12
  );

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const result: string[] = [];

  if (years > 0) {
    result.push(`${years} th`);
  }

  if (months > 0) {
    result.push(`${months} bln`);
  }

  return result.length > 0
    ? result.join(" ")
    : "Kurang dari 1 th";
}

// ============================================================
// TAHUN
// ============================================================

// Hanya angka, maksimal 4 digit
export const onlyYear = (value: string) =>
  value.replace(/\D/g, "").slice(0, 4);

// Tepat 4 digit angka
export const isYear4 = (value: string) =>
  /^\d{4}$/.test(value);

// ============================================================
// IPK (D1 - S3): 0.01 - 4.00
// ============================================================

export const onlyIpk = (value: string) => {
  // Ubah koma menjadi titik
  let v = value.replace(/,/g, ".");

  // Hapus semua karakter selain angka dan titik
  v = v.replace(/[^\d.]/g, "");

  // Hanya boleh ada satu titik
  const firstDot = v.indexOf(".");

  if (firstDot !== -1) {
    v =
      v.slice(0, firstDot + 1) +
      v.slice(firstDot + 1).replace(/\./g, "");
  }

  const parts = v.split(".");

  // Maksimal 1 angka sebelum titik
  let integerPart = parts[0].slice(0, 1);

  // Angka depan hanya boleh 0-4
  if (integerPart !== "" && Number(integerPart) > 4) {
    integerPart = "";
  }

  // Belum ada titik
  if (parts.length === 1) {
    return integerPart;
  }

  // Maksimal 2 angka setelah titik
  let decimalPart = parts[1].slice(0, 2);

  // Angka depan 4: hanya boleh 4.00
  if (integerPart === "4") {
    decimalPart = decimalPart.replace(/[1-9]/g, "0");
  }

  // ".75" otomatis menjadi "0.75"
  if (integerPart === "") {
    integerPart = "0";
  }

  return `${integerPart}.${decimalPart}`;
};

export const isIpk = (value: string) =>
  /^(?:[0-3](?:\.\d{1,2})?|4(?:\.0{1,2})?)$/.test(value) &&
  Number(value) > 0 &&
  Number(value) <= 4;

// ============================================================
// NILAI RATA-RATA (SMA / SMK): 0.01 - 100
// ============================================================

export const onlyNilai = (value: string) => {
  let v = value.replace(/,/g, ".").replace(/[^\d.]/g, "");

  // Hanya boleh ada satu titik
  const firstDot = v.indexOf(".");

  if (firstDot !== -1) {
    v =
      v.slice(0, firstDot + 1) +
      v.slice(firstDot + 1).replace(/\./g, "");
  }

  const parts = v.split(".");

  // Maksimal 3 angka sebelum titik
  let integerPart = parts[0].slice(0, 3);

  // Tidak boleh lebih dari 100
  if (integerPart.length === 3 && Number(integerPart) > 100) {
    integerPart = integerPart.slice(0, 2);
  }

  // Belum ada titik
  if (parts.length === 1) {
    return integerPart;
  }

  let decimalPart = parts[1].slice(0, 2);

  // 100 hanya boleh 100.00
  if (integerPart === "100") {
    decimalPart = decimalPart.replace(/[1-9]/g, "0");
  }

  if (integerPart === "") {
    integerPart = "0";
  }

  return `${integerPart}.${decimalPart}`;
};

export const isNilai = (value: string) =>
  /^(?:\d{1,2}(?:\.\d{1,2})?|100(?:\.0{1,2})?)$/.test(value) &&
  Number(value) > 0 &&
  Number(value) <= 100;

// ============================================================
// NILAI BERDASARKAN JENJANG
// ============================================================

export const isSmaSmk = (jenjang: string) =>
  jenjang === "SMA / SMK";

export const onlyNilaiByJenjang = (
  value: string,
  jenjang: string
) => (isSmaSmk(jenjang) ? onlyNilai(value) : onlyIpk(value));

export const isNilaiByJenjang = (
  value: string,
  jenjang: string
) => (isSmaSmk(jenjang) ? isNilai(value) : isIpk(value));