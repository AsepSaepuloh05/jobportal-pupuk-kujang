// =====================================================
// KONTEN PERNYATAAN PRIVASI DATA & SYARAT PENGGUNAAN
//
// CATATAN: Teks ini adalah DRAFT. Sesuaikan nama pengelola,
// email kontak, dan jangka waktu penyimpanan, lalu minta
// tinjauan dari HR / bagian hukum sebelum dipublikasikan.
// Ubah VERSI_PERSETUJUAN setiap kali isi dokumen berubah.
// =====================================================

export const VERSI_PERSETUJUAN = "2026-11-18";

export const NAMA_PENGELOLA = "PT Pupuk Kujang";
export const NAMA_PORTAL = "Portal Rekrutmen Pupuk Kujang";
export const EMAIL_KONTAK = "privasi@contoh.co.id"; // GANTI dengan email resmi

export type BagianDokumen = {
  judul: string;
  paragraf?: string[];
  daftar?: string[];
};

// =====================================================
// PERNYATAAN PRIVASI DATA
// =====================================================

export const KEBIJAKAN_PRIVASI: BagianDokumen[] = [
  {
    judul: "Pendahuluan",
    paragraf: [
      `${NAMA_PENGELOLA} ("Perusahaan") mengelola ${NAMA_PORTAL} ("Portal") untuk keperluan penerimaan pegawai. Pernyataan ini menjelaskan bagaimana data pribadi Anda dikumpulkan, digunakan, disimpan, dan dilindungi sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.`,
      "Dengan mendaftar dan menggunakan Portal, Anda menyatakan telah membaca dan memahami pernyataan ini.",
    ],
  },
  {
    judul: "Data yang Kami Kumpulkan",
    paragraf: ["Kami mengumpulkan data yang Anda berikan sendiri, yaitu:"],
    daftar: [
      "Data identitas: nama lengkap, NIK, alamat email, dan nomor telepon.",
      "Data alamat dan domisili: alamat, RT/RW, desa, kecamatan, kabupaten, provinsi, dan kode pos.",
      "Foto profil dan pas foto.",
      "Riwayat pendidikan, pengalaman kerja, dan sertifikasi.",
      "Dokumen pendukung: CV, KTP, ijazah, Surat Keterangan Lulus (SKL), transkrip nilai, paklaring, sertifikat, dan dokumen lain yang Anda unggah.",
      "Data lamaran dan hasil setiap tahapan seleksi.",
      "Data teknis yang diperlukan untuk keamanan akun, seperti waktu akses dan sesi login.",
    ],
  },
  {
    judul: "Tujuan Penggunaan Data",
    paragraf: ["Data Anda digunakan untuk:"],
    daftar: [
      "Memverifikasi identitas dan keaslian dokumen Anda.",
      "Memproses lamaran dan seluruh tahapan seleksi, mulai dari seleksi administrasi hingga penawaran kerja.",
      "Menghubungi Anda terkait jadwal, undangan, dan hasil seleksi, termasuk melalui email.",
      "Memenuhi kewajiban hukum yang berlaku bagi Perusahaan.",
      "Menjaga keamanan Portal dan mencegah pemalsuan data atau penyalahgunaan akun.",
    ],
  },
  {
    judul: "Dasar Pemrosesan Data",
    paragraf: [
      "Kami memproses data pribadi Anda berdasarkan persetujuan yang Anda berikan saat mendaftar, serta untuk memenuhi kewajiban hukum dan kepentingan yang sah dalam proses rekrutmen.",
    ],
  },
  {
    judul: "Pembagian Data kepada Pihak Lain",
    paragraf: [
      "Kami tidak menjual data pribadi Anda. Data hanya dapat diakses oleh:",
    ],
    daftar: [
      "Tim HR dan pihak internal yang terlibat langsung dalam proses seleksi.",
      "Penyedia layanan yang membantu operasional Portal, seperti layanan pengiriman email, dengan kewajiban menjaga kerahasiaan.",
      "Instansi atau pihak berwenang, apabila diwajibkan oleh peraturan perundang-undangan.",
    ],
  },
  {
    judul: "Penyimpanan dan Keamanan",
    paragraf: [
      "Dokumen Anda disimpan pada penyimpanan privat dan hanya dapat dibuka oleh pengguna yang sudah login dan berwenang. Kata sandi disimpan dalam bentuk terenkripsi (hash).",
      "Data disimpan selama diperlukan untuk proses rekrutmen dan sesuai kebijakan retensi data Perusahaan, kecuali peraturan mewajibkan jangka waktu yang lebih lama.",
      "Meskipun demikian, tidak ada sistem yang sepenuhnya bebas risiko. Jaga kerahasiaan kata sandi dan kode OTP Anda.",
    ],
  },
  {
    judul: "Hak Anda atas Data Pribadi",
    paragraf: ["Sesuai peraturan yang berlaku, Anda berhak untuk:"],
    daftar: [
      "Mengakses dan memperoleh salinan data pribadi Anda.",
      "Memperbaiki atau memperbarui data yang tidak akurat.",
      "Meminta penghapusan atau pemusnahan data pribadi Anda.",
      "Menarik persetujuan pemrosesan data dan mengajukan keberatan atas pemrosesan tertentu.",
    ],
  },
  {
    judul: "Dampak Penarikan Persetujuan",
    paragraf: [
      "Penarikan persetujuan atau penghapusan data dapat menyebabkan lamaran Anda tidak dapat diproses lebih lanjut, karena data tersebut diperlukan untuk seleksi.",
    ],
  },
  {
    judul: "Kontak",
    paragraf: [
      `Untuk menggunakan hak Anda atau mengajukan pertanyaan tentang pelindungan data, hubungi kami di ${EMAIL_KONTAK}.`,
    ],
  },
  {
    judul: "Perubahan Pernyataan",
    paragraf: [
      "Pernyataan ini dapat diperbarui sewaktu-waktu. Versi terbaru berlaku sejak dipublikasikan di Portal, dan perubahan penting akan diinformasikan kepada Anda.",
    ],
  },
];

