"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  UserData,
  UploadedDokumen,
  Pendidikan,
  Pengalaman,
  Sertifikasi,
  initialPendidikan,
  initialPengalaman,
  initialSertifikasi,
} from "../types";

import { isYear4, isNilaiByJenjang } from "../utils";
import { PreviewTarget } from "../components/Documentpreviewmodal";
import { toast } from "../components/Toast";
import { confirmDialog } from "../components/ConfirmDialog";

type ProfileForm = {
  nama: string;
  email: string;
  nik: string;
  noTelepon: string;
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

const emptyProfileForm: ProfileForm = {
  nama: "",
  email: "",
  nik: "",
  noTelepon: "",
  alamat: "",
  rt: "",
  rw: "",
  provinsiId: "",
  provinsi: "",
  kabupatenId: "",
  kabupaten: "",
  kecamatanId: "",
  kecamatan: "",
  desaId: "",
  desa: "",
  kodePos: "",
};

// Mengubah data user dari server menjadi isi form profil
function mapUserToProfileForm(u: any): ProfileForm {
  return {
    nama: u.nama || "",
    email: u.email || "",
    nik: u.nik || "",
    noTelepon: u.noTelepon || "",
    alamat: u.alamat || "",
    rt:
      u.rt !== null && u.rt !== undefined
        ? String(u.rt).padStart(3, "0")
        : "",
    rw:
      u.rw !== null && u.rw !== undefined
        ? String(u.rw).padStart(3, "0")
        : "",
    provinsiId: u.provinsiId || "",
    provinsi: u.provinsi || "",
    kabupatenId: u.kabupatenId || "",
    kabupaten: u.kabupaten || "",
    kecamatanId: u.kecamatanId || "",
    kecamatan: u.kecamatan || "",
    desaId: u.desaId || "",
    desa: u.desa || "",
    kodePos: u.kodePos || "",
  };
}

export function useProfilKandidat() {
  const router = useRouter();

  // ============================================================
  // CORE
  // ============================================================

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // FOTO PROFIL
  // ============================================================

  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const fotoInputRef = useRef<HTMLInputElement | null>(null);

  // ============================================================
  // DOKUMEN PENDUKUNG
  // ============================================================

  const [uploadedDocs, setUploadedDocs] = useState<
    Record<string, UploadedDokumen>
  >({});

  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ============================================================
  // PREVIEW DOKUMEN
  // ============================================================

  const [previewDoc, setPreviewDoc] = useState<PreviewTarget | null>(null);

  // ============================================================
  // EDIT PROFIL
  // ============================================================

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] =
    useState<ProfileForm>(emptyProfileForm);
  const [savingProfile, setSavingProfile] = useState(false);

  // ============================================================
  // PENDIDIKAN
  // ============================================================

  const [pendidikan, setPendidikan] = useState<Pendidikan[]>([]);
  const [showPendidikanModal, setShowPendidikanModal] = useState(false);
  const [editingPendidikanId, setEditingPendidikanId] = useState<
    number | null
  >(null);
  const [pendidikanForm, setPendidikanForm] =
    useState<Pendidikan>(initialPendidikan);
  const [savingPendidikan, setSavingPendidikan] = useState(false);
  const [ijazahFile, setIjazahFile] = useState<File | null>(null);
  const [uploadingIjazah, setUploadingIjazah] = useState(false);

  // ============================================================
  // PENGALAMAN
  // ============================================================

  const [pengalaman, setPengalaman] = useState<Pengalaman[]>([]);
  const [showPengalamanModal, setShowPengalamanModal] = useState(false);
  const [editingPengalamanId, setEditingPengalamanId] = useState<
    number | null
  >(null);
  const [pengalamanForm, setPengalamanForm] =
    useState<Pengalaman>(initialPengalaman);
  const [savingPengalaman, setSavingPengalaman] = useState(false);
  const [paklaringFile, setPaklaringFile] = useState<File | null>(null);
  const [uploadingPaklaring, setUploadingPaklaring] = useState(false);

  // ============================================================
  // SERTIFIKASI
  // ============================================================

  const [sertifikasi, setSertifikasi] = useState<Sertifikasi[]>([]);
  const [showSertifikasiModal, setShowSertifikasiModal] = useState(false);
  const [editingSertifikasiId, setEditingSertifikasiId] = useState<
    number | null
  >(null);
  const [sertifikasiForm, setSertifikasiForm] =
    useState<Sertifikasi>(initialSertifikasi);
  const [savingSertifikasi, setSavingSertifikasi] = useState(false);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // GET DATA
  // ============================================================

  const getData = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/me", { cache: "no-store" });

      if (!response.ok) {
        console.error("ME ERROR:", response.status);
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!data.success || !data.user || data.user.role !== "KANDIDAT") {
        console.error("ME INVALID:", data);
        router.replace("/login");
        return;
      }

      setUser(data.user);
      setProfileForm(mapUserToProfileForm(data.user));

      if (data.user.dokumenProfil?.pathFile) {
        setFotoPreview(null);
      }

      await Promise.all([
        fetchDokumen(),
        fetchPendidikan(),
        fetchPengalaman(),
        fetchSertifikasi(),
      ]);
    } catch (error) {
      console.error("GET PROFILE ERROR:", error);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH DOKUMEN
  // ============================================================

  const fetchDokumen = async () => {
    try {
      const res = await fetch("/api/profil/dokumen", { cache: "no-store" });

      if (!res.ok) return;

      const data = await res.json();

      if (data.success && Array.isArray(data.dokumen)) {
        const map: Record<string, UploadedDokumen> = {};

        data.dokumen.forEach((document: UploadedDokumen) => {
          map[document.jenisDokumen.toLowerCase()] = document;
        });

        setUploadedDocs(map);
      }
    } catch (error) {
      console.error("FETCH DOKUMEN ERROR:", error);
    }
  };

  // ============================================================
  // FETCH PENDIDIKAN
  // ============================================================

  const fetchPendidikan = async () => {
    try {
      const res = await fetch("/api/pendidikan", { cache: "no-store" });

      if (!res.ok) return;

      const data = await res.json();

      if (data.success) {
        setPendidikan(data.pendidikan || data.data || []);
      }
    } catch (error) {
      console.error("FETCH PENDIDIKAN ERROR:", error);
    }
  };

  // ============================================================
  // FETCH PENGALAMAN
  // Database menyimpan tahun sebagai Int, form menggunakan String
  // ============================================================

  const fetchPengalaman = async () => {
    try {
      const res = await fetch("/api/pengalaman", { cache: "no-store" });

      if (!res.ok) return;

      const data = await res.json();

      if (data.success) {
        const list = data.pengalaman || data.data || [];

        setPengalaman(
          list.map((item: any) => ({
            ...item,
            tahunMulai: String(item.tahunMulai ?? ""),
            tahunSelesai:
              item.tahunSelesai !== null && item.tahunSelesai !== undefined
                ? String(item.tahunSelesai)
                : "",
          }))
        );
      }
    } catch (error) {
      console.error("FETCH PENGALAMAN ERROR:", error);
    }
  };

  // ============================================================
  // FETCH SERTIFIKASI
  // ============================================================

  const fetchSertifikasi = async () => {
    try {
      const res = await fetch("/api/sertifikasi", { cache: "no-store" });

      if (!res.ok) return;

      const data = await res.json();

      if (data.success) {
        setSertifikasi(data.sertifikasi || data.data || []);
      }
    } catch (error) {
      console.error("FETCH SERTIFIKASI ERROR:", error);
    }
  };

  // ============================================================
  // FOTO PROFIL
  // ============================================================

  const handleFotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Format foto harus JPG atau PNG.");
      return;
    }

    if (file.size === 0) {
      toast.error("File foto kosong.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2 MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);

    setFotoPreview(localPreview);
    setUploadingFoto(true);

    try {
      const formData = new FormData();
      formData.append("foto", file);

      const res = await fetch("/api/profil/foto", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });

      let data;

      try {
        data = await res.json();
      } catch {
        data = {
          success: false,
          message: "Response server tidak valid.",
        };
      }

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal mengunggah foto profil.");
        setFotoPreview(null);
        return;
      }

      if (data.fotoProfil) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                dokumenProfil: {
                  pathFile: data.fotoProfil,
                },
              }
            : prev
        );

        setFotoPreview(`${data.fotoProfil}?t=${Date.now()}`);
      }

      const profileRes = await fetch("/api/me", { cache: "no-store" });

      if (profileRes.ok) {
        const profileData = await profileRes.json();

        if (profileData.success && profileData.user) {
          setUser(profileData.user);
        }
      }

      setTimeout(() => {
        URL.revokeObjectURL(localPreview);
      }, 1000);
    } catch (error) {
      console.error("UPLOAD FOTO ERROR:", error);
      toast.error("Terjadi kesalahan saat mengunggah foto profil.");
      setFotoPreview(null);
    } finally {
      setUploadingFoto(false);
    }
  };

  // ============================================================
  // SAVE PROFILE
  // ============================================================

  const saveProfile = async () => {
    if (
      !profileForm.nama.trim() ||
      !profileForm.email.trim() ||
      !profileForm.nik.trim()
    ) {
      toast.error("Nama, email, dan NIK wajib diisi.");
      return;
    }

    setSavingProfile(true);

    try {
      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: profileForm.nama.trim(),
          email: profileForm.email.trim(),
          nik: profileForm.nik.trim(),
          noTelepon: profileForm.noTelepon.trim() || null,
          alamat: profileForm.alamat.trim(),
          rt: profileForm.rt ? Number(profileForm.rt) : null,
          rw: profileForm.rw ? Number(profileForm.rw) : null,
          provinsiId: profileForm.provinsiId || null,
          provinsi: profileForm.provinsi || null,
          kabupatenId: profileForm.kabupatenId || null,
          kabupaten: profileForm.kabupaten || null,
          kecamatanId: profileForm.kecamatanId || null,
          kecamatan: profileForm.kecamatan || null,
          desaId: profileForm.desaId || null,
          desa: profileForm.desa || null,
          kodePos: profileForm.kodePos.trim() || null,
        }),
      });

      let data;

      try {
        data = await res.json();
      } catch {
        toast.error("Response dari server tidak valid.");
        return;
      }

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal memperbarui profil.");
        return;
      }

      setUser((prev) => (prev ? { ...prev, ...data.user } : data.user));
      setProfileForm(mapUserToProfileForm(data.user));
      setEditingProfile(false);

      toast.success("Profil berhasil diperbarui!");

      // Refresh data profil dari server
      const profileRes = await fetch("/api/me", { cache: "no-store" });

      if (profileRes.ok) {
        const profileData = await profileRes.json();

        if (profileData.success && profileData.user) {
          setUser(profileData.user);
          setProfileForm(mapUserToProfileForm(profileData.user));
        }
      }
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);
      toast.error("Terjadi kesalahan saat memperbarui profil.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ============================================================
  // UPLOAD DOKUMEN
  // ============================================================

  const handleUpload = async (key: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5 MB.");
      return;
    }

    setUploading((prev) => ({ ...prev, [key]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jenisDokumen", key.toUpperCase());

      const res = await fetch("/api/profil/dokumen", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal mengunggah dokumen.");
        return;
      }

      setUploadedDocs((prev) => ({
        ...prev,
        [key]: data.dokumen,
      }));
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      toast.error("Terjadi kesalahan saat mengunggah dokumen.");
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // ============================================================
  // DELETE DOKUMEN
  // ============================================================

  const handleDeleteDocument = async (key: string) => {
    const ok = await confirmDialog({
      title: "Hapus Dokumen",
      message: "Apakah Anda yakin ingin menghapus dokumen ini?",
      detail: "Data yang dihapus tidak dapat dikembalikan.",
    });

    if (!ok) return;

    try {
      const res = await fetch("/api/profil/dokumen/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jenisDokumen: key.toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal menghapus dokumen.");
        return;
      }

      setUploadedDocs((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      toast.success("Dokumen berhasil dihapus.");
    } catch (error) {
      console.error("DELETE DOCUMENT ERROR:", error);
      toast.error("Terjadi kesalahan saat menghapus dokumen.");
    }
  };

  // ============================================================
  // PREVIEW DOKUMEN
  // ============================================================

  const openPreview = (doc: PreviewTarget) => {
    setPreviewDoc(doc);
  };

  const closePreview = () => {
    setPreviewDoc(null);
  };

  // ============================================================
  // TAMBAH PENDIDIKAN
  // ============================================================

  const openTambahPendidikan = () => {
    setEditingPendidikanId(null);
    setPendidikanForm({ ...initialPendidikan });
    setIjazahFile(null);
    setShowPendidikanModal(true);
  };

  // ============================================================
  // EDIT PENDIDIKAN
  // ============================================================

  const openEditPendidikan = (item: Pendidikan) => {
    setEditingPendidikanId(item.id);
    setPendidikanForm({ ...item });
    setIjazahFile(null);
    setShowPendidikanModal(true);
  };

  // ============================================================
  // SAVE PENDIDIKAN
  // Validasi tahun 4 digit angka dan nilai sesuai jenjang
  // ============================================================

  const savePendidikan = async () => {
    if (
      !pendidikanForm.jenjang ||
      !pendidikanForm.institusi.trim() ||
      !pendidikanForm.jurusan.trim()
    ) {
      toast.error("Lengkapi seluruh data pendidikan terlebih dahulu.");
      return;
    }

    const nilai = String(pendidikanForm.nilai ?? "").trim();

    if (nilai !== "" && !isNilaiByJenjang(nilai, pendidikanForm.jenjang)) {
      toast.error(
        pendidikanForm.jenjang === "SMA / SMK"
          ? "Nilai rata-rata harus berupa angka antara 0.01 dan 100 (contoh: 85.50)."
          : "IPK harus berupa angka antara 0.01 dan 4.00 (contoh: 3.75)."
      );
      return;
    }

    const mulai = String(pendidikanForm.tahunMulai ?? "");
    const selesai = String(pendidikanForm.tahunSelesai ?? "");

    if (!isYear4(mulai)) {
      toast.error("Tahun mulai harus 4 digit angka.");
      return;
    }

    if (!isYear4(selesai)) {
      toast.error("Tahun selesai harus 4 digit angka.");
      return;
    }

    if (Number(selesai) < Number(mulai)) {
      toast.error("Tahun selesai tidak boleh lebih kecil dari tahun mulai.");
      return;
    }

    setSavingPendidikan(true);

    try {
      const isEdit = editingPendidikanId !== null;

      const url = isEdit
        ? `/api/pendidikan/${editingPendidikanId}`
        : "/api/pendidikan";

      const method = isEdit ? "PUT" : "POST";

      const body = {
        jenjang: pendidikanForm.jenjang,
        institusi: pendidikanForm.institusi.trim(),
        jurusan: pendidikanForm.jurusan.trim(),
        tahunMulai: mulai,
        tahunSelesai: selesai,
        nilai: pendidikanForm.nilai || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal menyimpan pendidikan.");
        return;
      }

      const savedId: number | undefined =
        data.pendidikan?.id ??
        data.data?.id ??
        editingPendidikanId ??
        undefined;

      // Upload ijazah (jika ada file baru)
      let ijazahBerhasil = true;

      if (ijazahFile && savedId) {
        ijazahBerhasil = await uploadIjazah(savedId, ijazahFile);
      }

      await fetchPendidikan();

      setShowPendidikanModal(false);
      setEditingPendidikanId(null);
      setPendidikanForm({ ...initialPendidikan });
      setIjazahFile(null);

      // Alert sukses
      if (ijazahBerhasil) {
        toast.success(
          isEdit
            ? "Pendidikan berhasil diperbarui!"
            : "Pendidikan berhasil ditambahkan!"
        );
      } else {
        toast.warning(
          isEdit
            ? "Pendidikan berhasil diperbarui, tetapi ijazah gagal diunggah."
            : "Pendidikan berhasil ditambahkan, tetapi ijazah gagal diunggah."
        );
      }
    } catch (error) {
      console.error("SAVE PENDIDIKAN ERROR:", error);
      toast.error("Terjadi kesalahan saat menyimpan pendidikan.");
    } finally {
      setSavingPendidikan(false);
    }
  };

  // ============================================================
  // PILIH FILE IJAZAH
  // ============================================================

  const handleIjazahFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Format ijazah harus PDF, JPG, atau PNG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran ijazah maksimal 5 MB.");
      return;
    }

    setIjazahFile(file);
  };

  // ============================================================
  // CLEAR FILE IJAZAH
  // ============================================================

  const clearIjazahFile = () => {
    setIjazahFile(null);
  };

  // ============================================================
  // UPLOAD IJAZAH
  // ============================================================

  const uploadIjazah = async (pendidikanId: number, file: File) => {
    setUploadingIjazah(true);

    try {
      const formData = new FormData();
      formData.append("ijazah", file);

      const res = await fetch(`/api/pendidikan/${pendidikanId}/ijazah`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal mengunggah ijazah.");
        return false;
      }

      await fetchPendidikan();

      return true;
    } catch (error) {
      console.error("UPLOAD IJAZAH ERROR:", error);
      toast.error("Terjadi kesalahan saat mengunggah ijazah.");
      return false;
    } finally {
      setUploadingIjazah(false);
    }
  };

  // ============================================================
  // DELETE IJAZAH
  // ============================================================

  const deleteIjazah = async (pendidikanId: number) => {
    const ok = await confirmDialog({
      title: "Hapus Ijazah",
      message: "Apakah Anda yakin ingin menghapus ijazah ini?",
      detail: "Data yang dihapus tidak dapat dikembalikan.",
    });

    if (!ok) return;

    try {
      const res = await fetch(`/api/pendidikan/${pendidikanId}/ijazah`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal menghapus ijazah.");
        return;
      }

      const kosong = {
        ijazahNamaFile: null,
        ijazahNamaAsli: null,
        ijazahPathFile: null,
        ijazahTipeFile: null,
        ijazahUkuranFile: null,
      };

      setPendidikan((prev) =>
        prev.map((item) =>
          item.id === pendidikanId ? { ...item, ...kosong } : item
        )
      );

      if (editingPendidikanId === pendidikanId) {
        setPendidikanForm((prev) => ({ ...prev, ...kosong }));
      }

      setIjazahFile(null);

      toast.success("Ijazah berhasil dihapus.");
    } catch (error) {
      console.error("DELETE IJAZAH ERROR:", error);
      toast.error("Terjadi kesalahan saat menghapus ijazah.");
    }
  };

  // ============================================================
  // DELETE PENDIDIKAN
  // ============================================================

  const deletePendidikan = async (id: number) => {
    const ok = await confirmDialog({
      title: "Hapus Pendidikan",
      message: "Apakah Anda yakin ingin menghapus pendidikan ini?",
      detail: "Data yang dihapus tidak dapat dikembalikan.",
    });

    if (!ok) return;

    try {
      const res = await fetch(`/api/pendidikan/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal menghapus pendidikan.");
        return;
      }

      setPendidikan((prev) => prev.filter((item) => item.id !== id));

      toast.success("Pendidikan berhasil dihapus.");
    } catch (error) {
      console.error("DELETE PENDIDIKAN ERROR:", error);
      toast.error("Terjadi kesalahan saat menghapus pendidikan.");
    }
  };

  // ============================================================
  // TAMBAH PENGALAMAN
  // ============================================================

  const openTambahPengalaman = () => {
    setEditingPengalamanId(null);
    setPengalamanForm({ ...initialPengalaman });
    setPaklaringFile(null);
    setShowPengalamanModal(true);
  };

  // ============================================================
  // EDIT PENGALAMAN
  // ============================================================

  const openEditPengalaman = (item: Pengalaman) => {
    setEditingPengalamanId(item.id);
    setPengalamanForm({ ...item });
    setPaklaringFile(null);
    setShowPengalamanModal(true);
  };

  // ============================================================
  // PAKLARING
  // ============================================================

  const handlePaklaringFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Format paklaring harus PDF, JPG, atau PNG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran paklaring maksimal 5 MB.");
      return;
    }

    setPaklaringFile(file);
  };

  const clearPaklaringFile = () => {
    setPaklaringFile(null);
  };

  // ============================================================
  // UPLOAD PAKLARING
  // ============================================================

  const uploadPaklaring = async (pengalamanId: number, file: File) => {
    setUploadingPaklaring(true);

    try {
      const formData = new FormData();
      formData.append("paklaring", file);

      const res = await fetch(`/api/pengalaman/${pengalamanId}/paklaring`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal mengunggah paklaring.");
        return false;
      }

      return true;
    } catch (error) {
      console.error("UPLOAD PAKLARING ERROR:", error);
      toast.error("Terjadi kesalahan saat mengunggah paklaring.");
      return false;
    } finally {
      setUploadingPaklaring(false);
    }
  };

  // ============================================================
  // DELETE PAKLARING
  // ============================================================

  const deletePaklaring = async (pengalamanId: number) => {
    const ok = await confirmDialog({
      title: "Hapus Paklaring",
      message: "Apakah Anda yakin ingin menghapus paklaring ini?",
      detail: "Data yang dihapus tidak dapat dikembalikan.",
    });

    if (!ok) return;

    try {
      const res = await fetch(`/api/pengalaman/${pengalamanId}/paklaring`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal menghapus paklaring.");
        return;
      }

      const kosong = {
        paklaringNamaFile: null,
        paklaringNamaAsli: null,
        paklaringPathFile: null,
        paklaringTipeFile: null,
        paklaringUkuranFile: null,
      };

      setPengalaman((prev) =>
        prev.map((item) =>
          item.id === pengalamanId ? { ...item, ...kosong } : item
        )
      );

      if (editingPengalamanId === pengalamanId) {
        setPengalamanForm((prev) => ({ ...prev, ...kosong }));
      }

      setPaklaringFile(null);

      toast.success("Paklaring berhasil dihapus.");
    } catch (error) {
      console.error("DELETE PAKLARING ERROR:", error);
      toast.error("Terjadi kesalahan saat menghapus paklaring.");
    }
  };

  // ============================================================
  // SAVE PENGALAMAN
  // Validasi 4 digit angka, dikirim sebagai Int
  // ============================================================

  const savePengalaman = async () => {
    if (!pengalamanForm.posisi.trim() || !pengalamanForm.perusahaan.trim()) {
      toast.error("Posisi dan perusahaan wajib diisi.");
      return;
    }

    const mulai = String(pengalamanForm.tahunMulai ?? "");
    const selesai = String(pengalamanForm.tahunSelesai ?? "");

    if (!isYear4(mulai)) {
      toast.error("Tahun mulai harus 4 digit angka.");
      return;
    }

    if (!isYear4(selesai)) {
      toast.error("Tahun selesai harus 4 digit angka.");
      return;
    }

    if (Number(selesai) < Number(mulai)) {
      toast.error("Tahun selesai tidak boleh lebih kecil dari tahun mulai.");
      return;
    }

    setSavingPengalaman(true);

    try {
      const isEdit = editingPengalamanId !== null;

      const url = "/api/pengalaman";
      const method = isEdit ? "PUT" : "POST";

      const body = {
        ...(isEdit && { id: editingPengalamanId }),
        posisi: pengalamanForm.posisi.trim(),
        perusahaan: pengalamanForm.perusahaan.trim(),
        lokasi: pengalamanForm.lokasi || null,
        tahunMulai: Number(mulai),
        tahunSelesai: Number(selesai),
        deskripsi: pengalamanForm.deskripsi || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data;

      try {
        data = await res.json();
      } catch {
        console.error("SAVE PENGALAMAN: response bukan JSON");
        toast.error("Response dari server tidak valid.");
        return;
      }

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal menyimpan pengalaman.");
        return;
      }

      const savedId: number | undefined =
        data.pengalaman?.id ??
        data.data?.id ??
        editingPengalamanId ??
        undefined;

      // Upload paklaring (jika ada file baru)
      let paklaringBerhasil = true;

      if (paklaringFile && savedId) {
        paklaringBerhasil = await uploadPaklaring(savedId, paklaringFile);
      }

      await fetchPengalaman();

      setShowPengalamanModal(false);
      setEditingPengalamanId(null);
      setPengalamanForm({ ...initialPengalaman });
      setPaklaringFile(null);

      // Alert sukses
      if (paklaringBerhasil) {
        toast.success(
          isEdit
            ? "Pengalaman kerja berhasil diperbarui!"
            : "Pengalaman kerja berhasil ditambahkan!"
        );
      } else {
        toast.warning(
          isEdit
            ? "Pengalaman kerja berhasil diperbarui, tetapi paklaring gagal diunggah."
            : "Pengalaman kerja berhasil ditambahkan, tetapi paklaring gagal diunggah."
        );
      }
    } catch (error) {
      console.error("SAVE PENGALAMAN ERROR:", error);
      toast.error("Terjadi kesalahan saat menyimpan pengalaman.");
    } finally {
      setSavingPengalaman(false);
    }
  };

  // ============================================================
  // DELETE PENGALAMAN
  // ============================================================

  const deletePengalaman = async (id: number) => {
    const ok = await confirmDialog({
      title: "Hapus Pengalaman",
      message: "Apakah Anda yakin ingin menghapus pengalaman ini?",
      detail: "Data yang dihapus tidak dapat dikembalikan.",
    });

    if (!ok) return;

    try {
      const res = await fetch("/api/pengalaman", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      let data;

      try {
        data = await res.json();
      } catch {
        console.error("DELETE PENGALAMAN: response bukan JSON");
        toast.error("Response dari server tidak valid.");
        return;
      }

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal menghapus pengalaman.");
        return;
      }

      setPengalaman((prev) => prev.filter((item) => item.id !== id));

      toast.success("Pengalaman kerja berhasil dihapus.");
    } catch (error) {
      console.error("DELETE PENGALAMAN ERROR:", error);
      toast.error("Terjadi kesalahan saat menghapus pengalaman.");
    }
  };

  // ============================================================
  // TAMBAH SERTIFIKASI
  // ============================================================

  const openTambahSertifikasi = () => {
    setEditingSertifikasiId(null);
    setSertifikasiForm({ ...initialSertifikasi });
    setShowSertifikasiModal(true);
  };

  // ============================================================
  // EDIT SERTIFIKASI
  // ============================================================

  const openEditSertifikasi = (item: Sertifikasi) => {
    setEditingSertifikasiId(item.id);

    setSertifikasiForm({
      ...item,
      // File baru tidak ikut dari data server
      file: null,
    });

    setShowSertifikasiModal(true);
  };

  // ============================================================
  // SAVE SERTIFIKASI
  // Menggunakan FormData karena mendukung upload file
  // ============================================================

  const saveSertifikasi = async () => {
    if (!sertifikasiForm.nama.trim() || !sertifikasiForm.penerbit.trim()) {
      toast.error("Nama sertifikasi dan penerbit wajib diisi.");
      return;
    }

    setSavingSertifikasi(true);

    try {
      const isEdit = editingSertifikasiId !== null;

      const formData = new FormData();

      formData.append("nama", sertifikasiForm.nama.trim());
      formData.append("penerbit", sertifikasiForm.penerbit.trim());
      formData.append("nomor", sertifikasiForm.nomor?.trim() || "");
      formData.append("tanggalTerbit", sertifikasiForm.tanggalTerbit || "");
      formData.append(
        "tanggalKadaluarsa",
        sertifikasiForm.tanggalKadaluarsa || ""
      );

      if (isEdit && editingSertifikasiId !== null) {
        formData.append("id", String(editingSertifikasiId));
      }

      if (sertifikasiForm.file instanceof File) {
        formData.append("file", sertifikasiForm.file);
      }

      // JANGAN menambahkan header Content-Type: multipart/form-data.
      // Browser akan otomatis menentukan Content-Type beserta boundary.
      const res = await fetch("/api/sertifikasi", {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      });

      let data;

      try {
        data = await res.json();
      } catch {
        console.error("SAVE SERTIFIKASI: response bukan JSON", {
          status: res.status,
          statusText: res.statusText,
        });

        toast.error("Response dari server tidak valid.");
        return;
      }

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal menyimpan sertifikasi.");
        return;
      }

      await fetchSertifikasi();

      setShowSertifikasiModal(false);
      setEditingSertifikasiId(null);
      setSertifikasiForm({ ...initialSertifikasi });

      // Alert sukses
      toast.success(
        isEdit
          ? "Sertifikasi berhasil diperbarui!"
          : "Sertifikasi berhasil ditambahkan!"
      );
    } catch (error) {
      console.error("SAVE SERTIFIKASI ERROR:", error);
      toast.error("Terjadi kesalahan saat menyimpan sertifikasi.");
    } finally {
      setSavingSertifikasi(false);
    }
  };

  // ============================================================
  // DELETE SERTIFIKASI
  // ============================================================

  const deleteSertifikasi = async (id: number) => {
    const ok = await confirmDialog({
      title: "Hapus Sertifikasi",
      message: "Apakah Anda yakin ingin menghapus sertifikasi ini?",
      detail: "Data yang dihapus tidak dapat dikembalikan.",
    });

    if (!ok) return;

    try {
      const res = await fetch("/api/sertifikasi", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      let data;

      try {
        data = await res.json();
      } catch {
        console.error("DELETE SERTIFIKASI: response bukan JSON");
        toast.error("Response dari server tidak valid.");
        return;
      }

      if (!res.ok || !data.success) {
        toast.error(data.message || "Gagal menghapus sertifikasi.");
        return;
      }

      setSertifikasi((prev) => prev.filter((item) => item.id !== id));

      toast.success("Sertifikasi berhasil dihapus.");
    } catch (error) {
      console.error("DELETE SERTIFIKASI ERROR:", error);
      toast.error("Terjadi kesalahan saat menghapus sertifikasi.");
    }
  };

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // CORE
    user,
    loading,

    // FOTO
    uploadingFoto,
    fotoPreview,
    fotoInputRef,
    handleFotoChange,

    // DOKUMEN
    uploadedDocs,
    uploading,
    fileInputRefs,
    handleUpload,
    handleDeleteDocument,

    // PREVIEW
    previewDoc,
    openPreview,
    closePreview,

    // EDIT PROFIL
    editingProfile,
    setEditingProfile,
    profileForm,
    setProfileForm,
    savingProfile,
    saveProfile,

    // PENDIDIKAN
    pendidikan,
    showPendidikanModal,
    setShowPendidikanModal,
    editingPendidikanId,
    pendidikanForm,
    setPendidikanForm,
    savingPendidikan,
    openTambahPendidikan,
    openEditPendidikan,
    savePendidikan,
    deletePendidikan,

    // IJAZAH
    ijazahFile,
    uploadingIjazah,
    handleIjazahFileChange,
    clearIjazahFile,
    deleteIjazah,

    // PENGALAMAN
    pengalaman,
    showPengalamanModal,
    setShowPengalamanModal,
    editingPengalamanId,
    pengalamanForm,
    setPengalamanForm,
    savingPengalaman,
    openTambahPengalaman,
    openEditPengalaman,
    savePengalaman,
    deletePengalaman,

    // PAKLARING
    paklaringFile,
    uploadingPaklaring,
    handlePaklaringFileChange,
    clearPaklaringFile,
    deletePaklaring,

    // SERTIFIKASI
    sertifikasi,
    showSertifikasiModal,
    setShowSertifikasiModal,
    editingSertifikasiId,
    sertifikasiForm,
    setSertifikasiForm,
    savingSertifikasi,
    openTambahSertifikasi,
    openEditSertifikasi,
    saveSertifikasi,
    deleteSertifikasi,
  };
}