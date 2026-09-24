"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Inbox,
} from "lucide-react";

interface Kandidat {
  id: number;
  nama: string;
  email: string;
  nik: string;
  noTelepon: string | null;
  alamat: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function KandidatPage() {
  const [kandidat, setKandidat] = useState<Kandidat[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [konfirmasi, setKonfirmasi] = useState<{
    id: number;
    nama: string;
    isActive: boolean;
  } | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const getKandidat = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/daftarkandidat");

      if (!response.ok) {
        throw new Error("Gagal mengambil data kandidat");
      }

      const data = await response.json();
      setKandidat(data);
    } catch (error) {
      console.error("GET KANDIDAT ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getKandidat();
  }, []);

  const handleUbahStatus = (
    id: number,
    nama: string,
    statusSaatIni: boolean
  ) => {
    setKonfirmasi({ id, nama, isActive: statusSaatIni });
  };

  const eksekusiUbahStatus = async () => {
    if (!konfirmasi) return;

    const { id, isActive } = konfirmasi;
    const statusBaru = !isActive;

    try {
      setProcessingId(id);

      const response = await fetch(`/api/users/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: statusBaru }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah status akun");
      }

      setKandidat((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: statusBaru } : item
        )
      );
    } catch (error) {
      console.error("UBAH STATUS ERROR:", error);
      alert(
        error instanceof Error ? error.message : "Gagal mengubah status akun"
      );
    } finally {
      setProcessingId(null);
      setKonfirmasi(null);
    }
  };

  const filteredKandidat = kandidat.filter((item) => {
    const keyword = search.toLowerCase();

    const cocokKeyword =
      item.nama.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword) ||
      item.nik.toLowerCase().includes(keyword);

    const cocokStatus =
      filterStatus === "Semua" ||
      (filterStatus === "Aktif" && item.isActive) ||
      (filterStatus === "Nonaktif" && !item.isActive);

    return cocokKeyword && cocokStatus;
  });

  const totalAktif = kandidat.filter((k) => k.isActive).length;
  const totalNonaktif = kandidat.filter((k) => !k.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white px-6 py-5 md:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Data Kandidat
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola dan lihat seluruh kandidat yang terdaftar.
        </p>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* STATISTICS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Users className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Kandidat
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {kandidat.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <UserCheck className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Akun Aktif
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {totalAktif}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <UserX className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Akun Nonaktif
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {totalNonaktif}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* FILTER */}

        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau NIK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:w-48"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>

        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {loading ? (

            <div className="flex flex-col items-center gap-3 px-6 py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <span className="text-sm text-slate-500">
                Memuat data kandidat...
              </span>
            </div>

          ) : filteredKandidat.length === 0 ? (

            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Inbox className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-700">
                {search || filterStatus !== "Semua"
                  ? "Tidak ada kandidat yang cocok."
                  : "Belum ada kandidat terdaftar."}
              </p>
            </div>

          ) : (

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">

                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Kandidat
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Kontak
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Domisili
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Terdaftar
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredKandidat.map((item) => (

                    <tr
                      key={item.id}
                      className={`transition hover:bg-slate-50 ${!item.isActive ? "bg-red-50/30" : ""
                        }`}
                    >

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${item.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-500"
                              }`}
                          >
                            {item.nama.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {item.nama}
                            </p>
                            <p className="text-xs text-slate-500">
                              NIK {item.nik}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1 text-xs text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {item.email}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {item.noTelepon || "-"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        <span className="flex items-start gap-1.5">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="line-clamp-2 max-w-[220px]">
                            {item.alamat || "-"}
                          </span>
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString(
                          "id-ID",
                          { day: "2-digit", month: "long", year: "numeric" }
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Nonaktif
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          disabled={processingId === item.id}
                          onClick={() =>
                            handleUbahStatus(
                              item.id,
                              item.nama,
                              item.isActive
                            )
                          }
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${item.isActive
                            ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                            : "border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"
                            }`}
                        >
                          {item.isActive ? (
                            <>
                              <UserX className="h-3.5 w-3.5" />
                              Nonaktifkan
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              Aktifkan
                            </>
                          )}
                        </button>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>
            </div>

          )}

        </div>

      </main>

      {/* KONFIRMASI UBAH STATUS */}

      <ConfirmDialog
        open={konfirmasi !== null}
        title={
          konfirmasi?.isActive
            ? `Nonaktifkan akun "${konfirmasi?.nama}"?`
            : `Aktifkan kembali akun "${konfirmasi?.nama}"?`
        }
        description={
          konfirmasi?.isActive
            ? "Kandidat tidak akan bisa login sampai akunnya diaktifkan kembali. Data & riwayat lamaran tetap tersimpan aman."
            : "Kandidat akan bisa login kembali seperti biasa."
        }
        confirmText={konfirmasi?.isActive ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
        variant={konfirmasi?.isActive ? "danger" : "default"}
        loading={processingId === konfirmasi?.id}
        onConfirm={eksekusiUbahStatus}
        onCancel={() => setKonfirmasi(null)}
      />

    </div>
  );
}