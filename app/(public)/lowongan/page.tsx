"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type StatusLowongan = "AKTIF" | "DRAFT" | "DITUTUP";

type ViewMode = "card" | "list";

interface Lowongan {
  id: number;
  posisi: string;
  departemen: string;
  lokasi: string;
  tipe: string;
  status: StatusLowongan;

  deskripsi: string | null;
  persyaratan: string | null;

  kategori?: string | null;
  pendidikan?: string | null;
  pengalaman?: string | null;

  tanggalBerakhir?: string | null;

  pelamar?: number;
  createdAt?: string;
}

export default function LowonganPage() {
  const searchParams = useSearchParams();

  const initialKeyword = searchParams.get("keyword") || "";
  const initialLocation = searchParams.get("location") || "";

  const [jobs, setJobs] = useState<Lowongan[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);
  const [departemen, setDepartemen] = useState("Semua");

  const [viewMode, setViewMode] =
    useState<ViewMode>("card");

  const [selectedJob, setSelectedJob] =
    useState<Lowongan | null>(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [detailError, setDetailError] =
    useState("");

  // =====================================================
  // GET LOWONGAN
  // =====================================================

  useEffect(() => {
    const getJobs = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "/api/lowongan?status=AKTIF",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Gagal mengambil data lowongan"
          );
        }

        const data = await response.json();

        setJobs(data);
      } catch (error) {
        console.error(
          "GET LOWONGAN ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    getJobs();
  }, []);

  // =====================================================
  // DETAIL LOWONGAN
  // =====================================================

  const openDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      setDetailError("");

      const jobFromList = jobs.find(
        (job) => job.id === id
      );

      if (jobFromList) {
        setSelectedJob(jobFromList);
      }

      const response = await fetch(
        `/api/lowongan/${id}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Gagal mengambil detail lowongan"
        );
      }

      const data = await response.json();

      setSelectedJob(data);
    } catch (error) {
      console.error(
        "GET DETAIL LOWONGAN ERROR:",
        error
      );

      setDetailError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil detail lowongan"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // =====================================================
  // CLOSE DETAIL
  // =====================================================

  const closeDetail = () => {
    setSelectedJob(null);
    setDetailError("");
  };

  // =====================================================
  // ESC
  // =====================================================

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        closeDetail();
      }
    };

    if (selectedJob) {
      document.addEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "";
    };
  }, [selectedJob]);

  // =====================================================
  // DEPARTEMEN
  // =====================================================

  const departemenList = useMemo(() => {
    const unique = Array.from(
      new Set(
        jobs
          .map((job) => job.departemen)
          .filter(Boolean)
      )
    );

    return ["Semua", ...unique];
  }, [jobs]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredJobs = useMemo(() => {
    const search = keyword
      .toLowerCase()
      .trim();

    const loc = location
      .toLowerCase()
      .trim();

    return jobs.filter((job) => {
      const keywordMatch =
        !search ||
        job.posisi
          .toLowerCase()
          .includes(search) ||
        job.departemen
          .toLowerCase()
          .includes(search);

      const locationMatch =
        !loc ||
        job.lokasi
          .toLowerCase()
          .includes(loc);

      const departemenMatch =
        departemen === "Semua" ||
        job.departemen === departemen;

      return (
        keywordMatch &&
        locationMatch &&
        departemenMatch
      );
    });
  }, [
    jobs,
    keyword,
    location,
    departemen,
  ]);

  // =====================================================
  // RESET
  // =====================================================

  const resetFilter = () => {
    setKeyword("");
    setLocation("");
    setDepartemen("Semua");
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(parsedDate.getTime())
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  return (
    <main className="min-h-screen bg-[#f7faf8] text-[#234236]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-[#e1eee7] bg-white">

        <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">

          <p className="text-xs font-extrabold uppercase tracking-[1.5px] text-[#4da477]">
            PT Pupuk Kujang
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#193d2e] sm:text-4xl">
            Lowongan Pekerjaan
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71877b]">
            Temukan peluang karier yang sesuai
            dengan kemampuan dan pengalaman Anda.
          </p>

        </div>

      </section>


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <section className="border-b border-[#e1eee7] bg-white">

        <div className="mx-auto max-w-[1200px] px-5 py-5 sm:px-8">

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_200px]">

            {/* KEYWORD */}

            <div className="flex items-center gap-3 rounded-xl border border-[#dce9e2] bg-white px-4 py-3 focus-within:border-[#73c69d] focus-within:ring-2 focus-within:ring-[#e8f6ee]">

              <span className="text-lg text-[#4da477]">
                ⌕
              </span>

              <input
                type="text"
                value={keyword}
                onChange={(e) =>
                  setKeyword(e.target.value)
                }
                placeholder="Cari posisi atau departemen..."
                className="w-full bg-transparent text-sm text-[#234236] outline-none placeholder:text-[#9aa9a1]"
              />

            </div>


            {/* LOCATION */}

            <div className="flex items-center gap-3 rounded-xl border border-[#dce9e2] bg-white px-4 py-3 focus-within:border-[#73c69d] focus-within:ring-2 focus-within:ring-[#e8f6ee]">

              <span className="text-sm text-[#4da477]">
                ●
              </span>

              <input
                type="text"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                placeholder="Cari lokasi..."
                className="w-full bg-transparent text-sm text-[#234236] outline-none placeholder:text-[#9aa9a1]"
              />

            </div>


            {/* DEPARTEMEN */}

            <select
              value={departemen}
              onChange={(e) =>
                setDepartemen(e.target.value)
              }
              className="rounded-xl border border-[#dce9e2] bg-white px-4 py-3 text-sm text-[#234236] outline-none focus:border-[#73c69d] focus:ring-2 focus:ring-[#e8f6ee]"
            >

              {departemenList.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}

            </select>

          </div>

        </div>

      </section>


      {/* =====================================================
          JOB LIST
      ===================================================== */}

      <section className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">

        {/* HEADER LIST */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-xl font-black text-[#193d2e]">
              Lowongan Tersedia
            </h2>

            <p className="mt-1 text-xs text-[#81938a]">
              {filteredJobs.length} lowongan ditemukan
            </p>

          </div>


          <div className="flex items-center gap-3">

            {(keyword ||
              location ||
              departemen !== "Semua") && (

              <button
                type="button"
                onClick={resetFilter}
                className="text-xs font-bold text-[#4da477] hover:text-[#315c4a]"
              >
                Reset Filter
              </button>

            )}


            {/* VIEW TOGGLE */}

            <div className="flex items-center rounded-xl border border-[#dce9e2] bg-white p-1">

              <button
                type="button"
                onClick={() =>
                  setViewMode("card")
                }
                className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold transition ${
                  viewMode === "card"
                    ? "bg-[#315c4a] text-white shadow-sm"
                    : "text-[#71877b] hover:bg-[#f0f7f3]"
                }`}
              >
                <GridIcon />
                <span>Card</span>
              </button>


              <button
                type="button"
                onClick={() =>
                  setViewMode("list")
                }
                className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold transition ${
                  viewMode === "list"
                    ? "bg-[#315c4a] text-white shadow-sm"
                    : "text-[#71877b] hover:bg-[#f0f7f3]"
                }`}
              >
                <ListIcon />
                <span>List</span>
              </button>

            </div>

          </div>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="rounded-2xl border border-[#e1eee7] bg-white p-12 text-center">

            <p className="text-sm text-[#81938a]">
              Memuat lowongan...
            </p>

          </div>

        )}


        {/* =====================================================
            CARD VIEW
        ===================================================== */}

        {!loading &&
          filteredJobs.length > 0 &&
          viewMode === "card" && (

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {filteredJobs.map((job) => (

                <article
                  key={job.id}
                  className="group cursor-pointer rounded-2xl border border-[#e1eee7] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#b9ddc9] hover:shadow-[0_12px_30px_rgba(49,92,74,0.08)]"
                  onClick={() =>
                    openDetail(job.id)
                  }
                >

                  {/* TOP */}

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-full bg-[#e8f6ee] px-3 py-1 text-[10px] font-bold text-[#35865d]">
                          {job.kategori ||
                            job.departemen}
                        </span>

                        {/* {job.status === "AKTIF" && (
                          <span className="rounded-full bg-[#f0f7f3] px-3 py-1 text-[10px] font-semibold text-[#6c8176]">
                            Aktif
                          </span>
                        )} */}

                      </div>

                      <h3 className="mt-3 line-clamp-2 text-lg font-black text-[#193d2e] transition group-hover:text-[#4da477]">
                        {job.posisi}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-[#60766b]">
                        {job.departemen}
                      </p>

                    </div>


                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef8f2]">
                      <BuildingIcon />
                    </div>

                  </div>


                  {/* INFO */}

                  <div className="mt-5 grid grid-cols-2 gap-2">

                    <MiniInfo
                      icon={<PinIcon />}
                      label="Lokasi"
                      value={job.lokasi}
                    />

                    <MiniInfo
                      icon={<CapIcon />}
                      label="Pendidikan"
                      value={job.pendidikan}
                    />

                    <MiniInfo
                      icon={<BriefcaseIcon />}
                      label="Tipe"
                      value={job.tipe}
                    />

                    {job.pengalaman ? (
                      <MiniInfo
                        icon={<BriefcaseIcon />}
                        label="Pengalaman"
                        value={job.pengalaman}
                      />
                    ) : (
                      <MiniInfo
                        icon={<BriefcaseIcon />}
                        label="Status"
                        value="Aktif"
                      />
                    )}

                  </div>


                  {/* DESCRIPTION */}

                  {job.deskripsi && (

                    <p className="mt-4 line-clamp-2 text-xs leading-6 text-[#81938a]">
                      {job.deskripsi}
                    </p>

                  )}


                  {/* FOOTER */}

                  <div className="mt-5 flex items-center justify-between border-t border-[#edf3ef] pt-4">

                    <span className="text-[10px] text-[#9aa9a1]">
                      {job.tanggalBerakhir
                        ? `Batas Lamaran: ${formatDate(
                            job.tanggalBerakhir
                          )}`
                        : "Informasi lowongan"}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(job.id);
                      }}
                      className="rounded-lg border border-[#b9ddc9] px-4 py-2 text-xs font-bold text-[#4da477] transition hover:bg-[#eaf7ef]"
                    >
                      Lihat Detail →
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}


        {/* =====================================================
            LIST VIEW
        ===================================================== */}

        {!loading &&
          filteredJobs.length > 0 &&
          viewMode === "list" && (

            <div className="space-y-3">

              {filteredJobs.map((job) => (

                <article
                  key={job.id}
                  onClick={() =>
                    openDetail(job.id)
                  }
                  className="group cursor-pointer rounded-2xl border border-[#e1eee7] bg-white p-4 transition duration-200 hover:border-[#b9ddc9] hover:shadow-[0_10px_28px_rgba(49,92,74,0.07)] sm:p-5"
                >

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(360px,1fr)_auto] lg:items-center">

                    {/* JOB */}

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf7ef]">
                        <BuildingIcon />
                      </div>


                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="rounded-full bg-[#e8f6ee] px-3 py-1 text-[10px] font-bold text-[#35865d]">
                            {job.kategori ||
                              job.departemen}
                          </span>

                          {job.status === "AKTIF" && (
                            <span className="rounded-full bg-[#f0f7f3] px-3 py-1 text-[10px] font-semibold text-[#6c8176]">
                              Aktif
                            </span>
                          )}

                        </div>

                        <h3 className="mt-2 line-clamp-1 text-base font-black text-[#193d2e] transition group-hover:text-[#4da477]">
                          {job.posisi}
                        </h3>

                        <p className="mt-1 text-xs font-medium text-[#60766b]">
                          {job.departemen}
                        </p>

                      </div>

                    </div>


                    {/* INFORMATION */}

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4 lg:grid-cols-2">

                      <ListInfo
                        icon={<PinIcon />}
                        label="Lokasi"
                        value={job.lokasi}
                      />

                      <ListInfo
                        icon={<CapIcon />}
                        label="Pendidikan"
                        value={job.pendidikan}
                      />

                      <ListInfo
                        icon={<BriefcaseIcon />}
                        label="Tipe"
                        value={job.tipe}
                      />

                      <ListInfo
                        icon={<BriefcaseIcon />}
                        label="Pengalaman"
                        value={
                          job.pengalaman || "-"
                        }
                      />

                    </div>


                    {/* ACTION */}

                    <div
                      className="flex items-center justify-between gap-4 border-t border-[#edf3ef] pt-3 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >

                      <div className="text-right">

                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#a0afa8]">
                          Batas Lamaran
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#60766b]">
                          {job.tanggalBerakhir
                            ? formatDate(
                                job.tanggalBerakhir
                              )
                            : "-"}
                        </p>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          openDetail(job.id)
                        }
                        className="shrink-0 rounded-lg border border-[#b9ddc9] px-4 py-2 text-xs font-bold text-[#4da477] transition hover:bg-[#eaf7ef]"
                      >
                        Detail →
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}


        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading &&
          filteredJobs.length === 0 && (

            <div className="rounded-2xl border border-[#e1eee7] bg-white px-5 py-16 text-center">

              <div className="text-4xl">
                🔍
              </div>

              <h3 className="mt-4 text-lg font-black text-[#315c4a]">
                Lowongan tidak ditemukan
              </h3>

              <p className="mt-2 text-sm text-[#81938a]">
                Coba ubah kata kunci, lokasi,
                atau departemen.
              </p>

              <button
                type="button"
                onClick={resetFilter}
                className="mt-5 rounded-xl bg-[#315c4a] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#234236]"
              >
                Reset Filter
              </button>

            </div>

          )}

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#dceee5] bg-[#173c2d]">

        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 py-7 text-xs text-[#c8ddd4] sm:flex-row sm:justify-between sm:px-8">

          <span>
            © 2026 JobPortal
          </span>

          <span>
            PT Pupuk Kujang
          </span>

        </div>

      </footer>


      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedJob && (

        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#10251d]/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeDetail();
            }
          }}
        >

          <div className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="border-b border-[#e5eee9] bg-[#f8fcfa] px-5 py-5 sm:px-7">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="mb-2 flex flex-wrap gap-2">

                    <span className="rounded-full bg-[#dff3e7] px-3 py-1 text-[10px] font-bold text-[#35865d]">
                      {selectedJob.status === "AKTIF"
                        ? "Sedang Dibuka"
                        : selectedJob.status}
                    </span>

                    {selectedJob.kategori && (
                      <span className="rounded-full bg-[#fff2c9] px-3 py-1 text-[10px] font-bold text-[#916b00]">
                        {selectedJob.kategori}
                      </span>
                    )}

                  </div>

                  <h2 className="text-2xl font-black text-[#193d2e]">
                    {selectedJob.posisi}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#63776d]">

                    <span className="inline-flex items-center gap-1.5">
                      <BuildingIcon />
                      {selectedJob.departemen}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <PinIcon />
                      {selectedJob.lokasi}
                    </span>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={closeDetail}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#dce9e2] bg-white text-xl text-[#63776d] hover:bg-[#eef8f2]"
                >
                  ×
                </button>

              </div>

            </div>


            {/* BODY */}

            <div className="overflow-y-auto">

              {detailLoading && (

                <div className="border-b border-[#e7eee9] bg-[#f8fcfa] px-5 py-3 text-xs text-[#4da477]">
                  Memuat detail lowongan...
                </div>

              )}

              {detailError && (

                <div className="mx-5 mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  {detailError}
                </div>

              )}


              <div className="grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_280px]">

                {/* LEFT */}

                <div className="space-y-5">

                  <section>

                    <h3 className="mb-3 text-base font-black text-[#193d2e]">
                      Informasi Pekerjaan
                    </h3>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                      <InfoCard
                        icon={<PinIcon />}
                        label="Lokasi"
                        value={selectedJob.lokasi}
                      />

                      <InfoCard
                        icon={<CapIcon />}
                        label="Pendidikan"
                        value={selectedJob.pendidikan}
                      />

                      <InfoCard
                        icon={<BriefcaseIcon />}
                        label="Tipe Pekerjaan"
                        value={selectedJob.tipe}
                      />

                    </div>

                  </section>


                  <DetailSection
                    title="Deskripsi Pekerjaan"
                  >

                    {selectedJob.deskripsi ? (
                      <p className="whitespace-pre-line text-sm leading-7 text-[#65786e]">
                        {selectedJob.deskripsi}
                      </p>
                    ) : (
                      <EmptyText text="Deskripsi pekerjaan belum tersedia." />
                    )}

                  </DetailSection>


                  <DetailSection
                    title="Kualifikasi"
                  >

                    {selectedJob.persyaratan ? (
                      <p className="whitespace-pre-line text-sm leading-7 text-[#65786e]">
                        {selectedJob.persyaratan}
                      </p>
                    ) : (
                      <EmptyText text="Persyaratan belum tersedia." />
                    )}

                  </DetailSection>

                </div>


                {/* RIGHT */}

                <aside className="space-y-4">

                  {/* APPLY */}

                  <div className="rounded-2xl border border-[#cfe8da] bg-[#f0faf4] p-5">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#899b91]">
                      Tertarik dengan posisi ini?
                    </p>

                    <h3 className="mt-1 text-lg font-black text-[#315c4a]">
                      Lamar Sekarang
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[#718279]">
                      Pastikan profil dan CV Anda
                      sudah lengkap sebelum melamar.
                    </p>

                    <button
                      type="button"
                      disabled={
                        selectedJob.status !==
                        "AKTIF"
                      }
                      onClick={() => {
                        alert(
                          "Fitur lamaran dapat diarahkan ke halaman login/lamar."
                        );
                      }}
                      className={`mt-5 w-full rounded-xl px-4 py-3 text-xs font-black ${
                        selectedJob.status ===
                        "AKTIF"
                          ? "bg-[#315c4a] text-white hover:bg-[#234236]"
                          : "cursor-not-allowed bg-[#c9d6cf] text-white"
                      }`}
                    >
                      {selectedJob.status === "AKTIF"
                        ? "Lamar Sekarang →"
                        : "Lowongan Ditutup"}
                    </button>

                  </div>


                  {/* ADDITIONAL */}

                  <div className="rounded-2xl border border-[#e1ece6] bg-white p-5">

                    <h3 className="text-sm font-black text-[#193d2e]">
                      Informasi Tambahan
                    </h3>

                    <div className="mt-4 space-y-4">

                      {selectedJob.pengalaman && (
                        <DetailItem
                          label="Pengalaman"
                          value={
                            selectedJob.pengalaman
                          }
                        />
                      )}

                      {selectedJob.createdAt && (
                        <DetailItem
                          label="Dipublikasikan"
                          value={formatDate(
                            selectedJob.createdAt
                          )}
                        />
                      )}

                      <DetailItem
                        label="Batas Lamaran"
                        value={formatDate(
                          selectedJob.tanggalBerakhir
                        )}
                      />

                      <DetailItem
                        label="Berlaku Hingga"
                        value={formatDate(
                          selectedJob.tanggalBerakhir
                        )}
                      />

                    </div>

                  </div>

                </aside>

              </div>

            </div>


            {/* FOOTER MODAL */}

            <div className="border-t border-[#e1ece6] bg-white px-5 py-4 sm:px-7">

              <div className="flex justify-end">

                <button
                  type="button"
                  onClick={closeDetail}
                  className="rounded-xl border border-[#dce9e2] px-5 py-2.5 text-xs font-bold text-[#4e7561] hover:bg-[#f3faf6]"
                >
                  Tutup
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}


// =====================================================
// MINI INFO — CARD VIEW
// =====================================================

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-[#f7fbf8] px-3 py-2.5">

      <div className="flex items-center gap-1.5">

        {icon}

        <span className="truncate text-[9px] font-bold uppercase tracking-wide text-[#9aa9a1]">
          {label}
        </span>

      </div>

      <p className="mt-1 truncate text-[11px] font-bold text-[#48665a]">
        {value || "-"}
      </p>

    </div>
  );
}


// =====================================================
// LIST INFO — LIST VIEW
// =====================================================

function ListInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="min-w-0">

      <div className="flex items-center gap-1.5">

        {icon}

        <span className="text-[9px] font-bold uppercase tracking-wide text-[#9aa9a1]">
          {label}
        </span>

      </div>

      <p className="mt-1 truncate pl-5 text-[11px] font-bold text-[#48665a]">
        {value || "-"}
      </p>

    </div>
  );
}


// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border border-[#e3eee8] bg-[#f8fcfa] p-4">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f6ee] text-[#4da477]">
        {icon}
      </div>

      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[#9aa9a1]">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-[#365548]">
        {value || "-"}
      </p>

    </div>
  );
}


// =====================================================
// DETAIL SECTION
// =====================================================

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e1ece6] bg-white p-5">

      <h3 className="mb-4 text-base font-black text-[#193d2e]">
        {title}
      </h3>

      {children}

    </section>
  );
}


// =====================================================
// EMPTY
// =====================================================

function EmptyText({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl bg-[#f7fbf8] p-4">

      <p className="text-sm text-[#81938a]">
        {text}
      </p>

    </div>
  );
}


// =====================================================
// DETAIL ITEM
// =====================================================

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="border-b border-[#edf2ef] pb-3 last:border-0 last:pb-0">

      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9aa9a1]">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold leading-5 text-[#365548]">
        {value || "-"}
      </p>

    </div>
  );
}


// =====================================================
// ICON GRID / CARD
// =====================================================

function GridIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}


// =====================================================
// ICON LIST
// =====================================================

function ListIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M5 7h14M5 12h14M5 17h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle
        cx="3.5"
        cy="7"
        r=".8"
        fill="currentColor"
      />

      <circle
        cx="3.5"
        cy="12"
        r=".8"
        fill="currentColor"
      />

      <circle
        cx="3.5"
        cy="17"
        r=".8"
        fill="currentColor"
      />
    </svg>
  );
}


// =====================================================
// ICON BUILDING
// =====================================================

function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 shrink-0 text-[#71877b]"
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


// =====================================================
// ICON PIN
// =====================================================

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 shrink-0 text-[#71877b]"
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


// =====================================================
// ICON CAP
// =====================================================

function CapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 shrink-0 text-[#71877b]"
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


// =====================================================
// ICON BRIEFCASE
// =====================================================

function BriefcaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 shrink-0 text-[#71877b]"
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