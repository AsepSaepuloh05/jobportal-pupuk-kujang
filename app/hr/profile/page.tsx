"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Camera,
    Lock,
    Mail,
    Fingerprint,
    ShieldCheck,
    CalendarDays,
    Phone,
    KeyRound,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

interface Profil {
    id: number;
    nama: string;
    email: string;
    nik: string;
    role: string;
    noTelepon: string | null;
    createdAt: string;
    fotoPath: string | null;
}

interface Pesan {
    type: "sukses" | "error";
    text: string;
}

function PesanBox({ pesan }: { pesan: Pesan | null }) {
    if (!pesan) return null;

    const sukses = pesan.type === "sukses";

    return (
        <div
            className={
                "mb-4 flex items-start gap-2 rounded-lg border px-3.5 py-3 text-sm font-medium " +
                (sukses
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700")
            }
        >
            {sukses ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{pesan.text}</span>
        </div>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                </p>
                <p className="truncate text-sm font-medium text-slate-700">{value}</p>
            </div>
        </div>
    );
}

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-50 disabled:text-slate-400";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export default function ProfilHRPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profil, setProfil] = useState<Profil | null>(null);
    const [loading, setLoading] = useState(true);

    const [nama, setNama] = useState("");
    const [noTelepon, setNoTelepon] = useState("");
    const [savingProfil, setSavingProfil] = useState(false);
    const [pesanProfil, setPesanProfil] = useState<Pesan | null>(null);

    const [uploadingFoto, setUploadingFoto] = useState(false);
    const [pesanFoto, setPesanFoto] = useState<Pesan | null>(null);

    const [passwordLama, setPasswordLama] = useState("");
    const [passwordBaru, setPasswordBaru] = useState("");
    const [konfirmasi, setKonfirmasi] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [pesanPassword, setPesanPassword] = useState<Pesan | null>(null);

    useEffect(() => {
        const getProfil = async () => {
            try {
                const response = await fetch("/api/hr/profile", {
                    cache: "no-store",
                });

                if (response.status === 401 || response.status === 403) {
                    router.replace("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error("Gagal mengambil data profil");
                }

                const data = await response.json();

                setProfil(data);
                setNama(data.nama);
                setNoTelepon(data.noTelepon || "");
            } catch (error) {
                console.error("GET PROFIL ERROR:", error);
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        getProfil();
    }, [router]);

    const profilBerubah =
        profil !== null &&
        (nama.trim() !== profil.nama ||
            noTelepon.trim() !== (profil.noTelepon || ""));

    const handleSimpanProfil = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (savingProfil) return;

        if (!nama.trim()) {
            setPesanProfil({ type: "error", text: "Nama wajib diisi" });
            return;
        }

        setSavingProfil(true);
        setPesanProfil(null);

        try {
            const response = await fetch("/api/hr/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama, noTelepon }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal menyimpan profil");
            }

            setProfil(data);
            setNama(data.nama);
            setNoTelepon(data.noTelepon || "");
            setPesanProfil({ type: "sukses", text: "Profil berhasil diperbarui" });

            window.dispatchEvent(new Event("hr-profile-updated"));
        } catch (error) {
            console.error("SIMPAN PROFIL ERROR:", error);
            setPesanProfil({
                type: "error",
                text:
                    error instanceof Error ? error.message : "Gagal menyimpan profil",
            });
        } finally {
            setSavingProfil(false);
        }
    };

    const handlePilihFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        e.target.value = "";

        if (!file) return;

        setPesanFoto(null);

        if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
            setPesanFoto({ type: "error", text: "Format foto harus JPG atau PNG" });
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setPesanFoto({ type: "error", text: "Ukuran foto maksimal 2 MB" });
            return;
        }

        setUploadingFoto(true);

        try {
            const formData = new FormData();
            formData.append("foto", file);

            const response = await fetch("/api/profil/foto", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Gagal mengunggah foto");
            }

            setProfil((prev) =>
                prev ? { ...prev, fotoPath: data.fotoProfil } : prev
            );
            setPesanFoto({ type: "sukses", text: "Foto profil berhasil diperbarui" });

            window.dispatchEvent(new Event("hr-profile-updated"));
        } catch (error) {
            console.error("UPLOAD FOTO ERROR:", error);
            setPesanFoto({
                type: "error",
                text:
                    error instanceof Error ? error.message : "Gagal mengunggah foto",
            });
        } finally {
            setUploadingFoto(false);
        }
    };

    const handleGantiPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (savingPassword) return;

        setPesanPassword(null);

        if (passwordBaru.length < 8) {
            setPesanPassword({
                type: "error",
                text: "Password baru minimal 8 karakter",
            });
            return;
        }

        if (passwordBaru !== konfirmasi) {
            setPesanPassword({
                type: "error",
                text: "Konfirmasi password tidak sama dengan password baru",
            });
            return;
        }

        setSavingPassword(true);

        try {
            const response = await fetch("/api/hr/profile/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passwordLama, passwordBaru }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal mengubah password");
            }

            setPasswordLama("");
            setPasswordBaru("");
            setKonfirmasi("");
            setPesanPassword({ type: "sukses", text: "Password berhasil diubah" });
        } catch (error) {
            console.error("GANTI PASSWORD ERROR:", error);
            setPesanPassword({
                type: "error",
                text:
                    error instanceof Error ? error.message : "Gagal mengubah password",
            });
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                    <p className="text-sm font-medium text-slate-500">
                        Memuat profil...
                    </p>
                </div>
            </div>
        );
    }

    if (!profil) {
        return null;
    }

    const tanggalBergabung = new Date(profil.createdAt).toLocaleDateString(
        "id-ID",
        { day: "2-digit", month: "long", year: "numeric" }
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-800">Profil Saya</h1>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Kelola informasi akun dan keamanan kamu.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">

                    {/* KARTU FOTO */}

                    <aside>
                        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">

                            <div className="relative mx-auto h-28 w-28">
                                {profil.fotoPath ? (
                                    <img
                                        src={profil.fotoPath}
                                        alt="Foto profil"
                                        className="h-28 w-28 rounded-full object-cover ring-4 ring-emerald-100"
                                    />
                                ) : (
                                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 text-4xl font-bold text-emerald-700 ring-4 ring-emerald-50">
                                        {profil.nama.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingFoto}
                                    title="Ganti foto"
                                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    onChange={handlePilihFoto}
                                    className="hidden"
                                />
                            </div>

                            <h2 className="mt-4 text-base font-bold text-slate-800">
                                {profil.nama}
                            </h2>
                            <span className="mt-1.5 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Human Resources
                            </span>

                            <p className="mt-4 text-xs text-slate-400">
                                {uploadingFoto
                                    ? "Mengunggah foto..."
                                    : "JPG atau PNG, maksimal 2 MB"}
                            </p>

                            <div className="mt-3 text-left">
                                <PesanBox pesan={pesanFoto} />
                            </div>

                        </div>
                    </aside>

                    <div className="space-y-6">

                        {/* INFORMASI AKUN (READ-ONLY) */}

                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">
                                        Informasi Akun
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Data ini tidak dapat diubah sendiri.
                                    </p>
                                </div>
                                <Lock className="h-4 w-4 text-slate-300" />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <InfoRow icon={Mail} label="Email" value={profil.email} />
                                <InfoRow icon={Fingerprint} label="NIK" value={profil.nik} />
                                <InfoRow
                                    icon={ShieldCheck}
                                    label="Peran"
                                    value="Human Resources"
                                />
                                <InfoRow
                                    icon={CalendarDays}
                                    label="Akun dibuat"
                                    value={tanggalBergabung}
                                />
                            </div>
                        </section>

                        {/* DATA DIRI */}

                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800">Data Diri</h3>
                            <p className="mb-4 mt-0.5 text-xs text-slate-500">
                                Nama dan nomor telepon yang bisa kamu perbarui.
                            </p>

                            <PesanBox pesan={pesanProfil} />

                            <form onSubmit={handleSimpanProfil} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="nama" className={labelClass}>
                                            Nama Lengkap
                                        </label>
                                        <input
                                            id="nama"
                                            type="text"
                                            value={nama}
                                            onChange={(e) => setNama(e.target.value)}
                                            disabled={savingProfil}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="noTelepon" className={labelClass}>
                                            Nomor Telepon
                                        </label>
                                        <div className="relative">
                                            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                id="noTelepon"
                                                type="tel"
                                                placeholder="Contoh: 081234567890"
                                                value={noTelepon}
                                                onChange={(e) => setNoTelepon(e.target.value)}
                                                disabled={savingProfil}
                                                className={inputClass + " pl-10"}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingProfil || !profilBerubah}
                                    className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {savingProfil ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </form>
                        </section>

                        {/* GANTI PASSWORD */}

                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                        <KeyRound className="h-4 w-4 text-emerald-600" />
                                        Ganti Password
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Gunakan password yang kuat, minimal 8 karakter.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-3.5 w-3.5" />
                                    ) : (
                                        <Eye className="h-3.5 w-3.5" />
                                    )}
                                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                                </button>
                            </div>

                            <PesanBox pesan={pesanPassword} />

                            <form onSubmit={handleGantiPassword} className="space-y-4">
                                <div>
                                    <label htmlFor="passwordLama" className={labelClass}>
                                        Password Lama
                                    </label>
                                    <input
                                        id="passwordLama"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={passwordLama}
                                        onChange={(e) => setPasswordLama(e.target.value)}
                                        disabled={savingPassword}
                                        className={inputClass}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="passwordBaru" className={labelClass}>
                                            Password Baru
                                        </label>
                                        <input
                                            id="passwordBaru"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            value={passwordBaru}
                                            onChange={(e) => setPasswordBaru(e.target.value)}
                                            disabled={savingPassword}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="konfirmasi" className={labelClass}>
                                            Konfirmasi Password Baru
                                        </label>
                                        <input
                                            id="konfirmasi"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            value={konfirmasi}
                                            onChange={(e) => setKonfirmasi(e.target.value)}
                                            disabled={savingPassword}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        savingPassword ||
                                        !passwordLama ||
                                        !passwordBaru ||
                                        !konfirmasi
                                    }
                                    className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {savingPassword ? "Menyimpan..." : "Ubah Password"}
                                </button>
                            </form>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}