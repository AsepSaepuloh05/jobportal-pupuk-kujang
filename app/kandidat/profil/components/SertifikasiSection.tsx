"use client";

import {
  Award,
  CalendarDays,
  FileText,
  Pencil,
  Trash2,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";

import { Sertifikasi } from "../types";
import { formatDate } from "../utils";

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
   FORMAT UKURAN
============================================================ */

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

        {/* FILE SERTIFIKAT */}
        {item.sertifikatPathFile && (
          <div className="mt-3">
            <a
              href={item.sertifikatPathFile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <FileText className="h-4 w-4" />

              <span>
                {item.sertifikatNamaAsli ||
                  "Lihat Sertifikat"}
              </span>

              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
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
      alert(
        "Format file harus PDF, JPG, JPEG, atau PNG."
      );

      event.target.value = "";

      return;
    }

    /* Validasi ukuran */
    if (file.size > MAX_FILE_SIZE) {
      alert("Ukuran file maksimal 5 MB.");

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

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        Sertifikat
        <span className="ml-1 text-xs font-normal text-slate-400">
          (Opsional)
        </span>
      </label>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/30">
        {/* FILE BARU */}
        {form.file ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-white p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-700">
                  {form.file.name}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {formatFileSize(form.file.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveNewFile}
              className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              title="Hapus file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : form.sertifikatPathFile ? (
          /* FILE LAMA */
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-700">
                  {form.sertifikatNamaAsli ||
                    "Sertifikat tersimpan"}
                </p>

                {form.sertifikatUkuranFile && (
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatFileSize(
                      form.sertifikatUkuranFile
                    )}
                  </p>
                )}
              </div>

              <a
                href={form.sertifikatPathFile}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                title="Lihat sertifikat"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
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