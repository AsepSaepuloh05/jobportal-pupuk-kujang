"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  ClipboardCheck,
  FilePlus2,
  FileText,
  Plus,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";

interface User {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
  fotoProfil?: { pathFile: string } | null;
}

type Periode = "hari" | "minggu" | "bulan" | "semua";

interface LowonganItem {
  id: number;
  posisi: string;
  departemen: string;
  pelamar: number;
  tanggalBerakhir: string | null;
}

interface DashboardData {
  stats: {
    lowonganAktif: number;
    totalLowongan: number;
    totalKandidat: number;
    kandidatBaruMingguIni: number;
    totalLamaran: number;
    lamaranPeriode: Record<Periode, number>;
    sedangDiproses: number;
  };
  sebaranTahapan: Record<string, number>;
  lowonganKadaluarsa: number;
  lowonganTerbaru: Record<Periode, LowonganItem[]>;
}

interface Aktivitas {
  key: string;
  type: string;
  title: string;
  desc: string;
  time: string;
}

interface StatItem {
  key: string;
  label: string;
  value: number;
  delta: string;
  icon: React.ElementType;
  color: string;
  extra?: React.ReactNode;
}

const AKTIVITAS_PER_HALAMAN = 6;

const PERIODE_OPTIONS: { key: Periode; label: string }[] = [
  { key: "hari", label: "Hari ini" },
  { key: "minggu", label: "Minggu ini" },
  { key: "bulan", label: "Bulan ini" },
  { key: "semua", label: "Semua" },
];

const PERIODE_LABEL: Record<Periode, string> = {
  hari: "Hari ini",
  minggu: "Minggu ini",
  bulan: "Bulan ini",
  semua: "Semua waktu",
};

const TAHAPAN_SEBARAN = [
  { key: "SCREENING", label: "Screening", dot: "bg-slate-400" },
  { key: "ASSESSMENT", label: "Assessment", dot: "bg-purple-500" },
  { key: "INTERVIEW", label: "Interview", dot: "bg-blue-500" },
  { key: "TECHNICAL_TEST", label: "Technical Test", dot: "bg-cyan-500" },
  { key: "MCU", label: "MCU", dot: "bg-orange-500" },
  { key: "OFFERING", label: "Offering", dot: "bg-pink-500" },
];

const statColor: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
};

const activityIcon: Record<string, React.ElementType> = {
  lamaran: FilePlus2,
  kandidat: UserPlus,
  tahapan: UserCheck,
  ditolak: UserX,
};

const waktuLalu = (iso: string) => {
  const detik = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (detik < 60) return "Baru saja";

  const menit = Math.floor(detik / 60);
  if (menit < 60) return menit + " menit yang lalu";

  const jam = Math.floor(menit / 60);
  if (jam < 24) return jam + " jam yang lalu";

  const hari = Math.floor(jam / 24);
  if (hari < 30) return hari + " hari yang lalu";

  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTanggal = (iso: string) => {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const sudahLewat = (iso: string | null) => {
  if (!iso) return false;

  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  return new Date(iso) < hariIni;
};

const sapaanWaktu = () => {
  const jam = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Jakarta",
    }).format(new Date())
  );

  if (jam < 11) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 18) return "Selamat sore";
  return "Selamat malam";
};

const tanggalHariIni = () => {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
};

const ambilAktivitas = async (offset: number) => {
  const response = await fetch(
    "/api/hr/dashboard/aktivitas?offset=" +
    offset +
    "&limit=" +
    AKTIVITAS_PER_HALAMAN,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil aktivitas");
  }

  return response.json();
};

interface PeriodeTabsProps {
  value: Periode;
  onChange: (periode: Periode) => void;
}

