"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  CalendarClock,
  Inbox,
  FileText,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import TahapanStepperKandidat, {
  formatTanggalWib,
  formatJamWib,
} from "@/app/components/TahapanStepperKandidat";

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
  jadwalTanggal: string | null;
  jadwalLokasi: string | null;
  jadwalCatatan: string | null;
}

interface Lamaran {
  id: number;
  status: StatusLamaran;
  createdAt: string;
  updatedAt: string;
  lowongan: {
    id: number;
    posisi: string;
    departemen: string;
    lokasi: string;
    tipe: string;
    status: string;
    deskripsi: string | null;
    tahapanSeleksi: string[];
  };
  tahapanProgress: TahapanProgress[];
}

interface JadwalItem {
  lamaranId: number;
  posisi: string;
  tahapan: string;
  jadwal: string;
  lokasi: string | null;
  catatan: string | null;
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

const TAHAPAN_BADGE: Record<string, string> = {
  SCREENING: "bg-slate-100 text-slate-700",
  ASSESSMENT: "bg-purple-100 text-purple-700",
  INTERVIEW: "bg-blue-100 text-blue-700",
  TECHNICAL_TEST: "bg-cyan-100 text-cyan-700",
  MCU: "bg-orange-100 text-orange-700",
  OFFERING: "bg-pink-100 text-pink-700",
};

const TAHAPAN_DOT: Record<string, string> = {
  SCREENING: "bg-slate-500",
  ASSESSMENT: "bg-purple-500",
  INTERVIEW: "bg-blue-500",
  TECHNICAL_TEST: "bg-cyan-500",
  MCU: "bg-orange-500",
  OFFERING: "bg-pink-500",
};

const statusConfig: Record<
  StatusLamaran,
  { label: string; badge: string; dot: string }
> = {
  DIPROSES: {
    label: "Diproses",
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  INTERVIEW: {
    label: "Diproses",
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  LOLOS: {
    label: "Lolos",
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  DITOLAK: {
    label: "Tidak lolos",
    badge: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
};

const TAB_OPTIONS: { key: string; label: string }[] = [
  { key: "SEMUA", label: "Semua" },
  { key: "BERJALAN", label: "Sedang berjalan" },
  { key: "LOLOS", label: "Lolos" },
  { key: "DITOLAK", label: "Tidak lolos" },
];

const kunciHariWib = (date: Date) => {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
};

const selisihHari = (iso: string) => {
  const target = new Date(kunciHariWib(new Date(iso)) + "T00:00:00Z").getTime();
  const hariIni = new Date(kunciHariWib(new Date()) + "T00:00:00Z").getTime();

  return Math.round((target - hariIni) / 86400000);
};

const labelSisaHari = (selisih: number) => {
  if (selisih <= 0) return "Hari ini";
  if (selisih === 1) return "Besok";
  return selisih + " hari lagi";
};

const tanggalAngka = (iso: string) => {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    timeZone: "Asia/Jakarta",
  });
};

const bulanSingkat = (iso: string) => {
  return new Date(iso).toLocaleDateString("id-ID", {
    month: "short",
    timeZone: "Asia/Jakarta",
  });
};

export default function LamaranPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [lamaran, setLamaran] = useState<Lamaran[]>([]);
  const [loadingLamaran, setLoadingLamaran] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("SEMUA");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/me", { cache: "no-store" });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!data.success || !data.user || data.user.role !== "KANDIDAT") {
          router.replace("/login");
          return;
        }

        setUser(data.user);
      } catch (err) {
        console.error(err);
        router.replace("/login");
      }
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const getLamaran = async () => {
      try {
        setLoadingLamaran(true);

        const response = await fetch("/api/lamaran", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Gagal mengambil data lamaran");
        }

        const data = await response.json();
        setLamaran(data);
      } catch (err) {
        console.error("GET LAMARAN ERROR:", err);
        setError(
          err instanceof Error ? err.message : "Gagal mengambil data lamaran"
        );
      } finally {
        setLoadingLamaran(false);
      }
    };

