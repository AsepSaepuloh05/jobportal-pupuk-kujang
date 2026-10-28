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
  Download
} from "lucide-react";
import { toast } from "@/app/components/Toast";
import Pagination from "@/app/components/Pagination";
import KepalaUrut from "@/app/components/KepalaUrut";
import { eksporExcel, tanggalExcel, stempelFile } from "@/lib/export-excel";
import type { KolomExcel, BarisExcel } from "@/lib/export-excel";

interface Kandidat {
  id: number;
  nama: string;
  email: string;
  nik: string;
  noTelepon: string | null;
  alamat: string | null;
  desa?: string | null;
  kecamatan?: string | null;
  kabupaten?: string | null;
  provinsi?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}
type KunciUrut = "nama" | "createdAt" | "status";

interface BarisMasalah {
  nama: string;
  alasan: string;
}

interface HasilMassal {
  judul: string;
  berhasil: number;
  dilewati: number;
  gagal: BarisMasalah[];
}

export default function KandidatPage() {
  const [kandidat, setKandidat] = useState<Kandidat[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [sortKey, setSortKey] = useState<KunciUrut>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<"nonaktif" | "aktif" | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ selesai: number; total: number } | null>(null);
  const [bulkHasil, setBulkHasil] = useState<HasilMassal | null>(null);

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
      toast.error(
        error instanceof Error ? error.message : "Gagal mengubah status akun"
      );
    } finally {
      setProcessingId(null);
      setKonfirmasi(null);
    }
  };

  const hasilFilter = kandidat.filter((item) => {
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

  const arahUrut = sortDir === "asc" ? 1 : -1;

  const filteredKandidat = [...hasilFilter].sort((a, b) => {
    let selisih = 0;

    if (sortKey === "nama") {
      selisih = a.nama.localeCompare(b.nama, "id");
    } else if (sortKey === "status") {
      selisih = Number(b.isActive) - Number(a.isActive);
    } else {
      selisih =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return selisih * arahUrut;
  });

  const totalHalaman = Math.max(
    1,
    Math.ceil(filteredKandidat.length / pageSize)
  );

  const halamanAktif = Math.min(page, totalHalaman);

  const dataHalaman = filteredKandidat.slice(
    (halamanAktif - 1) * pageSize,
    halamanAktif * pageSize
  );

  const handleSort = (kunci: KunciUrut) => {
    if (sortKey === kunci) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(kunci);
      setSortDir(kunci === "createdAt" ? "desc" : "asc");
    }

    setPage(1);
  };

  const selectedSet = new Set(selectedIds);

  const selectedKandidat = filteredKandidat.filter((k) => selectedSet.has(k.id));

  const jumlahTerpilih = selectedKandidat.length;

  const bisaDinonaktifkan = selectedKandidat.filter((k) => k.isActive);

  const bisaDiaktifkan = selectedKandidat.filter((k) => !k.isActive);

  const targetMassal =
    bulkAction === "aktif" ? bisaDiaktifkan : bisaDinonaktifkan;

  const semuaHalamanTerpilih =
    dataHalaman.length > 0 && dataHalaman.every((k) => selectedSet.has(k.id));

  const sebagianHalamanTerpilih =
    !semuaHalamanTerpilih && dataHalaman.some((k) => selectedSet.has(k.id));

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const togglePilihHalaman = () => {
    const idHalaman = dataHalaman.map((k) => k.id);

    if (semuaHalamanTerpilih) {
      setSelectedIds((prev) => prev.filter((x) => !idHalaman.includes(x)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...idHalaman])));
    }
  };

  const pilihSemuaHasil = () => {
    setSelectedIds(filteredKandidat.map((k) => k.id));
  };

  const ringkasNama = (daftar: Kandidat[]) => {
    const nama = daftar.slice(0, 4).map((k) => k.nama);
    const sisa = daftar.length - nama.length;

    return nama.join(", ") + (sisa > 0 ? ", dan " + sisa + " lainnya" : "");
  };

  const konfirmasiMassal = async () => {
    const aksi = bulkAction;

    if (!aksi) return;

    const statusBaru = aksi === "aktif";
    const daftar = statusBaru ? bisaDiaktifkan : bisaDinonaktifkan;
    const dilewati = jumlahTerpilih - daftar.length;

    const hasil: HasilMassal = {
      judul: statusBaru ? "Aktifkan akun" : "Nonaktifkan akun",
      berhasil: 0,
      dilewati,
      gagal: [],
    };

    setBulkAction(null);
    setBulkRunning(true);
    setBulkProgress({ selesai: 0, total: daftar.length });

    for (let i = 0; i < daftar.length; i++) {
      const item = daftar[i];

      try {
        const response = await fetch(`/api/users/${item.id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: statusBaru }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengubah status akun");
        }

        setKandidat((prev) =>
          prev.map((k) =>
            k.id === item.id ? { ...k, isActive: statusBaru } : k
          )
        );

        hasil.berhasil += 1;
      } catch (error) {
        hasil.gagal.push({
          nama: item.nama,
          alasan: error instanceof Error ? error.message : "Terjadi kesalahan",
        });
      }

      setBulkProgress({ selesai: i + 1, total: daftar.length });
    }

    setBulkRunning(false);
    setBulkProgress(null);
    setSelectedIds([]);

    if (hasil.gagal.length === 0) {
      toast.success(
        hasil.judul +
        ": " +
        hasil.berhasil +
        " berhasil" +
        (dilewati > 0 ? ", " + dilewati + " dilewati" : "")
      );
    } else {
      setBulkHasil(hasil);
    }
  };

  const handleEkspor = async () => {
    if (exporting || filteredKandidat.length === 0) return;

    try {
      setExporting(true);

      const kolom: KolomExcel[] = [
        { header: "No", key: "no", lebar: 6 },
        { header: "Nama", key: "nama", lebar: 28 },
        { header: "Email", key: "email", lebar: 30 },
        { header: "NIK", key: "nik", lebar: 20 },
        { header: "No. Telepon", key: "telepon", lebar: 16 },
        { header: "Alamat", key: "alamat", lebar: 34 },
        { header: "Desa", key: "desa", lebar: 20 },
        { header: "Kecamatan", key: "kecamatan", lebar: 20 },
        { header: "Kabupaten", key: "kabupaten", lebar: 22 },
        { header: "Provinsi", key: "provinsi", lebar: 18 },
        { header: "Status Akun", key: "statusAkun", lebar: 14 },
        { header: "Terdaftar", key: "terdaftar", lebar: 16, format: "dd/mm/yyyy" },
      ];

      const baris: BarisExcel[] = filteredKandidat.map((item, index) => ({
        no: index + 1,
        nama: item.nama,
        email: item.email,
        nik: item.nik,
        telepon: item.noTelepon,
        alamat: item.alamat,
        desa: item.desa ?? null,
        kecamatan: item.kecamatan ?? null,
        kabupaten: item.kabupaten ?? null,
        provinsi: item.provinsi ?? null,
        statusAkun: item.isActive ? "Aktif" : "Nonaktif",
        terdaftar: tanggalExcel(item.createdAt),
      }));

      await eksporExcel({
        namaFile: "Data-Kandidat-" + stempelFile(),
        namaSheet: "Kandidat",
        kolom,
        baris,
      });

      toast.success(baris.length + " kandidat berhasil diekspor");
    } catch (error) {
      console.error("EKSPOR KANDIDAT ERROR:", error);
      toast.error("Gagal mengekspor data kandidat");
    } finally {
      setExporting(false);
    }
  };

  const totalAktif = kandidat.filter((k) => k.isActive).length;
  const totalNonaktif = kandidat.filter((k) => !k.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1600px]">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Data Kandidat
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola dan lihat seluruh kandidat yang terdaftar.
          </p>
        </div>
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
              onChange={(e) => {
                setSearch(e.target.value);
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
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:w-48"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>

            <button
              type="button"
              onClick={handleEkspor}
              disabled={exporting || filteredKandidat.length === 0}
              title="Unduh daftar kandidat yang sedang tampil (sesuai pencarian dan filter)"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Mengekspor..." : "Ekspor Excel"}
            </button>
          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {!loading && filteredKandidat.length > 0 && jumlahTerpilih > 0 && (
            <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-slate-600">
                  {jumlahTerpilih} dipilih
                </span>

                {jumlahTerpilih < filteredKandidat.length && (
                  <button
                    type="button"
                    onClick={pilihSemuaHasil}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Pilih semua {filteredKandidat.length} hasil
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-xs font-medium text-slate-500 hover:underline"
                >
                  Batal pilihan
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setBulkAction("aktif")}
                  disabled={bulkRunning || bisaDiaktifkan.length === 0}
                  title={bisaDiaktifkan.length === 0 ? "Tidak ada akun nonaktif di antara yang dipilih" : undefined}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Aktifkan ({bisaDiaktifkan.length})
                </button>

                <button
                  type="button"
                  onClick={() => setBulkAction("nonaktif")}
                  disabled={bulkRunning || bisaDinonaktifkan.length === 0}
                  title={bisaDinonaktifkan.length === 0 ? "Tidak ada akun aktif di antara yang dipilih" : undefined}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserX className="h-3.5 w-3.5" />
                  Nonaktifkan ({bisaDinonaktifkan.length})
                </button>
              </div>

            </div>
          )}

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
                    <th className="w-12 px-5 py-4">
                      <input
                        type="checkbox"
                        aria-label="Pilih semua di halaman ini"
                        checked={semuaHalamanTerpilih}
                        ref={(el) => {
                          if (el) el.indeterminate = sebagianHalamanTerpilih;
                        }}
                        onChange={togglePilihHalaman}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>

                    <KepalaUrut label="Kandidat" kunci="nama" aktif={sortKey} arah={sortDir} onSort={handleSort} />

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Kontak
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Domisili
                    </th>

                    <KepalaUrut label="Terdaftar" kunci="createdAt" aktif={sortKey} arah={sortDir} onSort={handleSort} />

                    <KepalaUrut label="Status" kunci="status" aktif={sortKey} arah={sortDir} onSort={handleSort} />

                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {dataHalaman.map((item) => (

                    <tr
                      key={item.id}
                      className={`transition hover:bg-slate-50 ${!item.isActive ? "bg-red-50/30" : ""
                        }`}
                    >

                      <td className="w-12 px-5 py-4">
                        <input
                          type="checkbox"
                          aria-label={"Pilih " + item.nama}
                          checked={selectedSet.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

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

          {!loading && filteredKandidat.length > 0 && (
            <Pagination
              total={filteredKandidat.length}
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

      <ConfirmDialog
        open={bulkAction !== null}
        title={
          bulkAction === "aktif"
            ? "Aktifkan " + targetMassal.length + " akun?"
            : "Nonaktifkan " + targetMassal.length + " akun?"
        }
        description={
          (bulkAction === "aktif"
            ? "Akun " + ringkasNama(targetMassal) + " akan bisa login kembali seperti biasa."
            : "Akun " + ringkasNama(targetMassal) + " tidak akan bisa login sampai diaktifkan kembali. Data dan riwayat lamaran tetap tersimpan aman.") +
          (jumlahTerpilih - targetMassal.length > 0
            ? " " + (jumlahTerpilih - targetMassal.length) + " akun dilewati karena statusnya sudah sesuai."
            : "")
        }
        confirmText={bulkAction === "aktif" ? "Ya, Aktifkan" : "Ya, Nonaktifkan"}
        variant={bulkAction === "aktif" ? "default" : "danger"}
        loading={bulkRunning}
        onConfirm={konfirmasiMassal}
        onCancel={() => setBulkAction(null)}
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
                  Math.round((bulkProgress.selesai / bulkProgress.total) * 100) +
                  "%",
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

              <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
                {bulkHasil.gagal.length} gagal
              </span>

              {bulkHasil.dilewati > 0 && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  {bulkHasil.dilewati} dilewati
                </span>
              )}
            </div>

            <ul className="mt-4 space-y-2">
              {bulkHasil.gagal.map((g, index) => (
                <li
                  key={"gagal-" + index}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
                >
                  <strong className="font-semibold">{g.nama}</strong>: {g.alasan}
                </li>
              ))}
            </ul>

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