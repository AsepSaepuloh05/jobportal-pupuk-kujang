"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
}

type StatusLamaran = "DIPROSES" | "INTERVIEW" | "LOLOS" | "DITOLAK";

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
  };
}

const statusConfig: Record<StatusLamaran, { label: string; badge: string; dot: string }> = {
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

export default function LamaranPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [lamaran, setLamaran] = useState<Lamaran[]>([]);
  const [loadingLamaran, setLoadingLamaran] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/me", {
          cache: "no-store",
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

  useEffect(() => {
    if (!user) return;

    const getLamaran = async () => {
      try {
        setLoadingLamaran(true);

        const response = await fetch("/api/lamaran", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data lamaran");
        }

        const data = await response.json();

        setLamaran(data);
      } catch (err) {
        console.error("GET LAMARAN ERROR:", err);
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

  const formatTanggal = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const jumlah = (status: StatusLamaran) =>
    lamaran.filter((item) => item.status === status).length;

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
                Diterima
              </p>
              <p className="mt-1.5 text-2xl font-black text-[#35865d]">
                {jumlah("LOLOS")}
              </p>
            </div>

          </div>
        )}

        {/* LIST LAMARAN */}

        {loadingLamaran ? (

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#e1eee7] bg-white px-6 py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dceee5] border-t-[#4da477]" />
            <p className="text-sm text-[#81938a]">
              Memuat lamaran...
            </p>
          </div>

        ) : lamaran.length === 0 ? (

          <div className="rounded-2xl border border-[#e1eee7] bg-white px-5 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef6f1] text-3xl">
              📄
            </div>

            <h3 className="mt-5 text-lg font-black text-[#315c4a]">
              Belum ada lamaran
            </h3>

            <p className="mt-2 text-sm text-[#81938a]">
              Yuk jelajahi lowongan yang tersedia dan mulai
              melamar posisi yang sesuai denganmu.
            </p>

            <button
              type="button"
              onClick={() => router.push("/kandidat/lowongan")}
              className="mt-5 rounded-xl bg-[#315c4a] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#234236]"
            >
              Lihat Lowongan →
            </button>

          </div>

        ) : (

          <div className="space-y-3">

            {lamaran.map((item) => {
              const config = statusConfig[item.status];

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
                          <span>📍 {item.lowongan.lokasi}</span>
                          <span>◷ {item.lowongan.tipe}</span>
                          <span>
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
                      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${config.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>

                  </div>

                </article>
              );
            })}

          </div>

        )}

      </div>
    </div>
  );
}