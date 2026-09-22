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
                                                <button
                                                    type="button"
                                                    onClick={() => bukaBerkas(item.user.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    Lihat Berkas
                                                </button>
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>
                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}