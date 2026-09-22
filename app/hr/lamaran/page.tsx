"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Users,
    ClipboardList,
    CalendarCheck,
    CheckCircle2,
    Hourglass,
    Mail,
    FileText,
    X,
    Ban,
    Briefcase,
    MapPin,
} from "lucide-react";

interface User {
    id: number;
    nama: string;
    email: string;
    nik: string;
    role: string;
}

type StatusLamaran = "DIPROSES" | "INTERVIEW" | "LOLOS" | "DITOLAK";

interface TahapanProgress {
    id: number;
    tahapan: string;
    urutan: number;
    selesaiPada: string | null;
}

interface Lamaran {
    id: number;
    status: StatusLamaran;
    createdAt: string;
    user: {
        id: number;
        nama: string;
        email: string;
        nik: string;
    };
    lowongan: {
        id: number;
        posisi: string;
        departemen: string;
        lokasi: string;
        tipe: string;
        status: string;
        tahapanSeleksi: string[];
    };
    tahapanProgress: TahapanProgress[];
}

const TAHAPAN_URUTAN: Record<string, number> = {
    SCREENING: 1,
    ASSESSMENT: 2,
    INTERVIEW: 3,
    TECHNICAL_TEST: 4,
    MCU: 5,
    OFFERING: 6,
};

const TAHAPAN_LABEL: Record<string, string> = {
    SCREENING: "Screening",
    ASSESSMENT: "Assessment",
    INTERVIEW: "Interview",
    TECHNICAL_TEST: "Technical Test",
    MCU: "MCU",
    OFFERING: "Offering",
};

const statusLabel: Record<StatusLamaran, string> = {
    DIPROSES: "Diproses",
    INTERVIEW: "Interview",
    LOLOS: "Lolos",
    DITOLAK: "Ditolak",
};

type GroupedLamaran = {
    lowongan: Lamaran["lowongan"];
    items: Lamaran[];
};

const statusBadge: Record<StatusLamaran, string> = {
    DIPROSES: "bg-amber-100 text-amber-700",
    INTERVIEW: "bg-blue-100 text-blue-700",
    LOLOS: "bg-emerald-100 text-emerald-700",
    DITOLAK: "bg-red-100 text-red-700",
};

