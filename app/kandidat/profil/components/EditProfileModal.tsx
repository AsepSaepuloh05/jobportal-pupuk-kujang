"use client";

import { Modal, ModalFooter, ModalInput } from "./ModalPrimitives";

interface ProfileFormValue {
  nama: string;
  email: string;
  nik: string;
  alamat: string;
}

export function EditProfileModal({
  form,
  setForm,
  saving,
  onClose,
  onSave,
}: {
  form: ProfileFormValue;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormValue>>;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal
      title="Edit Profil"
      description="Perbarui informasi pribadi Anda."
      onClose={onClose}
    >
      <div className="space-y-5">
        <ModalInput
          label="Nama Lengkap"
          value={form.nama}
          onChange={(value) => setForm((prev) => ({ ...prev, nama: value }))}
        />

        <ModalInput
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
        />

        <ModalInput
          label="NIK"
          value={form.nik}
          maxLength={16}
          onChange={(value) => setForm((prev) => ({ ...prev, nik: value }))}
        />

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Domisili / Alamat
          </label>

          <textarea
            value={form.alamat}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, alamat: e.target.value }))
            }
            rows={3}
            placeholder="Contoh: Jl. Merdeka No. 10, Jakarta Selatan"
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      <ModalFooter onCancel={onClose} onSave={onSave} loading={saving} />
    </Modal>
  );
}