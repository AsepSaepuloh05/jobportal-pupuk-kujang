"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Eye,
  X,
  Inbox,
  GraduationCap,
  WalletCards,
  Users,
  CalendarDays,
  Building2,
} from "lucide-react";
import { formatGajiRange } from "@/lib/format";

const TAHAPAN_LABEL: Record<string, string> = {
  SCREENING: "Screening",
  ASSESSMENT: "Assessment",
  INTERVIEW: "Interview",
  TECHNICAL_TEST: "Technical Test",
  MCU: "MCU",
  OFFERING: "Offering",
};

interface User {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
}

type StatusLowongan = "AKTIF" | "DRAFT" | "DITUTUP";

interface Lowongan {
  id: number;
  posisi: string;
  departemen: string;
  lokasi: string;
  tipe: string;
  status: StatusLowongan;
  pelamar: number;
  createdAt: string;

  // DETAIL LOWONGAN
  kategori?: string | null;
  pendidikan?: string | null;
  pengalaman?: string | null;
  gajiMin?: number | null;
  gajiMax?: number | null;
  deskripsi?: string | null;
  persyaratan?: string | null;
  tanggungJawab?: string | null;
  tanggalBerakhir?: string | null;
  tahapanSeleksi?: string[];
}

const statusLabel: Record<StatusLowongan, string> = {
  AKTIF: "Aktif",
  DRAFT: "Draft",
  DITUTUP: "Ditutup",
};

