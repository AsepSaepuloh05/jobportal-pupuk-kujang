"use client";

import {
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
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

  const ijazahName =
    item.ijazahNamaAsli || item.ijazahNamaFile || "Ijazah";

  const ijazahKind = getFileKind(
    item.ijazahTipeFile,
    item.ijazahNamaAsli || item.ijazahPathFile
  );

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
              {isSmaSmk(item.jenjang)
                ? "Nilai Rata-rata"
                : "IPK"}
              : {item.nilai}
            </span>
          )}
        </div>

        {/* IJAZAH */}
        <div className="mt-4">
          {hasIjazah ? (
            <div className="group flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-3 transition hover:border-emerald-200 hover:shadow-sm sm:flex-row sm:items-center sm:p-3.5">
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <FileThumb
                  kind={ijazahKind}
                  src={item.ijazahPathFile}
                  size="lg"
                />

                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Ijazah terlampir
                  </span>

                  <p
                    className="mt-1.5 truncate text-sm font-semibold text-slate-800"
                    title={ijazahName}
                  >
                    {ijazahName}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {getKindLabel(ijazahKind)}
                    {item.ijazahUkuranFile
                      ? ` • ${formatFileSize(item.ijazahUkuranFile)}`
                      : ""}
                  </p>
                </div>
              </div>

              <a
                href={item.ijazahPathFile || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Eye className="h-4 w-4" />
                Lihat Ijazah
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3.5 py-3">
              <FileCheck2 className="h-4 w-4 shrink-0 text-slate-300" />

              <p className="text-xs text-slate-400">
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
  const sekolah = isSmaSmk(form.jenjang);

  return (
    <Modal
      title={isEdit ? "Edit Pendidikan" : "Tambah Pendidikan"}
      description="Masukkan riwayat pendidikan formal Anda."
      onClose={() => {
        if (!saving && !uploadingIjazah) {
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

        {/* ====================================================
            IJAZAH
        ==================================================== */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-800">
              Dokumen Ijazah
              <span className="ml-1 text-xs font-normal text-slate-400">
                (Opsional)
              </span>
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Format PDF, JPG, atau PNG. Maksimal 5 MB.
            </p>
          </div>

          {ijazahFile ? (
            /* FILE BARU */
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 rounded-xl border border-emerald-200 bg-white p-3 shadow-sm">
                <NewFileThumb file={ijazahFile} />

                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Siap diunggah
                  </span>

                  <p
                    className="mt-1.5 truncate text-sm font-semibold text-slate-800"
                    title={ijazahFile.name}
                  >
                    {ijazahFile.name}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {getKindLabel(
                      getFileKind(ijazahFile.type, ijazahFile.name)
                    )}{" "}
                    • {formatFileSize(ijazahFile.size)}
                  </p>

                  {hasExistingIjazah && (
                    <p className="mt-1 text-[11px] font-medium text-amber-600">
                      Akan menggantikan ijazah sebelumnya
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClearIjazahFile}
                  disabled={saving || uploadingIjazah}
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
                  disabled={saving || uploadingIjazah}
                  onChange={onIjazahFileChange}
                />
              </label>
            </div>
          ) : hasExistingIjazah ? (
            /* FILE LAMA */
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <FileThumb
                  kind={getFileKind(
                    form.ijazahTipeFile,
                    form.ijazahNamaAsli || form.ijazahPathFile
                  )}
                  src={form.ijazahPathFile}
                  size="lg"
                />

                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Tersimpan
                  </span>

                  <p
                    className="mt-1.5 truncate text-sm font-semibold text-slate-800"
                    title={form.ijazahNamaAsli || form.ijazahNamaFile || undefined}
                  >
                    {form.ijazahNamaAsli ||
                      form.ijazahNamaFile ||
                      "Ijazah tersimpan"}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {getKindLabel(
                      getFileKind(
                        form.ijazahTipeFile,
                        form.ijazahNamaAsli || form.ijazahPathFile
                      )
                    )}
                    {form.ijazahUkuranFile
                      ? ` • ${formatFileSize(form.ijazahUkuranFile)}`
                      : ""}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1">
                  {form.ijazahPathFile && (
                    <a
                      href={form.ijazahPathFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
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

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                <Upload className="h-4 w-4" />
                Ganti Ijazah

                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  disabled={saving || uploadingIjazah}
                  onChange={onIjazahFileChange}
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
                Pilih file ijazah
              </p>

              <p className="mt-1 text-xs text-slate-400">
                PDF, JPG, atau PNG • Maksimal 5 MB
              </p>

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
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
              Mengunggah ijazah...
            </div>
          )}
        </div>
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