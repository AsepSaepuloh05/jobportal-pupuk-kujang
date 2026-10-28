"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import JadwalModal from "@/app/components/JadwalModal";
import EmailBebasModal from "@/app/components/EmailBebasModal";
import EmailHistoryModal from "@/app/components/EmailHistoryModal";
import TahapanStepper from "@/app/components/TahapanStepper";
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
    Search,
    ChevronDown,
    CheckCircle2,
    Hourglass,
    Ban,
    ArrowUpDown,
    CalendarClock,
    Send,
    History,
    Download,
    Check,
    Minus,
} from "lucide-react";
import { toast } from "@/app/components/Toast";
import Pagination from "@/app/components/Pagination";
import { eksporExcel, tanggalExcel, teksTanggalJam, stempelFile } from "@/lib/export-excel";
import type { KolomExcel, BarisExcel } from "@/lib/export-excel";

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
    jadwalTanggal: string | null;
    jadwalLokasi: string | null;
    jadwalCatatan: string | null;
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

const TAHAPAN_BADGE: Record<string, string> = {
    SCREENING: "bg-slate-100 text-slate-700",
    ASSESSMENT: "bg-purple-100 text-purple-700",
    INTERVIEW: "bg-blue-100 text-blue-700",
    TECHNICAL_TEST: "bg-cyan-100 text-cyan-700",
    MCU: "bg-orange-100 text-orange-700",
    OFFERING: "bg-pink-100 text-pink-700",
};

interface BarisMasalah {
    nama: string;
    alasan: string;
}

interface RingkasanMassal {
    berhasil: number;
    gagal: BarisMasalah[];
    peringatan: BarisMasalah[];
}

