"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ShieldCheck, X } from "lucide-react";

import {
  KEBIJAKAN_PRIVASI,
  SYARAT_PENGGUNAAN,
  type BagianDokumen,
} from "./persetujuan";

type Tab = "privasi" | "syarat";

const TAB_LABEL: Record<Tab, string> = {
  privasi: "Pernyataan Privasi Data",
  syarat: "Syarat Penggunaan",
};

/* ============================================================
   ISI DOKUMEN
============================================================ */

function IsiDokumen({ bagian }: { bagian: BagianDokumen[] }) {
  return (
    <div className="space-y-5">
      {bagian.map((item, index) => (
        <section key={item.judul}>
          <h3 className="text-sm font-bold text-slate-900">
            {index + 1}. {item.judul}
          </h3>

          {item.paragraf?.map((teks) => (
            <p
              key={teks}
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              {teks}
            </p>
          ))}

          {item.daftar && (
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-600">
              {item.daftar.map((teks) => (
                <li key={teks}>{teks}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

/* ============================================================
   MODAL
============================================================ */

function PersetujuanModal({
  onClose,
  onAccept,
}: {
  onClose: () => void;
  onAccept: () => void;
}) {
  const [tab, setTab] = useState<Tab>("privasi");
  const [dibaca, setDibaca] = useState<Record<Tab, boolean>>({
    privasi: false,
    syarat: false,
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const semuaDibaca = dibaca.privasi && dibaca.syarat;

  // Tandai dokumen sebagai sudah dibaca bila sudah digulir sampai akhir
  const cekScroll = useCallback(() => {
    const el = scrollRef.current;

    if (!el) return;

    const sampaiAkhir =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 8;

    if (sampaiAkhir) {
      setDibaca((prev) => (prev[tab] ? prev : { ...prev, [tab]: true }));
    }
  }, [tab]);

  // Saat berpindah tab: kembali ke atas, lalu cek (dokumen pendek langsung terbaca)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    cekScroll();
  }, [tab, cekScroll]);

  // Tutup dengan Escape dan kunci scroll halaman di belakang modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    const overflowSebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflowSebelumnya;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-persetujuan"
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2
                id="judul-persetujuan"
                className="text-base font-bold text-slate-900"
              >
                Privasi Data & Syarat Penggunaan
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Baca kedua dokumen sampai akhir untuk melanjutkan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            title="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* TAB */}
        <div className="flex gap-2 border-b border-slate-100 px-5 py-3 sm:px-6">
          {(Object.keys(TAB_LABEL) as Tab[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                tab === key
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {dibaca[key] && <CheckCircle2 className="h-3.5 w-3.5" />}
              {TAB_LABEL[key]}
            </button>
          ))}
        </div>

        {/* ISI */}
        <div
          ref={scrollRef}
          onScroll={cekScroll}
          className="flex-1 overflow-y-auto px-5 py-5 sm:px-6"
        >
          <IsiDokumen
            bagian={
              tab === "privasi" ? KEBIJAKAN_PRIVASI : SYARAT_PENGGUNAAN
            }
          />
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-slate-500">
            {semuaDibaca
              ? "Anda sudah membaca kedua dokumen."
              : "Gulir hingga akhir kedua dokumen untuk mengaktifkan tombol setuju."}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={!semuaDibaca}
              onClick={onAccept}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Saya Setuju
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   KOMPONEN UTAMA (dipakai di halaman registrasi)
============================================================ */

export function PersetujuanPrivasi({
  value,
  onChange,
  error,
  disabled = false,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string | null;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <label
        className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm leading-6 text-slate-600 transition ${
          error
            ? "border-red-300 bg-red-50/50"
            : "border-slate-200 bg-slate-50/60"
        }`}
      >
        <input
          type="checkbox"
          checked={value}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.checked) {
              // Persetujuan baru sah setelah dokumen dibaca di dalam modal
              setOpen(true);
            } else {
              onChange(false);
            }
          }}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-emerald-600"
        />

        <span>
          Saya telah membaca dan menyetujui{" "}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            Pernyataan Privasi Data
          </button>{" "}
          dan{" "}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            Syarat Penggunaan
          </button>
          .
        </span>
      </label>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      {open && (
        <PersetujuanModal
          onClose={() => setOpen(false)}
          onAccept={() => {
            onChange(true);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}