export default function LamaranMasukPage() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [lamaran, setLamaran] = useState<Lamaran[]>([]);
    const [loadingLamaran, setLoadingLamaran] = useState(true);

    const [keyword, setKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("Semua");

    const [processingId, setProcessingId] = useState<number | null>(null);

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

                setUser(data.user);
            } catch (error) {
                console.error("GET USER ERROR:", error);
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        getUser();
    }, [router]);

    const getLamaran = async () => {
        try {
            setLoadingLamaran(true);

            const response = await fetch("/api/lamaran");

            if (!response.ok) {
                throw new Error("Gagal mengambil data lamaran");
            }

            const data = await response.json();

            setLamaran(data);
        } catch (error) {
            console.error("GET LAMARAN ERROR:", error);
            alert("Gagal mengambil data lamaran");
        } finally {
            setLoadingLamaran(false);
        }
    };

    useEffect(() => {
        if (user) {
            getLamaran();
        }
    }, [user]);

    const handleSelesaikanTahapan = async (
        lamaranId: number,
        tahapan: string
    ) => {
        if (processingId) return;

        try {
            setProcessingId(lamaranId);

            const response = await fetch(`/api/lamaran/${lamaranId}/tahapan`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tahapan }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal memperbarui tahapan");
            }

            setLamaran((prev) =>
                prev.map((item) =>
                    item.id === lamaranId
                        ? {
                            ...item,
                            status: data.status,
                            tahapanProgress: data.tahapanProgress,
                        }
                        : item
                )
            );
        } catch (error) {
            console.error("SELESAIKAN TAHAPAN ERROR:", error);
            alert(
                error instanceof Error ? error.message : "Gagal memperbarui tahapan"
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleTolak = async (lamaranId: number, nama: string) => {
        const confirmReject = window.confirm(
            `Yakin ingin menolak lamaran dari "${nama}"?`
        );

        if (!confirmReject) return;

        try {
            setProcessingId(lamaranId);

            const response = await fetch(`/api/lamaran/${lamaranId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "DITOLAK" }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal menolak lamaran");
            }

            setLamaran((prev) =>
                prev.map((item) =>
                    item.id === lamaranId
                        ? { ...item, status: "DITOLAK" as StatusLamaran }
                        : item
                )
            );
        } catch (error) {
            console.error("TOLAK LAMARAN ERROR:", error);
            alert(error instanceof Error ? error.message : "Gagal menolak lamaran");
        } finally {
            setProcessingId(null);
        }
    };

    const handleBatalkan = async (lamaranId: number, nama: string) => {
        const confirmCancel = window.confirm(
            `Yakin ingin membatalkan/menghapus lamaran dari "${nama}"? Tindakan ini tidak bisa dibatalkan.`
        );

        if (!confirmCancel) return;

        try {
            setProcessingId(lamaranId);

            const response = await fetch(`/api/lamaran/${lamaranId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal membatalkan lamaran");
            }

            setLamaran((prev) => prev.filter((item) => item.id !== lamaranId));
        } catch (error) {
            console.error("BATALKAN LAMARAN ERROR:", error);
            alert(
                error instanceof Error ? error.message : "Gagal membatalkan lamaran"
            );
        } finally {
            setProcessingId(null);
        }
    };

    const filteredLamaran = lamaran.filter((item) => {
        const search = keyword.toLowerCase();

        const cocokKeyword =
            item.user.nama.toLowerCase().includes(search) ||
            item.lowongan.posisi.toLowerCase().includes(search) ||
            item.lowongan.departemen.toLowerCase().includes(search);

        const cocokStatus =
            filterStatus === "Semua" || statusLabel[item.status] === filterStatus;

        return cocokKeyword && cocokStatus;
    });

    const grouped = useMemo(() => {
        const map: Record<number, GroupedLamaran> = {};

        filteredLamaran.forEach((item) => {
            const key = item.lowongan.id;

            if (!map[key]) {
                map[key] = { lowongan: item.lowongan, items: [] };
            }

            map[key].items.push(item);
        });

        return Object.values(map);
    }, [filteredLamaran]);

    const jumlah = (status: StatusLamaran) =>
        lamaran.filter((item) => item.status === status).length;

    const formatTanggal = (date: string) => {
        return new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
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

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white px-6 py-5 md:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                            Lamaran Masuk
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Kelola progres seleksi kandidat per lowongan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                            {user.nama.charAt(0).toUpperCase()}
                        </div>
                        <div className="leading-tight">
                            <p className="text-sm font-semibold text-slate-800">
                                {user.nama}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Human Resources</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <Users className="h-6 w-6" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Total Lamaran
                                </p>
                                <p className="mt-1 text-2xl font-bold text-slate-800">
                                    {lamaran.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                <ClipboardList className="h-6 w-6" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Diproses
                                </p>
                                <p className="mt-1 text-2xl font-bold text-slate-800">
                                    {jumlah("DIPROSES")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                <CalendarCheck className="h-6 w-6" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Interview
                                </p>
                                <p className="mt-1 text-2xl font-bold text-slate-800">
                                    {jumlah("INTERVIEW")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                <CheckCircle2 className="h-6 w-6" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Lolos</p>
                                <p className="mt-1 text-2xl font-bold text-slate-800">
                                    {jumlah("LOLOS")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama kandidat atau posisi..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:w-48"
                    >
                        <option value="Semua">Semua Status</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Interview">Interview</option>
                        <option value="Lolos">Lolos</option>
                        <option value="Ditolak">Ditolak</option>
                    </select>
                </div>

                {loadingLamaran ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-16">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                        <span className="text-sm text-slate-500">
                            Memuat data lamaran...
                        </span>
                    </div>
                ) : grouped.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <ClipboardList className="h-7 w-7" strokeWidth={1.8} />
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-700">
                            Belum ada lamaran yang masuk.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {grouped.map((group) => {
                            const kolomTahapan = [...group.lowongan.tahapanSeleksi].sort(
                                (a, b) => TAHAPAN_URUTAN[a] - TAHAPAN_URUTAN[b]
                            );

                            return (
                                <div
                                    key={group.lowongan.id}
                                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                                <Briefcase className="h-5 w-5" strokeWidth={2} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800">
                                                    {group.lowongan.posisi}
                                                </h3>
                                                <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                                                    <span>{group.lowongan.departemen}</span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {group.lowongan.lokasi}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                            {group.items.length} pelamar
                                        </span>
                                    </div>

                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="border-b border-slate-100 bg-slate-50/60">
                                                <tr>
                                                    <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                        Kandidat
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                        Status
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                        Submitted
                                                    </th>

                                                    {kolomTahapan.map((tahapan) => (
                                                        <th
                                                            key={tahapan}
                                                            className="whitespace-nowrap px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                                                        >
                                                            {TAHAPAN_LABEL[tahapan]}
                                                        </th>
                                                    ))}

                                                    <th className="whitespace-nowrap px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                        Opsi
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100">
                                                {group.items.map((item) => {
                                                    const ditolak = item.status === "DITOLAK";

                                                    const tahapanBelumSelesai = [...item.tahapanProgress]
                                                        .sort((a, b) => a.urutan - b.urutan)
                                                        .find((t) => t.selesaiPada === null);

                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className="transition hover:bg-slate-50/60"
                                                        >
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                                                                        {item.user.nama.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-sm font-semibold text-slate-800">
                                                                            {item.user.nama}
                                                                        </p>
                                                                        <p className="truncate text-xs text-slate-500">
                                                                            {item.user.email}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-4">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge[item.status]}`}
                                                                >
                                                                    {statusLabel[item.status]}
                                                                </span>
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                                                                {formatTanggal(item.createdAt)}
                                                            </td>

                                                            {kolomTahapan.map((tahapan) => {
                                                                const progress = item.tahapanProgress.find(
                                                                    (t) => t.tahapan === tahapan
                                                                );

                                                                const selesai = progress?.selesaiPada;
                                                                const isTahapanSaatIni =
                                                                    !ditolak &&
                                                                    tahapanBelumSelesai?.tahapan === tahapan;

                                                                return (
                                                                    <td
                                                                        key={tahapan}
                                                                        className="whitespace-nowrap px-4 py-4 text-center"
                                                                    >
                                                                        {selesai ? (
                                                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                                {formatTanggal(selesai)}
                                                                            </span>
                                                                        ) : isTahapanSaatIni ? (
                                                                            <button
                                                                                type="button"
                                                                                title={`Tandai ${TAHAPAN_LABEL[tahapan]} selesai`}
                                                                                disabled={processingId === item.id}
                                                                                onClick={() =>
                                                                                    handleSelesaikanTahapan(
                                                                                        item.id,
                                                                                        tahapan
                                                                                    )
                                                                                }
                                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                                            >
                                                                                <CheckCircle2 className="h-4 w-4" />
                                                                            </button>
                                                                        ) : (
                                                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                                                                                <Hourglass className="h-4 w-4" />
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}

                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        title="Kirim email (segera hadir)"
                                                                        disabled
                                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
                                                                    >
                                                                        <Mail className="h-3.5 w-3.5" />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        title="Lihat dokumen (segera hadir)"
                                                                        disabled
                                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
                                                                    >
                                                                        <FileText className="h-3.5 w-3.5" />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        title="Tolak lamaran"
                                                                        disabled={
                                                                            ditolak || processingId === item.id
                                                                        }
                                                                        onClick={() =>
                                                                            handleTolak(item.id, item.user.nama)
                                                                        }
                                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        title="Batalkan lamaran"
                                                                        disabled={processingId === item.id}
                                                                        onClick={() =>
                                                                            handleBatalkan(item.id, item.user.nama)
                                                                        }
                                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                                    >
                                                                        <Ban className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}