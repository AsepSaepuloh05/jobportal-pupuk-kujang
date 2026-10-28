"use client";

import {
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
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

import {
  FileThumb,
  NewFileThumb,
  formatFileSize,
  getFileKind,
  getKindLabel,
} from "./FilePreview";

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

  const paklaringName =
    item.paklaringNamaAsli ||
    item.paklaringNamaFile ||
    "Surat paklaring";

  const paklaringKind = getFileKind(
    item.paklaringTipeFile,
    item.paklaringNamaAsli || item.paklaringPathFile
  );

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
        <div className="mt-4">
          {hasPaklaring ? (
            <div className="group flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-3 transition hover:border-emerald-200 hover:shadow-sm sm:flex-row sm:items-center sm:p-3.5">
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <FileThumb
                  kind={paklaringKind}
                  src={item.paklaringPathFile}
                  size="lg"
                />

                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Paklaring terlampir
                  </span>

                  <p
                    className="mt-1.5 truncate text-sm font-semibold text-slate-800"
                    title={paklaringName}
                  >
                    {paklaringName}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {getKindLabel(paklaringKind)}
                    {item.paklaringUkuranFile
                      ? ` • ${formatFileSize(item.paklaringUkuranFile)}`
                      : ""}
                  </p>
                </div>
              </div>

              <a
                href={item.paklaringPathFile || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Eye className="h-4 w-4" />
                Lihat Paklaring
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3.5 py-3">
              <FileCheck2 className="h-4 w-4 shrink-0 text-slate-300" />

              <p className="text-xs text-slate-400">
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
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-800">
              Surat Paklaring
              <span className="ml-1 text-xs font-normal text-slate-400">
                (Opsional)
              </span>
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Format PDF, JPG, atau PNG. Maksimal 5 MB.
            </p>
          </div>

          {paklaringFile ? (
            /* FILE BARU */
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 rounded-xl border border-emerald-200 bg-white p-3 shadow-sm">
                <NewFileThumb file={paklaringFile} />

                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Siap diunggah
                  </span>

                  <p
                    className="mt-1.5 truncate text-sm font-semibold text-slate-800"
                    title={paklaringFile.name}
                  >
                    {paklaringFile.name}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {getKindLabel(
                      getFileKind(paklaringFile.type, paklaringFile.name)
                    )}{" "}
                    • {formatFileSize(paklaringFile.size)}
                  </p>

                  {hasExistingPaklaring && (
                    <p className="mt-1 text-[11px] font-medium text-amber-600">
                      Akan menggantikan paklaring sebelumnya
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClearPaklaringFile}
                  disabled={saving || uploadingPaklaring}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
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
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  disabled={saving || uploadingPaklaring}
                  onChange={onPaklaringFileChange}
                />
              </label>
            </div>
          ) : hasExistingPaklaring ? (
            /* FILE LAMA */
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <FileThumb
                  kind={getFileKind(
                    form.paklaringTipeFile,
                    form.paklaringNamaAsli || form.paklaringPathFile
                  )}
                  src={form.paklaringPathFile}
                  size="lg"
                />

                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Tersimpan
                  </span>

                  <p
                    className="mt-1.5 truncate text-sm font-semibold text-slate-800"
                    title={form.paklaringNamaAsli || form.paklaringNamaFile || undefined}
                  >
                    {form.paklaringNamaAsli ||
                      form.paklaringNamaFile ||
                      "Paklaring tersimpan"}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {getKindLabel(
                      getFileKind(
                        form.paklaringTipeFile,
                        form.paklaringNamaAsli || form.paklaringPathFile
                      )
                    )}
                    {form.paklaringUkuranFile
                      ? ` • ${formatFileSize(form.paklaringUkuranFile)}`
                      : ""}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1">
                  {form.paklaringPathFile && (
                    <a
                      href={form.paklaringPathFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
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

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                <Upload className="h-4 w-4" />
                Ganti Paklaring

                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  disabled={saving || uploadingPaklaring}
                  onChange={onPaklaringFileChange}
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
                Pilih file paklaring
              </p>

              <p className="mt-1 text-xs text-slate-400">
                PDF, JPG, atau PNG • Maksimal 5 MB
              </p>

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
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
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