interface HasilMassal extends RingkasanMassal {
    judul: string;
    dilewati: number;
}


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
    const [urutan, setUrutan] = useState<"terbaru" | "terlama" | "nama-asc" | "nama-desc">("terbaru");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [exporting, setExporting] = useState(false);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState<"tolak" | "email" | null>(null);
    const [bulkEmail, setBulkEmail] = useState(true);
    const [bulkRunning, setBulkRunning] = useState(false);
    const [bulkProgress, setBulkProgress] = useState<{ selesai: number; total: number } | null>(null);
    const [bulkHasil, setBulkHasil] = useState<HasilMassal | null>(null);

    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const [detailKandidat, setDetailKandidat] =
        useState<DetailKandidat | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [confirmAction, setConfirmAction] = useState<{
        type: "tahapan" | "tolak" | "batalkan";
        lamaranId: number;
        nama: string;
        tahapan?: string;
    } | null>(null);
    const [kirimEmailConfirm, setKirimEmailConfirm] = useState(true);

    const [jadwalTarget, setJadwalTarget] = useState<{
        lamaranId: number;
        tahapan: string;
    } | null>(null);
    const [savingJadwal, setSavingJadwal] = useState(false);

    const [emailTarget, setEmailTarget] = useState<{
        lamaranId: number;
        nama: string;
    } | null>(null);
    const [sendingEmail, setSendingEmail] = useState(false);

    const [historyTarget, setHistoryTarget] = useState<{
        lamaranId: number;
        nama: string;
    } | null>(null);

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

    const eksekusiSelesaikanTahapan = async (
        lamaranId: number,
        tahapan: string,
        kirimEmail: boolean
    ) => {
        if (processingId) return;

        try {
            setProcessingId(lamaranId);

            const response = await fetch(`/api/lamaran/${lamaranId}/tahapan`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tahapan, kirimEmail }),
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
                            status: data.lamaran.status,
                            tahapanProgress: data.lamaran.tahapanProgress,
                        }
                        : item
                )
            );
        } catch (error) {
            console.error("SELESAIKAN TAHAPAN ERROR:", error);
            toast.error(
                error instanceof Error ? error.message : "Gagal memperbarui tahapan"
            );
        } finally {
            setProcessingId(null);
        }
    };

    const eksekusiTolak = async (lamaranId: number, kirimEmail: boolean) => {
        try {
            setProcessingId(lamaranId);

            const response = await fetch(`/api/lamaran/${lamaranId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "DITOLAK", kirimEmail }),
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
            toast.error(error instanceof Error ? error.message : "Gagal menolak lamaran");
        } finally {
            setProcessingId(null);
        }
    };

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
            toast.error(
                error instanceof Error ? error.message : "Gagal membatalkan lamaran"
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleSelesaikanTahapan = (lamaranId: number, tahapan: string) => {
        const item = pelamar.find((p) => p.id === lamaranId);
        setKirimEmailConfirm(true);
        setConfirmAction({
            type: "tahapan",
            lamaranId,
            nama: item?.user.nama || "",
            tahapan,
        });
    };

    const handleTolak = (lamaranId: number, nama: string) => {
        setKirimEmailConfirm(true);
        setConfirmAction({ type: "tolak", lamaranId, nama });
    };

    const handleBatalkan = (lamaranId: number, nama: string) => {
        setConfirmAction({ type: "batalkan", lamaranId, nama });
    };

    const jalankanKonfirmasi = () => {
        if (!confirmAction) return;

        if (confirmAction.type === "tahapan" && confirmAction.tahapan) {
            eksekusiSelesaikanTahapan(
                confirmAction.lamaranId,
                confirmAction.tahapan,
                kirimEmailConfirm
            );
        } else if (confirmAction.type === "tolak") {
            eksekusiTolak(confirmAction.lamaranId, kirimEmailConfirm);
        } else if (confirmAction.type === "batalkan") {
            eksekusiBatalkan(confirmAction.lamaranId);
        }

        setConfirmAction(null);
    };

    const handleSubmitJadwal = async (formData: {
        jadwalTanggal: string;
        jadwalLokasi: string;
        jadwalCatatan: string;
        kirimEmail: boolean;
    }) => {
        if (!jadwalTarget) return;

        try {
            setSavingJadwal(true);

            const response = await fetch(
                `/api/lamaran/${jadwalTarget.lamaranId}/tahapan/jadwal`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal mengatur jadwal");
            }

            setPelamar((prev) =>
                prev.map((item) =>
                    item.id === jadwalTarget.lamaranId
                        ? { ...item, tahapanProgress: data.lamaran.tahapanProgress }
                        : item
                )
            );

            setJadwalTarget(null);
        } catch (error) {
            console.error("SET JADWAL ERROR:", error);
            toast.error(error instanceof Error ? error.message : "Gagal mengatur jadwal");
        } finally {
            setSavingJadwal(false);
        }
    };

    const handleSubmitEmailBebas = async (formData: {
        subjek: string;
        isi: string;
    }) => {
        if (!emailTarget) return;

        try {
            setSendingEmail(true);

            const response = await fetch(
                `/api/lamaran/${emailTarget.lamaranId}/email`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal mengirim email");
            }

            toast.success("Email berhasil dikirim");
            setEmailTarget(null);
        } catch (error) {
            console.error("KIRIM EMAIL ERROR:", error);
            toast.error(error instanceof Error ? error.message : "Gagal mengirim email");
        } finally {
            setSendingEmail(false);
        }
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
            toast.error("Gagal mengambil detail kandidat");
        } finally {
            setLoadingDetail(false);
        }
    };

    const tutupDetail = () => setDetailKandidat(null);

    const bukaBerkas = (userId: number) => {
        window.open(`/api/hr/kandidat/${userId}/pdf-gabungan`, "_blank");
    };

    const handleEksporPelamar = async () => {
        if (exporting || filteredPelamar.length === 0 || !lowongan) return;

        try {
            setExporting(true);

            const kolom: KolomExcel[] = [
                { header: "No", key: "no", lebar: 6 },
                { header: "Nama", key: "nama", lebar: 28 },
                { header: "Email", key: "email", lebar: 30 },
                { header: "No. Telepon", key: "telepon", lebar: 16 },
                { header: "NIK", key: "nik", lebar: 20 },
                { header: "Domisili", key: "domisili", lebar: 34 },
                { header: "Tanggal Melamar", key: "tanggalMelamar", lebar: 18, format: "dd/mm/yyyy" },
                { header: "Status", key: "status", lebar: 16 },
                { header: "Tahap Saat Ini", key: "tahapSaatIni", lebar: 18 },
                { header: "Jadwal Tahap Saat Ini", key: "jadwal", lebar: 40 },
                ...kolomTahapan.map((tahapan) => ({
                    header: "Selesai " + TAHAPAN_LABEL[tahapan],
                    key: "selesai-" + tahapan,
                    lebar: 18,
                    format: "dd/mm/yyyy",
                })),
                { header: "Tanggal Ditolak", key: "tanggalDitolak", lebar: 18, format: "dd/mm/yyyy" },
            ];

            const baris: BarisExcel[] = filteredPelamar.map((item, index) => {
                const berjalan = [...item.tahapanProgress]
                    .sort((a, b) => a.urutan - b.urutan)
                    .find((t) => t.selesaiPada === null);

                const ditolak = item.status === "DITOLAK";
                const lolos = item.status === "LOLOS";

                let jadwal = "";

                if (!ditolak && !lolos && berjalan?.jadwalTanggal) {
                    jadwal = teksTanggalJam(berjalan.jadwalTanggal);

                    if (berjalan.jadwalLokasi) {
                        jadwal = jadwal + " - " + berjalan.jadwalLokasi;
                    }
                }

                const row: BarisExcel = {
                    no: index + 1,
                    nama: item.user.nama,
                    email: item.user.email,
                    telepon: item.user.noTelepon,
                    nik: item.user.nik,
                    domisili: item.user.alamat,
                    tanggalMelamar: tanggalExcel(item.createdAt),
                    status: ditolak ? "Ditolak" : lolos ? "Lolos" : "Sedang Berjalan",
                    tahapSaatIni: lolos
                        ? "Selesai"
                        : berjalan
                            ? TAHAPAN_LABEL[berjalan.tahapan]
                            : "-",
                    jadwal,
                    tanggalDitolak: ditolak ? tanggalExcel(item.updatedAt) : null,
                };

                for (const tahapan of kolomTahapan) {
                    const progress = item.tahapanProgress.find(
                        (t) => t.tahapan === tahapan
                    );

                    row["selesai-" + tahapan] = tanggalExcel(progress?.selesaiPada);
                }

                return row;
            });

            await eksporExcel({
                namaFile: "Pelamar-" + lowongan.posisi + "-" + stempelFile(),
                namaSheet: "Pelamar",
                kolom,
                baris,
            });

            toast.success(baris.length + " pelamar berhasil diekspor");
        } catch (error) {
            console.error("EKSPOR PELAMAR ERROR:", error);
            toast.error("Gagal mengekspor data pelamar");
        } finally {
            setExporting(false);
        }
    };

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
            if (urutan === "nama-asc") {
                return a.user.nama.localeCompare(b.user.nama, "id");
            }

            if (urutan === "nama-desc") {
                return b.user.nama.localeCompare(a.user.nama, "id");
            }

            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();

            return urutan === "terlama" ? dateA - dateB : dateB - dateA;
        });

        return hasil;
    }, [pelamar, keyword, filterStatus, urutan]);


    const totalHalaman = Math.max(
        1,
        Math.ceil(filteredPelamar.length / pageSize)
    );

    const halamanAktif = Math.min(page, totalHalaman);

    const dataHalaman = filteredPelamar.slice(
        (halamanAktif - 1) * pageSize,
        halamanAktif * pageSize
    );

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const selectedPelamar = filteredPelamar.filter((p) => selectedSet.has(p.id));

    const jumlahTerpilih = selectedPelamar.length;

    const bisaDitolak = selectedPelamar.filter(
        (p) => p.status === "DIPROSES" || p.status === "INTERVIEW"
    );

    const semuaHalamanTerpilih =
        dataHalaman.length > 0 && dataHalaman.every((p) => selectedSet.has(p.id));

    const sebagianHalamanTerpilih =
        !semuaHalamanTerpilih && dataHalaman.some((p) => selectedSet.has(p.id));

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const togglePilihHalaman = () => {
        const idHalaman = dataHalaman.map((p) => p.id);

        if (semuaHalamanTerpilih) {
            setSelectedIds((prev) => prev.filter((x) => !idHalaman.includes(x)));
        } else {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...idHalaman])));
        }
    };

    const pilihSemuaHasil = () => {
        setSelectedIds(filteredPelamar.map((p) => p.id));
    };

    const ringkasNama = (daftar: Pelamar[]) => {
        const nama = daftar.slice(0, 4).map((p) => p.user.nama);
        const sisa = daftar.length - nama.length;

        return nama.join(", ") + (sisa > 0 ? ", dan " + sisa + " lainnya" : "");
    };

    const jalankanMassal = async (
        daftar: Pelamar[],
        kerja: (item: Pelamar) => Promise<string | null>,
        jeda: number
    ) => {
        const hasil: RingkasanMassal = { berhasil: 0, gagal: [], peringatan: [] };

        setBulkRunning(true);
        setBulkProgress({ selesai: 0, total: daftar.length });

        for (let i = 0; i < daftar.length; i++) {
            const item = daftar[i];

            try {
                const catatan = await kerja(item);

                hasil.berhasil += 1;

                if (catatan) {
                    hasil.peringatan.push({ nama: item.user.nama, alasan: catatan });
                }
            } catch (error) {
                hasil.gagal.push({
                    nama: item.user.nama,
                    alasan: error instanceof Error ? error.message : "Terjadi kesalahan",
                });
            }

            setBulkProgress({ selesai: i + 1, total: daftar.length });

            if (jeda > 0 && i < daftar.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, jeda));
            }
        }

        setBulkRunning(false);
        setBulkProgress(null);

        return hasil;
    };

    const selesaikanMassal = (
        judul: string,
        hasil: RingkasanMassal,
        dilewati: number
    ) => {
        setSelectedIds([]);

        if (hasil.gagal.length === 0 && hasil.peringatan.length === 0) {
            toast.success(
                judul +
                ": " +
                hasil.berhasil +
                " berhasil" +
                (dilewati > 0 ? ", " + dilewati + " dilewati" : "")
            );
            return;
        }

        setBulkHasil({ judul, dilewati, ...hasil });
    };

    const bukaTolakMassal = () => {
        setBulkEmail(true);
        setBulkAction("tolak");
    };

    const konfirmasiTolakMassal = async () => {
        const daftar = bisaDitolak;
        const dilewati = jumlahTerpilih - daftar.length;
        const kirimEmail = bulkEmail;

        setBulkAction(null);

        const hasil = await jalankanMassal(
            daftar,
            async (item) => {
                const response = await fetch(`/api/lamaran/${item.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "DITOLAK", kirimEmail }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Gagal menolak lamaran");
                }

                setPelamar((prev) =>
                    prev.map((p) =>
                        p.id === item.id
                            ? { ...p, status: "DITOLAK" as StatusLamaran }
                            : p
                    )
                );

                if (
                    kirimEmail &&
                    data.emailResult &&
                    data.emailResult.success === false
                ) {
                    return "Lamaran ditolak, tetapi email gagal terkirim";
                }

                return null;
            },
            kirimEmail ? 700 : 0
        );

        selesaikanMassal("Tolak lamaran", hasil, dilewati);
    };

    const handleSubmitEmailMassal = async (formData: {
        subjek: string;
        isi: string;
    }) => {
        const daftar = selectedPelamar;

        setBulkAction(null);

        const hasil = await jalankanMassal(
            daftar,
            async (item) => {
                const response = await fetch(`/api/lamaran/${item.id}/email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Gagal mengirim email");
                }

                return null;
            },
            700
        );

        selesaikanMassal("Kirim email", hasil, 0);
    };

    const formatTanggal = (date: string) => {
        return new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTanggalJam = (date: string) => {
        return (
            new Date(date).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }) + " WIB"
        );
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

            <header className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
                <div className="mx-auto flex w-full max-w-[1600px] items-center gap-4">
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

                <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="relative w-full sm:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email kandidat..."
                            value={keyword}
                            onChange={(e) => {
                                setKeyword(e.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="Semua">Semua Status</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Interview">Interview</option>
                            <option value="Lolos">Lolos</option>
                            <option value="Ditolak">Ditolak</option>
                        </select>

                        <div className="relative">
                            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <select
                                value={urutan}
                                onChange={(e) => {
                                    setUrutan(
                                        e.target.value as
                                        | "terbaru"
                                        | "terlama"
                                        | "nama-asc"
                                        | "nama-desc"
                                    );
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="terbaru">Terbaru</option>
                                <option value="terlama">Terlama</option>
                                <option value="nama-asc">Nama (A-Z)</option>
                                <option value="nama-desc">Nama (Z-A)</option>
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={handleEksporPelamar}
                            disabled={exporting || filteredPelamar.length === 0}
                            title="Unduh daftar pelamar yang sedang tampil (sesuai pencarian dan filter)"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Download className="h-4 w-4" />
                            {exporting ? "Mengekspor..." : "Ekspor Excel"}
                        </button>
                    </div>

                </div>


                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    {!loadingData && filteredPelamar.length > 0 && (
                        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex flex-wrap items-center gap-3">
                                <div
                                    role="checkbox"
                                    aria-checked={semuaHalamanTerpilih ? true : sebagianHalamanTerpilih ? "mixed" : false}
                                    aria-label="Pilih semua di halaman ini"
                                    tabIndex={0}
                                    onClick={togglePilihHalaman}
                                    onKeyDown={(e) => {
                                        if (e.key === " " || e.key === "Enter") {
                                            e.preventDefault();
                                            togglePilihHalaman();
                                        }
                                    }}
                                    className={
                                        "flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition " +
                                        (semuaHalamanTerpilih || sebagianHalamanTerpilih
                                            ? "border-emerald-600 bg-emerald-600 text-white"
                                            : "border-slate-300 bg-white hover:border-emerald-500")
                                    }
                                >
                                    {semuaHalamanTerpilih && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                                    {sebagianHalamanTerpilih && <Minus className="h-3.5 w-3.5" strokeWidth={3} />}
                                </div>

                                <span className="text-xs font-medium text-slate-600">
                                    {jumlahTerpilih > 0
                                        ? jumlahTerpilih + " dipilih"
                                        : "Pilih semua di halaman ini"}
                                </span>

                                {jumlahTerpilih > 0 && jumlahTerpilih < filteredPelamar.length && (
                                    <button
                                        type="button"
                                        onClick={pilihSemuaHasil}
                                        className="text-xs font-semibold text-emerald-700 hover:underline"
                                    >
                                        Pilih semua {filteredPelamar.length} hasil
                                    </button>
                                )}

                                {jumlahTerpilih > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedIds([])}
                                        className="text-xs font-medium text-slate-500 hover:underline"
                                    >
                                        Batal pilihan
                                    </button>
                                )}
                            </div>

                            {jumlahTerpilih > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setBulkAction("email")}
                                        disabled={bulkRunning}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        Kirim Email
                                    </button>

                                    <button
                                        type="button"
                                        onClick={bukaTolakMassal}
                                        disabled={bulkRunning || bisaDitolak.length === 0}
                                        title={bisaDitolak.length === 0 ? "Tidak ada lamaran terpilih yang bisa ditolak" : undefined}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Tolak Terpilih
                                    </button>
                                </div>
                            )}

                        </div>
                    )}

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

                            {dataHalaman.map((item) => {
                                const isExpanded = expandedId === item.id;
                                const ditolak = item.status === "DITOLAK";

                                const tahapanBelumSelesai = [...item.tahapanProgress]
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .find((t) => t.selesaiPada === null);

                                return (
                                    <div key={item.id}>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedId(isExpanded ? null : item.id)
                                            }
                                            className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                                        >

                                            <div className="flex items-center gap-3">
                                                <div
                                                    role="checkbox"
                                                    aria-checked={selectedSet.has(item.id)}
                                                    aria-label={"Pilih " + item.user.nama}
                                                    tabIndex={0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelect(item.id);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === " " || e.key === "Enter") {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            toggleSelect(item.id);
                                                        }
                                                    }}
                                                    className={
                                                        "flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition " +
                                                        (selectedSet.has(item.id)
                                                            ? "border-emerald-600 bg-emerald-600 text-white"
                                                            : "border-slate-300 bg-white hover:border-emerald-500")
                                                    }
                                                >
                                                    {selectedSet.has(item.id) && (
                                                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                                    )}
                                                </div>
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

                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs text-slate-400">
                                                    {formatTanggal(item.createdAt)}
                                                </span>

                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${ditolak
                                                            ? statusBadge.DITOLAK
                                                            : item.status === "LOLOS"
                                                                ? statusBadge.LOLOS
                                                                : tahapanBelumSelesai
                                                                    ? TAHAPAN_BADGE[tahapanBelumSelesai.tahapan]
                                                                    : statusBadge[item.status]
                                                            }`}
                                                    >
                                                        {ditolak
                                                            ? "Ditolak"
                                                            : item.status === "LOLOS"
                                                                ? "Lolos"
                                                                : tahapanBelumSelesai
                                                                    ? TAHAPAN_LABEL[tahapanBelumSelesai.tahapan]
                                                                    : statusLabel[item.status]}
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

                                                <div
                                                    role="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEmailTarget({
                                                            lamaranId: item.id,
                                                            nama: item.user.nama,
                                                        });
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                                                >
                                                    <Send className="h-3.5 w-3.5" />
                                                    Email
                                                </div>

                                                <div
                                                    role="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setHistoryTarget({
                                                            lamaranId: item.id,
                                                            nama: item.user.nama,
                                                        });
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                                >
                                                    <History className="h-3.5 w-3.5" />
                                                    Histori
                                                </div>

                                                <ChevronDown
                                                    className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </div>

                                        </button>

                                        {isExpanded && (

                                            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5">

                                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Progress Tahapan Seleksi
                                                </p>

                                                <TahapanStepper
                                                    tahapanList={kolomTahapan}
                                                    progressList={item.tahapanProgress}
                                                    ditolak={ditolak}
                                                    disabled={processingId === item.id}
                                                    onSelesaikan={(tahapan) =>
                                                        handleSelesaikanTahapan(item.id, tahapan)
                                                    }
                                                    onSetJadwal={(tahapan) =>
                                                        setJadwalTarget({
                                                            lamaranId: item.id,
                                                            tahapan,
                                                        })
                                                    }
                                                />

                                                <div className="mt-5 flex gap-2 border-t border-slate-200 pt-4">

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            ditolak ||
                                                            item.status === "LOLOS" ||
                                                            processingId === item.id
                                                        }
                                                        title={
                                                            item.status === "LOLOS"
                                                                ? "Kandidat sudah lolos seluruh tahapan"
                                                                : undefined
                                                        }
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

                    {!loadingData && filteredPelamar.length > 0 && (
                        <Pagination
                            total={filteredPelamar.length}
                            page={halamanAktif}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setPage(1);
                            }}
                        />
                    )}

                </div>

            </main>


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
                showEmailOption={
                    confirmAction?.type === "tahapan" || confirmAction?.type === "tolak"
                }
                emailChecked={kirimEmailConfirm}
                onEmailCheckedChange={setKirimEmailConfirm}
                emailLabel={
                    confirmAction?.type === "tolak"
                        ? "Kirim email pemberitahuan penolakan ke kandidat"
                        : "Kirim email hasil ke kandidat"
                }
                onConfirm={jalankanKonfirmasi}
                onCancel={() => setConfirmAction(null)}
            />

            <JadwalModal
                open={jadwalTarget !== null}
                tahapanLabel={
                    jadwalTarget ? TAHAPAN_LABEL[jadwalTarget.tahapan] : ""
                }
                loading={savingJadwal}
                onClose={() => setJadwalTarget(null)}
                onSubmit={handleSubmitJadwal}
            />

            <EmailBebasModal
                open={emailTarget !== null}
                namaKandidat={emailTarget?.nama || ""}
                loading={sendingEmail}
                onClose={() => setEmailTarget(null)}
                onSubmit={handleSubmitEmailBebas}
            />

            <EmailHistoryModal
                open={historyTarget !== null}
                lamaranId={historyTarget?.lamaranId ?? null}
                namaKandidat={historyTarget?.nama || ""}
                onClose={() => setHistoryTarget(null)}
            />

            <ConfirmDialog
                open={bulkAction === "tolak"}
                title={"Tolak " + bisaDitolak.length + " lamaran?"}
                description={
                    "Lamaran dari " +
                    ringkasNama(bisaDitolak) +
                    " akan ditandai Ditolak. Tindakan ini tidak bisa dibatalkan." +
                    (jumlahTerpilih - bisaDitolak.length > 0
                        ? " " +
                        (jumlahTerpilih - bisaDitolak.length) +
                        " lamaran dilewati karena sudah Lolos atau Ditolak."
                        : "")
                }
                confirmText={"Ya, Tolak " + bisaDitolak.length + " Lamaran"}
                variant="danger"
                loading={bulkRunning}
                showEmailOption
                emailChecked={bulkEmail}
                onEmailCheckedChange={setBulkEmail}
                emailLabel="Kirim email pemberitahuan penolakan ke tiap kandidat"
                onConfirm={konfirmasiTolakMassal}
                onCancel={() => setBulkAction(null)}
            />

            <EmailBebasModal
                open={bulkAction === "email"}
                namaKandidat={jumlahTerpilih + " kandidat terpilih"}
                loading={bulkRunning}
                onClose={() => setBulkAction(null)}
                onSubmit={handleSubmitEmailMassal}
            />

            {bulkProgress && (
                <div className="fixed bottom-6 right-6 z-[250] w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                    <p className="text-sm font-semibold text-slate-800">
                        Memproses {bulkProgress.selesai} dari {bulkProgress.total}
                    </p>

                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{
                                width:
                                    Math.round(
                                        (bulkProgress.selesai / bulkProgress.total) * 100
                                    ) + "%",
                            }}
                        />
                    </div>

                    <p className="mt-2 text-[11px] text-slate-400">
                        Jangan tutup halaman ini sampai selesai.
                    </p>
                </div>
            )}

            {bulkHasil && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setBulkHasil(null);
                    }}
                >
                    <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

                        <h3 className="text-base font-bold text-slate-800">
                            Hasil: {bulkHasil.judul}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                                {bulkHasil.berhasil} berhasil
                            </span>

                            {bulkHasil.gagal.length > 0 && (
                                <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
                                    {bulkHasil.gagal.length} gagal
                                </span>
                            )}

                            {bulkHasil.dilewati > 0 && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                                    {bulkHasil.dilewati} dilewati
                                </span>
                            )}
                        </div>

                        {bulkHasil.gagal.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                                    Gagal
                                </p>
                                <ul className="mt-2 space-y-2">
                                    {bulkHasil.gagal.map((g, index) => (
                                        <li key={"gagal-" + index} className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                                            <strong className="font-semibold">{g.nama}</strong>: {g.alasan}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {bulkHasil.peringatan.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                                    Perlu dicek
                                </p>
                                <ul className="mt-2 space-y-2">
                                    {bulkHasil.peringatan.map((g, index) => (
                                        <li key={"peringatan-" + index} className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                            <strong className="font-semibold">{g.nama}</strong>: {g.alasan}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setBulkHasil(null)}
                            className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Tutup
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}