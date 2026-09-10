"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  ClipboardCheck,
  FilePlus2,
  FileText,
  Plus,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

interface User {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
}

interface Stat {
  key: string;
  label: string;
  value: string;
  delta: string;
  icon: React.ElementType;
  color: "emerald" | "blue" | "amber" | "violet";
}

interface Job {
  key: string;
  code: string;
  title: string;
  dept: string;
  status: string;
}

interface Activity {
  key: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  time: string;
}

// =====================================================
// STATISTICS
// =====================================================

const stats: Stat[] = [
  {
    key: "lowongan",
    label: "Lowongan Aktif",
    value: "12",
    delta: "+2 bulan ini",
    icon: BriefcaseBusiness,
    color: "emerald",
  },
  {
    key: "kandidat",
    label: "Total Kandidat",
    value: "248",
    delta: "+18 minggu ini",
    icon: Users,
    color: "blue",
  },
  {
    key: "lamaran",
    label: "Lamaran Masuk",
    value: "86",
    delta: "+14 hari ini",
    icon: FileText,
    color: "amber",
  },
  {
    key: "seleksi",
    label: "Dalam Seleksi",
    value: "24",
    delta: "8 perlu diproses",
    icon: ClipboardCheck,
    color: "violet",
  },
];

// =====================================================
// LOWONGAN
// =====================================================

const jobs: Job[] = [
  {
    key: "it",
    code: "IT",
    title: "IT Support",
    dept: "Departemen IT",
    status: "Aktif",
  },
  {
    key: "qa",
    code: "QA",
    title: "Quality Assurance",
    dept: "Departemen IT",
    status: "Aktif",
  },
  {
    key: "hr",
    code: "HR",
    title: "HR Staff",
    dept: "Departemen MPSDM",
    status: "Aktif",
  },
  {
    key: "fn",
    code: "FN",
    title: "Finance Staff",
    dept: "Departemen Keuangan",
    status: "Aktif",
  },
];

// =====================================================
// AKTIVITAS
// =====================================================

const activities: Activity[] = [
  {
    key: "a1",
    icon: FilePlus2,
    title: "Lamaran baru diterima",
    desc: "Kandidat melamar posisi IT Support",
    time: "10 menit yang lalu",
  },
  {
    key: "a2",
    icon: UserCheck,
    title: "Kandidat lolos seleksi",
    desc: "Kandidat telah lolos tahap administrasi",
    time: "35 menit yang lalu",
  },
  {
    key: "a3",
    icon: UserPlus,
    title: "Kandidat baru terdaftar",
    desc: "Kandidat baru membuat akun",
    time: "1 jam yang lalu",
  },
];

// =====================================================
// WARNA ICON STATISTIK
// =====================================================

const statColor: Record<Stat["color"], string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
};

// =====================================================
// DASHBOARD HR
// =====================================================

export default function HRDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ===================================================
  // GET USER
  // ===================================================

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

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
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

  // ===================================================
  // NO USER
  // ===================================================

  if (!user) {
    return null;
  }

  // ===================================================
  // DASHBOARD
  // ===================================================

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
              Kelola proses rekrutmen dan kandidat melalui dashboard HR.
            </p>
          </div>

          {/* USER PROFILE */}

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {user.nama.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900">
                {user.nama}
              </p>

              <p className="text-xs text-slate-500">
                Human Resources
              </p>
            </div>
          </div>
        </header>

        {/* =================================================
            WELCOME
        ================================================= */}

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

          {/* BUTTON BUAT LOWONGAN */}

          <button
            type="button"
            onClick={() => router.push("/hr/kelolalowongan")}
            className="flex w-fit items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />

            Buat Lowongan
          </button>
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

                {/* ICON */}

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${statColor[stat.color]}`}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={2}
                  />
                </div>

                {/* LABEL */}

                <p className="mt-4 text-[13px] text-slate-500">
                  {stat.label}
                </p>

                {/* VALUE */}

                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {stat.value}
                </p>

                {/* DELTA */}

                <p className="mt-1 text-xs text-slate-400">
                  {stat.delta}
                </p>
              </div>
            );
          })}

        </div>

        {/* =================================================
            CONTENT GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">

          {/* =================================================
              LOWONGAN TERBARU
          ================================================= */}

          <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

            {/* HEADER */}

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">
                  Lowongan Terbaru
                </h3>

                <p className="mt-0.5 text-[13px] text-slate-500">
                  Daftar lowongan yang sedang aktif
                </p>
              </div>

              {/* LIHAT SEMUA */}

              <button
                type="button"
                onClick={() => router.push("/hr/kelolalowongan")}
                className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 transition-colors hover:text-emerald-700"
              >
                Lihat Semua

                <ArrowRight
                  className="h-3.5 w-3.5"
                  strokeWidth={2}
                />
              </button>

            </div>

            {/* JOB LIST */}

            <div className="space-y-2">

              {jobs.map((job) => (
                <div
                  key={job.key}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50/60"
                >

                  {/* JOB ICON */}

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <BriefcaseBusiness
                      className="h-4.5 w-4.5"
                      strokeWidth={2}
                    />
                  </div>

                  {/* JOB INFORMATION */}

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-[14px] font-medium text-slate-900">
                      {job.title}
                    </p>

                    <p className="text-[12.5px] text-slate-500">
                      {job.dept}
                    </p>

                  </div>

                  {/* STATUS */}

                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-medium text-emerald-700">
                    {job.status}
                  </span>

                </div>
              ))}

            </div>
          </div>

          {/* =================================================
              AKTIVITAS TERBARU
          ================================================= */}

          <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

            {/* HEADER */}

            <div className="mb-4">

              <h3 className="text-[15px] font-semibold text-slate-900">
                Aktivitas Terbaru
              </h3>

              <p className="mt-0.5 text-[13px] text-slate-500">
                Aktivitas kandidat
              </p>

            </div>

            {/* ACTIVITY LIST */}

            <div className="space-y-5">

              {activities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.key}
                    className="flex gap-3"
                  >

                    {/* ICON */}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon
                        className="h-4 w-4"
                        strokeWidth={2}
                      />
                    </div>

                    {/* CONTENT */}

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

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}