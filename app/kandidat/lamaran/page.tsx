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

interface Lamaran {
  id: number;
  posisi: string;
  perusahaan: string;
  departemen: string;
  tanggal: string;
  status: "Diproses" | "Seleksi" | "Diterima" | "Ditolak";
  rincian: string;
}

const lamaranDummy: Lamaran[] = [
  {
    id: 1,
    posisi: "IT Support",
    perusahaan: "PT Pupuk Kujang",
    departemen: "IT & Sistem Informasi",
    tanggal: "15 Agustus 2026",
    status: "Diproses",
    rincian: "Menangani pemeliharaan perangkat, jaringan, dan sistem komputer kantor.",
  },
  {
    id: 2,
    posisi: "Staff Administrasi",
    perusahaan: "PT Pupuk Kujang",
    departemen: "Umum & SDM",
    tanggal: "10 Agustus 2026",
    status: "Seleksi",
    rincian: "Mengelola dokumen administrasi dan surat-menyurat departemen.",
  },
];

const statusStyles: Record<Lamaran["status"], string> = {
  Diproses: "bg-amber-50 text-amber-700",
  Seleksi: "bg-blue-50 text-blue-700",
  Diterima: "bg-emerald-50 text-emerald-700",
  Ditolak: "bg-red-50 text-red-700",
};

export default function LamaranPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

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

        if (!data.success || !data.user || data.user.role !== "KANDIDAT") {
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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          <p className="text-sm text-slate-500">Memuat lamaran…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
            Lamaran Saya
          </h1>
          <p className="mt-1 text-[13.5px] text-slate-500">
            Pantau seluruh proses lamaran pekerjaan kamu.
          </p>
        </div>

        {/* TABLE CARD */}
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3.5 text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                    Tanggal Pengajuan
                  </th>
                  <th className="px-6 py-3.5 text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                    Posisi
                  </th>
                  <th className="px-6 py-3.5 text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                    Departemen
                  </th>
                  <th className="px-6 py-3.5 text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                    Rincian Pekerjaan
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {lamaranDummy.map((lamaran) => (
                  <tr key={lamaran.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-6 py-4 text-[13.5px] text-slate-600">
                      {lamaran.tanggal}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <BriefcaseIcon />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium text-slate-900">
                            {lamaran.posisi}
                          </p>
                          <p className="truncate text-[12.5px] text-slate-500">
                            {lamaran.perusahaan}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-[13.5px] text-slate-600">
                      {lamaran.departemen}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium ${statusStyles[lamaran.status]}`}
                      >
                        {lamaran.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="max-w-xs text-[13px] leading-relaxed text-slate-500">
                        {lamaran.rincian}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {lamaranDummy.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Belum ada lamaran yang diajukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
      <rect x="3.5" y="8" width="17" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 8V6.3A1.8 1.8 0 0 1 10.3 4.5h3.4a1.8 1.8 0 0 1 1.8 1.8V8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 12.5h17" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
