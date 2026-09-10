"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type StatusLowongan = "AKTIF" | "DRAFT" | "DITUTUP";

interface Lowongan {
  id: number;
  posisi: string;
  departemen: string;
  lokasi: string;
  tipe: string;
  status: StatusLowongan;
  gaji: string | null;
  deskripsi: string | null;
  kategori?: string | null;
  pendidikan?: string | null;
  berlakuHingga?: string | null;
}

export default function DetailLowonganPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [lowongan, setLowongan] = useState<Lowongan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookmarked, setBookmarked] = useState(false);

  // =====================================================
  // AMBIL DATA LOWONGAN BERDASARKAN ID
  // =====================================================

  useEffect(() => {
    const getDetailLowongan = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/lowongan/${id}`);

        if (!response.ok) {
          throw new Error("Lowongan tidak ditemukan");
        }

        const data = await response.json();

        setLowongan(data);
      } catch (error) {
        console.error("GET DETAIL LOWONGAN ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil detail lowongan"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getDetailLowongan();
    }
  }, [id]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7fbf8] px-5 py-16">
        <div className="mx-auto max-w-[900px]">
          <div className="rounded-2xl border border-[#e1eee7] bg-white px-5 py-20 text-center text-sm text-[#81938a]">
            Memuat detail lowongan...
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !lowongan) {
    return (
      <main className="min-h-screen bg-[#f7fbf8] px-5 py-16">
        <div className="mx-auto max-w-[900px]">
          <div className="rounded-2xl border border-[#e1eee7] bg-white px-5 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef6f1] text-3xl">
              🔍
            </div>

            <h1 className="mt-5 text-xl font-extrabold text-[#315c4a]">
              Lowongan Tidak Ditemukan
            </h1>

            <p className="mt-2 text-sm text-[#81938a]">
              {error || "Lowongan yang kamu cari tidak tersedia."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/lowongan")}
              className="mt-5 rounded-xl bg-[#73c69d] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#58b385]"
            >
              ← Kembali ke Lowongan
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // TOGGLE BOOKMARK
  // =====================================================

  const toggleBookmark = () => {
    setBookmarked((prev) => !prev);
  };

  // =====================================================
  // DETAIL
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f7fbf8] text-[#234236]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-[#dceee5] bg-white">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-5 py-5 sm:px-8">
          <button
            type="button"
            onClick={() => router.push("/lowongan")}
            className="text-sm font-bold text-[#4da477] transition hover:text-[#315c4a]"
          >
            ← Kembali ke Lowongan
          </button>

          <span className="text-xs font-semibold text-[#899b91]">
            Detail Lowongan
          </span>
        </div>
      </section>

      {/* =====================================================
          DETAIL CARD
      ===================================================== */}

      <section className="px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-[900px]">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_45px_rgba(49,92,74,0.08)] sm:p-7">
            {/* =================================================
                TOP ROW
            ================================================= */}

            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold text-slate-900">
                {lowongan.kategori || lowongan.departemen}
              </span>

              <div className="flex shrink-0 items-center gap-2">
                {lowongan.berlakuHingga && (
                  <span className="hidden whitespace-nowrap text-[11px] text-slate-500 sm:inline">
                    s.d. {lowongan.berlakuHingga}
                  </span>
                )}

                <button
                  type="button"
                  onClick={toggleBookmark}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-base transition ${
                    bookmarked
                      ? "border-[#b9ddc9] bg-[#eaf7ef] text-[#4da477]"
                      : "border-slate-200 bg-white text-slate-400 hover:border-[#b9ddc9] hover:bg-[#eaf7ef] hover:text-[#4da477]"
                  }`}
                  aria-label="Simpan lowongan"
                >
                  {bookmarked ? "♥" : "♡"}
                </button>
              </div>
            </div>

            {/* =================================================
                TITLE
            ================================================= */}

            <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {lowongan.posisi}
            </h1>

            {/* =================================================
                META
            ================================================= */}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <BuildingIcon />
                {lowongan.departemen}
              </span>

              <span className="inline-flex items-center gap-2">
                <PinIcon />
                {lowongan.lokasi}
              </span>

              {lowongan.pendidikan && (
                <span className="inline-flex items-center gap-2">
                  <CapIcon />
                  {lowongan.pendidikan}
                </span>
              )}

              <span className="inline-flex items-center gap-2">
                <BriefcaseIcon />
                {lowongan.tipe}
              </span>

              {lowongan.gaji && (
                <span className="inline-flex items-center gap-2">
                  💰 {lowongan.gaji}
                </span>
              )}
            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    lowongan.status === "AKTIF"
                      ? "bg-[#e8f6ee] text-[#4da477]"
                      : lowongan.status === "DITUTUP"
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {lowongan.status === "AKTIF"
                    ? "Lowongan Aktif"
                    : lowongan.status === "DITUTUP"
                    ? "Lowongan Ditutup"
                    : "Draft"}
                </span>

                {lowongan.berlakuHingga && (
                  <span className="text-xs text-slate-500">
                    Berlaku hingga {lowongan.berlakuHingga}
                  </span>
                )}
              </div>
            </div>

            {/* =================================================
                DESKRIPSI
            ================================================= */}

            {lowongan.deskripsi && (
              <div className="mt-7 border-t border-slate-100 pt-6">
                <h2 className="text-base font-extrabold text-[#315c4a]">
                  Deskripsi
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {lowongan.deskripsi}
                </p>
              </div>
            )}

            {/* =================================================
                ACTION
            ================================================= */}

            <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/lowongan")}
                className="rounded-xl border border-[#dceee5] bg-white px-5 py-3 text-sm font-bold text-[#4da477] transition hover:bg-[#f1faf5]"
              >
                ← Kembali
              </button>

              <button
                type="button"
                disabled={lowongan.status !== "AKTIF"}
                onClick={() => {
                  if (lowongan.status === "AKTIF") {
                    router.push(`/kandidat/lowongan/${lowongan.id}/lamar`);
                  }
                }}
                className={`rounded-xl px-6 py-3 text-sm font-bold text-white transition ${
                  lowongan.status === "AKTIF"
                    ? "bg-[#315c4a] hover:bg-[#234236]"
                    : "cursor-not-allowed bg-slate-300"
                }`}
              >
                {lowongan.status === "AKTIF"
                  ? "Lamar Sekarang →"
                  : "Lowongan Ditutup"}
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#dceee5] bg-[#173c2d] text-[#c8ddd4]">
        <div className="mx-auto flex max-w-[900px] flex-col justify-between gap-3 px-5 py-8 text-xs sm:flex-row sm:px-8">
          <div>© 2026 JobPortal. All rights reserved.</div>

          <div>Platform Pencarian Kerja PT Pupuk Kujang</div>
        </div>
      </footer>
    </main>
  );
}

// =====================================================
// ICONS
// =====================================================

function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5 shrink-0 text-slate-500"
    >
      <rect
        x="5"
        y="3.5"
        width="14"
        height="17"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M8.5 7.5h1M11.5 7.5h1M14.5 7.5h1M8.5 11h1M11.5 11h1M14.5 11h1M8.5 14.5h1M11.5 14.5h1M14.5 14.5h1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M10 20.5v-3h4v3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5 shrink-0 text-slate-500"
    >
      <path
        d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="10"
        r="2.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5 shrink-0 text-slate-500"
    >
      <path
        d="M12 5 2.5 9.5 12 14l9.5-4.5L12 5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <path
        d="M6.5 11.7v3.6c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-3.6"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M21.5 9.5V15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5 shrink-0 text-slate-500"
    >
      <rect
        x="3.5"
        y="8"
        width="17"
        height="11"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M8.5 8V6.3A1.8 1.8 0 0 1 10.3 4.5h3.4a1.8 1.8 0 0 1 1.8 1.8V8"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M3.5 12.5h17"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}