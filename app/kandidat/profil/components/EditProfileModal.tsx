"use client";

import { useEffect, useState } from "react";
import {
Modal,
ModalFooter,
ModalInput,
ModalSelect,
} from "./ModalPrimitives";

type Wilayah = {
id: string;
name: string;
};

export type ProfileForm = {
nama: string;
email: string;
noTelepon: string;
nik: string;
alamat: string;

rt: string;
rw: string;

provinsiId: string;
provinsi: string;

kabupatenId: string;
kabupaten: string;

kecamatanId: string;
kecamatan: string;

desaId: string;
desa: string;

kodePos: string;
};

type EditProfileModalProps = {
form: ProfileForm;
setForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
saving: boolean;
onClose: () => void;
onSave: () => void | Promise<void>;
};

const normalizeWilayahResponse = (response: unknown): Wilayah[] => {
if (Array.isArray(response)) {
return response as Wilayah[];
}

if (
response &&
typeof response === "object" &&
"data" in response &&
Array.isArray((response as { data?: unknown }).data)
) {
return (response as { data: Wilayah[] }).data;
}

return [];
};

export function EditProfileModal({
form,
setForm,
saving,
onClose,
onSave,
}: EditProfileModalProps) {
const [provinces, setProvinces] = useState<Wilayah[]>([]);
const [regencies, setRegencies] = useState<Wilayah[]>([]);
const [districts, setDistricts] = useState<Wilayah[]>([]);
const [villages, setVillages] = useState<Wilayah[]>([]);

const [loadingProvinces, setLoadingProvinces] = useState(false);
const [loadingRegencies, setLoadingRegencies] = useState(false);
const [loadingDistricts, setLoadingDistricts] = useState(false);
const [loadingVillages, setLoadingVillages] = useState(false);

// =========================================================
// LOAD PROVINSI
// =========================================================

useEffect(() => {
let cancelled = false;

const loadProvinces = async () => {
  try {
    setLoadingProvinces(true);

    const res = await fetch(
      "https://www.emsifa.com/api-wilayah-indonesia/v2/provinces.json"
    );

    if (!res.ok) {
      throw new Error("Gagal mengambil data provinsi.");
    }

    const data = await res.json();

    if (!cancelled) {
      setProvinces(normalizeWilayahResponse(data));
    }
  } catch (error) {
    console.error("LOAD PROVINCES ERROR:", error);

    if (!cancelled) {
      setProvinces([]);
    }
  } finally {
    if (!cancelled) {
      setLoadingProvinces(false);
    }
  }
};

loadProvinces();

return () => {
  cancelled = true;
};

}, []);

// =========================================================
// LOAD KABUPATEN / KOTA
// =========================================================

useEffect(() => {
let cancelled = false;

if (!form.provinsiId) {
  setRegencies([]);
  return;
}

const loadRegencies = async () => {
  try {
    setLoadingRegencies(true);

    const res = await fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/v2/regencies/${form.provinsiId}.json`
    );

    if (!res.ok) {
      throw new Error("Gagal mengambil data kabupaten/kota.");
    }

    const data = await res.json();

    if (!cancelled) {
      setRegencies(normalizeWilayahResponse(data));
    }
  } catch (error) {
    console.error("LOAD REGENCIES ERROR:", error);

    if (!cancelled) {
      setRegencies([]);
    }
  } finally {
    if (!cancelled) {
      setLoadingRegencies(false);
    }
  }
};

loadRegencies();

return () => {
  cancelled = true;
};


}, [form.provinsiId]);

// =========================================================
// LOAD KECAMATAN
// =========================================================

useEffect(() => {
let cancelled = false;

if (!form.kabupatenId) {
  setDistricts([]);
  return;
}

const loadDistricts = async () => {
  try {
    setLoadingDistricts(true);

    const res = await fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/v2/districts/${form.kabupatenId}.json`
    );

    if (!res.ok) {
      throw new Error("Gagal mengambil data kecamatan.");
    }

    const data = await res.json();

    if (!cancelled) {
      setDistricts(normalizeWilayahResponse(data));
    }
  } catch (error) {
    console.error("LOAD DISTRICTS ERROR:", error);

    if (!cancelled) {
      setDistricts([]);
    }
  } finally {
    if (!cancelled) {
      setLoadingDistricts(false);
    }
  }
};

loadDistricts();

return () => {
  cancelled = true;
};

}, [form.kabupatenId]);

