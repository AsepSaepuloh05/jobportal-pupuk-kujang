"use client";

import {
  CalendarDays,
  FileCheck2,
  GraduationCap,
  Pencil,
  Trash2,
  Upload,
  X,
  Eye,
} from "lucide-react";

import { Pendidikan } from "../types";
import { AddButton, EmptyState, ModernSection } from "./Shared";
import {
  Modal,
  ModalFooter,
  ModalInput,
  ModalSelect,
} from "./ModalPrimitives";

const JENJANG_OPTIONS = [
  "SMA / SMK",
  "D1",
  "D2",
  "D3",
  "D4",
  "S1",
  "S2",
  "S3",
];

function formatUkuran(bytes?: number | null) {
  if (!bytes) return "";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  const hasIjazah = Boolean(item.ijazahPathFile);

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
              IPK / Nilai: {item.nilai}
            </span>
          )}
        </div>

        {/* IJAZAH */}
        <div className="mt-3">
          {hasIjazah ? (
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
                  <FileCheck2 className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Ijazah
                  </p>

                  <p className="truncate text-xs font-medium text-slate-700">
                    {item.ijazahNamaAsli || item.ijazahNamaFile}
                  </p>

                  {item.ijazahUkuranFile ? (
                    <p className="text-[10px] text-slate-400">
                      {formatUkuran(item.ijazahUkuranFile)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                {item.ijazahPathFile && (
                  <a
                    href={item.ijazahPathFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Lihat
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5">
              <FileCheck2 className="h-4 w-4 text-slate-300" />

              <p className="text-[11px] text-slate-400">
                Ijazah belum diunggah
              </p>
            </div>
          )}
        </div>
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

  onClose: () => void;
  onSave: () => void;
}) {
  const hasExistingIjazah = Boolean(form.ijazahPathFile);

  return (
    <Modal
      title={isEdit ? "Edit Pendidikan" : "Tambah Pendidikan"}
      description="Masukkan riwayat pendidikan formal Anda."
      onClose={() => {
        if (!saving && !uploadingIjazah) {
          onClose();
        }
      }}
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
            label="IPK / Nilai"
            value={form.nilai || ""}
            placeholder="Contoh: 3.75"
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                nilai: value,
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
                tahunMulai: value,
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
                tahunSelesai: value,
              }))
            }
          />
        </div>

        {/* ====================================================
            IJAZAH
        ==================================================== */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-800">
              Dokumen Ijazah
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Format PDF, JPG, atau PNG. Maksimal 5 MB.
            </p>
          </div>

          {/* EXISTING IJAZAH */}
          {hasExistingIjazah && (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                <FileCheck2 className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700">
                  {form.ijazahNamaAsli || form.ijazahNamaFile}
                </p>

                {form.ijazahUkuranFile ? (
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {formatUkuran(form.ijazahUkuranFile)}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 gap-1">
                {form.ijazahPathFile && (
                  <a
                    href={form.ijazahPathFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                    title="Lihat ijazah"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                )}

                {isEdit && (
                  <button
                    type="button"
                    disabled={uploadingIjazah}
                    onClick={() => onDeleteIjazah(form.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    title="Hapus ijazah"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* NEW FILE */}
          {ijazahFile ? (
            <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100">
                <Upload className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700">
                  {ijazahFile.name}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  File baru siap diunggah
                </p>
              </div>

              <button
                type="button"
                onClick={onClearIjazahFile}
                disabled={saving || uploadingIjazah}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                title="Batalkan file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600">
              <Upload className="h-4 w-4" />
              Pilih File Ijazah

              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                disabled={saving || uploadingIjazah}
                onChange={onIjazahFileChange}
              />
            </label>
          )}

          {/* UPLOAD STATUS */}
          {uploadingIjazah && (
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              Mengunggah ijazah...
            </div>
          )}
        </div>
      </div>

      <ModalFooter
        onCancel={onClose}
        onSave={onSave}
        loading={saving}
      />
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
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </>
  );
}