"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  MapPin,
  Calendar,
  ChevronRight,
  Inbox,
  CheckCircle2,
  XCircle,
  Circle,
} from "lucide-react";

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
}

interface Lamaran {
  id: number;
  status: StatusLamaran;
  createdAt: string;
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
    label: "Interview",
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  LOLOS: {
    label: "Lolos",
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  DITOLAK: {
    label: "Ditolak",
    badge: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
};

const TAB_OPTIONS: { key: string; label: string }[] = [
  { key: "SEMUA", label: "Semua" },
  { key: "DIPROSES", label: "Diproses" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "LOLOS", label: "Lolos" },
  { key: "DITOLAK", label: "Ditolak" },
];

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

  const formatTanggal = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const jumlah = (status: StatusLamaran) =>
    lamaran.filter((item) => item.status === status).length;

  const filteredLamaran = useMemo(() => {
    if (activeTab === "SEMUA") return lamaran;
    return lamaran.filter((item) => item.status === activeTab);
  }, [lamaran, activeTab]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7faf8]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dceee5] border-t-[#4da477]" />
          <p className="text-sm text-[#81938a]">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">

        {/* HEADER */}

        <div className="mb-7">
          <p className="text-xs font-extrabold uppercase tracking-[1.5px] text-[#4da477]">
            Riwayat Lamaran
          </p>
          <h1 className="mt-1.5 text-2xl font-black tracking-tight text-[#193d2e]">
            Lamaran Saya
          </h1>
          <p className="mt-1.5 text-sm text-[#71877b]">
            Pantau seluruh proses lamaran pekerjaan kamu di PT Pupuk Kujang.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* RINGKASAN */}

