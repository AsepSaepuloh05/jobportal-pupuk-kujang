"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Users,
    Mail,
    Phone,
    MapPin,
    FileText,
    Inbox,
    Eye,
    X,
    GraduationCap,
    Briefcase,
    Award,
} from "lucide-react";

interface HRUser {
    id: number;
    nama: string;
    email: string;
    role: string;
}

type StatusLamaran = "DIPROSES" | "INTERVIEW" | "LOLOS" | "DITOLAK";

interface Pelamar {
    id: number;
    status: StatusLamaran;
    createdAt: string;
    user: {
        id: number;
        nama: string;
        email: string;
        nik: string;
        alamat: string | null;
        noTelepon: string | null;
    };
}

interface Lowongan {
    id: number;
    posisi: string;
    departemen: string;
    lokasi: string;
}

interface DetailKandidat {
    user: {
        id: number;
        nama: string;
        email: string;
        nik: string;
        alamat: string | null;
        noTelepon: string | null;
    };
    pendidikan: {
        id: number;
        jenjang: string;
        institusi: string;
        jurusan: string;
        tahunMulai: string;
        tahunSelesai: string;
        nilai: string | null;
    }[];
    pengalaman: {
        id: number;
        posisi: string;
        perusahaan: string;
        lokasi: string | null;
        tahunMulai: string;
        tahunSelesai: string | null;
        deskripsi: string | null;
    }[];
    sertifikasi: {
        id: number;
        nama: string;
        penerbit: string;
        nomor: string | null;
        tanggalTerbit: string | null;
    }[];
}

const statusLabel: Record<StatusLamaran, string> = {
    DIPROSES: "Diproses",
    INTERVIEW: "Interview",
    LOLOS: "Lolos",
    DITOLAK: "Ditolak",
};

const statusBadge: Record<StatusLamaran, string> = {
    DIPROSES: "bg-amber-100 text-amber-700",
    INTERVIEW: "bg-blue-100 text-blue-700",
    LOLOS: "bg-emerald-100 text-emerald-700",
    DITOLAK: "bg-red-100 text-red-700",
};

