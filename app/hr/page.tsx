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
}

interface DashboardData {
  stats: {
    lowonganAktif: number;
    totalLowongan: number;
    totalKandidat: number;
    kandidatBaruMingguIni: number;
    totalLamaran: number;
    lamaranHariIni: number;
    dalamSeleksi: number;
    menungguProses: number;
  };
  lowonganKadaluarsa: number;
  lowonganTerbaru: {
    id: number;
    posisi: string;
    departemen: string;
    pelamar: number;
    tanggalBerakhir: string | null;
  }[];
  aktivitas: {
    key: string;
    type: string;
    title: string;
    desc: string;
    time: string;
  }[];
}

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
  if (menit < 60) return `${menit} menit yang lalu`;

  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam yang lalu`;

  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari yang lalu`;

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

export default function HRDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

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

  const stats = data
    ? [
      {
        key: "lowongan",
        label: "Lowongan Aktif",
        value: data.stats.lowonganAktif,
        delta: `dari ${data.stats.totalLowongan} total lowongan`,
        icon: BriefcaseBusiness,
        color: "emerald",
      },
      {
        key: "kandidat",
        label: "Total Kandidat",
        value: data.stats.totalKandidat,
        delta: `+${data.stats.kandidatBaruMingguIni} minggu ini`,
        icon: Users,
        color: "blue",
      },
      {
        key: "lamaran",
        label: "Lamaran Masuk",
        value: data.stats.totalLamaran,
        delta: `+${data.stats.lamaranHariIni} hari ini`,
        icon: FileText,
        color: "amber",
      },
      {
        key: "seleksi",
        label: "Dalam Seleksi",
        value: data.stats.dalamSeleksi,
        delta: `${data.stats.menungguProses} perlu diproses`,
        icon: ClipboardCheck,
        color: "violet",
      },
    ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}

        <header className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola proses rekrutmen dan kandidat melalui dashboard HR.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {user.nama.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{user.nama}</p>
              <p className="text-xs text-slate-500">Human Resources</p>
            </div>
          </div>
        </header>

        {/* WELCOME */}

        <div className="mb-6 flex flex-col justify-between gap-5 rounded-2xl bg-white p-6 ring-1 ring-slate-200 sm:flex-row sm:items-center">
          <div>
            <span className="text-[13px] text-slate-500">
              Selamat datang kembali 👋
            </span>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Halo, {user.nama}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Berikut ringkasan aktivitas rekrutmen hari ini.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/hr/lowongan/tambah")}
            className="flex w-fit items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Buat Lowongan
          </button>
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
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${statColor[stat.color]}`}
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
                  </div>
                );
              })}
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
                      Daftar lowongan yang sedang aktif
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

                {data.lowonganTerbaru.length === 0 ? (

                  <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                    Belum ada lowongan aktif.
                  </p>

                ) : (

                  <div className="space-y-2">
                    {data.lowonganTerbaru.map((job) => {
                      const lewat = sudahLewat(job.tanggalBerakhir);

                      return (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() =>
                            router.push(
                              `/hr/kelolalowongan/${job.id}/pelamar`
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
                                ` · Berakhir ${formatTanggal(job.tanggalBerakhir)}`}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium ${lewat
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                                }`}
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

                {data.aktivitas.length === 0 ? (

                  <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                    Belum ada aktivitas.
                  </p>

                ) : (

                  <div className="space-y-5">
                    {data.aktivitas.map((activity) => {
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

                )}

              </div>

            </div>

          </>

        ) : null}

      </div>
    </div>
  );
}