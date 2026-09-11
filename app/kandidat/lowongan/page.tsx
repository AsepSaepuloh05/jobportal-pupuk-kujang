"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Lowongan {
  id: string;
  posisi: string;
  departemen: string;
  lokasi: string;
  tipe: string;
  status: string;
  gaji?: string | null;
  deskripsi?: string | null;
  persyaratan?: string | null;
  tanggungJawab?: string | null;
  kategori?: string | null;
  pendidikan?: string | null;
  pengalaman?: string | null;
  berlakuHingga?: string | null;
  batasLamaran?: string | null;
  createdAt?: string;
  pelamar?: number;
}

interface Dokumen {
  id: string;
  jenisDokumen: string;
  namaFile: string;
  url?: string;
}

export default function LowonganPage() {
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Lowongan[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState(
    searchParams.get("keyword") || ""
  );
  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  );
  const [departemen, setDepartemen] = useState("");

  const [selectedJob, setSelectedJob] = useState<Lowongan | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [documents, setDocuments] = useState<Dokumen[]>([]);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJob) return;

    fetchProfileData();
  }, [selectedJob]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedJob(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (selectedJob) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedJob]);

  async function fetchJobs() {
    try {
      setLoading(true);

      const response = await fetch("/api/lowongan?status=AKTIF");

      if (!response.ok) {
        throw new Error("Gagal mengambil data lowongan");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setJobs(data);
      } else if (Array.isArray(data.lowongan)) {
        setJobs(data.lowongan);
      } else if (Array.isArray(data.data)) {
        setJobs(data.data);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error(error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfileData() {
    try {
      setApplicationMessage("");
      setAlreadyApplied(false);
      setDocuments([]);

      const [documentResponse, applicationResponse] = await Promise.all([
        fetch("/api/profil/dokumen"),
        fetch("/api/lamaran"),
      ]);

      if (documentResponse.ok) {
        const documentData = await documentResponse.json();

        if (Array.isArray(documentData)) {
          setDocuments(documentData);
        } else if (Array.isArray(documentData.data)) {
          setDocuments(documentData.data);
        } else if (Array.isArray(documentData.dokumen)) {
          setDocuments(documentData.dokumen);
        }
      }

      if (applicationResponse.ok) {
        const applicationData = await applicationResponse.json();

        const applications = Array.isArray(applicationData)
          ? applicationData
          : applicationData.data ||
            applicationData.lamaran ||
            applicationData.applications ||
            [];

        if (Array.isArray(applications)) {
          const exists = applications.some((item: any) => {
            const lowonganId =
              item.lowonganId ||
              item.lowongan?.id ||
              item.jobId ||
              item.job?.id;

            return String(lowonganId) === String(selectedJob?.id);
          });

          setAlreadyApplied(exists);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function openDetail(id: string) {
    try {
      setDetailLoading(true);
      setDetailError("");
      setApplicationMessage("");

      const response = await fetch(`/api/lowongan/${id}`);

      if (!response.ok) {
        throw new Error("Gagal mengambil detail lowongan");
      }

      const data = await response.json();

      const job = data?.data || data?.lowongan || data;

      setSelectedJob(job);
    } catch (error) {
      console.error(error);
      setDetailError("Detail lowongan tidak dapat dimuat.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleLamar() {
    if (!selectedJob) return;

    const hasCV = documents.some(
      (document) =>
        document.jenisDokumen?.toUpperCase() === "CV"
    );

    if (!hasCV) {
      setApplicationMessage(
        "Silakan unggah CV terlebih dahulu melalui halaman Profil & Dokumen."
      );
      return;
    }

    try {
      setApplicationLoading(true);
      setApplicationMessage("");

      const response = await fetch("/api/lamaran", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lowonganId: selectedJob.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Gagal mengirim lamaran."
        );
      }

      setAlreadyApplied(true);

      setApplicationMessage(
        data?.message || "Lamaran berhasil dikirim."
      );
    } catch (error: any) {
      setApplicationMessage(
        error?.message || "Terjadi kesalahan saat mengirim lamaran."
      );
    } finally {
      setApplicationLoading(false);
    }
  }

  const departemenList = useMemo(() => {
    const values = jobs
      .map((job) => job.departemen)
      .filter(Boolean);

    return ["Semua Departemen", ...Array.from(new Set(values))];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const keywordMatch =
        !keyword ||
        job.posisi
          ?.toLowerCase()
          .includes(keyword.toLowerCase()) ||
        job.departemen
          ?.toLowerCase()
          .includes(keyword.toLowerCase());

      const locationMatch =
        !location ||
        job.lokasi
          ?.toLowerCase()
          .includes(location.toLowerCase());

      const departmentMatch =
        !departemen ||
        departemen === "Semua Departemen" ||
        job.departemen === departemen;

      return (
        keywordMatch &&
        locationMatch &&
        departmentMatch
      );
    });
  }, [jobs, keyword, location, departemen]);

  function resetFilter() {
    setKeyword("");
    setLocation("");
    setDepartemen("");
  }

  function formatDate(date?: string | null) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function closeModal() {
    setSelectedJob(null);
    setDetailError("");
    setApplicationMessage("");
  }

  const hasCV = documents.some(
    (document) =>
      document.jenisDokumen?.toUpperCase() === "CV"
  );

  return (
    <main className="min-h-screen bg-[#f7faf8] text-[#234236]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-[#e1eee7] bg-white">
        <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f6ee]">
              <BriefcaseIcon />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight text-[#315c4a] sm:text-2xl">
                Lowongan Pekerjaan
              </h1>

              <p className="mt-1 text-xs text-[#71877b] sm:text-sm">
                Temukan peluang kerja yang sesuai dengan kemampuan dan
                pengalaman Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <section className="bg-[#f7faf8]">
        <div className="mx-auto max-w-[1200px] px-5 pt-7 sm:px-8">
          <div className="rounded-2xl border border-[#e1eee7] bg-white p-4 shadow-[0_4px_20px_rgba(49,92,74,0.04)] sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f6ee]">
                <SearchIcon />
              </div>

              <div>
                <p className="text-sm font-black text-[#315c4a]">
                  Cari Lowongan
                </p>

                <p className="text-[11px] text-[#8a9b92]">
                  Temukan posisi yang sesuai dengan kebutuhan Anda
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_200px]">
              {/* KEYWORD */}

              <div className="flex h-11 items-center gap-3 rounded-xl border border-[#dce9e2] bg-[#f9fcfa] px-3.5 transition focus-within:border-[#73c69d] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#e8f6ee]">
                <SearchIcon />

                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Cari posisi atau departemen..."
                  className="w-full bg-transparent text-xs text-[#234236] outline-none placeholder:text-[#9aa9a1]"
                />
              </div>

              {/* LOCATION */}

              <div className="flex h-11 items-center gap-3 rounded-xl border border-[#dce9e2] bg-[#f9fcfa] px-3.5 transition focus-within:border-[#73c69d] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#e8f6ee]">
                <PinIcon />

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Cari lokasi..."
                  className="w-full bg-transparent text-xs text-[#234236] outline-none placeholder:text-[#9aa9a1]"
                />
              </div>

              {/* DEPARTEMEN */}

              <div className="relative">
                <select
                  value={departemen}
                  onChange={(e) =>
                    setDepartemen(e.target.value)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-[#dce9e2] bg-[#f9fcfa] px-3.5 pr-9 text-xs font-medium text-[#234236] outline-none transition focus:border-[#73c69d] focus:bg-white focus:ring-2 focus:ring-[#e8f6ee]"
                >
                  {departemenList.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71877b]"
                >
                  <path
                    d="m6 9 6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {(keyword || location || departemen) && (
              <div className="mt-3 flex items-center justify-between border-t border-[#edf3ef] pt-3">
                <p className="text-[11px] text-[#71877b]">
                  Menampilkan{" "}
                  <span className="font-bold text-[#315c4a]">
                    {filteredJobs.length}
                  </span>{" "}
                  lowongan
                </p>

                <button
                  type="button"
                  onClick={resetFilter}
                  className="text-[11px] font-bold text-[#4da477] transition hover:text-[#315c4a]"
                >
                  Reset filter
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          LIST LOWONGAN
      ===================================================== */}

      <section className="mx-auto max-w-[1200px] px-5 pb-12 pt-6 sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-[#315c4a]">
              Lowongan Tersedia
            </h2>

            <p className="mt-0.5 text-[11px] text-[#8a9b92]">
              {filteredJobs.length} posisi tersedia
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[245px] animate-pulse rounded-2xl border border-[#e1eee7] bg-white"
              />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-[#e1eee7] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f6ee]">
              <SearchIcon />
            </div>

            <h3 className="mt-4 text-sm font-black text-[#315c4a]">
              Lowongan tidak ditemukan
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#8a9b92]">
              Coba ubah kata kunci, lokasi, atau departemen untuk
              menemukan lowongan lainnya.
            </p>

            {(keyword || location || departemen) && (
              <button
                type="button"
                onClick={resetFilter}
                className="mt-4 rounded-lg bg-[#4da477] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#3e9167]"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <article
                key={job.id}
                className="group rounded-2xl border border-[#e1eee7] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#cfe2d8] hover:shadow-[0_8px_28px_rgba(49,92,74,0.07)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap gap-2">
                    {job.kategori && (
                      <span className="rounded-full bg-[#e8f6ee] px-2.5 py-1 text-[10px] font-bold text-[#4da477]">
                        {job.kategori}
                      </span>
                    )}

                    <span className="rounded-full bg-[#f1f7f3] px-2.5 py-1 text-[10px] font-bold text-[#71877b]">
                      {job.status}
                    </span>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f4f8f5] transition group-hover:bg-[#e8f6ee]">
                    <BuildingIcon />
                  </div>
                </div>

                <h3 className="mt-4 line-clamp-2 text-base font-black leading-6 text-[#315c4a]">
                  {job.posisi}
                </h3>

                <p className="mt-1 text-xs font-medium text-[#71877b]">
                  {job.departemen}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <InfoCard
                    icon={<PinIcon />}
                    label="Lokasi"
                    value={job.lokasi || "-"}
                  />

                  <InfoCard
                    icon={<CapIcon />}
                    label="Pendidikan"
                    value={job.pendidikan || "-"}
                  />

                  <InfoCard
                    icon={<BriefcaseIcon />}
                    label="Tipe"
                    value={job.tipe || "-"}
                  />

                  {job.pengalaman && (
                    <InfoCard
                      icon={<BriefcaseIcon />}
                      label="Pengalaman"
                      value={job.pengalaman}
                    />
                  )}
                </div>

                {job.deskripsi && (
                  <p className="mt-4 line-clamp-2 text-xs leading-5 text-[#71877b]">
                    {job.deskripsi}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-[#edf3ef] pt-4">
                  <div>
                    {job.batasLamaran ? (
                      <>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa9a1]">
                          Batas Lamaran
                        </p>

                        <p className="mt-0.5 text-[10px] font-bold text-[#315c4a]">
                          {formatDate(job.batasLamaran)}
                        </p>
                      </>
                    ) : job.berlakuHingga ? (
                      <>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa9a1]">
                          Berlaku Hingga
                        </p>

                        <p className="mt-0.5 text-[10px] font-bold text-[#315c4a]">
                          {formatDate(job.berlakuHingga)}
                        </p>
                      </>
                    ) : (
                      <p className="text-[10px] text-[#9aa9a1]">
                        Lowongan tersedia
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openDetail(job.id)}
                    className="rounded-lg bg-[#4da477] px-4 py-2 text-[11px] font-bold text-white transition hover:bg-[#3e9167]"
                  >
                    Lihat Detail
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#e1eee7] bg-white">
        <div className="mx-auto max-w-[1200px] px-5 py-5 text-center sm:px-8">
          <p className="text-[10px] text-[#9aa9a1]">
            Informasi lowongan pekerjaan diperbarui secara berkala.
          </p>
        </div>
      </footer>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {(selectedJob || detailLoading || detailError) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#193d2e]/30 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          {detailLoading ? (
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 text-center shadow-2xl">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#dce9e2] border-t-[#4da477]" />

              <p className="mt-4 text-xs font-medium text-[#71877b]">
                Memuat detail lowongan...
              </p>
            </div>
          ) : detailError ? (
            <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff4f2] text-[#c76b5d]">
                !
              </div>

              <h3 className="mt-4 text-sm font-black text-[#315c4a]">
                Terjadi Kesalahan
              </h3>

              <p className="mt-1 text-xs text-[#8a9b92]">
                {detailError}
              </p>

              <button
                type="button"
                onClick={closeModal}
                className="mt-5 rounded-lg bg-[#4da477] px-5 py-2 text-xs font-bold text-white"
              >
                Tutup
              </button>
            </div>
          ) : selectedJob ? (
            <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[#e1eee7] bg-white shadow-2xl">
              {/* MODAL HEADER */}

              <div className="border-b border-[#e1eee7] px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.kategori && (
                        <span className="rounded-full bg-[#e8f6ee] px-2.5 py-1 text-[10px] font-bold text-[#4da477]">
                          {selectedJob.kategori}
                        </span>
                      )}

                      <span className="rounded-full bg-[#f1f7f3] px-2.5 py-1 text-[10px] font-bold text-[#71877b]">
                        {selectedJob.status}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-black leading-6 text-[#315c4a] sm:text-xl">
                      {selectedJob.posisi}
                    </h2>

                    <p className="mt-1 text-xs text-[#71877b]">
                      {selectedJob.departemen}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f4f8f5] text-[#71877b] transition hover:bg-[#e8f6ee] hover:text-[#315c4a]"
                    aria-label="Tutup"
                  >
                    <XIcon />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <DetailItem
                    icon={<PinIcon />}
                    label="Lokasi"
                    value={selectedJob.lokasi || "-"}
                  />

                  <DetailItem
                    icon={<CapIcon />}
                    label="Pendidikan"
                    value={selectedJob.pendidikan || "-"}
                  />

                  <DetailItem
                    icon={<BriefcaseIcon />}
                    label="Tipe"
                    value={selectedJob.tipe || "-"}
                  />

                  <DetailItem
                    icon={<BriefcaseIcon />}
                    label="Pengalaman"
                    value={selectedJob.pengalaman || "-"}
                  />
                </div>
              </div>

              {/* MODAL CONTENT */}

              <div className="max-h-[calc(90vh-230px)] overflow-y-auto px-5 py-5 sm:px-6">
                <div className="space-y-5">
                  <DetailSection
                    title="Deskripsi Pekerjaan"
                    content={selectedJob.deskripsi}
                  />

                  <DetailSection
                    title="Persyaratan"
                    content={selectedJob.persyaratan}
                    list
                  />

                  <DetailSection
                    title="Tanggung Jawab"
                    content={selectedJob.tanggungJawab}
                    list
                  />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#e1eee7] bg-[#f9fcfa] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#9aa9a1]">
                        Batas Lamaran
                      </p>

                      <p className="mt-1 text-xs font-black text-[#315c4a]">
                        {formatDate(selectedJob.batasLamaran)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#e1eee7] bg-[#f9fcfa] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#9aa9a1]">
                        Berlaku Hingga
                      </p>

                      <p className="mt-1 text-xs font-black text-[#315c4a]">
                        {formatDate(selectedJob.berlakuHingga)}
                      </p>
                    </div>
                  </div>

                  {/* APPLY */}

                  <div className="rounded-2xl border border-[#dce9e2] bg-[#f7faf8] p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-sm font-black text-[#315c4a]">
                          Tertarik dengan posisi ini?
                        </h3>

                        <p className="mt-1 max-w-md text-[11px] leading-5 text-[#71877b]">
                          Pastikan CV Anda sudah tersedia sebelum
                          mengirimkan lamaran.
                        </p>

                        {!hasCV && !alreadyApplied && (
                          <p className="mt-2 text-[10px] font-medium text-[#c76b5d]">
                            CV belum tersedia.
                          </p>
                        )}

                        {hasCV && !alreadyApplied && (
                          <p className="mt-2 text-[10px] font-medium text-[#4da477]">
                            CV tersedia dan siap digunakan.
                          </p>
                        )}

                        {applicationMessage && (
                          <p className="mt-2 text-[10px] font-bold text-[#4da477]">
                            {applicationMessage}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={
                          applicationLoading ||
                          alreadyApplied
                        }
                        onClick={handleLamar}
                        className={`shrink-0 rounded-lg px-5 py-2.5 text-xs font-bold transition ${
                          alreadyApplied
                            ? "cursor-not-allowed bg-[#dfe9e3] text-[#71877b]"
                            : "bg-[#4da477] text-white hover:bg-[#3e9167]"
                        }`}
                      >
                        {applicationLoading
                          ? "Mengirim..."
                          : alreadyApplied
                          ? "Sudah Dilamar"
                          : "Lamar Sekarang"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}

              <div className="flex items-center justify-end border-t border-[#e1eee7] bg-[#fbfdfc] px-5 py-3 sm:px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-[#dce9e2] bg-white px-4 py-2 text-xs font-bold text-[#71877b] transition hover:bg-[#f4f8f5]"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}

/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[#edf3ef] bg-[#f9fcfa] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="shrink-0">{icon}</div>

        <div className="min-w-0">
          <p className="text-[9px] font-medium text-[#9aa9a1]">
            {label}
          </p>

          <p className="truncate text-[10px] font-bold text-[#315c4a]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL SECTION
============================================================ */

function DetailSection({
  title,
  content,
  list = false,
}: {
  title: string;
  content?: string | null;
  list?: boolean;
}) {
  if (!content) return null;

  const items = content
    .split(/\r?\n|•/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section>
      <h3 className="text-sm font-black text-[#315c4a]">
        {title}
      </h3>

      {list ? (
        <ul className="mt-2 space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex gap-2 text-xs leading-5 text-[#71877b]"
            >
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#4da477]" />

              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 whitespace-pre-line text-xs leading-5 text-[#71877b]">
          {content}
        </p>
      )}
    </section>
  );
}

/* ============================================================
   DETAIL ITEM
============================================================ */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#e1eee7] bg-[#f9fcfa] p-3">
      <div className="flex items-center gap-2">
        {icon}

        <div className="min-w-0">
          <p className="text-[9px] text-[#9aa9a1]">
            {label}
          </p>

          <p className="truncate text-[10px] font-bold text-[#315c4a]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ICONS
============================================================ */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 shrink-0 text-[#4da477]"
    >
      <circle
        cx="10.8"
        cy="10.8"
        r="6.3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="m16 16 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 shrink-0 text-[#4da477]"
    >
      <path
        d="M20 10.2c0 5-8 10.3-8 10.3S4 15.2 4 10.2a8 8 0 1 1 16 0Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="10"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 shrink-0 text-[#4da477]"
    >
      <path
        d="m3 9 9-5 9 5-9 5-9-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M7 11.2v4.2c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M21 10v5"
        stroke="currentColor"
        strokeWidth="1.7"
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
      className="h-4 w-4 shrink-0 text-[#4da477]"
    >
      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M10 12v1.5h4V12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 text-[#4da477]"
    >
      <path
        d="M4 20V5.5L12 3v17M12 20h8V8.5l-8-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M7.5 7.5h1M7.5 11h1M7.5 14.5h1M15.5 10h1M15.5 13.5h1M15.5 17h1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}