// =====================================================
// SYARAT PENGGUNAAN
// =====================================================

export const SYARAT_PENGGUNAAN: BagianDokumen[] = [
  {
    judul: "Penerimaan Syarat",
    paragraf: [
      `Dengan membuat akun dan menggunakan ${NAMA_PORTAL}, Anda menyetujui seluruh Syarat Penggunaan ini. Jika Anda tidak setuju, mohon tidak menggunakan Portal.`,
    ],
  },
  {
    judul: "Kelayakan dan Akun",
    daftar: [
      "Anda harus memiliki identitas yang sah dan berusia sesuai ketentuan ketenagakerjaan yang berlaku.",
      "Satu NIK hanya dapat digunakan untuk satu akun.",
      "Anda bertanggung jawab menjaga kerahasiaan kata sandi dan kode OTP, serta atas seluruh aktivitas yang terjadi pada akun Anda.",
    ],
  },
  {
    judul: "Keakuratan Data dan Keaslian Dokumen",
    paragraf: [
      "Anda menjamin bahwa seluruh data yang diisi dan dokumen yang diunggah adalah benar, lengkap, dan asli.",
      "Pemalsuan data atau dokumen dapat mengakibatkan pembatalan lamaran, penghapusan akun, dan pemberitahuan kepada pihak berwenang.",
    ],
  },
  {
    judul: "Penggunaan yang Dilarang",
    paragraf: ["Anda dilarang untuk:"],
    daftar: [
      "Menggunakan identitas atau akun orang lain.",
      "Mengunggah berkas yang berbahaya, berisi program jahat, atau melanggar hukum.",
      "Mengakses, mengambil, atau menyalin data secara otomatis tanpa izin.",
      "Mengganggu, merusak, atau mencoba menembus keamanan Portal.",
    ],
  },
  {
    judul: "Proses Seleksi",
    paragraf: [
      "Pendaftaran akun dan pengiriman lamaran tidak menjamin Anda diterima. Keputusan hasil seleksi ditetapkan oleh Perusahaan dan bersifat final.",
      "Informasi resmi mengenai seleksi hanya disampaikan melalui Portal dan email resmi Perusahaan. Waspadai pihak yang mengatasnamakan Perusahaan dan meminta imbalan.",
    ],
  },
  {
    judul: "Hak Kekayaan Intelektual",
    paragraf: [
      "Seluruh tampilan, konten, dan perangkat lunak Portal merupakan milik Perusahaan atau pemberi lisensinya dan tidak boleh disalin atau digunakan tanpa izin.",
    ],
  },
  {
    judul: "Batasan Tanggung Jawab",
    paragraf: [
      "Perusahaan berupaya menjaga Portal tetap tersedia, namun tidak menjamin Portal bebas dari gangguan teknis. Perusahaan tidak bertanggung jawab atas kerugian akibat gangguan di luar kendali wajar Perusahaan atau akibat kelalaian pengguna dalam menjaga akunnya.",
    ],
  },
  {
    judul: "Penangguhan dan Penghapusan Akun",
    paragraf: [
      "Perusahaan dapat menangguhkan atau menghapus akun yang melanggar Syarat Penggunaan ini atau yang terindikasi digunakan secara tidak sah.",
    ],
  },
  {
    judul: "Perubahan Syarat",
    paragraf: [
      "Syarat Penggunaan dapat diperbarui sewaktu-waktu. Dengan terus menggunakan Portal setelah perubahan berlaku, Anda dianggap menyetujui versi terbaru.",
    ],
  },
  {
    judul: "Hukum yang Berlaku",
    paragraf: [
      "Syarat Penggunaan ini diatur oleh hukum Republik Indonesia.",
    ],
  },
];