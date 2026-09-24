"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ConfirmDialog from "@/app/components/ConfirmDialog";
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
    XCircle,
    GraduationCap,
    Briefcase,
    Award,
    Search,
    ChevronDown,
    CheckCircle2,
    Hourglass,
    Ban,
    ArrowUpDown,
} from "lucide-react";

interface HRUser {
    id: number;
    nama: string;
    email: string;
    role: string;
}

type StatusLamaran = "DIPROSES" | "INTERVIEW" | "LOLOS" | "DITOLAK";

interface TahapanProgress {
    id: number;
    tahapan: string;
    urutan: number;
    selesaiPada: string | null;
}

interface Pelamar {
    id: number;
    status: StatusLamaran;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        nama: string;
        email: string;
        nik: string;
        alamat: string | null;
        noTelepon: string | null;
    };
    tahapanProgress: TahapanProgress[];
}

interface Lowongan {
    id: number;
    posisi: string;
    departemen: string;
    lokasi: string;
    tahapanSeleksi: string[];
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

    const [keyword, setKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("Semua");
    const [urutan, setUrutan] = useState<"terbaru" | "terlama">("terbaru");

    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [confirmAction, setConfirmAction] = useState<{
        type: "tahapan" | "tolak" | "batalkan";
        lamaranId: number;
        nama: string;
        tahapan?: string;
    } | null>(null);

    const [detailKandidat, setDetailKandidat] =
        useState<DetailKandidat | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // =====================================================
    // CEK LOGIN
    // =====================================================

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

    // =====================================================
    // AMBIL DATA
    // =====================================================

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

    useEffect(() => {
        if (hrUser) {
            getData();
        }
    }, [hrUser, id]);

    // =====================================================
    // SELESAIKAN TAHAPAN
    // =====================================================

    const eksekusiSelesaikanTahapan = async (
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

            setPelamar((prev) =>
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

    // =====================================================
    // TOLAK LAMARAN
    // =====================================================

    const eksekusiTolak = async (lamaranId: number) => {
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

            setPelamar((prev) =>
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

    // =====================================================
    // BATALKAN LAMARAN
    // =====================================================

    const eksekusiBatalkan = async (lamaranId: number) => {
        try {
            setProcessingId(lamaranId);

            const response = await fetch(`/api/lamaran/${lamaranId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal membatalkan lamaran");
            }

            setPelamar((prev) => prev.filter((item) => item.id !== lamaranId));

            if (expandedId === lamaranId) {
                setExpandedId(null);
            }
        } catch (error) {
            console.error("BATALKAN LAMARAN ERROR:", error);
            alert(
                error instanceof Error ? error.message : "Gagal membatalkan lamaran"
            );
        } finally {
            setProcessingId(null);
        }
    };

    // =====================================================
    // TRIGGER & KONFIRMASI
    // =====================================================

    const handleSelesaikanTahapan = (lamaranId: number, tahapan: string) => {
        const item = pelamar.find((p) => p.id === lamaranId);
        setConfirmAction({
            type: "tahapan",
            lamaranId,
            nama: item?.user.nama || "",
            tahapan,
        });
    };

    const handleTolak = (lamaranId: number, nama: string) => {
        setConfirmAction({ type: "tolak", lamaranId, nama });
    };

    const handleBatalkan = (lamaranId: number, nama: string) => {
        setConfirmAction({ type: "batalkan", lamaranId, nama });
    };

    const jalankanKonfirmasi = () => {
        if (!confirmAction) return;

        if (confirmAction.type === "tahapan" && confirmAction.tahapan) {
            eksekusiSelesaikanTahapan(confirmAction.lamaranId, confirmAction.tahapan);
        } else if (confirmAction.type === "tolak") {
            eksekusiTolak(confirmAction.lamaranId);
        } else if (confirmAction.type === "batalkan") {
            eksekusiBatalkan(confirmAction.lamaranId);
        }

        setConfirmAction(null);
    };

    // =====================================================
    // DETAIL KANDIDAT (MODAL)
    // =====================================================

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

    const tutupDetail = () => setDetailKandidat(null);

    const bukaBerkas = (userId: number) => {
        window.open(`/api/hr/kandidat/${userId}/pdf-gabungan`, "_blank");
    };

    // =====================================================
    // FILTER + SORT
    // =====================================================

    const kolomTahapan = useMemo(() => {
        if (!lowongan) return [];
        return [...lowongan.tahapanSeleksi].sort(
            (a, b) => TAHAPAN_URUTAN[a] - TAHAPAN_URUTAN[b]
        );
    }, [lowongan]);

    const filteredPelamar = useMemo(() => {
        const search = keyword.toLowerCase();

        let hasil = pelamar.filter((item) => {
            const cocokKeyword =
                item.user.nama.toLowerCase().includes(search) ||
                item.user.email.toLowerCase().includes(search);

            const cocokStatus =
                filterStatus === "Semua" || statusLabel[item.status] === filterStatus;

            return cocokKeyword && cocokStatus;
        });

        hasil = hasil.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return urutan === "terbaru" ? dateB - dateA : dateA - dateB;
        });

        return hasil;
    }, [pelamar, keyword, filterStatus, urutan]);

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

    if (!hrUser) return null;

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

                {/* FILTER */}

                <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="relative w-full sm:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email kandidat..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="Semua">Semua Status</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Interview">Interview</option>
                            <option value="Lolos">Lolos</option>
                            <option value="Ditolak">Ditolak</option>
                        </select>

                        <button
                            type="button"
                            onClick={() =>
                                setUrutan((prev) =>
                                    prev === "terbaru" ? "terlama" : "terbaru"
                                )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            <ArrowUpDown className="h-4 w-4" />
                            {urutan === "terbaru" ? "Terbaru" : "Terlama"}
                        </button>
                    </div>

                </div>

                {/* LIST (ACCORDION) */}

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    {loadingData ? (

                        <div className="flex flex-col items-center gap-3 px-6 py-16">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                            <span className="text-sm text-slate-500">
                                Memuat data pelamar...
                            </span>
                        </div>

                    ) : filteredPelamar.length === 0 ? (

                        <div className="px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Inbox className="h-7 w-7" strokeWidth={1.8} />
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-700">
                                Tidak ada pelamar yang cocok dengan pencarian/filter.
                            </p>
                        </div>

                    ) : (

                        <div className="divide-y divide-slate-100">

                            {filteredPelamar.map((item) => {
                                const isExpanded = expandedId === item.id;
                                const ditolak = item.status === "DITOLAK";

                                const tahapanBelumSelesai = [...item.tahapanProgress]
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .find((t) => t.selesaiPada === null);

                                return (
                                    <div key={item.id}>

                                        {/* ACCORDION HEADER */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedId(isExpanded ? null : item.id)
                                            }
                                            className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                                        >

                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                                                    {item.user.nama.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {item.user.nama}
                                                    </p>
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {item.user.email}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {item.user.noTelepon || "-"}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {item.user.alamat || "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-400">
                                                    {formatTanggal(item.createdAt)}
                                                </span>

                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge[item.status]}`}
                                                    >
                                                        {statusLabel[item.status]}
                                                    </span>

                                                    {item.status === "DITOLAK" && (
                                                        <span className="text-[10px] text-red-500">
                                                            {formatTanggal(item.updatedAt)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div
                                                    role="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        bukaDetail(item.user.id);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Detail
                                                </div>

                                                <div
                                                    role="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        bukaBerkas(item.user.id);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    Berkas
                                                </div>

                                                <ChevronDown
                                                    className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </div>

                                        </button>

                                        {/* ACCORDION BODY - TAHAPAN SELEKSI */}

                                        {isExpanded && (

                                            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5">

                                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Progress Tahapan Seleksi
                                                </p>

                                                <div className="flex flex-wrap items-center gap-3">

                                                    {kolomTahapan.map((tahapan) => {
                                                        const progress = item.tahapanProgress.find(
                                                            (t) => t.tahapan === tahapan
                                                        );
                                                        const selesai = progress?.selesaiPada;
                                                        const isTahapanSaatIni =
                                                            !ditolak &&
                                                            tahapanBelumSelesai?.tahapan === tahapan;

                                                        return (
                                                            <div
                                                                key={tahapan}
                                                                className="flex flex-col items-center gap-1.5"
                                                            >
                                                                {selesai ? (

                                                                    <button
                                                                        type="button"
                                                                        disabled
                                                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white"
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                    </button>

                                                                ) : ditolak && tahapanBelumSelesai?.tahapan === tahapan ? (

                                                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white">
                                                                        <XCircle className="h-4 w-4" />
                                                                    </span>

                                                                ) : ditolak ? (

                                                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                                                                        <XCircle className="h-4 w-4" />
                                                                    </span>

                                                                ) : isTahapanSaatIni ? (

                                                                    <button
                                                                        type="button"
                                                                        disabled={processingId === item.id}
                                                                        onClick={() =>
                                                                            handleSelesaikanTahapan(
                                                                                item.id,
                                                                                tahapan
                                                                            )
                                                                        }
                                                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition hover:bg-emerald-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                                        title={`Tandai ${TAHAPAN_LABEL[tahapan]} selesai`}
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                    </button>

                                                                ) : (

                                                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                                                                        <Hourglass className="h-4 w-4" />
                                                                    </span>

                                                                )}

                                                                <span className="text-center text-[11px] font-medium text-slate-600">
                                                                    {TAHAPAN_LABEL[tahapan]}
                                                                </span>

                                                                {selesai && (
                                                                    <span className="text-[10px] text-emerald-600">
                                                                        {formatTanggal(selesai)}
                                                                    </span>
                                                                )}

                                                                {ditolak && tahapanBelumSelesai?.tahapan === tahapan && (
                                                                    <span className="text-[10px] font-semibold text-red-500">
                                                                        Ditolak di sini
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}

                                                </div>

                                                <div className="mt-5 flex gap-2 border-t border-slate-200 pt-4">

                                                    <button
                                                        type="button"
                                                        disabled={ditolak || processingId === item.id}
                                                        onClick={() =>
                                                            handleTolak(item.id, item.user.nama)
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                        Tolak Lamaran
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={processingId === item.id}
                                                        onClick={() =>
                                                            handleBatalkan(item.id, item.user.nama)
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <Ban className="h-3.5 w-3.5" />
                                                        Batalkan Lamaran
                                                    </button>

                                                </div>

                                            </div>

                                        )}

                                    </div>
                                );
                            })}

                        </div>

                    )}

                </div>

            </main>

            {/* MODAL DETAIL KANDIDAT */}

            {detailKandidat && (

                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) tutupDetail();
                    }}
                >

                    <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

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

                        <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-6">

                            <div className="mb-6 flex items-start gap-2 text-sm text-slate-600">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                {detailKandidat.user.alamat || "Alamat belum diisi"}
                            </div>

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

            {/* CONFIRM DIALOG */}

            <ConfirmDialog
                open={confirmAction !== null}
                title={
                    confirmAction?.type === "tahapan"
                        ? `Tandai ${TAHAPAN_LABEL[confirmAction.tahapan || ""]} selesai?`
                        : confirmAction?.type === "tolak"
                            ? "Tolak Lamaran?"
                            : "Batalkan Lamaran?"
                }
                description={
                    confirmAction?.type === "tahapan"
                        ? `Kandidat "${confirmAction.nama}" akan lanjut ke tahapan berikutnya. Aksi ini tidak bisa dibatalkan.`
                        : confirmAction?.type === "tolak"
                            ? `Lamaran dari "${confirmAction?.nama}" akan ditandai Ditolak.`
                            : `Lamaran dari "${confirmAction?.nama}" akan dihapus permanen dari sistem.`
                }
                confirmText={
                    confirmAction?.type === "tahapan" ? "Ya, Selesaikan" : "Ya, Lanjutkan"
                }
                variant={confirmAction?.type === "tahapan" ? "default" : "danger"}
                loading={processingId === confirmAction?.lamaranId}
                onConfirm={jalankanKonfirmasi}
                onCancel={() => setConfirmAction(null)}
            />

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