export default function PelamarLowonganPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [hrUser, setHrUser] = useState<HRUser | null>(null);
    const [loading, setLoading] = useState(true);

    const [lowongan, setLowongan] = useState<Lowongan | null>(null);
    const [pelamar, setPelamar] = useState<Pelamar[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const [detailKandidat, setDetailKandidat] = useState<DetailKandidat | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);



    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await fetch("/api/me");

                if (!response.ok) {
                    router.replace("/login");
                    return;
                }

                const data = await response.json();

                if (!data.user || data.user.role !== "HR") {
                    router.replace("/login");
                    return;
                }

                setHrUser(data.user);
            } catch (error) {
                console.error("GET USER ERROR:", error);
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        getUser();
    }, [router]);

    useEffect(() => {
        if (!hrUser) return;

        const getData = async () => {
            try {
                setLoadingData(true);

                const [lowonganRes, pelamarRes] = await Promise.all([
                    fetch(`/api/lowongan/${id}`),
                    fetch(`/api/lamaran?lowonganId=${id}`),
                ]);

                if (lowonganRes.ok) {
                    setLowongan(await lowonganRes.json());
                }

                if (pelamarRes.ok) {
                    setPelamar(await pelamarRes.json());
                }
            } catch (error) {
                console.error("GET DATA PELAMAR ERROR:", error);
            } finally {
                setLoadingData(false);
            }
        };

        getData();
    }, [hrUser, id]);

    const bukaBerkas = (userId: number) => {
        window.open(`/api/hr/kandidat/${userId}/pdf-gabungan`, "_blank");
    };

    const bukaDetail = async (userId: number) => {
        try {
            setLoadingDetail(true);

            const response = await fetch(`/api/hr/kandidat/${userId}/detail`);

            if (!response.ok) {
                throw new Error("Gagal mengambil detail kandidat");
            }

            const data = await response.json();
            setDetailKandidat(data);
        } catch (error) {
            console.error("GET DETAIL ERROR:", error);
            alert("Gagal mengambil detail kandidat");
        } finally {
            setLoadingDetail(false);
        }
    };

    const tutupDetail = () => {
        setDetailKandidat(null);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                    <p className="text-sm font-medium text-slate-500">
                        Memuat halaman...
                    </p>
                </div>
            </div>
        );
    }

    if (!hrUser) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50">

            <header className="border-b border-slate-200 bg-white px-6 py-5 md:px-8">
                <div className="flex items-center gap-4">

                    <button
                        type="button"
                        onClick={() => router.push("/hr/kelolalowongan")}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4.5 w-4.5" />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">
                            Daftar Pelamar
                        </h1>
                        {lowongan && (
                            <p className="mt-0.5 text-sm text-slate-500">
                                {lowongan.posisi} &middot; {lowongan.departemen} &middot;{" "}
                                {lowongan.lokasi}
                            </p>
                        )}
                    </div>

                </div>
            </header>

            <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

                <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <Users className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            Total Pelamar
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-800">
                            {pelamar.length}
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    {loadingData ? (

                        <div className="flex flex-col items-center gap-3 px-6 py-16">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                            <span className="text-sm text-slate-500">
                                Memuat data pelamar...
                            </span>
                        </div>

                    ) : pelamar.length === 0 ? (

                        <div className="px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Inbox className="h-7 w-7" strokeWidth={1.8} />
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-700">
                                Belum ada yang melamar ke lowongan ini.
                            </p>
                        </div>

                    ) : (

                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left">

                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Kandidat
                                        </th>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Kontak
                                        </th>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Domisili
                                        </th>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>
                                        <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Berkas
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                    {pelamar.map((item) => (

                                        <tr key={item.id} className="transition hover:bg-slate-50">

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                                                        {item.user.nama.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {item.user.nama}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            NIK {item.user.nik}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="space-y-1 text-xs text-slate-600">
                                                    <span className="flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                        {item.user.email}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                        {item.user.noTelepon || "-"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                <span className="flex items-start gap-1.5">
                                                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                    {item.user.alamat || "-"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge[item.status]}`}
                                                >
                                                    {statusLabel[item.status]}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => bukaDetail(item.user.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Detail
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => bukaBerkas(item.user.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        Berkas
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>
                        </div>

                    )}

                </div>

            </main>

            {/* MODAL DETAIL KANDIDAT */}

            {detailKandidat && (

                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            tutupDetail();
                        }
                    }}
                >

                    <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* HEADER */}

                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-6">

                            <div className="relative flex items-start justify-between gap-4">

                                <div className="flex items-start gap-4">

                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold text-white ring-1 ring-white/25">
                                        {detailKandidat.user.nama.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            {detailKandidat.user.nama}
                                        </h2>

                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-emerald-50">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Mail className="h-3.5 w-3.5" />
                                                {detailKandidat.user.email}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Phone className="h-3.5 w-3.5" />
                                                {detailKandidat.user.noTelepon || "-"}
                                            </span>
                                        </div>
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={tutupDetail}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-emerald-50 transition hover:bg-white/15"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                        </div>

                        {/* CONTENT */}

                        <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-6">

                            <div className="mb-6 flex items-start gap-2 text-sm text-slate-600">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                {detailKandidat.user.alamat || "Alamat belum diisi"}
                            </div>

                            {/* PENDIDIKAN */}

                            <div className="mb-7">
                                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
                                    <GraduationCap className="h-4.5 w-4.5 text-emerald-600" />
                                    Pendidikan
                                </h3>

                                {detailKandidat.pendidikan.length === 0 ? (
                                    <p className="text-sm italic text-slate-400">
                                        Belum ada riwayat pendidikan.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {detailKandidat.pendidikan.map((p) => (
                                            <div
                                                key={p.id}
                                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {p.jenjang} - {p.institusi}
                                                    </p>
                                                    <span className="whitespace-nowrap text-xs text-slate-500">
                                                        {p.tahunMulai} - {p.tahunSelesai}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-600">
                                                    {p.jurusan}
                                                    {p.nilai && ` · IPK/Nilai: ${p.nilai}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* PENGALAMAN */}

                            <div className="mb-7">
                                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
                                    <Briefcase className="h-4.5 w-4.5 text-emerald-600" />
                                    Pengalaman Kerja
                                </h3>

                                {detailKandidat.pengalaman.length === 0 ? (
                                    <p className="text-sm italic text-slate-400">
                                        Belum ada riwayat pengalaman kerja.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {detailKandidat.pengalaman.map((p) => (
                                            <div
                                                key={p.id}
                                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {p.posisi} - {p.perusahaan}
                                                    </p>
                                                    <span className="whitespace-nowrap text-xs text-slate-500">
                                                        {p.tahunMulai} - {p.tahunSelesai || "Sekarang"}
                                                    </span>
                                                </div>
                                                {p.lokasi && (
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {p.lokasi}
                                                    </p>
                                                )}
                                                {p.deskripsi && (
                                                    <p className="mt-2 text-xs leading-6 text-slate-600">
                                                        {p.deskripsi}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* SERTIFIKASI */}

                            <div>
                                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
                                    <Award className="h-4.5 w-4.5 text-emerald-600" />
                                    Sertifikasi
                                </h3>

                                {detailKandidat.sertifikasi.length === 0 ? (
                                    <p className="text-sm italic text-slate-400">
                                        Belum ada sertifikasi.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {detailKandidat.sertifikasi.map((s) => (
                                            <div
                                                key={s.id}
                                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <p className="text-sm font-bold text-slate-800">
                                                    {s.nama}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-600">
                                                    {s.penerbit}
                                                    {s.tanggalTerbit && ` · ${s.tanggalTerbit}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                    </div>

                </div>

            )}

            {/* LOADING DETAIL OVERLAY */}

            {loadingDetail && !detailKandidat && (

                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-xl">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                        <span className="text-sm font-medium text-slate-700">
                            Memuat detail kandidat...
                        </span>
                    </div>
                </div>

            )}

        </div>
    );
}