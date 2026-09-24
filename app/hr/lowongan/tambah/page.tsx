"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Briefcase,
    Building2,
    MapPin,
    GraduationCap,
    Wallet,
    CalendarClock,
    FileText,
    ClipboardList,
    CheckCircle2,
    Search,
    ClipboardCheck,
    Users,
    Code2,
    HeartPulse,
    Handshake,
} from "lucide-react";

const TAHAPAN_OPTIONS = [
    { value: "SCREENING", label: "Screening", icon: Search },
    { value: "ASSESSMENT", label: "Assessment", icon: ClipboardCheck },
    { value: "INTERVIEW", label: "Interview", icon: Users },
    { value: "TECHNICAL_TEST", label: "Technical Test", icon: Code2 },
    { value: "MCU", label: "MCU", icon: HeartPulse },
    { value: "OFFERING", label: "Offering", icon: Handshake },
];

const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const PENGALAMAN_OPTIONS = [
    "Fresh Graduate / Tidak Diperlukan",
    "1-2 Tahun",
    "3-5 Tahun",
    "Lebih dari 5 Tahun",
];

export default function TambahLowonganPage() {
    const router = useRouter();

    const [posisi, setPosisi] = useState("");
    const [departemen, setDepartemen] = useState("");
    const [lokasi, setLokasi] = useState("");
    const [tipe, setTipe] = useState("Full Time");
    const [status, setStatus] = useState("DRAFT");
    const [deskripsi, setDeskripsi] = useState("");
    const [persyaratan, setPersyaratan] = useState("");
    const [kategori, setKategori] = useState("");
    const [pendidikan, setPendidikan] = useState("");
    const [pengalaman, setPengalaman] = useState("");
    const [tanggungJawab, setTanggungJawab] = useState("");
    const [gajiMin, setGajiMin] = useState("");
    const [gajiMax, setGajiMax] = useState("");
    const [tahapanSeleksi, setTahapanSeleksi] = useState<string[]>([
        "SCREENING",
        "ASSESSMENT",
        "INTERVIEW",
        "TECHNICAL_TEST",
        "MCU",
        "OFFERING",
    ]);
    const [tanggalBerakhir, setTanggalBerakhir] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const toggleTahapan = (value: string) => {
        setTahapanSeleksi((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (saving) return;

        if (!posisi.trim() || !departemen.trim() || !lokasi.trim()) {
            setError("Posisi, departemen, dan lokasi wajib diisi");
            return;
        }

        setError("");
        setSaving(true);

        try {
            const response = await fetch("/api/lowongan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    posisi: posisi.trim(),
                    departemen: departemen.trim(),
                    lokasi: lokasi.trim(),
                    tipe,
                    status,
                    deskripsi: deskripsi.trim() || undefined,
                    persyaratan: persyaratan.trim() || undefined,
                    kategori: kategori.trim() || undefined,
                    pendidikan: pendidikan.trim() || undefined,
                    pengalaman: pengalaman.trim() || undefined,
                    tanggungJawab: tanggungJawab.trim() || undefined,
                    gajiMin: gajiMin || undefined,
                    gajiMax: gajiMax || undefined,
                    tahapanSeleksi,
                    tanggalBerakhir: tanggalBerakhir || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal menambahkan lowongan");
            }

            router.push("/hr/kelolalowongan");
        } catch (err) {
            console.error("CREATE LOWONGAN ERROR:", err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Terjadi kesalahan pada server");
            }
        } finally {
            setSaving(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-50 disabled:text-slate-400";

    const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

    return (
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

            {/* HEADER */}

            <div className="mb-6 flex items-center gap-4">

                <button
                    type="button"
                    onClick={() => router.push("/hr/kelolalowongan")}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                    aria-label="Kembali"
                >
                    <ArrowLeft className="h-4.5 w-4.5" />
                </button>

                <div>
                    <h1 className="text-xl font-bold text-slate-800">
                        Buat Lowongan Baru
                    </h1>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Isi detail lowongan pekerjaan yang akan dibuka.
                    </p>
                </div>

            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* SECTION: INFORMASI DASAR */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <Briefcase className="h-4.5 w-4.5 text-emerald-600" />
                        <h2 className="text-sm font-bold text-slate-800">
                            Informasi Dasar
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 sm:p-8">

                        <div className="sm:col-span-2">
                            <label htmlFor="posisi" className={labelClass}>
                                Posisi
                            </label>
                            <input
                                id="posisi"
                                type="text"
                                placeholder="Contoh: IT Support"
                                value={posisi}
                                onChange={(e) => setPosisi(e.target.value)}
                                disabled={saving}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="departemen" className={labelClass}>
                                Departemen
                            </label>
                            <div className="relative">
                                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="departemen"
                                    type="text"
                                    placeholder="Contoh: Departemen IT"
                                    value={departemen}
                                    onChange={(e) => setDepartemen(e.target.value)}
                                    disabled={saving}
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="lokasi" className={labelClass}>
                                Lokasi
                            </label>
                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="lokasi"
                                    type="text"
                                    placeholder="Contoh: Cikampek"
                                    value={lokasi}
                                    onChange={(e) => setLokasi(e.target.value)}
                                    disabled={saving}
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="tipe" className={labelClass}>
                                Tipe Pekerjaan
                            </label>
                            <select
                                id="tipe"
                                value={tipe}
                                onChange={(e) => setTipe(e.target.value)}
                                disabled={saving}
                                className={inputClass}
                            >
                                <option value="Full Time">Full Time</option>
                                <option value="Kontrak">Kontrak</option>
                                <option value="Magang">Magang</option>
                                <option value="Part Time">Part Time</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="status" className={labelClass}>
                                Status
                            </label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                disabled={saving}
                                className={inputClass}
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="AKTIF">Aktif</option>
                                <option value="DITUTUP">Ditutup</option>
                            </select>
                        </div>

                    </div>

                </div>

                {/* SECTION: KUALIFIKASI */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <GraduationCap className="h-4.5 w-4.5 text-emerald-600" />
                        <h2 className="text-sm font-bold text-slate-800">
                            Kualifikasi
                        </h2>
                        <span className="ml-auto text-xs font-medium text-slate-400">
                            Opsional
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-3 sm:p-8">

                        <div>
                            <label htmlFor="kategori" className={labelClass}>
                                Kategori
                            </label>
                            <input
                                id="kategori"
                                type="text"
                                placeholder="Contoh: Teknologi & IT"
                                value={kategori}
                                onChange={(e) => setKategori(e.target.value)}
                                disabled={saving}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="pendidikan" className={labelClass}>
                                Pendidikan Minimal
                            </label>
                            <input
                                id="pendidikan"
                                type="text"
                                placeholder="Contoh: Minimal S1 Teknik Informatika"
                                value={pendidikan}
                                onChange={(e) => setPendidikan(e.target.value)}
                                disabled={saving}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="pengalaman" className={labelClass}>
                                Pengalaman
                            </label>
                            <select
                                id="pengalaman"
                                value={pengalaman}
                                onChange={(e) => setPengalaman(e.target.value)}
                                disabled={saving}
                                className={inputClass}
                            >
                                <option value="">Pilih pengalaman</option>
                                {PENGALAMAN_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                </div>

                {/* SECTION: KOMPENSASI & JADWAL */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <Wallet className="h-4.5 w-4.5 text-emerald-600" />
                        <h2 className="text-sm font-bold text-slate-800">
                            Kompensasi &amp; Jadwal
                        </h2>
                        <span className="ml-auto text-xs font-medium text-slate-400">
                            Opsional
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-3">

                        <div>
                            <label htmlFor="gajiMin" className={labelClass}>
                                Gaji Minimum
                            </label>
                            <input
                                id="gajiMin"
                                type="number"
                                min="0"
                                placeholder="5000000"
                                value={gajiMin}
                                onChange={(e) => setGajiMin(e.target.value)}
                                disabled={saving}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="gajiMax" className={labelClass}>
                                Gaji Maksimum
                            </label>
                            <input
                                id="gajiMax"
                                type="number"
                                min="0"
                                placeholder="7000000"
                                value={gajiMax}
                                onChange={(e) => setGajiMax(e.target.value)}
                                disabled={saving}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="tanggalBerakhir" className={labelClass}>
                                Batas Lowongan Ditutup
                            </label>
                            <div className="relative">
                                <CalendarClock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="tanggalBerakhir"
                                    type="date"
                                    value={tanggalBerakhir}
                                    onChange={(e) => setTanggalBerakhir(e.target.value)}
                                    disabled={saving}
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                        </div>

                    </div>

                    <p className="border-t border-slate-100 bg-slate-50/60 px-6 py-3 text-xs text-slate-500">
                        Kamu akan lihat pengingat kalau tanggal ini sudah
                        lewat tapi lowongan masih Aktif.
                    </p>

                </div>

                {/* SECTION: TAHAPAN SELEKSI */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <ClipboardList className="h-4.5 w-4.5 text-emerald-600" />
                        <h2 className="text-sm font-bold text-slate-800">
                            Tahapan Seleksi
                        </h2>
                    </div>

                    <div className="p-6 sm:p-8">

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {TAHAPAN_OPTIONS.map((item) => {
                                const Icon = item.icon;
                                const selected = tahapanSeleksi.includes(item.value);

                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => toggleTahapan(item.value)}
                                        disabled={saving}
                                        className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-center transition ${selected
                                            ? "border-emerald-500 bg-emerald-50"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                    >
                                        <div
                                            className={`flex h-9 w-9 items-center justify-center rounded-full ${selected
                                                ? "bg-emerald-500 text-white"
                                                : "bg-slate-100 text-slate-400"
                                                }`}
                                        >
                                            {selected ? (
                                                <CheckCircle2 className="h-4.5 w-4.5" />
                                            ) : (
                                                <Icon className="h-4.5 w-4.5" />
                                            )}
                                        </div>

                                        <span
                                            className={`text-xs font-semibold ${selected
                                                ? "text-emerald-700"
                                                : "text-slate-500"
                                                }`}
                                        >
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <p className="mt-4 text-xs text-slate-500">
                            Klik untuk memilih tahapan yang berlaku pada
                            lowongan ini.
                        </p>

                    </div>

                </div>

                {/* SECTION: DETAIL PEKERJAAN */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <FileText className="h-4.5 w-4.5 text-emerald-600" />
                        <h2 className="text-sm font-bold text-slate-800">
                            Detail Pekerjaan
                        </h2>
                        <span className="ml-auto text-xs font-medium text-slate-400">
                            Opsional
                        </span>
                    </div>

                    <div className="space-y-5 p-6 sm:p-8">

                        <div>
                            <label htmlFor="deskripsi" className={labelClass}>
                                Deskripsi Pekerjaan
                            </label>
                            <textarea
                                id="deskripsi"
                                rows={4}
                                placeholder="Jelaskan tanggung jawab dan gambaran pekerjaan ini..."
                                value={deskripsi}
                                onChange={(e) => setDeskripsi(e.target.value)}
                                disabled={saving}
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <div>
                            <label htmlFor="persyaratan" className={labelClass}>
                                Persyaratan / Kualifikasi
                            </label>
                            <textarea
                                id="persyaratan"
                                rows={4}
                                placeholder={
                                    "Tulis satu syarat per baris, contoh:\nMinimal S1\nPengalaman 1 tahun\nMenguasai Excel"
                                }
                                value={persyaratan}
                                onChange={(e) => setPersyaratan(e.target.value)}
                                disabled={saving}
                                className={`${inputClass} resize-none`}
                            />
                            <p className="mt-1.5 text-xs text-slate-500">
                                Satu baris = satu poin syarat, akan
                                ditampilkan sebagai daftar di halaman detail.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="tanggungJawab" className={labelClass}>
                                Tanggung Jawab
                            </label>
                            <textarea
                                id="tanggungJawab"
                                rows={4}
                                placeholder={
                                    "Tulis satu tanggung jawab per baris, contoh:\nMenyusun strategi pemasaran\nBerkoordinasi dengan tim sales"
                                }
                                value={tanggungJawab}
                                onChange={(e) => setTanggungJawab(e.target.value)}
                                disabled={saving}
                                className={`${inputClass} resize-none`}
                            />
                            <p className="mt-1.5 text-xs text-slate-500">
                                Satu baris = satu poin tanggung jawab.
                            </p>
                        </div>

                    </div>

                </div>

                {/* ACTIONS */}

                <div className="flex items-center gap-3 pb-4">

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Menyimpan..." : "Simpan Lowongan"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/hr/kelolalowongan")}
                        disabled={saving}
                        className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Batal
                    </button>

                </div>

            </form>
        </div>
    );
}