"use client";

import { useEffect, useState } from "react";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Sertifikasi } from "../types";
import { formatDate } from "../utils";
import { toast } from "./Toast";

import {
  AddButton,
  EmptyState,
  ModernSection,
} from "./Shared";

import {
  Modal,
  ModalFooter,
  ModalInput,
} from "./ModalPrimitives";

/* ============================================================
   KONFIGURASI FILE
============================================================ */

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

/* ============================================================
   HELPER FILE
============================================================ */

type FileKind = "pdf" | "image" | "file";

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileKind(
  type?: string | null,
  name?: string | null
): FileKind {
  const mime = (type || "").toLowerCase();
  const fileName = (name || "").toLowerCase();

  if (mime === "application/pdf" || fileName.endsWith(".pdf")) {
    return "pdf";
  }

  if (
    mime.startsWith("image/") ||
    /\.(jpe?g|png)$/.test(fileName)
  ) {
    return "image";
  }

  return "file";
}

function getKindLabel(kind: FileKind) {
  if (kind === "pdf") return "PDF";
  if (kind === "image") return "Gambar";
  return "File";
}

/* ============================================================
   THUMBNAIL FILE
   Gambar tampil sebagai pratinjau, PDF tampil sebagai ikon
============================================================ */

function FileThumb({
  kind,
  src,
  size = "md",
}: {
  kind: FileKind;
  src?: string | null;
  size?: "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const box = size === "lg" ? "h-16 w-16" : "h-12 w-12";

  if (kind === "image" && src && !failed) {
    return (
      <div
        className={`${box} shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200`}
      >
        <img
          src={src}
          alt="Pratinjau sertifikat"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (kind === "pdf") {
    return (
      <div
        className={`${box} flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100`}
      >
        <FileText className="h-5 w-5" />

        <span className="text-[9px] font-black tracking-wide">
          PDF
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${box} flex shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ring-1 ring-slate-200`}
    >
      {kind === "image" ? (
        <ImageIcon className="h-5 w-5" />
      ) : (
        <FileText className="h-5 w-5" />
      )}
    </div>
  );
}

/* ============================================================
   PRATINJAU FILE BARU (SEBELUM DIUNGGAH)
============================================================ */

function NewFileThumb({ file }: { file: File }) {
  const kind = getFileKind(file.type, file.name);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== "image") {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, kind]);

  return <FileThumb kind={kind} src={previewUrl} size="lg" />;
}

/* ============================================================
   CERTIFICATION ITEM
============================================================ */

function CertificationItem({
  item,
  last,
  onEdit,
  onDelete,
}: {
  item: Sertifikasi;
  last: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hasFile = Boolean(item.sertifikatPathFile);

  const fileName =
    item.sertifikatNamaAsli || "Bukti sertifikat";

  const kind = getFileKind(
    item.sertifikatTipeFile,
    item.sertifikatNamaAsli || item.sertifikatPathFile
  );

  return (
    <div
      className={`relative py-5 ${
        !last ? "border-b border-slate-100" : ""
      }`}
    >
      <div className="min-w-0">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold leading-6 text-slate-900 sm:text-base">
              {item.nama}
            </h3>

            <p className="mt-0.5 text-sm font-medium text-slate-600">
              {item.penerbit}
            </p>

            {item.nomor && (
              <p className="mt-1.5 text-xs text-slate-400">
                Nomor sertifikat:{" "}
                <span className="font-medium text-slate-600">
                  {item.nomor}
                </span>
              </p>
            )}
          </div>

          {/* ACTION */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-blue-50 hover:text-blue-600"
              title="Edit sertifikasi"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
              title="Hapus sertifikasi"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* TANGGAL */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {item.tanggalTerbit && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-600">
              <CalendarDays className="h-3.5 w-3.5" />

              Terbit {formatDate(item.tanggalTerbit)}
            </span>
          )}

          {item.tanggalKadaluarsa && (
            <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-500">
              Berlaku sampai{" "}
              {formatDate(item.tanggalKadaluarsa)}
            </span>
          )}
        </div>

        {/* BUKTI SERTIFIKAT */}
        <div className="mt-4">
          {hasFile ? (
            <div className="group flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-3 transition hover:border-emerald-200 hover:shadow-sm sm:flex-row sm:items-center sm:p-3.5">
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <FileThumb
                  kind={kind}
                  src={item.sertifikatPathFile}
                  size="lg"
                />

                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Bukti terlampir
                  </span>

                  <p
                    className="mt-1.5 truncate text-sm font-semibold text-slate-800"
                    title={fileName}
                  >
                    {fileName}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {getKindLabel(kind)}
                    {item.sertifikatUkuranFile
                      ? ` • ${formatFileSize(
                          item.sertifikatUkuranFile
                        )}`
                      : ""}
                  </p>
                </div>
              </div>

              <a
                href={item.sertifikatPathFile || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Eye className="h-4 w-4" />
                Lihat Sertifikat
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3.5 py-3">
              <FileText className="h-4 w-4 shrink-0 text-slate-300" />

              <p className="text-xs text-slate-400">
                Bukti sertifikat belum diunggah
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FILE UPLOAD
============================================================ */

function SertifikatUpload({
  form,
  setForm,
}: {
  form: Sertifikasi;

  setForm: React.Dispatch<
    React.SetStateAction<Sertifikasi>
  >;
}) {
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    /* Validasi tipe */
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        "Format file harus PDF, JPG, JPEG, atau PNG."
      );

      event.target.value = "";

      return;
    }

    /* Validasi ukuran */
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran file maksimal 5 MB.");

      event.target.value = "";

      return;
    }

    setForm((prev) => ({
      ...prev,

      file,

      sertifikatNamaAsli: file.name,

      sertifikatTipeFile: file.type,

      sertifikatUkuranFile: file.size,
    }));
  };

  const handleRemoveNewFile = () => {
    setForm((prev) => ({
      ...prev,

      file: null,

      sertifikatNamaAsli:
        prev.sertifikatPathFile
          ? prev.sertifikatNamaAsli
          : null,

      sertifikatTipeFile:
        prev.sertifikatPathFile
          ? prev.sertifikatTipeFile
          : null,

      sertifikatUkuranFile:
        prev.sertifikatPathFile
          ? prev.sertifikatUkuranFile
          : null,
    }));
  };

  const hasExisting = Boolean(form.sertifikatPathFile);

  const existingKind = getFileKind(
    form.sertifikatTipeFile,
    form.sertifikatNamaAsli || form.sertifikatPathFile
  );

  const newKind = form.file
    ? getFileKind(form.file.type, form.file.name)
    : "file";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        Bukti Sertifikat
        <span className="ml-1 text-xs font-normal text-slate-400">
          (Opsional)
        </span>
      </label>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3.5 transition hover:border-emerald-300 hover:bg-emerald-50/30">
        {/* FILE BARU */}
        {form.file ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3.5 rounded-xl border border-emerald-200 bg-white p-3 shadow-sm">
              <NewFileThumb file={form.file} />

              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Siap diunggah
                </span>

                <p
                  className="mt-1.5 truncate text-sm font-semibold text-slate-800"
                  title={form.file.name}
                >
                  {form.file.name}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {getKindLabel(newKind)} •{" "}
                  {formatFileSize(form.file.size)}
                </p>

                {hasExisting && (
                  <p className="mt-1 text-[11px] font-medium text-amber-600">
                    Akan menggantikan file sebelumnya
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleRemoveNewFile}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                title="Batalkan file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
              <Upload className="h-4 w-4" />

              Pilih File Lain

              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : hasExisting ? (
          /* FILE LAMA */
          <div className="space-y-3">
            <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <FileThumb
                kind={existingKind}
                src={form.sertifikatPathFile}
                size="lg"
              />

              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Tersimpan
                </span>

                <p
                  className="mt-1.5 truncate text-sm font-semibold text-slate-800"
                  title={form.sertifikatNamaAsli || undefined}
                >
                  {form.sertifikatNamaAsli ||
                    "Sertifikat tersimpan"}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {getKindLabel(existingKind)}
                  {form.sertifikatUkuranFile
                    ? ` • ${formatFileSize(
                        form.sertifikatUkuranFile
                      )}`
                    : ""}
                </p>
              </div>

              <a
                href={form.sertifikatPathFile || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                title="Lihat sertifikat"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
              <Upload className="h-4 w-4" />

              Ganti Sertifikat

              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          /* UPLOAD BARU */
          <label className="flex cursor-pointer flex-col items-center justify-center py-4 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
              <Upload className="h-5 w-5" />
            </div>

            <p className="text-sm font-semibold text-slate-600">
              Pilih file sertifikat
            </p>

            <p className="mt-1 text-xs text-slate-400">
              PDF, JPG, JPEG, atau PNG • Maksimal 5 MB
            </p>

            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MODAL
============================================================ */

function SertifikasiModal({
  isEdit,
  form,
  setForm,
  saving,
  onClose,
  onSave,
}: {
  isEdit: boolean;

  form: Sertifikasi;

  setForm: React.Dispatch<
    React.SetStateAction<Sertifikasi>
  >;

  saving: boolean;

  onClose: () => void;

  onSave: () => void;
}) {
  return (
    <Modal
      title={
        isEdit
          ? "Edit Sertifikasi"
          : "Tambah Sertifikasi"
      }
      description="Masukkan sertifikasi atau pelatihan yang dimiliki."
      onClose={() => {
        if (!saving) {
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
      <div className="space-y-4">
        <ModalInput
          label="Nama Sertifikasi"
          value={form.nama}
          placeholder="Contoh: Microsoft Azure Fundamentals"
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              nama: value,
            }))
          }
        />

        <ModalInput
          label="Penerbit / Lembaga"
          value={form.penerbit}
          placeholder="Contoh: Microsoft"
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              penerbit: value,
            }))
          }
        />

        <ModalInput
          label="Nomor Sertifikat"
          value={form.nomor || ""}
          placeholder="Opsional"
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              nomor: value,
            }))
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ModalInput
            label="Tanggal Terbit"
            type="date"
            value={form.tanggalTerbit || ""}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                tanggalTerbit: value,
              }))
            }
          />

          <ModalInput
            label="Tanggal Kadaluarsa"
            type="date"
            value={form.tanggalKadaluarsa || ""}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                tanggalKadaluarsa: value,
              }))
            }
          />
        </div>

        {/* UPLOAD SERTIFIKAT */}
        <SertifikatUpload
          form={form}
          setForm={setForm}
        />
      </div>
    </Modal>
  );
}

/* ============================================================
   SERTIFIKASI SECTION
============================================================ */

export function SertifikasiSection({
  items,
  showModal,
  editingId,
  form,
  setForm,
  saving,
  onOpenTambah,
  onOpenEdit,
  onClose,
  onSave,
  onDelete,
}: {
  items: Sertifikasi[];

  showModal: boolean;

  editingId: number | null;

  form: Sertifikasi;

  setForm: React.Dispatch<
    React.SetStateAction<Sertifikasi>
  >;

  saving: boolean;

  onOpenTambah: () => void;

  onOpenEdit: (item: Sertifikasi) => void;

  onClose: () => void;

  onSave: () => void;

  onDelete: (id: number) => void;
}) {
  return (
    <>
      <ModernSection
        icon={<Award className="h-5 w-5" />}
        iconStyle="emerald"
        title="Lisensi & Sertifikasi"
        description="Sertifikasi dan pelatihan yang mendukung kompetensi."
        action={
          <AddButton
            label="Tambah Sertifikasi"
            onClick={onOpenTambah}
          />
        }
      >
        {items.length === 0 ? (
          <EmptyState
            icon={<Award className="h-6 w-6" />}
            title="Belum ada sertifikasi"
            description="Tambahkan sertifikasi atau pelatihan yang Anda miliki."
            button="Tambah Sertifikasi"
            onClick={onOpenTambah}
          />
        ) : (
          <div className="mt-4">
            {items.map((item, index) => (
              <CertificationItem
                key={item.id}
                item={item}
                last={index === items.length - 1}
                onEdit={() => onOpenEdit(item)}
                onDelete={() =>
                  onDelete(item.id)
                }
              />
            ))}
          </div>
        )}
      </ModernSection>

      {showModal && (
        <SertifikasiModal
          isEdit={editingId !== null}
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </>
  );
}