"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Hourglass,
  MapPin,
  XCircle,
} from "lucide-react";

interface User {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
}

type StatusLamaran =
  | "DIPROSES"
  | "INTERVIEW"
  | "LOLOS"
  | "DITOLAK";

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
    tahapanSeleksi?: string[] | null;
  };

  tahapanProgress?: TahapanProgress[] | null;
}

/* ============================================================
   TAHAPAN
============================================================ */

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

/* ============================================================
   STATUS CONFIG
============================================================ */

const statusConfig: Record<
  StatusLamaran,
  {
    label: string;
    badge: string;
    dot: string;
  }
> = {
  DIPROSES: {
    label: "Diproses",
    badge: "bg-[#fff4de] text-[#a16207]",
    dot: "bg-[#d99619]",
  },

  INTERVIEW: {
    label: "Interview",
    badge: "bg-[#e6f0ff] text-[#2c5aa0]",
    dot: "bg-[#3d78c9]",
  },

  LOLOS: {
    label: "Diterima",
    badge: "bg-[#e8f6ee] text-[#35865d]",
    dot: "bg-[#4da477]",
  },

  DITOLAK: {
    label: "Ditolak",
    badge: "bg-[#fdecec] text-[#c0392b]",
    dot: "bg-[#e05252]",
  },
};

/* ============================================================
   PAGE
============================================================ */