// =========================================================
// LOAD DESA / KELURAHAN
// =========================================================

useEffect(() => {
let cancelled = false;

if (!form.kecamatanId) {
  setVillages([]);
  return;
}

const loadVillages = async () => {
  try {
    setLoadingVillages(true);

    const res = await fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/v2/villages/${form.kecamatanId}.json`
    );

    if (!res.ok) {
      throw new Error("Gagal mengambil data desa/kelurahan.");
    }

    const data = await res.json();

    if (!cancelled) {
      setVillages(normalizeWilayahResponse(data));
    }
  } catch (error) {
    console.error("LOAD VILLAGES ERROR:", error);

    if (!cancelled) {
      setVillages([]);
    }
  } finally {
    if (!cancelled) {
      setLoadingVillages(false);
    }
  }
};

loadVillages();

return () => {
  cancelled = true;
};

}, [form.kecamatanId]);

// =========================================================
// SINKRONISASI NAMA WILAYAH DARI ID
// =========================================================

useEffect(() => {
if (!form.provinsiId || provinces.length === 0) {
return;
}

const selected = provinces.find(
  (item) => item.id === form.provinsiId
);

if (selected && selected.name !== form.provinsi) {
  setForm((prev) => ({
    ...prev,
    provinsi: selected.name,
  }));
}

}, [provinces, form.provinsiId, form.provinsi, setForm]);

useEffect(() => {
if (!form.kabupatenId || regencies.length === 0) {
return;
}

const selected = regencies.find(
  (item) => item.id === form.kabupatenId
);

if (selected && selected.name !== form.kabupaten) {
  setForm((prev) => ({
    ...prev,
    kabupaten: selected.name,
  }));
}

}, [regencies, form.kabupatenId, form.kabupaten, setForm]);

useEffect(() => {
if (!form.kecamatanId || districts.length === 0) {
return;
}

const selected = districts.find(
  (item) => item.id === form.kecamatanId
);

if (selected && selected.name !== form.kecamatan) {
  setForm((prev) => ({
    ...prev,
    kecamatan: selected.name,
  }));
}

}, [districts, form.kecamatanId, form.kecamatan, setForm]);

useEffect(() => {
if (!form.desaId || villages.length === 0) {
return;
}

const selected = villages.find(
  (item) => item.id === form.desaId
);

if (selected && selected.name !== form.desa) {
  setForm((prev) => ({
    ...prev,
    desa: selected.name,
  }));
}

}, [villages, form.desaId, form.desa, setForm]);

// =========================================================
// HANDLE PROVINSI
// =========================================================

const handleProvinsiChange = (value: string) => {
const selected = provinces.find(
(item) => item.id === value
);

setForm((prev) => ({
  ...prev,

  provinsiId: value,
  provinsi: selected?.name || "",

  kabupatenId: "",
  kabupaten: "",

  kecamatanId: "",
  kecamatan: "",

  desaId: "",
  desa: "",
}));

};

// =========================================================
// HANDLE KABUPATEN / KOTA
// =========================================================

const handleKabupatenChange = (value: string) => {
const selected = regencies.find(
(item) => item.id === value
);

setForm((prev) => ({
  ...prev,

  kabupatenId: value,
  kabupaten: selected?.name || "",

  kecamatanId: "",
  kecamatan: "",

  desaId: "",
  desa: "",
}));

};

// =========================================================
// HANDLE KECAMATAN
// =========================================================

const handleKecamatanChange = (value: string) => {
const selected = districts.find(
(item) => item.id === value
);

setForm((prev) => ({
  ...prev,

  kecamatanId: value,
  kecamatan: selected?.name || "",

  desaId: "",
  desa: "",
}));

};

// =========================================================
// HANDLE DESA / KELURAHAN
// =========================================================

const handleDesaChange = (value: string) => {
const selected = villages.find(
(item) => item.id === value
);

setForm((prev) => ({
  ...prev,

  desaId: value,
  desa: selected?.name || "",
}));

};

// =========================================================
// HANDLE KODE POS
// =========================================================

const handleKodePosChange = (value: string) => {
setForm((prev) => ({
...prev,
kodePos: value.replace(/\D/g, "").slice(0, 5),
}));
};

return (
<Modal
title="Edit Profil"
description="Perbarui informasi pribadi dan alamat Anda."
onClose={onClose}
footer={ <ModalFooter
       onCancel={onClose}
       onSave={onSave}
       loading={saving}
     />
}
> <div className="space-y-6">
{/* =====================================================
DATA PRIBADI
===================================================== */}

```
    <div>
      <h3 className="mb-3 text-sm font-bold text-slate-900">
        Data Pribadi
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ModalInput
          label="Nama Lengkap"
          value={form.nama}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              nama: value,
            }))
          }
          placeholder="Masukkan nama lengkap"
        />

        <ModalInput
          label="NIK"
          value={form.nik}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              nik: value.replace(/\D/g, "").slice(0, 16),
            }))
          }
          placeholder="16 digit NIK"
        />

        <ModalInput
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              email: value,
            }))
          }
          placeholder="nama@email.com"
        />

        <ModalInput
          label="Nomor Telepon"
          type="tel"
          value={form.noTelepon}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              noTelepon: value.replace(/\D/g, ""),
            }))
          }
          placeholder="08xxxxxxxxxx"
        />
      </div>
    </div>

    {/* =====================================================
        ALAMAT
    ===================================================== */}

    <div>
      <h3 className="mb-3 text-sm font-bold text-slate-900">
        Alamat
      </h3>

      <div className="space-y-4">
        {/* ALAMAT LENGKAP */}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Alamat Lengkap
          </label>

          <textarea
            value={form.alamat}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                alamat: e.target.value,
              }))
            }
            placeholder="Masukkan alamat lengkap"
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ModalInput
            label="RT"
            value={form.rt}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                rt: value.replace(/\D/g, "").slice(0, 3),
              }))
            }
            placeholder="038"
          />

          <ModalInput
            label="RW"
            value={form.rw}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                rw: value.replace(/\D/g, "").slice(0, 3),
              }))
            }
            placeholder="011"
          />
        </div>

        {/* PROVINSI */}

        <ModalSelect
          label="Provinsi"
          value={form.provinsiId}
          onChange={handleProvinsiChange}
          options={[
            {
              value: "",
              label: loadingProvinces
                ? "Memuat provinsi..."
                : "Pilih provinsi",
            },
            ...provinces.map((item) => ({
              value: item.id,
              label: item.name,
            })),
          ]}
          disabled={loadingProvinces}
        />

        {/* KABUPATEN / KOTA */}

        <ModalSelect
          label="Kabupaten / Kota"
          value={form.kabupatenId}
          onChange={handleKabupatenChange}
          options={[
            {
              value: "",
              label: loadingRegencies
                ? "Memuat kabupaten/kota..."
                : "Pilih kabupaten/kota",
            },
            ...regencies.map((item) => ({
              value: item.id,
              label: item.name,
            })),
          ]}
          disabled={
            !form.provinsiId ||
            loadingRegencies
          }
        />

        {/* KECAMATAN */}

        <ModalSelect
          label="Kecamatan"
          value={form.kecamatanId}
          onChange={handleKecamatanChange}
          options={[
            {
              value: "",
              label: loadingDistricts
                ? "Memuat kecamatan..."
                : "Pilih kecamatan",
            },
            ...districts.map((item) => ({
              value: item.id,
              label: item.name,
            })),
          ]}
          disabled={
            !form.kabupatenId ||
            loadingDistricts
          }
        />

        {/* DESA / KELURAHAN */}

        <ModalSelect
          label="Desa / Kelurahan"
          value={form.desaId}
          onChange={handleDesaChange}
          options={[
            {
              value: "",
              label: loadingVillages
                ? "Memuat desa/kelurahan..."
                : "Pilih desa/kelurahan",
            },
            ...villages.map((item) => ({
              value: item.id,
              label: item.name,
            })),
          ]}
          disabled={
            !form.kecamatanId ||
            loadingVillages
          }
        />

        {/* KODE POS */}

        <ModalInput
          label="Kode Pos"
          value={form.kodePos}
          onChange={handleKodePosChange}
          placeholder="Contoh: 41373"
        />
      </div>
    </div>
  </div>
</Modal>

);
}