function PeriodeTabs({ value, onChange }: PeriodeTabsProps) {
  return (
    <div className="inline-flex flex-wrap rounded-lg bg-slate-100 p-0.5">
      {PERIODE_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={
            "rounded-md px-2.5 py-1 text-[11px] font-medium transition " +
            (value === opt.key
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700")
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function HRDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const [periodeLamaran, setPeriodeLamaran] = useState<Periode>("semua");
  const [periodeLowongan, setPeriodeLowongan] = useState<Periode>("semua");

  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
  const [aktivitasHasMore, setAktivitasHasMore] = useState(false);
  const [loadingAktivitas, setLoadingAktivitas] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/me");

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const result = await response.json();

        if (!result.user || result.user.role !== "HR") {
          router.replace("/login");
          return;
        }

        setUser(result.user);
      } catch (err) {
        console.error("GET USER ERROR:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const getDashboard = async () => {
      try {
        setLoadingData(true);

        const response = await fetch("/api/hr/dashboard", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data dashboard");
        }

        setData(await response.json());
      } catch (err) {
        console.error("GET DASHBOARD ERROR:", err);
        setError(
          err instanceof Error ? err.message : "Gagal mengambil data dashboard"
        );
      } finally {
        setLoadingData(false);
      }
    };

    getDashboard();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const muatAwal = async () => {
      try {
        const hasil = await ambilAktivitas(0);

        setAktivitas(hasil.items);
        setAktivitasHasMore(hasil.hasMore);
      } catch (err) {
        console.error("GET AKTIVITAS ERROR:", err);
      } finally {
        setLoadingAktivitas(false);
      }
    };

    muatAwal();
  }, [user]);

  const muatLagi = async () => {
    if (loadingMore) return;

    try {
      setLoadingMore(true);

      const hasil = await ambilAktivitas(aktivitas.length);

      setAktivitas((prev) => {
        const sudahAda = new Set(prev.map((a) => a.key));
        const baru = hasil.items.filter((a: Aktivitas) => !sudahAda.has(a.key));

        return [...prev, ...baru];
      });
      setAktivitasHasMore(hasil.hasMore);
    } catch (err) {
      console.error("MUAT AKTIVITAS ERROR:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          <p className="text-sm text-slate-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats: StatItem[] = data
    ? [
      {
        key: "lowongan",
        label: "Lowongan Aktif",
        value: data.stats.lowonganAktif,
        delta: "dari " + data.stats.totalLowongan + " total lowongan",
        icon: BriefcaseBusiness,
        color: "emerald",
      },
      {
        key: "kandidat",
        label: "Total Kandidat",
        value: data.stats.totalKandidat,
        delta: "+" + data.stats.kandidatBaruMingguIni + " minggu ini",
        icon: Users,
        color: "blue",
      },
      {
        key: "lamaran",
        label: "Lamaran Masuk",
        value: data.stats.lamaranPeriode[periodeLamaran],
        delta:
          periodeLamaran === "semua"
            ? "Seluruh lamaran yang pernah masuk"
            : PERIODE_LABEL[periodeLamaran] +
            " · total " +
            data.stats.totalLamaran,
        icon: FileText,
        color: "amber",
        extra: (
          <PeriodeTabs value={periodeLamaran} onChange={setPeriodeLamaran} />
        ),
      },
      {
        key: "diproses",
        label: "Sedang Diproses",
        value: data.stats.sedangDiproses,
        delta: "dari " + data.stats.totalLamaran + " lamaran masuk",
        icon: ClipboardCheck,
        color: "violet",
      },
    ]
    : [];

  const lowonganTampil = data ? data.lowonganTerbaru[periodeLowongan] : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}

        <header className="mb-5 flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola proses rekrutmen dan kandidat melalui dashboard HR.
            </p>
          </div>

          <p className="text-sm font-medium text-slate-500">
            {tanggalHariIni()}
          </p>
        </header>

        {/* HERO */}

        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 p-6 text-white shadow-sm sm:p-8">

          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-40 h-44 w-44 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-4 sm:gap-5">

              {user.fotoProfil?.pathFile ? (
                <img
                  src={user.fotoProfil.pathFile}
                  alt={user.nama}
                  className="h-16 w-16 shrink-0 rounded-full object-cover ring-4 ring-white/25"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold ring-4 ring-white/25">
                  {user.nama.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-sm text-emerald-50">{sapaanWaktu()} 👋</p>
                <h2 className="mt-0.5 truncate text-2xl font-semibold">
                  {user.nama}
                </h2>
                <p className="mt-1 text-sm text-emerald-100">
                  Human Resources &middot; PT Pupuk Kujang
                </p>
              </div>

            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => router.push("/hr/lowongan/tambah")}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Buat Lowongan
              </button>

              <button
                type="button"
                onClick={() => router.push("/hr/daftarkandidat")}
                className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25"
              >
                <Users className="h-4 w-4" strokeWidth={2} />
                Data Kandidat
              </button>
            </div>

          </div>

        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loadingData ? (

          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-16 ring-1 ring-slate-200">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
            <span className="text-sm text-slate-500">
              Memuat data dashboard...
            </span>
          </div>

        ) : data ? (

          <>

            {/* PERINGATAN LOWONGAN LEWAT BATAS */}

            {data.lowonganKadaluarsa > 0 && (
              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      {data.lowonganKadaluarsa} lowongan aktif sudah melewati
                      batas penutupan
                    </p>
                    <p className="mt-0.5 text-xs text-amber-700">
                      Tinjau dan tutup lowongan tersebut agar tidak menerima
                      lamaran lagi.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/hr/kelolalowongan")}
                  className="w-fit rounded-lg border border-amber-300 bg-white px-3.5 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                >
                  Tinjau Sekarang
                </button>
              </div>
            )}

            {/* STATISTICS */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.key}
                    className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition-shadow hover:shadow-sm"
                  >
                    <div
                      className={
                        "flex h-10 w-10 items-center justify-center rounded-xl " +
                        statColor[stat.color]
                      }
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>

                    <p className="mt-4 text-[13px] text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{stat.delta}</p>

                    {stat.extra && <div className="mt-3">{stat.extra}</div>}
                  </div>
                );
              })}
            </div>

            {/* SEBARAN TAHAPAN */}

            <div className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
              <h3 className="text-[15px] font-semibold text-slate-900">
                Sebaran Kandidat per Tahapan
              </h3>
              <p className="mt-0.5 text-[13px] text-slate-500">
                Posisi terkini kandidat yang masih dalam proses seleksi (belum
                lolos dan belum ditolak).
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {TAHAPAN_SEBARAN.map((tahap) => (
                  <div
                    key={tahap.key}
                    className="rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={"h-2 w-2 rounded-full " + tahap.dot}
                      />
                      <span className="text-xs font-medium text-slate-500">
                        {tahap.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xl font-semibold text-slate-900">
                      {data.sebaranTahapan[tahap.key] ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CONTENT GRID */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">

              {/* LOWONGAN TERBARU */}

              <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900">
                      Lowongan Terbaru
                    </h3>
                    <p className="mt-0.5 text-[13px] text-slate-500">
                      Lowongan aktif berdasarkan tanggal dibuat
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/hr/kelolalowongan")}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    Lihat Semua
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>

                <div className="mb-4">
                  <PeriodeTabs
                    value={periodeLowongan}
                    onChange={setPeriodeLowongan}
                  />
                </div>

                {lowonganTampil.length === 0 ? (

                  <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                    {periodeLowongan === "semua"
                      ? "Belum ada lowongan aktif."
                      : "Tidak ada lowongan aktif yang dibuat " +
                      PERIODE_LABEL[periodeLowongan].toLowerCase() +
                      "."}
                  </p>

                ) : (

                  <div className="space-y-2">
                    {lowonganTampil.map((job) => {
                      const lewat = sudahLewat(job.tanggalBerakhir);

                      return (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() =>
                            router.push(
                              "/hr/kelolalowongan/" + job.id + "/pelamar"
                            )
                          }
                          className="flex w-full items-center gap-4 rounded-xl border border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50/60"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <BriefcaseBusiness
                              className="h-4.5 w-4.5"
                              strokeWidth={2}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-medium text-slate-900">
                              {job.posisi}
                            </p>
                            <p className="text-[12.5px] text-slate-500">
                              {job.departemen}
                              {job.tanggalBerakhir &&
                                " · Berakhir " +
                                formatTanggal(job.tanggalBerakhir)}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span
                              className={
                                "rounded-full px-2.5 py-1 text-[11.5px] font-medium " +
                                (lewat
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700")
                              }
                            >
                              {lewat ? "Lewat batas" : "Aktif"}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {job.pelamar} pelamar
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                )}

              </div>

              {/* AKTIVITAS TERBARU */}

              <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

                <div className="mb-4">
                  <h3 className="text-[15px] font-semibold text-slate-900">
                    Aktivitas Terbaru
                  </h3>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    Aktivitas kandidat dan proses seleksi
                  </p>
                </div>

                {loadingAktivitas ? (

                  <div className="flex justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                  </div>

                ) : aktivitas.length === 0 ? (

                  <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                    Belum ada aktivitas.
                  </p>

                ) : (

                  <>
                    <div className="max-h-[520px] space-y-5 overflow-y-auto pr-1">
                      {aktivitas.map((activity) => {
                        const Icon = activityIcon[activity.type] || FilePlus2;

                        return (
                          <div key={activity.key} className="flex gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                              <Icon className="h-4 w-4" strokeWidth={2} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[13.5px] font-medium text-slate-900">
                                {activity.title}
                              </p>
                              <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-500">
                                {activity.desc}
                              </p>
                              <p className="mt-1 text-[11.5px] text-slate-400">
                                {waktuLalu(activity.time)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4 text-center">
                      {aktivitasHasMore ? (
                        <button
                          type="button"
                          onClick={muatLagi}
                          disabled={loadingMore}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                          {loadingMore ? "Memuat..." : "Lihat lebih banyak"}
                        </button>
                      ) : (
                        <p className="text-xs text-slate-400">
                          Semua aktivitas sudah ditampilkan.
                        </p>
                      )}
                    </div>
                  </>

                )}

              </div>

            </div>

          </>

        ) : null}

      </div>
    </div>
  );
}