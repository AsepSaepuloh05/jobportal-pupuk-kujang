"use client";

import {
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  FileCheck2,
  MapPin,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Pengalaman } from "../types";
import { calculateDuration, onlyYear } from "../utils";

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

function formatUkuran(bytes?: number | null) {
  if (!bytes) return "";

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ============================================================
   EXPERIENCE ITEM
============================================================ */

function ExperienceItem({
  item,
  last,
  onEdit,
  onDelete,
}: {
  item: Pengalaman;
  last: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const duration = calculateDuration(
    item.tahunMulai,
    item.tahunSelesai
  );

  const hasPaklaring = Boolean(item.paklaringPathFile);

  return (
    <div
      className={`relative py-5 ${
        !last ? "border-b border-slate-100" : ""
      }`}
    >
      <div className="min-w-0">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-bold leading-6 text-slate-900 sm:text-base">
              {item.posisi}
            </h3>

            <div className="mt-1.5 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 shrink-0 text-slate-400" />

              <p className="truncate text-sm font-semibold text-slate-600">
                {item.perusahaan}
              </p>
            </div>
          </div>

          {/* ACTION */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-blue-50 hover:text-blue-600"
              title="Edit pengalaman"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
              title="Hapus pengalaman"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* INFORMASI */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />

            <span>
              {item.tahunMulai} -{" "}
              {item.tahunSelesai || "Sekarang"}
            </span>
          </span>

          {duration && (
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
              {duration}
            </span>
          )}

          {item.lokasi && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />

              <span>{item.lokasi}</span>
            </span>
          )}
        </div>

        {/* DESKRIPSI */}
        {item.deskripsi && (
          <div className="mt-3.5 max-w-3xl">
            <p className="whitespace-pre-line text-[13px] leading-6 text-slate-500">
              {item.deskripsi}
            </p>
          </div>
        )}

        {/* PAKLARING */}
        <div className="mt-3.5">
          {hasPaklaring ? (
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
                  <FileCheck2 className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Paklaring
                  </p>

                  <p className="truncate text-xs font-medium text-slate-700">
                    {item.paklaringNamaAsli || item.paklaringNamaFile}
                  </p>

                  {item.paklaringUkuranFile ? (
                    <p className="text-[10px] text-slate-400">
                      {formatUkuran(item.paklaringUkuranFile)}
                    </p>
                  ) : null}
                </div>
              </div>

              <a
                href={item.paklaringPathFile || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <Eye className="h-3.5 w-3.5" />
                Lihat
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5">
              <FileCheck2 className="h-4 w-4 text-slate-300" />

              <p className="text-[11px] text-slate-400">
                Paklaring belum diunggah
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PENGALAMAN MODAL
============================================================ */

function PengalamanModal({
  isEdit,
  form,
  setForm,
  saving,
  paklaringFile,
  uploadingPaklaring,
  onPaklaringFileChange,
  onClearPaklaringFile,
  onDeletePaklaring,
  onClose,
  onSave,
}: {
  isEdit: boolean;
  form: Pengalaman;
  setForm: React.Dispatch<React.SetStateAction<Pengalaman>>;
  saving: boolean;

  paklaringFile: File | null;
  uploadingPaklaring: boolean;
  onPaklaringFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onClearPaklaringFile: () => void;
  onDeletePaklaring: (id: number) => void;

  onClose: () => void;
  onSave: () => void;
}) {
  const hasExistingPaklaring = Boolean(form.paklaringPathFile);

  return (
    <Modal
      title={
        isEdit
          ? "Edit Pengalaman Kerja"
          : "Tambah Pengalaman Kerja"
      }
      description="Masukkan pengalaman kerja yang relevan."
      onClose={() => {
        if (!saving && !uploadingPaklaring) onClose();
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
          label="Posisi / Jabatan"
          value={form.posisi}
          placeholder="Contoh: Web Developer"
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              posisi: value,
            }))
          }
        />

        <ModalInput
          label="Perusahaan"
          value={form.perusahaan}
          placeholder="Nama perusahaan"
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              perusahaan: value,
            }))
          }
        />

        <ModalInput
          label="Lokasi"
          value={form.lokasi || ""}
          placeholder="Contoh: Cikampek"
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              lokasi: value,
            }))
          }
        />

        <div className="grid grid-cols-2 gap-4">
          <ModalInput
            label="Tahun Mulai"
            value={form.tahunMulai}
            placeholder="2024"
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
            value={form.tahunSelesai || ""}
            placeholder="2025"
            maxLength={4}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                tahunSelesai: onlyYear(value),
              }))
            }
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Deskripsi Pekerjaan
          </label>

          <textarea
            value={form.deskripsi || ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                deskripsi: e.target.value,
              }))
            }
            rows={6}
            placeholder="Jelaskan tanggung jawab atau pencapaian selama bekerja..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
        </div>

        {/* ====================================================
            PAKLARING
        ==================================================== */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-800">
              Surat Paklaring
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Opsional. Format PDF, JPG, atau PNG. Maksimal 5 MB.
            </p>
          </div>

          {/* EXISTING PAKLARING */}
          {hasExistingPaklaring && (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                <FileCheck2 className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700">
                  {form.paklaringNamaAsli || form.paklaringNamaFile}
                </p>

                {form.paklaringUkuranFile ? (
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {formatUkuran(form.paklaringUkuranFile)}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 gap-1">
                {form.paklaringPathFile && (
                  <a
                    href={form.paklaringPathFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                    title="Lihat paklaring"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                )}

                {isEdit && (
                  <button
                    type="button"
                    disabled={uploadingPaklaring || saving}
                    onClick={() => onDeletePaklaring(form.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    title="Hapus paklaring"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* NEW FILE */}
          {paklaringFile ? (
            <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100">
                <Upload className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700">
                  {paklaringFile.name}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  {hasExistingPaklaring
                    ? "Akan menggantikan paklaring sebelumnya"
                    : "File baru siap diunggah"}
                </p>
              </div>

              <button
                type="button"
                onClick={onClearPaklaringFile}
                disabled={saving || uploadingPaklaring}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                title="Batalkan file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600">
              <Upload className="h-4 w-4" />
              {hasExistingPaklaring
                ? "Ganti File Paklaring"
                : "Pilih File Paklaring"}

              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                disabled={saving || uploadingPaklaring}
                onChange={onPaklaringFileChange}
              />
            </label>
          )}

          {/* UPLOAD STATUS */}
          {uploadingPaklaring && (
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              Mengunggah paklaring...
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================
   PENGALAMAN SECTION
============================================================ */

export function PengalamanSection({
  items,
  showModal,
  editingId,
  form,
  setForm,
  saving,
  paklaringFile,
  uploadingPaklaring,
  onPaklaringFileChange,
  onClearPaklaringFile,
  onDeletePaklaring,
  onOpenTambah,
  onOpenEdit,
  onClose,
  onSave,
  onDelete,
}: {
  items: Pengalaman[];
  showModal: boolean;
  editingId: number | null;
  form: Pengalaman;
  setForm: React.Dispatch<React.SetStateAction<Pengalaman>>;
  saving: boolean;

  paklaringFile: File | null;
  uploadingPaklaring: boolean;
  onPaklaringFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onClearPaklaringFile: () => void;
  onDeletePaklaring: (id: number) => void;

  onOpenTambah: () => void;
  onOpenEdit: (item: Pengalaman) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <>
      <ModernSection
        icon={<BriefcaseBusiness className="h-5 w-5" />}
        iconStyle="emerald"
        title="Pengalaman Kerja"
        description="Riwayat pengalaman kerja dan profesional."
        action={
          <AddButton
            label="Tambah Pengalaman"
            onClick={onOpenTambah}
          />
        }
      >
        {items.length === 0 ? (
          <EmptyState
            icon={<BriefcaseBusiness className="h-6 w-6" />}
            title="Belum ada pengalaman kerja"
            description="Tambahkan pengalaman kerja untuk memperkuat profil kandidat Anda."
            button="Tambah Pengalaman"
            onClick={onOpenTambah}
          />
        ) : (
          <div className="mt-4">
            {items.map((item, index) => (
              <ExperienceItem
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
        <PengalamanModal
          isEdit={editingId !== null}
          form={form}
          setForm={setForm}
          saving={saving}
          paklaringFile={paklaringFile}
          uploadingPaklaring={uploadingPaklaring}
          onPaklaringFileChange={onPaklaringFileChange}
          onClearPaklaringFile={onClearPaklaringFile}
          onDeletePaklaring={onDeletePaklaring}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </>
  );
}