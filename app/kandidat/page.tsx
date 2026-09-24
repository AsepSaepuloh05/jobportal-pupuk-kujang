"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  UserCircle,
  XCircle,
} from "lucide-react";

interface User {
  id: number;
  nama: string;
  email: string;
  nik: string;
  alamat?: string | null;
  role: string;
  dokumenProfil?: {
    pathFile: string;
  } | null;
}

interface Lowongan {
  id: string;
  posisi: string;
  departemen: string;
  lokasi: string;
  tipe: string;
  kategori?: string | null;
  deskripsi?: string | null;
  persyaratan?: string | null;
  tanggungJawab?: string | null;
}

interface Lamaran {
  id: number;
  status: string;
  createdAt: string;
  lowongan?: Lowongan | null;
}

interface Dokumen {
  id: number;
  jenisDokumen: string;
  namaAsli?: string;
  pathFile?: string;
}

interface Pendidikan {
  id: number;
  jenjang: string;
  institusi: string;
  jurusan: string;
  tahunMulai: string;
  tahunSelesai: string;
  nilai?: string | null;
  ijazahNamaFile?: string | null;
  ijazahNamaAsli?: string | null;
  ijazahPathFile?: string | null;
  ijazahTipeFile?: string | null;
  ijazahUkuranFile?: number | null;
}

