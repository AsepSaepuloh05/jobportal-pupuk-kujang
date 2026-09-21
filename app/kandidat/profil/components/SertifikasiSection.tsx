"use client";

import {
  Award,
  CalendarDays,
  Pencil,
  Trash2,
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
            {/* NAMA */}
            <h3 className="text-[15px] font-bold leading-6 text-slate-900 sm:text-base">
              {item.nama}
            </h3>

            {/* PENERBIT */}
            <p className="mt-0.5 text-sm font-medium text-slate-600">
              {item.penerbit}
            </p>

            {/* NOMOR */}
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
  setForm: React.Dispatch<React.SetStateAction<Sertifikasi>>;
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
        if (!saving) onClose();
      }}
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
  setForm: React.Dispatch<React.SetStateAction<Sertifikasi>>;
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
                onDelete={() => onDelete(item.id)}
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