export default function LamaranPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [lamaran, setLamaran] = useState<Lamaran[]>([]);
  const [loadingLamaran, setLoadingLamaran] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================================
     CHECK USER
  ========================================================== */

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/me", {
          cache: "no-store",
          credentials: "include",
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
        console.error(error);
        router.replace("/login");
      }
    };

    checkUser();
  }, [router]);

  /* ==========================================================
     GET LAMARAN
  ========================================================== */

  useEffect(() => {
    if (!user) return;

    const getLamaran = async () => {
      try {
        setLoadingLamaran(true);
        setError("");

        const response = await fetch("/api/lamaran", {
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(
            "Gagal mengambil data lamaran"
          );
        }

        const data = await response.json();

        console.log(
          "DATA LAMARAN:",
          data
        );

        setLamaran(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "GET LAMARAN ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data lamaran"
        );
      } finally {
        setLoadingLamaran(false);
      }
    };

    getLamaran();
  }, [user]);

  /* ==========================================================
     FORMAT TANGGAL
  ========================================================== */

  const formatTanggal = (date: string) => {
    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  /* ==========================================================
     JUMLAH STATUS
  ========================================================== */

  const jumlah = (status: StatusLamaran) =>
    lamaran.filter(
      (item) => item.status === status
    ).length;

  /* ==========================================================
     LOADING USER
  ========================================================== */

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7faf8]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dceee5] border-t-[#4da477]" />

          <p className="text-sm text-[#81938a]">
            Memuat halaman...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-7">
          <p className="text-xs font-extrabold uppercase tracking-[1.5px] text-[#4da477]">
            Riwayat Lamaran
          </p>

          <h1 className="mt-1.5 text-2xl font-black tracking-tight text-[#193d2e]">
            Lamaran Saya
          </h1>

          <p className="mt-1.5 text-sm text-[#71877b]">
            Pantau seluruh proses lamaran pekerjaan
            kamu di PT Pupuk Kujang.
          </p>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ====================================================
            RINGKASAN
        ==================================================== */}

        {!loadingLamaran &&
          lamaran.length > 0 && (
            <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">

              <SummaryCard
                title="Total Lamaran"
                value={lamaran.length}
                className="border-[#e1eee7] bg-white"
                textClass="text-[#193d2e]"
              />

              <SummaryCard
                title="Diproses"
                value={jumlah("DIPROSES")}
                className="border-[#f3e2ba] bg-[#fffaf0]"
                textClass="text-[#a16207]"
              />

              <SummaryCard
                title="Interview"
                value={jumlah("INTERVIEW")}
                className="border-[#c7dcf5] bg-[#f2f7fe]"
                textClass="text-[#2c5aa0]"
              />

              <SummaryCard
                title="Diterima"
                value={jumlah("LOLOS")}
                className="border-[#bfe3cd] bg-[#f0faf4]"
                textClass="text-[#35865d]"
              />

            </div>
          )}

        {/* ====================================================
            CONTENT
        ==================================================== */}

        {loadingLamaran ? (

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#e1eee7] bg-white px-6 py-16">

            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dceee5] border-t-[#4da477]" />

            <p className="text-sm text-[#81938a]">
              Memuat lamaran...
            </p>

          </div>

        ) : lamaran.length === 0 ? (

          /* ==================================================
             EMPTY
          ================================================== */

          <div className="rounded-2xl border border-[#e1eee7] bg-white px-5 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef6f1] text-[#4da477]">
              <FileTextIcon />
            </div>

            <h3 className="mt-5 text-lg font-black text-[#315c4a]">
              Belum ada lamaran
            </h3>

            <p className="mt-2 text-sm text-[#81938a]">
              Yuk jelajahi lowongan yang tersedia
              dan mulai melamar posisi yang sesuai
              denganmu.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/kandidat/lowongan"
                )
              }
              className="mt-5 rounded-xl bg-[#315c4a] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#234236]"
            >
              Lihat Lowongan →
            </button>

          </div>

        ) : (

          /* ==================================================
             LIST
          ================================================== */

          <div className="space-y-4">

            {lamaran.map((item) => {
              const config =
                statusConfig[item.status];

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#e1eee7] bg-white p-5 transition hover:border-[#b9ddc9] hover:shadow-[0_10px_25px_rgba(49,92,74,0.06)] sm:p-6"
                >

                  {/* ========================================
                     HEADER CARD
                  ======================================== */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="flex min-w-0 gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e8f6ee] text-sm font-black text-[#4da477]">
                        {item.lowongan.posisi
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">

                        <h3 className="text-base font-black text-[#193d2e]">
                          {
                            item.lowongan
                              .posisi
                          }
                        </h3>

                        <p className="mt-0.5 text-xs font-semibold text-[#4da477]">
                          {
                            item.lowongan
                              .departemen
                          }
                        </p>

                        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#81938a]">

                          <span className="inline-flex items-center gap-1">
                            <MapPin size={13} />
                            {
                              item.lowongan
                                .lokasi
                            }
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <BriefcaseBusiness
                              size={13}
                            />
                            {
                              item.lowongan
                                .tipe
                            }
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <CalendarDays
                              size={13}
                            />
                            Dilamar{" "}
                            {formatTanggal(
                              item.createdAt
                            )}
                          </span>

                        </div>

                      </div>
                    </div>

                    {/* BADGE */}

                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${config.badge}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                      />

                      {config.label}
                    </span>

                  </div>

                  {/* ========================================
                     DESKRIPSI
                  ======================================== */}

                  {item.lowongan
                    .deskripsi && (
                    <p className="mt-4 max-w-3xl text-xs leading-6 text-[#71877b]">
                      {item.lowongan
                        .deskripsi.length >
                      140
                        ? item.lowongan.deskripsi.slice(
                            0,
                            140
                          ) + "..."
                        : item.lowongan.deskripsi}
                    </p>
                  )}

                  {/* DIVIDER */}

                  <div className="my-5 border-t border-[#edf2ef]" />

                  {/* PROGRESS */}

                  <ApplicationProgress
                    status={item.status}
                    tahapanSeleksi={
                      item.lowongan
                        .tahapanSeleksi
                    }
                    tahapanProgress={
                      item.tahapanProgress
                    }
                  />

                </article>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}

/* ===============================================================
   SUMMARY CARD
=============================================================== */

function SummaryCard({
  title,
  value,
  className,
  textClass,
}: {
  title: string;
  value: number;
  className: string;
  textClass: string;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${className}`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#9aa9a1]">
        {title}
      </p>

      <p
        className={`mt-1.5 text-2xl font-black ${textClass}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ===============================================================
   APPLICATION PROGRESS
=============================================================== */

function ApplicationProgress({
  status,
  tahapanSeleksi,
  tahapanProgress,
}: {
  status: StatusLamaran;
  tahapanSeleksi?: string[] | null;
  tahapanProgress?: TahapanProgress[] | null;
}) {
  /* -------------------------------------------------------------
     AMBIL TAHAPAN
  ------------------------------------------------------------- */

  const safeTahapanSeleksi =
    Array.isArray(tahapanSeleksi)
      ? tahapanSeleksi
      : [];

  const safeTahapanProgress =
    Array.isArray(tahapanProgress)
      ? tahapanProgress
      : [];

  let daftarTahapan = [
    ...safeTahapanSeleksi,
  ];

  /*
   * Jika tahapanSeleksi kosong,
   * gunakan tahapanProgress sebagai fallback.
   */
  if (daftarTahapan.length === 0) {
    daftarTahapan =
      safeTahapanProgress.map(
        (item) => item.tahapan
      );
  }

  /*
   * Hilangkan duplikat dan urutkan.
   */
  daftarTahapan = Array.from(
    new Set(daftarTahapan)
  ).sort(
    (a, b) =>
      (TAHAPAN_URUTAN[a] ?? 999) -
      (TAHAPAN_URUTAN[b] ?? 999)
  );

  /* -------------------------------------------------------------
     JIKA TIDAK ADA TAHAPAN
  ------------------------------------------------------------- */

  if (daftarTahapan.length === 0) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-bold text-[#60786c]">
            Status proses
          </p>
        </div>

        <div className="rounded-xl bg-[#f7faf8] px-4 py-3">
          <p className="text-xs text-[#81938a]">
            Tahapan seleksi belum tersedia.
          </p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     MAP PROGRESS
  ------------------------------------------------------------- */

  const progressMap = new Map<
    string,
    TahapanProgress
  >();

  safeTahapanProgress.forEach(
    (item) => {
      progressMap.set(
        item.tahapan,
        item
      );
    }
  );

  /* -------------------------------------------------------------
     TAHAPAN AKTIF
  ------------------------------------------------------------- */

  const firstUnfinishedIndex =
    daftarTahapan.findIndex(
      (tahapan) => {
        const progress =
          progressMap.get(tahapan);

        return !progress?.selesaiPada;
      }
    );

  const allCompleted =
    daftarTahapan.every(
      (tahapan) =>
        !!progressMap.get(tahapan)
          ?.selesaiPada
    );

  /* -------------------------------------------------------------
     STATUS TEXT
  ------------------------------------------------------------- */

  let statusText =
    "Lamaran sedang dalam proses seleksi oleh tim rekrutmen.";

  let statusIcon = (
    <Clock3
      size={14}
      className="shrink-0 text-[#d99619]"
    />
  );

  if (status === "INTERVIEW") {
    statusText =
      "Lamaran kamu telah masuk ke tahap interview.";

    statusIcon = (
      <CalendarDays
        size={14}
        className="shrink-0 text-[#3d78c9]"
      />
    );
  }

  if (status === "LOLOS") {
    statusText =
      "Selamat! Kamu berhasil lolos proses rekrutmen.";

    statusIcon = (
      <CheckCircle2
        size={14}
        className="shrink-0 text-[#4da477]"
      />
    );
  }

  if (status === "DITOLAK") {
    statusText =
      "Lamaran belum dapat dilanjutkan ke tahap berikutnya.";

    statusIcon = (
      <XCircle
        size={14}
        className="shrink-0 text-[#e05252]"
      />
    );
  }

  return (
    <div>

      {/* =======================================================
          HEADER PROGRESS
      ======================================================= */}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-bold text-[#60786c]">
          Tahapan Seleksi
        </p>

        {status === "DITOLAK" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdecec] px-2.5 py-1 text-[10px] font-bold text-[#c0392b]">
            <XCircle size={12} />

            Lamaran ditolak
          </span>
        )}

        {allCompleted &&
          status !== "DITOLAK" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f6ee] px-2.5 py-1 text-[10px] font-bold text-[#35865d]">
              <CheckCircle2 size={12} />

              Selesai
            </span>
          )}
      </div>

      {/* =======================================================
          PROGRESS
      ======================================================= */}

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-start">

          {daftarTahapan.map(
            (tahapan, index) => {
              const progress =
                progressMap.get(tahapan);

              const selesai =
                !!progress?.selesaiPada;

              const isCurrent =
                index ===
                  firstUnfinishedIndex &&
                status !== "DITOLAK";

              const isRejected =
                status === "DITOLAK" &&
                index ===
                  firstUnfinishedIndex;

              /*
               * Tahap dianggap aktif jika:
               * - sudah selesai
               * - sedang berjalan
               * - menjadi tahap penolakan
               */
              const active =
                selesai ||
                isCurrent ||
                isRejected;

              return (
                <div
                  key={`${tahapan}-${index}`}
                  className="flex items-start"
                >

                  {/* STEP */}

                  <ProgressStep
                    label={
                      TAHAPAN_LABEL[
                        tahapan
                      ] ?? tahapan
                    }
                    active={active}
                    completed={selesai}
                    rejected={isRejected}
                    current={isCurrent}
                    date={
                      progress?.selesaiPada
                    }
                  />

                  {/* LINE */}

                  {index <
                    daftarTahapan.length -
                      1 && (
                    <ProgressLine
                      active={selesai}
                    />
                  )}

                </div>
              );
            }
          )}

        </div>
      </div>

      {/* =======================================================
          STATUS TEXT
      ======================================================= */}

      <div className="mt-4 rounded-xl bg-[#f7faf8] px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-[#71877b]">
          {statusIcon}

          <span>{statusText}</span>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   PROGRESS STEP
=============================================================== */

function ProgressStep({
  label,
  active,
  completed,
  rejected = false,
  current = false,
  date,
}: {
  label: string;
  active: boolean;
  completed: boolean;
  rejected?: boolean;
  current?: boolean;
  date?: string | null;
}) {
  return (
    <div className="flex min-w-[70px] flex-col items-center">

      {/* CIRCLE */}

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
          rejected
            ? "border-[#e05252] bg-[#e05252] text-white"
            : completed
              ? "border-[#4da477] bg-[#4da477] text-white"
              : current
                ? "border-[#4da477] bg-white text-[#4da477]"
                : active
                  ? "border-[#4da477] bg-[#4da477] text-white"
                  : "border-[#dce5e0] bg-white text-[#a6b3ad]"
        }`}
      >
        {rejected ? (
          <XCircle size={15} />
        ) : completed ? (
          <CheckCircle2 size={15} />
        ) : current ? (
          <Clock3 size={14} />
        ) : (
          <Hourglass size={13} />
        )}
      </div>

      {/* LABEL */}

      <span
        className={`mt-2 max-w-[75px] text-center text-[9px] font-semibold leading-tight sm:text-[10px] ${
          rejected
            ? "text-[#c0392b]"
            : completed || current
              ? "text-[#526e61]"
              : "text-[#a0ada6]"
        }`}
      >
        {label}
      </span>

      {/* DATE */}

      {date && (
        <span className="mt-1 whitespace-nowrap text-[8px] text-[#a0ada6]">
          {new Date(
            date
          ).toLocaleDateString(
            "id-ID",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }
          )}
        </span>
      )}
    </div>
  );
}

/* ===============================================================
   PROGRESS LINE
=============================================================== */

function ProgressLine({
  active,
}: {
  active: boolean;
}) {
  return (
    <div
      className={`mx-1 mt-[15px] h-0.5 w-8 shrink-0 transition sm:w-10 ${
        active
          ? "bg-[#4da477]"
          : "bg-[#dce5e0]"
      }`}
    />
  );
}

/* ===============================================================
   EMPTY ICON
=============================================================== */

function FileTextIcon() {
  return (
    <FileCheck2
      size={28}
      strokeWidth={1.7}
    />
  );
}