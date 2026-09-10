export function formatRupiah(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
}

export function formatGajiRange(
    gajiMin: number | null | undefined,
    gajiMax: number | null | undefined
): string {
    if (!gajiMin && !gajiMax) {
        return "Nego";
    }

    if (gajiMin && gajiMax) {
        return `${formatRupiah(gajiMin)} - ${formatRupiah(gajiMax)}`;
    }

    if (gajiMin) {
        return `Mulai ${formatRupiah(gajiMin)}`;
    }

    return `Hingga ${formatRupiah(gajiMax as number)}`;
}