export default function KelolaLowonganPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [lowongan, setLowongan] = useState<Lowongan[]>([]);
  const [loadingLowongan, setLoadingLowongan] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  // =====================================================
  // DETAIL MODAL
  // =====================================================

  const [selectedLowongan, setSelectedLowongan] =
    useState<Lowongan | null>(null);

  const [konfirmasiHapus, setKonfirmasiHapus] = useState<{
    id: number;
    posisi: string;
    pelamar: number;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  // =====================================================
  // AMBIL DATA LOWONGAN
  // =====================================================

  const getLowongan = async () => {
    try {
      setLoadingLowongan(true);

      const response = await fetch("/api/lowongan");

      if (!response.ok) {
        throw new Error("Gagal mengambil data lowongan");
      }

      const data = await response.json();

      setLowongan(data);
    } catch (error) {
      console.error("GET LOWONGAN ERROR:", error);
      alert("Gagal mengambil data lowongan");
    } finally {
      setLoadingLowongan(false);
    }
  };

  useEffect(() => {
    if (user) {
      getLowongan();
    }
  }, [user]);

  // =====================================================
  // LIHAT DETAIL LOWONGAN
  // =====================================================

  const handleViewDetail = async (id: number) => {
    try {
      setLoadingDetail(true);

      const response = await fetch(`/api/lowongan/${id}`);

      if (!response.ok) {
        throw new Error("Gagal mengambil detail lowongan");
      }

      const data = await response.json();

      const detail = data.lowongan || data;

      setSelectedLowongan(detail);
    } catch (error) {
      console.error("GET DETAIL LOWONGAN ERROR:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Gagal mengambil detail lowongan");
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  // =====================================================
  // TUTUP MODAL
  // =====================================================

  const closeDetail = () => {
    setSelectedLowongan(null);
  };

  // =====================================================
  // HAPUS LOWONGAN
  // =====================================================

  const handleDelete = (id: number, posisi: string, pelamar: number) => {
    setKonfirmasiHapus({ id, posisi, pelamar });
  };

  const eksekusiHapus = async () => {
    if (!konfirmasiHapus) return;

    const { id } = konfirmasiHapus;

    try {
      setDeletingId(id);

      const response = await fetch(`/api/lowongan/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus lowongan");
      }

      if (selectedLowongan?.id === id) {
        setSelectedLowongan(null);
      }

      await getLowongan();
    } catch (error) {
      console.error("DELETE LOWONGAN ERROR:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Gagal menghapus lowongan");
      }
    } finally {
      setDeletingId(null);
      setKonfirmasiHapus(null);
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredLowongan = lowongan.filter((item) => {
    const search = keyword.toLowerCase();

    const cocokKeyword =
      item.posisi.toLowerCase().includes(search) ||
      item.departemen.toLowerCase().includes(search) ||
      item.lokasi.toLowerCase().includes(search);

    const cocokStatus =
      filterStatus === "Semua" ||
      statusLabel[item.status] === filterStatus;

    return cocokKeyword && cocokStatus;
  });

  // =====================================================
  // LOADING LOGIN
  // =====================================================

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

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-200 bg-white px-6 py-5 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* TITLE */}

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Kelola Lowongan
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Kelola dan pantau lowongan pekerjaan yang tersedia.
            </p>
          </div>

          {/* PROFILE */}

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              {user.nama.charAt(0).toUpperCase()}
            </div>

            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-800">
                {user.nama}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Human Resources
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* =====================================================
            PAGE TOP
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Daftar Lowongan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Kelola seluruh lowongan pekerjaan perusahaan.
            </p>
          </div>

          {/* BUAT LOWONGAN */}

          <button
            type="button"
            onClick={() => router.push("/hr/lowongan/tambah")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Plus
              className="h-4 w-4"
              strokeWidth={2.2}
            />

            Buat Lowongan
          </button>

        </div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL LOWONGAN */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <BriefcaseBusiness
                  className="h-6 w-6"
                  strokeWidth={2}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Lowongan
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {lowongan.length}
                </p>
              </div>

            </div>
          </div>

          {/* LOWONGAN AKTIF */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <CheckCircle2
                  className="h-6 w-6"
                  strokeWidth={2}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Lowongan Aktif
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {
                    lowongan.filter(
                      (item) => item.status === "AKTIF"
                    ).length
                  }
                </p>
              </div>

            </div>
          </div>

          {/* TOTAL PELAMAR */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <Users
                  className="h-6 w-6"
                  strokeWidth={2}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Pelamar
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {
                    lowongan.reduce(
                      (total, item) =>
                        total + item.pelamar,
                      0
                    )
                  }
                </p>
              </div>

            </div>
          </div>

          {/* DRAFT */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <ClipboardList
                  className="h-6 w-6"
                  strokeWidth={2}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Draft
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {
                    lowongan.filter(
                      (item) => item.status === "DRAFT"
                    ).length
                  }
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* =====================================================
            TABLE PANEL
        ===================================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* FILTER */}

          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">

            {/* SEARCH */}

            <div className="relative w-full sm:max-w-md">

              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                strokeWidth={2}
              />

              <input
                type="text"
                placeholder="Cari posisi, departemen..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

            </div>

            {/* STATUS */}

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:w-48"
            >
              <option value="Semua">
                Semua Status
              </option>

              <option value="Aktif">
                Aktif
              </option>

              <option value="Draft">
                Draft
              </option>

              <option value="Ditutup">
                Ditutup
              </option>
            </select>

          </div>

          {/* TABLE */}

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Posisi
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Departemen
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Lokasi
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tipe
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pelamar
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dibuat
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {/* LOADING */}

                {loadingLowongan ? (

                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">

                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

                        <span className="text-sm text-slate-500">
                          Memuat data lowongan...
                        </span>

                      </div>
                    </td>
                  </tr>

                ) : filteredLowongan.length > 0 ? (

                  filteredLowongan.map((item) => (

                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* POSISI */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <BriefcaseBusiness
                              className="h-4.5 w-4.5"
                              strokeWidth={2}
                            />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {item.posisi}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* DEPARTEMEN */}

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.departemen}
                      </td>

                      {/* LOKASI */}

                      <td className="px-5 py-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5">

                          <MapPin
                            className="h-4 w-4 text-slate-400"
                            strokeWidth={2}
                          />

                          {item.lokasi}

                        </span>
                      </td>

                      {/* TIPE */}

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.tipe}
                      </td>

                      {/* PELAMAR */}

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/hr/kelolalowongan/${item.id}/pelamar`)
                          }
                          className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 underline-offset-2 hover:underline"
                        >
                          <Users className="h-4 w-4 text-slate-400" strokeWidth={2} />
                          {item.pelamar}
                        </button>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        {item.status === "AKTIF" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        )}

                        {item.status === "DRAFT" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        )}

                        {item.status === "DITUTUP" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Ditutup
                          </span>
                        )}

                      </td>

                      {/* TANGGAL */}

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </td>

                      {/* AKSI */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-2">

                          {/* LIHAT */}

                          <button
                            type="button"
                            title="Lihat Detail"
                            aria-label="Lihat Detail"
                            onClick={() =>
                              handleViewDetail(item.id)
                            }
                            disabled={loadingDetail}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Eye
                              className="h-4 w-4"
                              strokeWidth={2}
                            />
                          </button>

                          {/* EDIT */}

                          <button
                            type="button"
                            title="Edit"
                            aria-label="Edit"
                            onClick={() =>
                              router.push(
                                `/hr/lowongan/${item.id}/edit`
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <Pencil
                              className="h-4 w-4"
                              strokeWidth={2}
                            />
                          </button>

                          {/* HAPUS */}

                          <button
                            type="button"
                            title="Hapus"
                            aria-label="Hapus"
                            onClick={() =>
                              handleDelete(
                                item.id,
                                item.posisi,
                                item.pelamar
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2
                              className="h-4 w-4"
                              strokeWidth={2}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  /* EMPTY STATE */

                  <tr>

                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center"
                    >

                      <div className="flex flex-col items-center justify-center">

                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                          <Inbox
                            className="h-7 w-7"
                            strokeWidth={1.8}
                          />

                        </div>

                        <p className="text-sm font-medium text-slate-700">
                          Tidak ada lowongan yang ditemukan.
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Coba ubah kata kunci atau filter status.
                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </main>

      {/* =====================================================
          MODAL DETAIL LOWONGAN
      ===================================================== */}

      {selectedLowongan && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeDetail();
            }
          }}
        >

          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-6">

              <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-16 right-28 h-32 w-32 rounded-full bg-white/5" />

              <div className="relative flex items-start justify-between gap-4">

                <div className="flex items-start gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
                    <BriefcaseBusiness className="h-6 w-6" strokeWidth={2} />
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-white">
                      {selectedLowongan.posisi}
                    </h2>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-emerald-50">

                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {selectedLowongan.departemen}
                      </span>

                      <span className="text-emerald-300">•</span>

                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {selectedLowongan.lokasi}
                      </span>

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={closeDetail}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-emerald-50 transition hover:bg-white/15"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>

              </div>

            </div>

            {/* MODAL CONTENT */}

            <div className="max-h-[calc(90vh-150px)] overflow-y-auto">

              <div className="p-6">

                {/* STATUS */}

                <div className="mb-6 flex flex-wrap items-center gap-2">

                  {selectedLowongan.status === "AKTIF" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Aktif
                    </span>
                  )}

                  {selectedLowongan.status === "DRAFT" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      <ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />
                      Draft
                    </span>
                  )}

                  {selectedLowongan.status === "DITUTUP" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                      Ditutup
                    </span>
                  )}

                  {selectedLowongan.kategori && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                      <BriefcaseBusiness className="h-3.5 w-3.5" />
                      {selectedLowongan.kategori}
                    </span>
                  )}

                </div>

                {/* RINGKASAN CEPAT */}

                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                      Gaji
                    </p>
                    <p className="mt-1 text-sm font-bold text-emerald-700">
                      {formatGajiRange(
                        selectedLowongan.gajiMin,
                        selectedLowongan.gajiMax
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Tipe
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {selectedLowongan.tipe || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Pelamar
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {selectedLowongan.pelamar ?? 0} orang
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Batas Lamaran
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {selectedLowongan.tanggalBerakhir
                        ? new Date(
                          selectedLowongan.tanggalBerakhir
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : "-"}
                    </p>
                  </div>

                </div>

                {/* DETAIL LIST */}

                <div className="mb-7 grid grid-cols-1 gap-x-8 gap-y-2.5 border-y border-slate-100 py-4 sm:grid-cols-2">

                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      Departemen
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedLowongan.departemen || "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      Lokasi
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedLowongan.lokasi || "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      Pendidikan
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedLowongan.pendidikan || "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <ClipboardList className="h-4 w-4 text-slate-400" />
                      Pengalaman
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedLowongan.pengalaman || "-"}
                    </span>
                  </div>

                </div>

                {/* DESKRIPSI */}

                <div className="mb-7">

                  <h3 className="mb-2.5 flex items-center gap-2 text-base font-bold text-slate-800">
                    <FileText className="h-4.5 w-4.5 text-emerald-600" />
                    Deskripsi Pekerjaan
                  </h3>

                  {selectedLowongan.deskripsi ? (
                    <p className="whitespace-pre-line border-l-2 border-emerald-100 pl-4 text-sm leading-7 text-slate-600">
                      {selectedLowongan.deskripsi}
                    </p>
                  ) : (
                    <p className="border-l-2 border-slate-100 pl-4 text-sm italic text-slate-400">
                      Tidak ada deskripsi pekerjaan.
                    </p>
                  )}

                </div>

                {/* TANGGUNG JAWAB */}

                {selectedLowongan.tanggungJawab && (

                  <div className="mb-7">

                    <h3 className="mb-2.5 flex items-center gap-2 text-base font-bold text-slate-800">
                      <ClipboardList className="h-4.5 w-4.5 text-emerald-600" />
                      Tanggung Jawab
                    </h3>

                    <p className="whitespace-pre-line border-l-2 border-emerald-100 pl-4 text-sm leading-7 text-slate-600">
                      {selectedLowongan.tanggungJawab}
                    </p>

                  </div>

                )}

                {/* PERSYARATAN */}

                {selectedLowongan.persyaratan && (

                  <div className="mb-7">

                    <h3 className="mb-2.5 flex items-center gap-2 text-base font-bold text-slate-800">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                      Persyaratan
                    </h3>

                    <p className="whitespace-pre-line border-l-2 border-emerald-100 pl-4 text-sm leading-7 text-slate-600">
                      {selectedLowongan.persyaratan}
                    </p>

                  </div>

                )}

                {/* TAHAPAN SELEKSI */}

                {selectedLowongan.tahapanSeleksi &&
                  selectedLowongan.tahapanSeleksi.length > 0 && (

                    <div className="mt-7">

                      <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">

                        <ClipboardList className="h-4.5 w-4.5 text-emerald-600" />

                        Tahapan Seleksi

                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedLowongan.tahapanSeleksi.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                          >
                            {TAHAPAN_LABEL[item] || item}
                          </span>
                        ))}
                      </div>

                    </div>

                  )}

                {/* CREATED AT */}

                {selectedLowongan.createdAt && (

                  <div className="mt-7 flex items-center gap-2 border-t border-slate-200 pt-5">

                    <CalendarDays className="h-4 w-4 text-slate-400" />

                    <p className="text-xs text-slate-400">
                      Lowongan dibuat pada{" "}
                      <span className="font-medium text-slate-500">
                        {new Date(
                          selectedLowongan.createdAt
                        ).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

              <button
                type="button"
                onClick={closeDetail}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />

                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  const id = selectedLowongan.id;

                  closeDetail();

                  router.push(
                    `/hr/lowongan/${id}/edit`
                  );
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Pencil className="h-4 w-4" />

                Edit Lowongan
              </button>

            </div>

          </div>

        </div>

      )
      }

      {/* =====================================================
          LOADING DETAIL OVERLAY
      ===================================================== */}

      {
        loadingDetail && !selectedLowongan && (

          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">

            <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-xl">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

              <span className="text-sm font-medium text-slate-700">
                Memuat detail lowongan...
              </span>

            </div>

          </div>



        )
      }

      {/* KONFIRMASI HAPUS LOWONGAN */}

      <ConfirmDialog
        open={konfirmasiHapus !== null}
        title={`Hapus Lowongan "${konfirmasiHapus?.posisi}"?`}
        description={
          konfirmasiHapus && konfirmasiHapus.pelamar > 0
            ? `Lowongan ini punya ${konfirmasiHapus.pelamar} pelamar. Menghapus lowongan akan ikut menghapus SELURUH data lamaran mereka (termasuk progress tahapan seleksi) secara permanen. Tindakan ini tidak bisa dibatalkan.`
            : "Lowongan ini belum ada pelamarnya. Tindakan ini tidak bisa dibatalkan."
        }
        confirmText="Ya, Hapus Permanen"
        variant="danger"
        loading={deletingId === konfirmasiHapus?.id}
        onConfirm={eksekusiHapus}
        onCancel={() => setKonfirmasiHapus(null)}
      />

    </div >
  );
}