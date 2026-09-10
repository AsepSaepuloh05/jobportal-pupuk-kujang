export interface UserData {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
  alamat?: string | null;
  dokumenProfil?: {
    pathFile: string;
  } | null;
}

export interface UploadedDokumen {
  id: number;
  jenisDokumen: string;
  namaAsli: string;
  pathFile: string;
  tipeFile: string;
  ukuranFile: number;
  updatedAt: string;
}

export interface Pendidikan {
  id: number;
  jenjang: string;
  institusi: string;
  jurusan: string;
  tahunMulai: string;
  tahunSelesai: string;
  nilai: string | null;

  // Ijazah
  ijazahNamaFile?: string | null;
  ijazahNamaAsli?: string | null;
  ijazahPathFile?: string | null;
  ijazahTipeFile?: string | null;
  ijazahUkuranFile?: number | null;
}

export interface Pengalaman {
  id: number;
  posisi: string;
  perusahaan: string;
  lokasi: string | null;
  tahunMulai: string;
  tahunSelesai: string | null;
  deskripsi: string | null;
}

export interface Sertifikasi {
  id: number;
  nama: string;
  penerbit: string;
  nomor: string | null;
  tanggalTerbit: string | null;
  tanggalKadaluarsa: string | null;
}

export interface DokumenConfig {
  key: string;
  label: string;
  description: string;
  accept: string;
}

export const initialPendidikan: Pendidikan = {
  id: 0,
  jenjang: "",
  institusi: "",
  jurusan: "",
  tahunMulai: "",
  tahunSelesai: "",
  nilai: null,

  ijazahNamaFile: null,
  ijazahNamaAsli: null,
  ijazahPathFile: null,
  ijazahTipeFile: null,
  ijazahUkuranFile: null,
};

export const initialPengalaman: Pengalaman = {
  id: 0,
  posisi: "",
  perusahaan: "",
  lokasi: "",
  tahunMulai: "",
  tahunSelesai: "",
  deskripsi: "",
};

export const initialSertifikasi: Sertifikasi = {
  id: 0,
  nama: "",
  penerbit: "",
  nomor: "",
  tanggalTerbit: "",
  tanggalKadaluarsa: "",
};

export const documents: DokumenConfig[] = [
  {
    key: "cv",
    label: "Curriculum Vitae",
    description: "PDF, maksimal 5 MB",
    accept: "application/pdf",
  },
  {
    key: "ktp",
    label: "KTP",
    description: "PDF, JPG, atau PNG — maksimal 5 MB",
    accept: "application/pdf,image/jpeg,image/png",
  },
  {
    key: "transkrip",
    label: "Transkrip Nilai",
    description: "PDF, JPG, atau PNG — maksimal 5 MB",
    accept: "application/pdf,image/jpeg,image/png",
  },
  {
    key: "lainnya",
    label: "Dokumen Pendukung",
    description: "PDF, JPG, atau PNG — maksimal 5 MB",
    accept: "application/pdf,image/jpeg,image/png",
  },
];