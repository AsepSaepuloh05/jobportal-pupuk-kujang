"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FileText,
  MapPin,
  Search,
  FilePlus2,
  Clock,
} from "lucide-react";

interface User {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
  alamat?: string | null;

  fotoProfil?: {
    id: number;
    namaFile: string;
    namaAsli: string;
    pathFile: string;
    tipeFile: string;
  } | null;
}

interface Lowongan {
  id: number;
  posisi: string;
  departemen: string;
  lokasi: string;
  tipe: string;
  status: "AKTIF" | "DRAFT" | "DITUTUP";
  createdAt?: string;
}

interface Activity {
  key: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  time: string;
}

const activities: Activity[] = [
  {
    key: "a1",
    icon: FilePlus2,
    title: "Lamaran diajukan",
    desc: "Kamu melamar posisi IT Support",
    time: "15 Agustus 2026",
  },
  {
    key: "a2",
    icon: Clock,
    title: "Lamaran sedang diproses",
    desc: "Staff Administrasi masuk tahap seleksi",
    time: "10 Agustus 2026",
  },
];

const summary = {
  diajukan: 2,
  diproses: 1,
  diterima: 0,
  ditolak: 0,
};

export default function KandidatDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [lowongan, setLowongan] = useState<Lowongan[]>([]);
  const [loadingLowongan, setLoadingLowongan] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  // =====================================================
  // GET USER
  // =====================================================

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (
          !data.success ||
          !data.user ||
          data.user.role !== "KANDIDAT"
        ) {
          router.replace("/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("GET USER ERROR:", error);
        router.replace("/login");
      } finally {
        setLoadingUser(false);
      }
    };

    getUser();
  }, [router]);

  // =====================================================
  // GET LOWONGAN
  // =====================================================

  useEffect(() => {
    const getLowongan = async () => {
      try {
        const response = await fetch(
          "/api/lowongan?status=AKTIF",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil data lowongan");
        }

        const data = await response.json();

        setLowongan(
          Array.isArray(data) ? data.slice(0, 4) : []
        );
      } catch (error) {
        console.error("GET LOWONGAN ERROR:", error);
        setLowongan([]);
      } finally {
        setLoadingLowongan(false);
      }
    };

    getLowongan();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    router.push(
      `/kandidat/lowongan?keyword=${encodeURIComponent(
        keyword
      )}&location=${encodeURIComponent(location)}`
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

          <p className="text-sm text-slate-500">
            Memuat dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // =====================================================
  // FOTO PROFIL
  // =====================================================

  const fotoProfil = user.fotoProfil;

  // =====================================================
  // STATISTIK
  // =====================================================

  const stats = [
    {
      key: "diajukan",
      label: "Lamaran Diajukan",
      value: summary.diajukan,
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      key: "diproses",
      label: "Sedang Diproses",
      value: summary.diproses,
      icon: ClipboardList,
      color: "bg-amber-50 text-amber-600",
    },
    {
      key: "diterima",
      label: "Diterima",
      value: summary.diterima,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      key: "lowongan",
      label: "Lowongan Aktif",
      value: loadingLowongan ? "…" : lowongan.length,
      icon: BriefcaseBusiness,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Pantau status lamaran dan temukan peluang karier baru.
            </p>
          </div>

          {/* USER */}
          <div className="flex items-center gap-3">

            {/* FOTO PROFIL */}
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-900">
              {fotoProfil?.pathFile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoProfil.pathFile}
                  alt={`Foto ${user.nama}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                  {user.nama?.charAt(0)?.toUpperCase() || "K"}
                </div>
              )}
            </div>

            {/* NAMA */}
            <div>
              <p className="text-sm font-medium text-slate-900">
                {user.nama}
              </p>

              <p className="text-xs text-slate-500">
                Kandidat
              </p>
            </div>
          </div>
        </header>

        {/* =================================================
            WELCOME CARD
        ================================================= */}

        <div className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <span className="text-[13px] text-slate-500">
                Selamat datang kembali 👋
              </span>

              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Halo, {user.nama}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Berikut ringkasan aktivitas lamaranmu.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/kandidat/lowongan")
              }
              className="flex w-fit items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <Search
                className="h-4 w-4"
                strokeWidth={2}
              />

              Cari Lowongan
            </button>
          </div>

          {/* SEARCH */}
          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-[1fr_1fr_auto]">
            <input
              type="text"
              value={keyword}
              onChange={(e) =>
                setKeyword(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Cari posisi atau pekerjaan"
              className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />

            <input
              type="text"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Kota atau provinsi"
              className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />

            <button
              type="button"
              onClick={handleSearch}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Cari
            </button>
          </div>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.key}
                className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition-shadow hover:shadow-sm"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={2}
                  />
                </div>

                <p className="mt-4 text-[13px] text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">

          {/* =================================================
              LOWONGAN
          ================================================= */}

          <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">
                  Lowongan Terbaru
                </h3>

                <p className="mt-0.5 text-[13px] text-slate-500">
                  Peluang karier yang baru dibuka
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/kandidat/lowongan")
                }
                className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 transition-colors hover:text-emerald-700"
              >
                Lihat Semua

                <ArrowRight
                  className="h-3.5 w-3.5"
                  strokeWidth={2}
                />
              </button>
            </div>

            <div className="space-y-2">

              {/* LOADING */}
              {loadingLowongan && (
                <div className="rounded-xl border border-slate-100 px-4 py-6 text-center text-sm text-slate-400">
                  Memuat lowongan...
                </div>
              )}

              {/* EMPTY */}
              {!loadingLowongan &&
                lowongan.length === 0 && (
                  <div className="rounded-xl border border-slate-100 px-4 py-6 text-center text-sm text-slate-400">
                    Belum ada lowongan aktif saat ini.
                  </div>
                )}

              {/* DATA */}
              {!loadingLowongan &&
                lowongan.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() =>
                      router.push(
                        `/kandidat/lowongan/${job.id}`
                      )
                    }
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50/60"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <BriefcaseBusiness
                        className="h-[18px] w-[18px]"
                        strokeWidth={2}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-slate-900">
                        {job.posisi}
                      </p>

                      <p className="flex items-center gap-1 text-[12.5px] text-slate-500">
                        {job.departemen}

                        <span className="text-slate-300">
                          •
                        </span>

                        <MapPin className="h-3 w-3" />

                        {job.lokasi}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-medium text-emerald-700">
                      Aktif
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* =================================================
              AKTIVITAS
          ================================================= */}

          <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
            <div className="mb-4">
              <h3 className="text-[15px] font-semibold text-slate-900">
                Aktivitas Lamaran
              </h3>

              <p className="mt-0.5 text-[13px] text-slate-500">
                Riwayat terbaru lamaranmu
              </p>
            </div>

            <div className="space-y-5">
              {activities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.key}
                    className="flex gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon
                        className="h-4 w-4"
                        strokeWidth={2}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-slate-900">
                        {activity.title}
                      </p>

                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-500">
                        {activity.desc}
                      </p>

                      <p className="mt-1 text-[11.5px] text-slate-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  router.push("/kandidat/lamaran")
                }
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Lihat Semua Lamaran

                <ArrowRight
                  className="h-3.5 w-3.5"
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}