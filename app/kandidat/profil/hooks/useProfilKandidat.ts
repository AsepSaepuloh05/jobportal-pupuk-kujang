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
import { PreviewTarget } from "../components/Documentpreviewmodal";

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

  const [profileForm, setProfileForm] = useState({
    nama: "",
    email: "",
    nik: "",
    alamat: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);

  // ============================================================
  // PENDIDIKAN
  // ============================================================

  const [pendidikan, setPendidikan] = useState<Pendidikan[]>([]);

  const [showPendidikanModal, setShowPendidikanModal] =
    useState(false);

  const [editingPendidikanId, setEditingPendidikanId] =
    useState<number | null>(null);

  const [pendidikanForm, setPendidikanForm] =
    useState<Pendidikan>(initialPendidikan);

  const [savingPendidikan, setSavingPendidikan] = useState(false);

  // File ijazah yang baru dipilih
  const [ijazahFile, setIjazahFile] = useState<File | null>(null);

  const [uploadingIjazah, setUploadingIjazah] = useState(false);

  // ============================================================
  // PENGALAMAN
  // ============================================================

  const [pengalaman, setPengalaman] = useState<Pengalaman[]>([]);

  const [showPengalamanModal, setShowPengalamanModal] =
    useState(false);

  const [editingPengalamanId, setEditingPengalamanId] =
    useState<number | null>(null);

  const [pengalamanForm, setPengalamanForm] =
    useState<Pengalaman>(initialPengalaman);

  const [savingPengalaman, setSavingPengalaman] = useState(false);

  // ============================================================
  // SERTIFIKASI
  // ============================================================

  const [sertifikasi, setSertifikasi] = useState<Sertifikasi[]>([]);

  const [showSertifikasiModal, setShowSertifikasiModal] =
    useState(false);

  const [editingSertifikasiId, setEditingSertifikasiId] =
    useState<number | null>(null);

  const [sertifikasiForm, setSertifikasiForm] =
    useState<Sertifikasi>(initialSertifikasi);

  const [savingSertifikasi, setSavingSertifikasi] =
    useState(false);

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

      const response = await fetch("/api/me", {
        cache: "no-store",
      });

      if (!response.ok) {
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (
        !data.success ||
        !data.user ||
        data.user.role !== "KANDIDAT"
      ) {
        router.replace("/login");
        return;
      }

      setUser(data.user);

      setProfileForm({
        nama: data.user.nama || "",
        email: data.user.email || "",
        nik: data.user.nik || "",
        alamat: data.user.alamat || "",
      });

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
      const res = await fetch("/api/profil/dokumen", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.success && Array.isArray(data.dokumen)) {
        const map: Record<string, UploadedDokumen> = {};

        data.dokumen.forEach(
          (document: UploadedDokumen) => {
            map[document.jenisDokumen.toLowerCase()] = document;
          }
        );

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
      const res = await fetch("/api/pendidikan", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.success) {
        setPendidikan(
          data.pendidikan ||
            data.data ||
            []
        );
      }
    } catch (error) {
      console.error("FETCH PENDIDIKAN ERROR:", error);
    }
  };

  // ============================================================
  // FETCH PENGALAMAN
  // ============================================================

  const fetchPengalaman = async () => {
    try {
      const res = await fetch("/api/pengalaman", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.success) {
        setPengalaman(
          data.pengalaman ||
            data.data ||
            []
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
      const res = await fetch("/api/sertifikasi", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.success) {
        setSertifikasi(
          data.sertifikasi ||
            data.data ||
            []
        );
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

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Format foto harus JPG atau PNG.");
      return;
    }

    if (file.size === 0) {
      alert("File foto kosong.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran foto maksimal 2 MB.");
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
        alert(
          data.message ||
            "Gagal mengunggah foto profil."
        );

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

        setFotoPreview(
          `${data.fotoProfil}?t=${Date.now()}`
        );
      }

      const profileRes = await fetch("/api/me", {
        cache: "no-store",
      });

      if (profileRes.ok) {
        const profileData =
          await profileRes.json();

        if (
          profileData.success &&
          profileData.user
        ) {
          setUser(profileData.user);
        }
      }

      setTimeout(() => {
        URL.revokeObjectURL(localPreview);
      }, 1000);
    } catch (error) {
      console.error("UPLOAD FOTO ERROR:", error);

      alert(
        "Terjadi kesalahan saat mengunggah foto profil."
      );

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
      !profileForm.nama ||
      !profileForm.email ||
      !profileForm.nik
    ) {
      alert("Nama, email, dan NIK wajib diisi.");
      return;
    }

    setSavingProfile(true);

    try {
      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Gagal memperbarui profil."
        );

        return;
      }

      setUser((prev) =>
        prev
          ? {
              ...prev,
              ...data.user,
            }
          : data.user
      );

      setProfileForm({
        nama: data.user.nama,
        email: data.user.email,
        nik: data.user.nik,
        alamat: data.user.alamat || "",
      });

      setEditingProfile(false);
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat memperbarui profil."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ============================================================
  // UPLOAD DOKUMEN
  // ============================================================

  const handleUpload = async (
    key: string,
    file: File
  ) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5 MB.");
      return;
    }

    setUploading((prev) => ({
      ...prev,
      [key]: true,
    }));

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append(
        "jenisDokumen",
        key.toUpperCase()
      );

      const res = await fetch(
        "/api/profil/dokumen",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Gagal mengunggah dokumen."
        );

        return;
      }

      setUploadedDocs((prev) => ({
        ...prev,
        [key]: data.dokumen,
      }));
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      alert(
        "Terjadi kesalahan saat mengunggah dokumen."
      );
    } finally {
      setUploading((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  };

  // ============================================================
  // DELETE DOKUMEN
  // ============================================================

  const handleDeleteDocument = async (
    key: string
  ) => {
    if (!confirm("Hapus dokumen ini?")) {
      return;
    }

    try {
      const res = await fetch(
        "/api/profil/dokumen/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jenisDokumen: key.toUpperCase(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Gagal menghapus dokumen."
        );

        return;
      }

      setUploadedDocs((prev) => {
        const next = {
          ...prev,
        };

        delete next[key];

        return next;
      });
    } catch (error) {
      console.error(
        "DELETE DOCUMENT ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menghapus dokumen."
      );
    }
  };

  // ============================================================
  // PREVIEW DOKUMEN
  // ============================================================

  const openPreview = (
    doc: PreviewTarget
  ) => {
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

    setPendidikanForm({
      ...initialPendidikan,
    });

    setIjazahFile(null);

    setShowPendidikanModal(true);
  };

  // ============================================================
  // EDIT PENDIDIKAN
  // ============================================================

  const openEditPendidikan = (
    item: Pendidikan
  ) => {
    setEditingPendidikanId(item.id);

    setPendidikanForm({
      ...item,
    });

    setIjazahFile(null);

    setShowPendidikanModal(true);
  };

  // ============================================================
  // SAVE PENDIDIKAN
  // ============================================================

  const savePendidikan = async () => {
    if (
      !pendidikanForm.jenjang ||
      !pendidikanForm.institusi ||
      !pendidikanForm.jurusan ||
      !pendidikanForm.tahunMulai ||
      !pendidikanForm.tahunSelesai
    ) {
      alert(
        "Lengkapi seluruh data pendidikan terlebih dahulu."
      );

      return;
    }

    setSavingPendidikan(true);

    try {
      const isEdit =
        editingPendidikanId !== null;

      const url = isEdit
        ? `/api/pendidikan/${editingPendidikanId}`
        : "/api/pendidikan";

      const method = isEdit
        ? "PUT"
        : "POST";

      const body = {
        jenjang:
          pendidikanForm.jenjang,

        institusi:
          pendidikanForm.institusi,

        jurusan:
          pendidikanForm.jurusan,

        tahunMulai:
          pendidikanForm.tahunMulai,

        tahunSelesai:
          pendidikanForm.tahunSelesai,

        nilai:
          pendidikanForm.nilai || null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Gagal menyimpan pendidikan."
        );

        return;
      }

      const savedId: number | undefined =
        data.pendidikan?.id ??
        data.data?.id ??
        editingPendidikanId ??
        undefined;

      // Upload ijazah setelah pendidikan berhasil dibuat
      if (ijazahFile && savedId) {
        await uploadIjazah(
          savedId,
          ijazahFile
        );
      }

      await fetchPendidikan();

      setShowPendidikanModal(false);

      setEditingPendidikanId(null);

      setPendidikanForm({
        ...initialPendidikan,
      });

      setIjazahFile(null);
    } catch (error) {
      console.error(
        "SAVE PENDIDIKAN ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menyimpan pendidikan."
      );
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
    const file =
      e.target.files?.[0];

    // Reset input agar file yang sama
    // dapat dipilih kembali
    e.target.value = "";

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Format ijazah harus PDF, JPG, atau PNG."
      );

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Ukuran ijazah maksimal 5 MB."
      );

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

  const uploadIjazah = async (
    pendidikanId: number,
    file: File
  ) => {
    setUploadingIjazah(true);

    try {
      const formData = new FormData();

      formData.append(
        "ijazah",
        file
      );

      const res = await fetch(
        `/api/pendidikan/${pendidikanId}/ijazah`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Gagal mengunggah ijazah."
        );

        return false;
      }

      await fetchPendidikan();

      return true;
    } catch (error) {
      console.error(
        "UPLOAD IJAZAH ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat mengunggah ijazah."
      );

      return false;
    } finally {
      setUploadingIjazah(false);
    }
  };

  // ============================================================
  // DELETE IJAZAH
  // ============================================================

  const deleteIjazah = async (
    pendidikanId: number
  ) => {
    if (!confirm("Hapus ijazah ini?")) {
      return;
    }

    try {
      const res = await fetch(
        `/api/pendidikan/${pendidikanId}/ijazah`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Gagal menghapus ijazah."
        );

        return;
      }

      // Update field ijazah sesuai schema terbaru
      setPendidikan((prev) =>
        prev.map((item) =>
          item.id === pendidikanId
            ? {
                ...item,
                ijazahNamaFile: null,
                ijazahNamaAsli: null,
                ijazahPathFile: null,
                ijazahTipeFile: null,
                ijazahUkuranFile: null,
              }
            : item
        )
      );

      // Jika sedang edit pendidikan tersebut,
      // bersihkan juga data ijazah pada form
      if (
        editingPendidikanId ===
        pendidikanId
      ) {
        setPendidikanForm((prev) => ({
          ...prev,
          ijazahNamaFile: null,
          ijazahNamaAsli: null,
          ijazahPathFile: null,
          ijazahTipeFile: null,
          ijazahUkuranFile: null,
        }));
      }

      setIjazahFile(null);
    } catch (error) {
      console.error(
        "DELETE IJAZAH ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menghapus ijazah."
      );
    }
  };

  // ============================================================
  // DELETE PENDIDIKAN
  // ============================================================

  const deletePendidikan = async (
    id: number
  ) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus pendidikan ini?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/pendidikan/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Gagal menghapus pendidikan."
        );

        return;
      }

      setPendidikan((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (error) {
      console.error(
        "DELETE PENDIDIKAN ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menghapus pendidikan."
      );
    }
  };

  // ============================================================
  // TAMBAH PENGALAMAN
  // ============================================================

  const openTambahPengalaman = () => {
    setEditingPengalamanId(null);

    setPengalamanForm({
      ...initialPengalaman,
    });

    setShowPengalamanModal(true);
  };

  // ============================================================
  // EDIT PENGALAMAN
  // ============================================================

  const openEditPengalaman = (
    item: Pengalaman
  ) => {
    setEditingPengalamanId(item.id);

    setPengalamanForm({
      ...item,
    });

    setShowPengalamanModal(true);
  };

  // ============================================================
  // SAVE PENGALAMAN
  // ============================================================

  const savePengalaman = async () => {
    if (
      !pengalamanForm.posisi ||
      !pengalamanForm.perusahaan ||
      !pengalamanForm.tahunMulai
    ) {
      alert(
        "Posisi, perusahaan, dan tahun mulai wajib diisi."
      );

      return;
    }

    setSavingPengalaman(true);

    try {
      const isEdit =
        editingPengalamanId !== null;

      const url = isEdit
        ? `/api/pengalaman/${editingPengalamanId}`
        : "/api/pengalaman";

      const method = isEdit
        ? "PUT"
        : "POST";

      const body = {
        posisi:
          pengalamanForm.posisi,

        perusahaan:
          pengalamanForm.perusahaan,

        lokasi:
          pengalamanForm.lokasi ||
          null,

        tahunMulai:
          pengalamanForm.tahunMulai,

        tahunSelesai:
          pengalamanForm.tahunSelesai ||
          null,

        deskripsi:
          pengalamanForm.deskripsi ||
          null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Gagal menyimpan pengalaman."
        );

        return;
      }

      await fetchPengalaman();

      setShowPengalamanModal(false);

      setEditingPengalamanId(null);

      setPengalamanForm({
        ...initialPengalaman,
      });
    } catch (error) {
      console.error(
        "SAVE PENGALAMAN ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menyimpan pengalaman."
      );
    } finally {
      setSavingPengalaman(false);
    }
  };

  // ============================================================
  // DELETE PENGALAMAN
  // ============================================================

  const deletePengalaman = async (
    id: number
  ) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus pengalaman ini?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/pengalaman/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Gagal menghapus pengalaman."
        );

        return;
      }

      setPengalaman((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (error) {
      console.error(
        "DELETE PENGALAMAN ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menghapus pengalaman."
      );
    }
  };

  // ============================================================
  // TAMBAH SERTIFIKASI
  // ============================================================

  const openTambahSertifikasi = () => {
    setEditingSertifikasiId(null);

    setSertifikasiForm({
      ...initialSertifikasi,
    });

    setShowSertifikasiModal(true);
  };

  // ============================================================
  // EDIT SERTIFIKASI
  // ============================================================

  const openEditSertifikasi = (
    item: Sertifikasi
  ) => {
    setEditingSertifikasiId(item.id);

    setSertifikasiForm({
      ...item,
    });

    setShowSertifikasiModal(true);
  };

  // ============================================================
  // SAVE SERTIFIKASI
  // ============================================================

  const saveSertifikasi = async () => {
    if (
      !sertifikasiForm.nama ||
      !sertifikasiForm.penerbit
    ) {
      alert(
        "Nama sertifikasi dan penerbit wajib diisi."
      );

      return;
    }

    setSavingSertifikasi(true);

    try {
      const isEdit =
        editingSertifikasiId !== null;

      const url = isEdit
        ? `/api/sertifikasi/${editingSertifikasiId}`
        : "/api/sertifikasi";

      const method = isEdit
        ? "PUT"
        : "POST";

      const body = {
        nama: sertifikasiForm.nama,
        penerbit:
          sertifikasiForm.penerbit,
        nomor:
          sertifikasiForm.nomor ||
          null,
        tanggalTerbit:
          sertifikasiForm.tanggalTerbit ||
          null,
        tanggalKadaluarsa:
          sertifikasiForm.tanggalKadaluarsa ||
          null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Gagal menyimpan sertifikasi."
        );

        return;
      }

      await fetchSertifikasi();

      setShowSertifikasiModal(false);

      setEditingSertifikasiId(null);

      setSertifikasiForm({
        ...initialSertifikasi,
      });
    } catch (error) {
      console.error(
        "SAVE SERTIFIKASI ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menyimpan sertifikasi."
      );
    } finally {
      setSavingSertifikasi(false);
    }
  };

  // ============================================================
  // DELETE SERTIFIKASI
  // ============================================================

  const deleteSertifikasi = async (
    id: number
  ) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus sertifikasi ini?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/sertifikasi/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Gagal menghapus sertifikasi."
        );

        return;
      }

      setSertifikasi((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (error) {
      console.error(
        "DELETE SERTIFIKASI ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menghapus sertifikasi."
      );
    }
  };

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // ==========================================================
    // CORE
    // ==========================================================

    user,
    loading,

    // ==========================================================
    // FOTO
    // ==========================================================

    uploadingFoto,
    fotoPreview,
    fotoInputRef,
    handleFotoChange,

    // ==========================================================
    // DOKUMEN
    // ==========================================================

    uploadedDocs,
    uploading,
    fileInputRefs,
    handleUpload,
    handleDeleteDocument,

    // ==========================================================
    // PREVIEW
    // ==========================================================

    previewDoc,
    openPreview,
    closePreview,

    // ==========================================================
    // EDIT PROFIL
    // ==========================================================

    editingProfile,
    setEditingProfile,
    profileForm,
    setProfileForm,
    savingProfile,
    saveProfile,

    // ==========================================================
    // PENDIDIKAN
    // ==========================================================

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

    // ==========================================================
    // IJAZAH
    // ==========================================================

    ijazahFile,
    uploadingIjazah,
    handleIjazahFileChange,

    // PENTING:
    // Fungsi ini sebelumnya belum dikembalikan
    // sehingga page.tsx membaca p.clearIjazahFile
    // sebagai error TypeScript.
    clearIjazahFile,

    deleteIjazah,

    // ==========================================================
    // PENGALAMAN
    // ==========================================================

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

    // ==========================================================
    // SERTIFIKASI
    // ==========================================================

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
