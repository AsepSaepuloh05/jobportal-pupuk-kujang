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

export function calculateDuration(start: string, end: string | null) {
  if (!start) return "";

  const startYear = Number(start);

  if (!startYear || Number.isNaN(startYear)) {
    return "";
  }

  const endYear = end && end !== "" ? Number(end) : new Date().getFullYear();

  if (!endYear || Number.isNaN(endYear)) {
    return "";
  }

  const totalMonths = Math.max(0, (endYear - startYear) * 12);

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const result: string[] = [];

  if (years > 0) {
    result.push(`${years} th`);
  }

  if (months > 0) {
    result.push(`${months} bln`);
  }

  return result.length > 0 ? result.join(" ") : "Kurang dari 1 th";
}