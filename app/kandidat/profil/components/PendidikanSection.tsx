"use client";

import { useState } from "react";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Info,
  Pencil,
  Trash2,
  Upload,
  X,
  Eye,
} from "lucide-react";

import { Pendidikan } from "../types";
import {
  onlyYear,
  onlyNilaiByJenjang,
  isSmaSmk,
} from "../utils";
import {
  SKL_BATAS_BULAN,
  formatTanggalIndo,
  getStatusSkl,
  hariIniISO,
} from "../skl";
import { AddButton, EmptyState, ModernSection } from "./Shared";
import {
  FileThumb,
  NewFileThumb,
  formatFileSize,
  getFileKind,
  getKindLabel,
} from "./FilePreview";
import {
  Modal,
  ModalFooter,
  ModalInput,
  ModalSelect,
} from "./ModalPrimitives";

const JENJANG_OPTIONS = [
  { value: "SMA / SMK", label: "SMA / SMK" },
  { value: "D1", label: "D1" },
  { value: "D2", label: "D2" },
  { value: "D3", label: "D3" },
  { value: "D4", label: "D4" },
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
];

const FILE_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

/* ============================================================
   NOTICE STATUS SKL
============================================================ */

function SklStatusNotice({
  adaIjazah,
  adaSkl,
  tanggalLulus,
  className = "",
}: {
  adaIjazah: boolean;
  adaSkl: boolean;
  tanggalLulus?: string | null;
  className?: string;
}) {
  const status = getStatusSkl(tanggalLulus);

  let tone: "info" | "warn" | "danger" = "info";

  let text = `SKL hanya berlaku ${SKL_BATAS_BULAN} bulan sejak tanggal lulus. Setelah itu wajib beralih ke ijazah.`;

  if (status.status === "BERLAKU") {
    tone = adaIjazah ? "info" : "warn";

    text = `Masa berlaku SKL sampai ${formatTanggalIndo(
      status.batas
    )} (sisa ${status.sisaHari} hari).${
      adaIjazah ? "" : " Setelah itu wajib beralih ke ijazah."
    }`;
  } else if (status.status === "KEDALUWARSA") {
    tone = adaIjazah ? "info" : "danger";

    text = `Masa berlaku SKL berakhir pada ${formatTanggalIndo(
      status.batas
    )}.${adaIjazah ? " Ijazah sudah terlampir." : " Ijazah wajib diunggah."}`;
  } else if (adaSkl) {
    tone = "warn";
    text = "Isi tanggal lulus agar masa berlaku SKL dapat dihitung.";
  }

  const toneClass = {
    info: "border-slate-200 bg-white text-slate-500",
    warn: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
  }[tone];

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-5 ${toneClass} ${className}`}
    >
      {tone === "danger" || tone === "warn" ? (
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : (
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      )}

      <p>{text}</p>
    </div>
  );
}

/* ============================================================
   ATTACHMENT FIELD (Ijazah, SKL & Transkrip)
============================================================ */

type ExistingFile = {
  pathFile?: string | null;
  namaAsli?: string | null;
  namaFile?: string | null;
  tipeFile?: string | null;
  ukuranFile?: number | null;
};

function AttachmentField({
  title,
  noun,
  labelTag = "(Opsional)",
  file,
  existing,
  canDelete,
  disabled,
  uploading,
  onFileChange,
  onClearFile,
  onDelete,
}: {
  title: string; // contoh: "Dokumen Ijazah"
  noun: string; // contoh: "ijazah"
  labelTag?: string; // contoh: "(Wajib)"
  file: File | null;
  existing: ExistingFile | null;
  canDelete: boolean;
  disabled: boolean;
  uploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  onDelete: () => void;
}) {
  const existingKind = getFileKind(
    existing?.tipeFile,
    existing?.namaAsli || existing?.pathFile
  );

  const pickerLabel =
    "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-800">
          {title}
          <span className="ml-1 text-xs font-normal text-slate-400">
            {labelTag}
          </span>
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Format PDF, JPG, atau PNG. Maksimal 5 MB.
        </p>
      </div>

      {file ? (
        /* FILE BARU */
        <div className="space-y-3">
          <div className="flex items-center gap-3.5 rounded-xl border border-emerald-200 bg-white p-3 shadow-sm">
            <NewFileThumb file={file} />

            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Siap diunggah
              </span>

              <p
                className="mt-1.5 truncate text-sm font-semibold text-slate-800"
                title={file.name}
              >
                {file.name}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-400">
                {getKindLabel(getFileKind(file.type, file.name))} •{" "}
                {formatFileSize(file.size)}
              </p>

              {existing?.pathFile && (
                <p className="mt-1 text-[11px] font-medium text-amber-600">
                  Akan menggantikan {noun} sebelumnya
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClearFile}
              disabled={disabled}
              className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
              title="Batalkan file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className={pickerLabel}>
            <Upload className="h-4 w-4" />
            Pilih File Lain
            <input
              type="file"
              hidden
              accept={FILE_ACCEPT}
              disabled={disabled}
              onChange={onFileChange}
            />
          </label>
        </div>
      ) : existing?.pathFile ? (
        /* FILE LAMA */
        <div className="space-y-3">
          <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <FileThumb
              kind={existingKind}
              src={existing.pathFile}
              size="lg"
            />

            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                <CheckCircle2 className="h-3 w-3" />
                Tersimpan
              </span>

              <p
                className="mt-1.5 truncate text-sm font-semibold text-slate-800"
                title={existing.namaAsli || existing.namaFile || undefined}
              >
                {existing.namaAsli ||
                  existing.namaFile ||
                  `${title} tersimpan`}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-400">
                {getKindLabel(existingKind)}
                {existing.ukuranFile
                  ? ` • ${formatFileSize(existing.ukuranFile)}`
                  : ""}
              </p>
            </div>

            <div className="flex shrink-0 gap-1">
              <a
                href={existing.pathFile}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                title={`Lihat ${noun}`}
              >
                <Eye className="h-4 w-4" />
              </a>

              {canDelete && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={onDelete}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  title={`Hapus ${noun}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <label className={pickerLabel}>
            <Upload className="h-4 w-4" />
            Ganti file {noun}
            <input
              type="file"
              hidden
              accept={FILE_ACCEPT}
              disabled={disabled}
              onChange={onFileChange}
            />
          </label>
        </div>
      ) : (
        /* UPLOAD BARU */
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-5 text-center transition hover:border-emerald-300 hover:bg-emerald-50/30">
          <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
            <Upload className="h-5 w-5" />
          </div>

          <p className="text-sm font-semibold text-slate-600">
            Pilih file {noun}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            PDF, JPG, atau PNG • Maksimal 5 MB
          </p>

          <input
            type="file"
            hidden
            accept={FILE_ACCEPT}
            disabled={disabled}
            onChange={onFileChange}
          />
        </label>
      )}

      {/* UPLOAD STATUS */}
      {uploading && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
          Mengunggah {noun}...
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ATTACHMENT SUMMARY (ringkasan di kartu pendidikan)
============================================================ */

function AttachmentSummary({
  className,
  badge,
  linkLabel,
  emptyLabel,
  defaultName,
  pathFile,
  namaAsli,
  namaFile,
  tipeFile,
  ukuranFile,
}: {
  className?: string;
  badge: string;
  linkLabel: string;
  emptyLabel: string;
  defaultName: string;
  pathFile?: string | null;
  namaAsli?: string | null;
  namaFile?: string | null;
  tipeFile?: string | null;
  ukuranFile?: number | null;
}) {
  const name = namaAsli || namaFile || defaultName;
  const kind = getFileKind(tipeFile, namaAsli || pathFile);

  return (
    <div className={className}>
      {pathFile ? (
        <div className="group flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-3 transition hover:border-emerald-200 hover:shadow-sm sm:flex-row sm:items-center sm:p-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <FileThumb kind={kind} src={pathFile} size="lg" />

            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                {badge}
              </span>

              <p
                className="mt-1.5 truncate text-sm font-semibold text-slate-800"
                title={name}
              >
                {name}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-400">
                {getKindLabel(kind)}
                {ukuranFile ? ` • ${formatFileSize(ukuranFile)}` : ""}
              </p>
            </div>
          </div>

          <a
            href={pathFile}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Eye className="h-4 w-4" />
            {linkLabel}
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3.5 py-3">
          <FileCheck2 className="h-4 w-4 shrink-0 text-slate-300" />

          <p className="text-xs text-slate-400">{emptyLabel}</p>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   EDUCATION ITEM
============================================================ */

function EducationItem({
  item,
  last,
  onEdit,
  onDelete,
}: {
  item: Pendidikan;
  last: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const adaIjazah = Boolean(item.ijazahPathFile);
  const adaSkl = Boolean(item.sklPathFile);

  return (
    <div
      className={`relative py-5 ${
        !last ? "border-b border-slate-100" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold leading-6 text-slate-900">
              {item.institusi}
            </h3>

            <p className="mt-0.5 text-sm font-medium text-slate-600">
              {item.jurusan}
            </p>

            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarDays className="h-3.5 w-3.5" />
              {item.tahunMulai} - {item.tahunSelesai}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {/* EDIT */}
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-blue-50 hover:text-blue-600"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>

            {/* DELETE */}
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
              title="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* BADGES */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600">
            <GraduationCap className="h-3.5 w-3.5" />
            {item.jenjang}
          </span>

          {item.nilai && (
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
              {isSmaSmk(item.jenjang) ? "Nilai Rata-rata" : "IPK"}:{" "}
              {item.nilai}
            </span>
          )}
        </div>

        {/* DOKUMEN KELULUSAN: IJAZAH ATAU SKL (pilih salah satu) */}
        {adaIjazah ? (
          <AttachmentSummary
            className="mt-4"
            badge="Ijazah terlampir"
            linkLabel="Lihat Ijazah"
            emptyLabel="Ijazah belum diunggah"
            defaultName="Ijazah"
            pathFile={item.ijazahPathFile}
            namaAsli={item.ijazahNamaAsli}
            namaFile={item.ijazahNamaFile}
            tipeFile={item.ijazahTipeFile}
            ukuranFile={item.ijazahUkuranFile}
          />
        ) : adaSkl ? (
          <div className="mt-4 space-y-3">
            <AttachmentSummary
              badge="SKL terlampir"
              linkLabel="Lihat SKL"
              emptyLabel="SKL belum diunggah"
              defaultName="Surat Keterangan Lulus"
              pathFile={item.sklPathFile}
              namaAsli={item.sklNamaAsli}
              namaFile={item.sklNamaFile}
              tipeFile={item.sklTipeFile}
              ukuranFile={item.sklUkuranFile}
            />

            <SklStatusNotice
              adaIjazah={false}
              adaSkl={adaSkl}
              tanggalLulus={item.tanggalLulus}
            />
          </div>
        ) : (
          <AttachmentSummary
            className="mt-4"
            badge="Ijazah terlampir"
            linkLabel="Lihat Ijazah"
            emptyLabel="Ijazah atau SKL belum diunggah"
            defaultName="Ijazah"
            pathFile={null}
          />
        )}

        {/* TRANSKRIP NILAI */}
        <AttachmentSummary
          className="mt-3"
          badge="Transkrip terlampir"
          linkLabel="Lihat Transkrip"
          emptyLabel="Transkrip belum diunggah"
          defaultName="Transkrip Nilai"
          pathFile={item.transkripPathFile}
          namaAsli={item.transkripNamaAsli}
          namaFile={item.transkripNamaFile}
          tipeFile={item.transkripTipeFile}
          ukuranFile={item.transkripUkuranFile}
        />
      </div>
    </div>
  );
}

/* ============================================================
   PENDIDIKAN MODAL
============================================================ */

function PendidikanModal({
  isEdit,
  form,
  setForm,
  saving,
  ijazahFile,
  uploadingIjazah,
  onIjazahFileChange,
  onClearIjazahFile,
  onDeleteIjazah,
  sklFile,
  uploadingSkl,
  onSklFileChange,
  onClearSklFile,
  onDeleteSkl,
  transkripFile,
  uploadingTranskrip,
  onTranskripFileChange,
  onClearTranskripFile,
  onDeleteTranskrip,
  onClose,
  onSave,
}: {
  isEdit: boolean;
  form: Pendidikan;
  setForm: React.Dispatch<React.SetStateAction<Pendidikan>>;
  saving: boolean;

  ijazahFile: File | null;
  uploadingIjazah: boolean;
  onIjazahFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onClearIjazahFile: () => void;
  onDeleteIjazah: (id: number) => void;

  sklFile: File | null;
  uploadingSkl: boolean;
  onSklFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onClearSklFile: () => void;
  onDeleteSkl: (id: number) => void;

  transkripFile: File | null;
  uploadingTranskrip: boolean;
  onTranskripFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onClearTranskripFile: () => void;
  onDeleteTranskrip: (id: number) => void;

  onClose: () => void;
  onSave: () => void;
}) {
  const sekolah = isSmaSmk(form.jenjang);
  const [jenisDokumenKelulusan, setJenisDokumenKelulusan] = useState<
    "IJAZAH" | "SKL"
  >(() => {
    if (form.ijazahPathFile) return "IJAZAH";
    if (form.sklPathFile) return "SKL";
    return "IJAZAH";
  });

  const busy =
    saving || uploadingIjazah || uploadingSkl || uploadingTranskrip;

  const adaIjazah = Boolean(ijazahFile) || Boolean(form.ijazahPathFile);
  const adaSkl = Boolean(sklFile) || Boolean(form.sklPathFile);

  // Jika ijazah sudah tersimpan, SKL tidak diperlukan lagi
  const sklTerkunci = Boolean(form.ijazahPathFile);

  // Hanya satu dokumen kelulusan: file dari pilihan lain dibuang
  const pilihJenis = (value: "IJAZAH" | "SKL") => {
    if (value === jenisDokumenKelulusan) return;

    if (value === "SKL") {
      onClearIjazahFile();
    } else {
      onClearSklFile();
    }

    setJenisDokumenKelulusan(value);
  };

  return (
    <Modal
      title={isEdit ? "Edit Pendidikan" : "Tambah Pendidikan"}
      description="Masukkan riwayat pendidikan formal Anda."
      onClose={() => {
        if (!busy) {
          onClose();
        }
      }}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSave={onSave}
          loading={saving}
        />
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ModalSelect
            label="Jenjang"
            value={form.jenjang}
            options={JENJANG_OPTIONS}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                jenjang: value,
                // kosongkan nilai jika pindah antara SMA/SMK
                // dan jenjang lain, karena skalanya berbeda
                nilai:
                  isSmaSmk(prev.jenjang) !== isSmaSmk(value)
                    ? ""
                    : prev.nilai,
              }))
            }
          />

          <ModalInput
            label="Institusi"
            value={form.institusi}
            placeholder="Contoh: Politeknik Negeri Subang"
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                institusi: value,
              }))
            }
          />

          <ModalInput
            label="Jurusan"
            value={form.jurusan}
            placeholder="Contoh: Sistem Informasi"
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                jurusan: value,
              }))
            }
          />

          <ModalInput
            label={
              sekolah
                ? "Nilai Rata-rata (0 - 100)"
                : "IPK (0 - 4.00)"
            }
            value={form.nilai || ""}
            placeholder={
              sekolah ? "Contoh: 85.50" : "Contoh: 3.75"
            }
            maxLength={sekolah ? 6 : 4}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                nilai: onlyNilaiByJenjang(value, prev.jenjang),
              }))
            }
          />

          <ModalInput
            label="Tahun Mulai"
            value={form.tahunMulai}
            placeholder="Contoh: 2022"
            maxLength={4}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                tahunMulai: onlyYear(value),
              }))
            }
          />

          <ModalInput
            label="Tahun Selesai"
            value={form.tahunSelesai}
            placeholder="Contoh: 2025"
            maxLength={4}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                tahunSelesai: onlyYear(value),
              }))
            }
          />
        </div>

        {/* PILIH DOKUMEN KELULUSAN */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Dokumen Kelulusan
              <span className="ml-1 text-xs font-normal text-red-500">
                (Pilih salah satu)
              </span>
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {sklTerkunci
                ? "Ijazah sudah tersimpan, sehingga SKL tidak diperlukan lagi."
                : "Silakan pilih dokumen kelulusan yang akan dilampirkan."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => pilihJenis("IJAZAH")}
              aria-pressed={jenisDokumenKelulusan === "IJAZAH"}
              className={`rounded-xl border p-4 text-left transition ${
                jenisDokumenKelulusan === "IJAZAH"
                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                  : "border-slate-200 bg-white hover:border-emerald-300"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    jenisDokumenKelulusan === "IJAZAH"
                      ? "border-emerald-600"
                      : "border-slate-300"
                  }`}
                >
                  {jenisDokumenKelulusan === "IJAZAH" && (
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  )}
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  Ijazah
                </span>
              </span>
              <span className="mt-2 block pl-6 text-xs leading-5 text-slate-500">
                Pilih jika sudah memiliki ijazah.
              </span>
            </button>

            <button
              type="button"
              disabled={busy || sklTerkunci}
              onClick={() => pilihJenis("SKL")}
              aria-pressed={jenisDokumenKelulusan === "SKL"}
              title={
                sklTerkunci
                  ? "Ijazah sudah tersimpan, SKL tidak diperlukan lagi."
                  : undefined
              }
              className={`rounded-xl border p-4 text-left transition ${
                jenisDokumenKelulusan === "SKL"
                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                  : "border-slate-200 bg-white hover:border-emerald-300"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    jenisDokumenKelulusan === "SKL"
                      ? "border-emerald-600"
                      : "border-slate-300"
                  }`}
                >
                  {jenisDokumenKelulusan === "SKL" && (
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  )}
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  Surat Keterangan Lulus (SKL)
                </span>
              </span>
              <span className="mt-2 block pl-6 text-xs leading-5 text-slate-500">
                Pilih jika ijazah belum diterbitkan.
              </span>
            </button>
          </div>

          {jenisDokumenKelulusan === "IJAZAH" ? (
            <AttachmentField
              title="Dokumen Ijazah"
              noun="ijazah"
              labelTag="(Wajib)"
              file={ijazahFile}
              existing={
                form.ijazahPathFile
                  ? {
                      pathFile: form.ijazahPathFile,
                      namaAsli: form.ijazahNamaAsli,
                      namaFile: form.ijazahNamaFile,
                      tipeFile: form.ijazahTipeFile,
                      ukuranFile: form.ijazahUkuranFile,
                    }
                  : null
              }
              canDelete={isEdit}
              disabled={saving || uploadingIjazah}
              uploading={uploadingIjazah}
              onFileChange={onIjazahFileChange}
              onClearFile={onClearIjazahFile}
              onDelete={() => onDeleteIjazah(form.id)}
            />
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <label
                  htmlFor="tanggal-lulus"
                  className="text-sm font-semibold text-slate-800"
                >
                  Tanggal Lulus
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    (sesuai tanggal pada SKL)
                  </span>
                </label>

                <input
                  id="tanggal-lulus"
                  type="date"
                  value={form.tanggalLulus || ""}
                  max={hariIniISO()}
                  disabled={saving}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      tanggalLulus: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                />

                <SklStatusNotice
                  className="mt-3"
                  adaIjazah={adaIjazah}
                  adaSkl={adaSkl}
                  tanggalLulus={form.tanggalLulus}
                />
              </div>

              <AttachmentField
                title="Surat Keterangan Lulus (SKL)"
                noun="SKL"
                labelTag={`(Berlaku ${SKL_BATAS_BULAN} bulan)`}
                file={sklFile}
                existing={
                  form.sklPathFile
                    ? {
                        pathFile: form.sklPathFile,
                        namaAsli: form.sklNamaAsli,
                        namaFile: form.sklNamaFile,
                        tipeFile: form.sklTipeFile,
                        ukuranFile: form.sklUkuranFile,
                      }
                    : null
                }
                canDelete={isEdit}
                disabled={saving || uploadingSkl}
                uploading={uploadingSkl}
                onFileChange={onSklFileChange}
                onClearFile={onClearSklFile}
                onDelete={() => onDeleteSkl(form.id)}
              />
            </div>
          )}
        </div>

        {/* TRANSKRIP NILAI */}
        <AttachmentField
          title="Transkrip Nilai"
          noun="transkrip"
          file={transkripFile}
          existing={
            form.transkripPathFile
              ? {
                  pathFile: form.transkripPathFile,
                  namaAsli: form.transkripNamaAsli,
                  namaFile: form.transkripNamaFile,
                  tipeFile: form.transkripTipeFile,
                  ukuranFile: form.transkripUkuranFile,
                }
              : null
          }
          canDelete={isEdit}
          disabled={saving || uploadingTranskrip}
          uploading={uploadingTranskrip}
          onFileChange={onTranskripFileChange}
          onClearFile={onClearTranskripFile}
          onDelete={() => onDeleteTranskrip(form.id)}
        />
      </div>
    </Modal>
  );
}

/* ============================================================
   PENDIDIKAN SECTION
============================================================ */

export function PendidikanSection({
  items,
  showModal,
  editingId,
  form,
  setForm,
  saving,
  ijazahFile,
  uploadingIjazah,
  onIjazahFileChange,
  onClearIjazahFile,
  onDeleteIjazah,
  sklFile,
  uploadingSkl,
  onSklFileChange,
  onClearSklFile,
  onDeleteSkl,
  transkripFile,
  uploadingTranskrip,
  onTranskripFileChange,
  onClearTranskripFile,
  onDeleteTranskrip,
  onOpenTambah,
  onOpenEdit,
  onClose,
  onSave,
  onDelete,
}: {
  items: Pendidikan[];
  showModal: boolean;
  editingId: number | null;
  form: Pendidikan;
  setForm: React.Dispatch<React.SetStateAction<Pendidikan>>;
  saving: boolean;

  ijazahFile: File | null;
  uploadingIjazah: boolean;
  onIjazahFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onClearIjazahFile: () => void;
  onDeleteIjazah: (id: number) => void;

  sklFile: File | null;
  uploadingSkl: boolean;
  onSklFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onClearSklFile: () => void;
  onDeleteSkl: (id: number) => void;

  transkripFile: File | null;
  uploadingTranskrip: boolean;
  onTranskripFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onClearTranskripFile: () => void;
  onDeleteTranskrip: (id: number) => void;

  onOpenTambah: () => void;
  onOpenEdit: (item: Pendidikan) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <>
      <ModernSection
        icon={<GraduationCap className="h-5 w-5" />}
        iconStyle="teal"
        title="Pendidikan"
        description="Riwayat pendidikan formal yang pernah ditempuh."
        action={
          <AddButton
            label="Tambah Pendidikan"
            onClick={onOpenTambah}
          />
        }
      >
        {items.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="h-6 w-6" />}
            title="Belum ada pendidikan"
            description="Tambahkan riwayat pendidikan untuk melengkapi profil Anda."
            button="Tambah Pendidikan"
            onClick={onOpenTambah}
          />
        ) : (
          <div className="mt-5">
            {items.map((item, index) => (
              <EducationItem
                key={item.id}
                item={item}
                last={index === items.length - 1}
                onEdit={() => onOpenEdit(item)}
                onDelete={() => onDelete(item.id)}
              />
            ))}
          </div>
        )}
      </ModernSection>

      {showModal && (
        <PendidikanModal
          isEdit={editingId !== null}
          form={form}
          setForm={setForm}
          saving={saving}
          ijazahFile={ijazahFile}
          uploadingIjazah={uploadingIjazah}
          onIjazahFileChange={onIjazahFileChange}
          onClearIjazahFile={onClearIjazahFile}
          onDeleteIjazah={onDeleteIjazah}
          sklFile={sklFile}
          uploadingSkl={uploadingSkl}
          onSklFileChange={onSklFileChange}
          onClearSklFile={onClearSklFile}
          onDeleteSkl={onDeleteSkl}
          transkripFile={transkripFile}
          uploadingTranskrip={uploadingTranskrip}
          onTranskripFileChange={onTranskripFileChange}
          onClearTranskripFile={onClearTranskripFile}
          onDeleteTranskrip={onDeleteTranskrip}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </>
  );
}