    getLamaran();
  }, [user]);

  const jumlahBerjalan = lamaran.filter(
    (item) => item.status === "DIPROSES" || item.status === "INTERVIEW"
  ).length;

  const jumlahLolos = lamaran.filter((item) => item.status === "LOLOS").length;

  const jumlahDitolak = lamaran.filter(
    (item) => item.status === "DITOLAK"
  ).length;

  const filteredLamaran = useMemo(() => {
    if (activeTab === "SEMUA") return lamaran;

    if (activeTab === "BERJALAN") {
      return lamaran.filter(
        (item) => item.status === "DIPROSES" || item.status === "INTERVIEW"
      );
    }

    return lamaran.filter((item) => item.status === activeTab);
  }, [lamaran, activeTab]);

  const daftarJadwal = useMemo(() => {
    const hasil: JadwalItem[] = [];

    for (const item of lamaran) {
      if (item.status === "DITOLAK" || item.status === "LOLOS") continue;

      const berjalan = [...item.tahapanProgress]
        .sort((a, b) => a.urutan - b.urutan)
        .find((t) => t.selesaiPada === null);

      if (!berjalan || !berjalan.jadwalTanggal) continue;
      if (selisihHari(berjalan.jadwalTanggal) < 0) continue;

      hasil.push({
        lamaranId: item.id,
        posisi: item.lowongan.posisi,
        tahapan: berjalan.tahapan,
        jadwal: berjalan.jadwalTanggal,
        lokasi: berjalan.jadwalLokasi,
        catatan: berjalan.jadwalCatatan,
      });
    }

    hasil.sort(
      (a, b) => new Date(a.jadwal).getTime() - new Date(b.jadwal).getTime()
    );

    return hasil;
  }, [lamaran]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          <p className="text-sm text-slate-500">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6faf8] text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6">
          <p className="mb-1 text-sm font-medium text-slate-500">
            Riwayat Lamaran
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Lamaran <span className="text-emerald-700">Saya</span>
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Pantau seluruh proses lamaran pekerjaan kamu di PT Pupuk Kujang,
            mulai dari tahapan seleksi hingga jadwal panggilan.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            STATISTIK
        ====================================================== */}

        {!loadingLamaran && lamaran.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Lamaran
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {lamaran.length}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText size={20} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Semua lamaran yang dikirim
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Sedang Berjalan
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {jumlahBerjalan}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock size={20} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Belum ada keputusan akhir
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Lolos</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {jumlahLolos}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Seluruh tahapan selesai
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Tidak Lolos
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {jumlahDitolak}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <XCircle size={20} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Belum dapat dilanjutkan
              </p>
            </div>

          </div>
        )}

        {/* =====================================================
            JADWAL MENDATANG
        ====================================================== */}

        {!loadingLamaran && daftarJadwal.length > 0 && (
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Jadwal Mendatang
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Panggilan tahapan seleksi yang akan kamu ikuti
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarClock size={18} />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {daftarJadwal.slice(0, 3).map((j, index) => (
                <div
                  key={j.lamaranId}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >

                  <div className="flex items-start gap-4">

                    <div
                      className={
                        "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl " +
                        (index === 0
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600")
                      }
                    >
                      <span className="text-lg font-bold leading-none">
                        {tanggalAngka(j.jadwal)}
                      </span>
                      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
                        {bulanSingkat(j.jadwal)}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">
                        Panggilan {TAHAPAN_LABEL[j.tahapan]}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {j.posisi}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {formatJamWib(j.jadwal)}
                        </span>

                        {j.lokasi && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} />
                            {j.lokasi}
                          </span>
                        )}
                      </div>

                      {j.catatan && (
                        <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
                          {j.catatan}
                        </p>
                      )}
                    </div>

                  </div>

                  <span
                    className={
                      "w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold " +
                      (index === 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600")
                    }
                  >
                    {labelSisaHari(selisihHari(j.jadwal))}
                  </span>

                </div>
              ))}
            </div>

            {daftarJadwal.length > 3 && (
              <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400 sm:px-6">
                +{daftarJadwal.length - 3} jadwal lainnya
              </p>
            )}

          </section>
        )}

        {/* =====================================================
            DAFTAR LAMARAN
        ====================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Daftar Lamaran
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {lamaran.length > 0
                  ? "Menampilkan " +
                  filteredLamaran.length +
                  " dari " +
                  lamaran.length +
                  " lamaran"
                  : "Riwayat lamaran kamu akan muncul di sini"}
              </p>
            </div>

            {!loadingLamaran && lamaran.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                {TAB_OPTIONS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={
                      "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition " +
                      (activeTab === tab.key
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700")
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

          </div>

          {loadingLamaran ? (

            <div className="flex flex-col items-center gap-3 px-6 py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <p className="text-sm text-slate-500">Memuat lamaran...</p>
            </div>

          ) : lamaran.length === 0 ? (

            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Inbox className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Belum ada lamaran
              </h3>
              <p className="mt-1.5 text-sm text-slate-500">
                Yuk jelajahi lowongan yang tersedia dan mulai melamar posisi
                yang sesuai denganmu.
              </p>
              <button
                type="button"
                onClick={() => router.push("/kandidat/lowongan")}
                className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
              >
                Lihat Lowongan →
              </button>
            </div>

          ) : filteredLamaran.length === 0 ? (

            <div className="px-5 py-12 text-center text-sm text-slate-500">
              Tidak ada lamaran dengan status ini.
            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {filteredLamaran.map((item) => {
                const config = statusConfig[item.status];

                const ditolak = item.status === "DITOLAK";
                const lolos = item.status === "LOLOS";

                const kolomTahapan =
                  item.lowongan.tahapanSeleksi &&
                    item.lowongan.tahapanSeleksi.length > 0
                    ? [...item.lowongan.tahapanSeleksi].sort(
                      (a, b) => TAHAPAN_URUTAN[a] - TAHAPAN_URUTAN[b]
                    )
                    : [];

                const belumSelesai = [...item.tahapanProgress]
                  .sort((a, b) => a.urutan - b.urutan)
                  .find((t) => t.selesaiPada === null);

                const total = kolomTahapan.length;

                const selesaiCount = kolomTahapan.filter(
                  (t) =>
                    item.tahapanProgress.find((p) => p.tahapan === t)
                      ?.selesaiPada
                ).length;

                const persen =
                  total > 0 ? Math.round((selesaiCount / total) * 100) : 0;

                const nomorTahap = Math.min(selesaiCount + 1, total);

                const labelTahapBerjalan = belumSelesai
                  ? TAHAPAN_LABEL[belumSelesai.tahapan]
                  : "";

                let teksProgres = "";

                if (lolos) {
                  teksProgres = "Seluruh tahapan selesai";
                } else if (ditolak) {
                  teksProgres = labelTahapBerjalan
                    ? "Berhenti di tahap " + labelTahapBerjalan
                    : "Proses dihentikan";
                } else {
                  teksProgres =
                    "Tahap " +
                    nomorTahap +
                    " dari " +
                    total +
                    (labelTahapBerjalan ? " · " + labelTahapBerjalan : "");
                }

                const displayLabel = ditolak
                  ? config.label
                  : lolos
                    ? config.label
                    : belumSelesai
                      ? TAHAPAN_LABEL[belumSelesai.tahapan]
                      : config.label;

                const displayBadge = ditolak
                  ? statusConfig.DITOLAK.badge
                  : lolos
                    ? statusConfig.LOLOS.badge
                    : belumSelesai
                      ? TAHAPAN_BADGE[belumSelesai.tahapan]
                      : config.badge;

                const displayDot = ditolak
                  ? statusConfig.DITOLAK.dot
                  : lolos
                    ? statusConfig.LOLOS.dot
                    : belumSelesai
                      ? TAHAPAN_DOT[belumSelesai.tahapan]
                      : config.dot;

                return (
                  <article key={item.id} className="px-5 py-6 sm:px-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="flex items-start gap-3">

                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <Briefcase size={19} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-900">
                            {item.lowongan.posisi}
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.lowongan.departemen}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin size={13} />
                              {item.lowongan.lokasi}
                            </span>

                            <span className="flex items-center gap-1">
                              <Briefcase size={13} />
                              {item.lowongan.tipe}
                            </span>

                            <span className="flex items-center gap-1">
                              <Calendar size={13} />
                              Dilamar {formatTanggalWib(item.createdAt)}
                            </span>
                          </div>

                          {item.lowongan.deskripsi && (
                            <p className="mt-3 line-clamp-2 max-w-2xl text-xs leading-6 text-slate-500">
                              {item.lowongan.deskripsi}
                            </p>
                          )}
                        </div>

                      </div>

                      <span
                        className={
                          "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold " +
                          displayBadge
                        }
                      >
                        <span
                          className={"h-1.5 w-1.5 rounded-full " + displayDot}
                        />
                        {displayLabel}
                      </span>

                    </div>

                    {/* PROGRES */}

                    {total > 0 && (
                      <div className="mt-5">
                        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-slate-700">{teksProgres}</span>
                          <span className="text-slate-400">{persen}%</span>
                        </div>

                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={
                              "h-full rounded-full transition-all " +
                              (ditolak ? "bg-red-400" : "bg-emerald-500")
                            }
                            style={{ width: persen + "%" }}
                          />
                        </div>
                      </div>
                    )}

                    {/* STEPPER TAHAPAN SELEKSI */}

                    {total > 0 && (
                      <div className="mt-6 rounded-xl bg-slate-50/70 px-4 py-5">
                        <TahapanStepperKandidat
                          tahapanList={kolomTahapan}
                          progressList={item.tahapanProgress}
                          ditolak={ditolak}
                        />
                      </div>
                    )}

                    {/* PESAN LOLOS */}

                    {lolos && (
                      <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                        <p className="text-xs leading-6 text-emerald-800">
                          <strong className="font-bold">Selamat!</strong> Kamu
                          telah menyelesaikan seluruh tahapan seleksi. Tim HR
                          akan menghubungimu untuk proses selanjutnya.
                        </p>
                      </div>
                    )}

                    {/* PESAN TIDAK LOLOS */}

                    {ditolak && (
                      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                          <p className="text-xs leading-6 text-slate-600">
                            Terima kasih sudah mengikuti proses seleksi. Mohon
                            maaf, lamaranmu belum dapat dilanjutkan
                            {labelTahapBerjalan
                              ? " pada tahap " + labelTahapBerjalan
                              : ""}{" "}
                            (diputuskan {formatTanggalWib(item.updatedAt)}).
                            Tetap semangat, masih banyak lowongan lain yang
                            bisa kamu coba.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => router.push("/kandidat/lowongan")}
                          className="w-fit shrink-0 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          Lihat lowongan lain
                        </button>
                      </div>
                    )}

                  </article>
                );
              })}

            </div>

          )}

        </section>

      </main>
    </div>
  );
}