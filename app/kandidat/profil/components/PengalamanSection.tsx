"use client";

import {
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";

import { Pengalaman } from "../types";
import { calculateDuration } from "../utils";

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
            {/* POSISI */}
            <h3 className="text-[15px] font-bold leading-6 text-slate-900 sm:text-base">
              {item.posisi}
            </h3>

            {/* PERUSAHAAN */}
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
          {/* TANGGAL */}
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />

            <span>
              {item.tahunMulai} -{" "}
              {item.tahunSelesai || "Sekarang"}
            </span>
          </span>

          {/* DURASI */}
          {duration && (
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
              {duration}
            </span>
          )}

          {/* LOKASI */}
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
  onClose,
  onSave,
}: {
  isEdit: boolean;
  form: Pengalaman;
  setForm: React.Dispatch<React.SetStateAction<Pengalaman>>;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal
      title={
        isEdit
          ? "Edit Pengalaman Kerja"
          : "Tambah Pengalaman Kerja"
      }
      description="Masukkan pengalaman kerja yang relevan."
      onClose={() => {
        if (!saving) onClose();
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
                tahunMulai: value,
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
                tahunSelesai: value,
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
  onOpenTambah: () => void;
  onOpenEdit: (item: Pengalaman) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <>
      <ModernSection
        icon={
          <BriefcaseBusiness className="h-5 w-5" />
        }
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
            icon={
              <BriefcaseBusiness className="h-6 w-6" />
            }
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
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </>
  );
}