        {!loadingLamaran && lamaran.length > 0 && (
          <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">

            <div className="rounded-2xl border border-[#e1eee7] bg-white px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#9aa9a1]">
                Total Lamaran
              </p>
              <p className="mt-1.5 text-2xl font-black text-[#193d2e]">
                {lamaran.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[#f3e2ba] bg-[#fffaf0] px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#a16207]">
                Diproses
              </p>
              <p className="mt-1.5 text-2xl font-black text-[#a16207]">
                {jumlah("DIPROSES")}
              </p>
            </div>

            <div className="rounded-2xl border border-[#c7dcf5] bg-[#f2f7fe] px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#2c5aa0]">
                Interview
              </p>
              <p className="mt-1.5 text-2xl font-black text-[#2c5aa0]">
                {jumlah("INTERVIEW")}
              </p>
            </div>

            <div className="rounded-2xl border border-[#bfe3cd] bg-[#f0faf4] px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#35865d]">
                Lolos
              </p>
              <p className="mt-1.5 text-2xl font-black text-[#35865d]">
                {jumlah("LOLOS")}
              </p>
            </div>

          </div>
        )}

        {/* TAB FILTER */}

        {!loadingLamaran && lamaran.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${activeTab === tab.key
                  ? "bg-[#315c4a] text-white"
                  : "border border-[#e1eee7] bg-white text-[#71877b] hover:border-[#b9ddc9]"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* LIST LAMARAN */}

        {loadingLamaran ? (

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#e1eee7] bg-white px-6 py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dceee5] border-t-[#4da477]" />
            <p className="text-sm text-[#81938a]">Memuat lamaran...</p>
          </div>

        ) : lamaran.length === 0 ? (

          <div className="rounded-2xl border border-[#e1eee7] bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef6f1] text-3xl">
              <Inbox className="h-7 w-7 text-[#71877b]" />
            </div>
            <h3 className="mt-5 text-lg font-black text-[#315c4a]">
              Belum ada lamaran
            </h3>
            <p className="mt-2 text-sm text-[#81938a]">
              Yuk jelajahi lowongan yang tersedia dan mulai melamar posisi
              yang sesuai denganmu.
            </p>
            <button
              type="button"
              onClick={() => router.push("/kandidat/lowongan")}
              className="mt-5 rounded-xl bg-[#315c4a] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#234236]"
            >
              Lihat Lowongan →
            </button>
          </div>

        ) : filteredLamaran.length === 0 ? (

          <div className="rounded-2xl border border-[#e1eee7] bg-white px-5 py-12 text-center text-sm text-[#81938a]">
            Tidak ada lamaran dengan status ini.
          </div>

        ) : (

          <div className="space-y-3">

            {filteredLamaran.map((item) => {
              const config = statusConfig[item.status];

              const ditolak = item.status === "DITOLAK";

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

              const displayLabel = ditolak
                ? "Ditolak"
                : item.status === "LOLOS"
                  ? "Lolos"
                  : belumSelesai
                    ? TAHAPAN_LABEL[belumSelesai.tahapan]
                    : config.label;

              const displayBadge = ditolak
                ? statusConfig.DITOLAK.badge
                : item.status === "LOLOS"
                  ? statusConfig.LOLOS.badge
                  : belumSelesai
                    ? TAHAPAN_BADGE[belumSelesai.tahapan]
                    : statusConfig[item.status].badge;

              const displayDot = ditolak
                ? statusConfig.DITOLAK.dot
                : item.status === "LOLOS"
                  ? statusConfig.LOLOS.dot
                  : belumSelesai
                    ? TAHAPAN_DOT[belumSelesai.tahapan]
                    : statusConfig[item.status].dot;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#e1eee7] bg-white p-5 transition hover:border-[#b9ddc9] hover:shadow-[0_10px_25px_rgba(49,92,74,0.06)]"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="flex gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e8f6ee] text-lg font-black text-[#4da477]">
                        {item.lowongan.posisi.substring(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-base font-black text-[#193d2e]">
                          {item.lowongan.posisi}
                        </h3>

                        <p className="mt-0.5 text-xs font-semibold text-[#4da477]">
                          {item.lowongan.departemen}
                        </p>

                        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#81938a]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.lowongan.lokasi}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {item.lowongan.tipe}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Dilamar {formatTanggal(item.createdAt)}
                          </span>
                        </div>

                        {item.lowongan.deskripsi && (
                          <p className="mt-3 max-w-xl text-xs leading-6 text-[#71877b]">
                            {item.lowongan.deskripsi.length > 140
                              ? item.lowongan.deskripsi.slice(0, 140) + "..."
                              : item.lowongan.deskripsi}
                          </p>
                        )}

                      </div>

                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${displayBadge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${displayDot}`} />
                      {displayLabel}
                    </span>

                  </div>

                  {/* STEPPER TAHAPAN SELEKSI */}

                  {kolomTahapan.length > 0 && (
                    <div className="mt-5 overflow-x-auto border-t border-[#eef5f1] pt-4">
                      <div className="flex min-w-[420px] items-start">
                        {kolomTahapan.map((tahapan, index) => {
                          const progress = item.tahapanProgress.find(
                            (t) => t.tahapan === tahapan
                          );
                          const selesai = progress?.selesaiPada;
                          const isSekarang =
                            !ditolak && belumSelesai?.tahapan === tahapan;
                          const isTitikTolak =
                            ditolak && belumSelesai?.tahapan === tahapan;
                          const isLast = index === kolomTahapan.length - 1;

                          return (
                            <div key={tahapan} className="flex flex-1 items-start">
                              <div className="flex flex-col items-center gap-1.5">
                                <div
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${selesai
                                    ? "bg-[#4da477] text-white"
                                    : isTitikTolak
                                      ? "bg-red-500 text-white"
                                      : isSekarang
                                        ? "border-2 border-[#4da477] text-[#4da477]"
                                        : "bg-[#eef5f1] text-[#a0afa7]"
                                    }`}
                                >
                                  {selesai ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : isTitikTolak ? (
                                    <XCircle className="h-3.5 w-3.5" />
                                  ) : (
                                    <Circle className="h-2.5 w-2.5 fill-current" />
                                  )}
                                </div>

                                <span
                                  className={`text-center text-[10px] font-medium leading-tight ${selesai || isSekarang
                                    ? "text-[#315c4a]"
                                    : "text-[#a0afa7]"
                                    }`}
                                >
                                  {TAHAPAN_LABEL[tahapan]}
                                </span>
                              </div>

                              {!isLast && (
                                <div
                                  className={`mt-3.5 h-0.5 flex-1 ${selesai ? "bg-[#4da477]" : "bg-[#eef5f1]"
                                    }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </article>
              );
            })}

          </div>

        )}

      </div>
    </div>
  );
}