export default function KandidatDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [lamaran, setLamaran] = useState<Lamaran[]>([]);
  const [dokumen, setDokumen] = useState<Dokumen[]>([]);
  const [pendidikan, setPendidikan] = useState<Pendidikan[]>([]);
  const [lowongan, setLowongan] = useState<Lowongan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [
        meRes,
        lamaranRes,
        dokumenRes,
        pendidikanRes,
        lowonganRes,
      ] = await Promise.all([
        fetch("/api/me", {
          cache: "no-store",
        }),

        fetch("/api/lamaran", {
          cache: "no-store",
        }),

        fetch("/api/profil/dokumen", {
          cache: "no-store",
        }),

        fetch("/api/pendidikan", {
          cache: "no-store",
        }),

        fetch("/api/lowongan?status=AKTIF", {
          cache: "no-store",
        }),
      ]);

      // ============================================================
      // USER
      // ============================================================

      if (meRes.ok) {
        const meData = await meRes.json();

        if (meData.success && meData.user) {
          setUser(meData.user);
        }
      }

      // ============================================================
      // LAMARAN
      // ============================================================

      if (lamaranRes.ok) {
        const lamaranData = await lamaranRes.json();

        const lamaranList = Array.isArray(lamaranData)
          ? lamaranData
          : Array.isArray(lamaranData?.lamaran)
          ? lamaranData.lamaran
          : Array.isArray(lamaranData?.data)
          ? lamaranData.data
          : [];

        setLamaran(lamaranList);
      }

      // ============================================================
      // DOKUMEN
      // ============================================================

      if (dokumenRes.ok) {
        const dokumenData = await dokumenRes.json();

        const dokumenList = Array.isArray(dokumenData?.dokumen)
          ? dokumenData.dokumen
          : [];

        setDokumen(dokumenList);
      }

      // ============================================================
      // PENDIDIKAN
      // ============================================================

      if (pendidikanRes.ok) {
        const pendidikanData = await pendidikanRes.json();

        const pendidikanList = Array.isArray(
          pendidikanData?.pendidikan
        )
          ? pendidikanData.pendidikan
          : Array.isArray(pendidikanData?.data)
          ? pendidikanData.data
          : [];

        setPendidikan(pendidikanList);
      }

      // ============================================================
      // LOWONGAN
      // ============================================================

      if (lowonganRes.ok) {
        const lowonganData = await lowonganRes.json();

        const lowonganList = Array.isArray(lowonganData)
          ? lowonganData
          : Array.isArray(lowonganData?.lowongan)
          ? lowonganData.lowongan
          : Array.isArray(lowonganData?.data)
          ? lowonganData.data
          : [];

        setLowongan(lowonganList);
      }
    } catch (error) {
      console.error("FETCH DASHBOARD ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // NORMALISASI DOKUMEN
  // ============================================================

  const normalizeDocumentType = (value?: string | null) => {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[\s_-]+/g, "");
  };

  const hasDocument = (type: string) => {
    const target = normalizeDocumentType(type);

    return dokumen.some(
      (item) =>
        normalizeDocumentType(item.jenisDokumen) === target
    );
  };

  // ============================================================
  // CEK IJAZAH
  // ============================================================

  const hasIjazah = useMemo(() => {
    const dariDokumen = dokumen.some(
      (item) =>
        normalizeDocumentType(item.jenisDokumen) === "IJAZAH"
    );

    const dariPendidikan = pendidikan.some(
      (item) =>
        Boolean(item.ijazahPathFile?.trim())
    );

    return dariDokumen || dariPendidikan;
  }, [dokumen, pendidikan]);

  // ============================================================
  // FOTO PROFIL
  // ============================================================

  const fotoProfil =
    user?.dokumenProfil?.pathFile || null;

  // ============================================================
  // JURUSAN / KEJURUAN KANDIDAT
  // ============================================================

  const jurusanKandidat = useMemo(() => {
    if (!pendidikan.length) return "";

    const pendidikanTerakhir = [...pendidikan].sort(
      (a, b) => {
        return (
          Number(b.tahunSelesai || 0) -
          Number(a.tahunSelesai || 0)
        );
      }
    )[0];

    return pendidikanTerakhir?.jurusan?.trim() || "";
  }, [pendidikan]);

  // ============================================================
  // LOWONGAN REKOMENDASI
  // ============================================================

  const recommendedLowongan = useMemo(() => {
    if (!jurusanKandidat) {
      return [];
    }

    const keyword = jurusanKandidat
      .toLowerCase()
      .trim();

    if (!keyword) return [];

    const keywordWords = keyword
      .split(/\s+/)
      .filter((word) => word.length >= 3);

    const result = lowongan
      .map((job) => {
        const searchableText = [
          job.posisi,
          job.departemen,
          job.kategori,
          job.deskripsi,
          job.persyaratan,
          job.tanggungJawab,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        let score = 0;

        if (searchableText.includes(keyword)) {
          score += 10;
        }

        keywordWords.forEach((word) => {
          if (searchableText.includes(word)) {
            score += 2;
          }
        });

        const posisiText = `${job.posisi} ${
          job.departemen
        } ${job.kategori || ""}`.toLowerCase();

        if (posisiText.includes(keyword)) {
          score += 5;
        }

        return {
          job,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.job);

    return result;
  }, [lowongan, jurusanKandidat]);

  // ============================================================
  // TOTAL LOWONGAN AKTIF
  // ============================================================

  const totalLowonganAktif = lowongan.length;

  // ============================================================
  // TOTAL REKOMENDASI LAMARAN
  // ============================================================

  const totalRekomendasiLowongan = recommendedLowongan.length;

  // ============================================================
  // LAMARAN TERBARU
  // ============================================================

  const latestLamaran = useMemo(() => {
    return [...lamaran]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
  }, [lamaran]);

  // ============================================================
  // STATUS LAMARAN
  // ============================================================

  const currentLamaran = useMemo(() => {
    return [...lamaran].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )[0] || null;
  }, [lamaran]);

  const statusLamaran = useMemo(() => {
    if (!currentLamaran) {
      return {
        label: "Belum Melamar",
        description: "Belum ada lamaran yang dikirim",
        className:
          "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
        icon: <FileText size={15} />,
      };
    }

    const status = String(
      currentLamaran.status || ""
    ).toUpperCase();

    if (status === "LOLOS") {
      return {
        label: "Lolos",
        description: "Anda dinyatakan lolos seleksi",
        className:
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
        icon: <CheckCircle2 size={15} />,
      };
    }

    if (status === "DITOLAK") {
      return {
        label: "Ditolak",
        description: "Lamaran tidak dilanjutkan",
        className:
          "bg-red-50 text-red-700 ring-1 ring-red-100",
        icon: <XCircle size={15} />,
      };
    }

    if (status === "INTERVIEW") {
      return {
        label: "Interview",
        description:
          "Menunggu atau mengikuti tahap interview",
        className:
          "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
        icon: <CalendarDays size={15} />,
      };
    }

    return {
      label: "Sedang Diproses",
      description:
        "Lamaran sedang dalam proses seleksi",
      className:
        "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
      icon: <Clock3 size={15} />,
    };
  }, [currentLamaran]);

  // ============================================================
  // PROFILE COMPLETENESS
  // ============================================================

  const profileChecks = useMemo(() => {
    return [
      {
        label: "Nama lengkap",
        complete: Boolean(user?.nama?.trim()),
      },
      {
        label: "Email",
        complete: Boolean(user?.email?.trim()),
      },
      {
        label: "NIK",
        complete: Boolean(user?.nik?.trim()),
      },
      {
        label: "Alamat",
        complete: Boolean(user?.alamat?.trim()),
      },
      {
        label: "CV",
        complete: hasDocument("CV"),
      },
      {
        label: "Ijazah",
        complete: hasIjazah,
      },
      {
        label: "KTP",
        complete: hasDocument("KTP"),
      },
    ];
  }, [user, dokumen, hasIjazah]);

  const completedProfile = profileChecks.filter(
    (item) => item.complete
  ).length;

  const profilePercentage = Math.round(
    (completedProfile / profileChecks.length) * 100
  );

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusBadge = (status: string) => {
    const normalized = String(status).toUpperCase();

    if (normalized === "LOLOS") {
      return {
        label: "Lolos",
        className:
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
        icon: <CheckCircle2 size={14} />,
      };
    }

    if (normalized === "DITOLAK") {
      return {
        label: "Ditolak",
        className:
          "bg-red-50 text-red-700 ring-1 ring-red-100",
        icon: <XCircle size={14} />,
      };
    }

    if (normalized === "INTERVIEW") {
      return {
        label: "Interview",
        className:
          "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
        icon: <CalendarDays size={14} />,
      };
    }

    return {
      label: "Diproses",
      className:
        "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
      icon: <Clock3 size={14} />,
    };
  };

  // ============================================================
  // FORMAT TANGGAL
  // ============================================================

  const formatDate = (date: string) => {
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(date));
    } catch {
      return "-";
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

          <p className="text-sm font-medium text-slate-500">
            Memuat dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f6faf8] text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-slate-500">
              Dashboard Kandidat
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Selamat datang,{" "}
              <span className="text-emerald-700">
                {user?.nama || "Kandidat"}
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Pantau aktivitas lamaran dan kelengkapan
              profil Anda melalui dashboard ini.
            </p>
          </div>

          {/* FOTO PROFIL */}

          <Link
            href="/kandidat/profil"
            className="group flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
          >
            <div className="h-11 w-11 overflow-hidden rounded-xl bg-emerald-50">
              {fotoProfil ? (
                <img
                  src={fotoProfil}
                  alt={user?.nama || "Foto profil"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-emerald-600">
                  <UserCircle size={25} />
                </div>
              )}
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-32 truncate text-sm font-bold text-slate-800">
                {user?.nama || "Kandidat"}
              </p>

              <p className="text-xs text-slate-400">
                Lihat profil
              </p>
            </div>

            <ChevronRight
              size={16}
              className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
            />
          </Link>
        </div>

        {/* =====================================================
            STATISTIK
        ====================================================== */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* TOTAL LOWONGAN AKTIF */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Lowongan Aktif
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalLowonganAktif}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BriefcaseBusiness size={20} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Lowongan yang tersedia
            </p>
          </div>

          {/* STATUS LAMARAN */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  Status Lamaran
                </p>

                <p className="mt-2 truncate text-xl font-bold text-slate-900">
                  {statusLamaran.label}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${statusLamaran.className}`}
              >
                {statusLamaran.icon}
              </div>
            </div>

            <p className="mt-3 line-clamp-1 text-xs text-slate-400">
              {statusLamaran.description}
            </p>
          </div>

          {/* TOTAL REKOMENDASI LAMARAN */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  Rekomendasi Lowongan
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalRekomendasiLowongan}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <BriefcaseBusiness size={20} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Lowongan sesuai jurusan Anda
            </p>
          </div>

          {/* KELENGKAPAN PROFIL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Kelengkapan Profil
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {profilePercentage}%
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserCircle size={20} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {completedProfile}/{profileChecks.length} data lengkap
            </p>
          </div>
        </div>

        {/* =====================================================
            REKOMENDASI LOWONGAN
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Lowongan Direkomendasikan
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Rekomendasi berdasarkan jurusan{" "}
                {jurusanKandidat
                  ? `"${jurusanKandidat}"`
                  : "pendidikan Anda"}
                .
              </p>
            </div>

            <Link
              href="/kandidat/lowongan"
              className="flex w-fit items-center gap-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              Lihat semua
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="p-5 sm:p-6">

            {recommendedLowongan.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                {recommendedLowongan.map((job) => (
                  <Link
                    key={job.id}
                    href={`/kandidat/lowongan/${job.id}`}
                    className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-100">
                        <BriefcaseBusiness size={19} />
                      </div>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        Rekomendasi
                      </span>
                    </div>

                    <h3 className="mt-4 line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                      {job.posisi}
                    </h3>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {job.departemen}
                    </p>

                    <div className="mt-4 space-y-2">

                      {job.lokasi && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin
                            size={14}
                            className="shrink-0 text-slate-400"
                          />
                          <span className="truncate">
                            {job.lokasi}
                          </span>
                        </div>
                      )}

                      {job.tipe && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <BriefcaseBusiness
                            size={14}
                            className="shrink-0 text-slate-400"
                          />
                          <span>{job.tipe}</span>
                        </div>
                      )}

                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                      <span className="text-xs font-medium text-slate-400">
                        Sesuai kejuruan
                      </span>

                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        Lihat
                        <ChevronRight
                          size={14}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>

                  </Link>
                ))}

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <BriefcaseBusiness size={22} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  Belum ada rekomendasi
                </h3>

                <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                  {jurusanKandidat
                    ? "Belum ditemukan lowongan yang sesuai dengan jurusan Anda."
                    : "Lengkapi data pendidikan dan jurusan pada profil untuk mendapatkan rekomendasi lowongan."}
                </p>

                <Link
                  href={
                    jurusanKandidat
                      ? "/kandidat/lowongan"
                      : "/kandidat/profil"
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  {jurusanKandidat
                    ? "Cari Lowongan"
                    : "Lengkapi Pendidikan"}
                  <ChevronRight size={15} />
                </Link>

              </div>
            )}

          </div>
        </section>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ===================================================
              LAMARAN TERBARU
          ==================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Lamaran Terakhir
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Tiga lamaran terbaru Anda
                </p>
              </div>

              <Link
                href="/kandidat/lamaran"
                className="flex items-center gap-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
              >
                Lihat semua
                <ChevronRight size={16} />
              </Link>

            </div>

            <div className="divide-y divide-slate-100">

              {latestLamaran.length > 0 ? (
                latestLamaran.map((item) => {
                  const status = getStatusBadge(
                    item.status
                  );

                  return (
                    <div
                      key={item.id}
                      className="px-5 py-5 transition hover:bg-slate-50/70 sm:px-6"
                    >

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start gap-3">

                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              <BriefcaseBusiness size={19} />
                            </div>

                            <div className="min-w-0">

                              <h3 className="truncate text-sm font-bold text-slate-900">
                                {item.lowongan?.posisi ||
                                  "Posisi tidak tersedia"}
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                {item.lowongan?.departemen ||
                                  "Departemen tidak tersedia"}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">

                                {item.lowongan?.lokasi && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={13} />
                                    {item.lowongan.lokasi}
                                  </span>
                                )}

                                <span>
                                  {formatDate(
                                    item.createdAt
                                  )}
                                </span>

                              </div>
                            </div>

                          </div>
                        </div>

                        <div className="shrink-0">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                          >
                            {status.icon}
                            {status.label}
                          </span>

                        </div>

                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FileText size={22} />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-800">
                    Belum ada lamaran
                  </h3>

                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Anda belum mengirimkan lamaran ke
                    lowongan apa pun.
                  </p>

                  <Link
                    href="/kandidat/lowongan"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Cari Lowongan
                    <ChevronRight size={15} />
                  </Link>

                </div>
              )}

            </div>
          </section>

          {/* ===================================================
              PROFIL
          ==================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-4">

              <h2 className="text-base font-bold text-slate-900">
                Kelengkapan Profil
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Lengkapi profil untuk meningkatkan kesiapan
                lamaran.
              </p>

            </div>

            <div className="p-5">

              {/* FOTO + PERCENTAGE */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 overflow-hidden rounded-xl bg-emerald-50">

                    {fotoProfil ? (
                      <img
                        src={fotoProfil}
                        alt={user?.nama || "Foto profil"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-emerald-600">
                        <UserCircle size={21} />
                      </div>
                    )}

                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {profilePercentage}%
                    </p>

                    <p className="text-xs text-slate-500">
                      Profil lengkap
                    </p>
                  </div>

                </div>

                <span className="text-xs font-medium text-slate-400">
                  {completedProfile}/
                  {profileChecks.length}
                </span>

              </div>

              {/* PROGRESS */}

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{
                    width: `${profilePercentage}%`,
                  }}
                />

              </div>

              {/* CHECKLIST */}

              <div className="mt-5 space-y-3">

                {profileChecks.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >

                    <span className="text-sm text-slate-600">
                      {item.label}
                    </span>

                    {item.complete ? (
                      <CheckCircle2
                        size={18}
                        className="text-emerald-600"
                      />
                    ) : (
                      <XCircle
                        size={18}
                        className="text-slate-300"
                      />
                    )}

                  </div>
                ))}

              </div>

              {/* BUTTON */}

              <Link
                href="/kandidat/profil"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                Lengkapi Profil
                <ChevronRight size={16} />
              </Link>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}