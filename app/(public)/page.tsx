
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const budayaPerusahaan = [
  {
    title: "Amanah",
    image:
      "https://admin-web.pupuk-kujang.co.id/proxy-file?source=corporate-info/visi_misi_dan_budaya_perusahaan/file-bNEhG1728011644.png",
    description:
      "Amanah berarti memegang teguh kepercayaan yang diberikan, dengan perilaku yang diharapkan sebagai berikut:",
    items: [
      "Memenuhi janji dan komitmen",
      "Bertanggung jawab atas tugas, keputusan, dan tindakan yang dilakukan",
      "Berpegang teguh kepada nilai moral dan etika",
    ],
  },
  {
    title: "Kompeten",
    image:
      "https://admin-web.pupuk-kujang.co.id/proxy-file?source=corporate-info/visi_misi_dan_budaya_perusahaan/file-xUlTm1728011712.png",
    description:
      "Kompeten berarti terus belajar dan mengembangkan kapabilitas, dengan perilaku yang diharapkan sebagai berikut:",
    items: [
      "Meningkatkan kompetensi diri untuk menjawab tantangan yang selalu berubah",
      "Membantu orang lain belajar",
      "Menyelesaikan tugas dengan kualitas terbaik",
    ],
  },
  {
    title: "Harmonis",
    image:
      "https://admin-web.pupuk-kujang.co.id/proxy-file?source=corporate-info/visi_misi_dan_budaya_perusahaan/file-VueGR1728011891.png",
    description:
      "Harmonis berarti saling peduli dan menghargai perbedaan, dengan perilaku yang diharapkan sebagai berikut:",
    items: [
      "Menghargai setiap orang apapun latar belakangnya",
      "Suka menolong orang lain",
      "Membangun lingkungan kerja yang kondusif",
    ],
  },
  {
    title: "Loyal",
    image:
      "https://admin-web.pupuk-kujang.co.id/proxy-file?source=corporate-info/visi_misi_dan_budaya_perusahaan/file-3fUm41728012093.png",
    description:
      "Loyal berarti berdedikasi dan mengutamakan kepentingan Bangsa dan Negara, dengan perilaku yang diharapkan sebagai berikut:",
    items: [
      "Menjaga nama baik sesama karyawan, pimpinan, BUMN dan Negara",
      "Rela berkorban untuk mencapai tujuan yang lebih besar",
      "Patuh pada pimpinan sepanjang tidak bertentangan dengan hukum dan etika",
    ],
  },
  {
    title: "Adaptif",
    image:
      "https://admin-web.pupuk-kujang.co.id/proxy-file?source=corporate-info/visi_misi_dan_budaya_perusahaan/file-t4x6n1728012221.png",
    description:
      "Adaptif berarti terus berinovasi dan antusias dalam menggerakkan ataupun menghadapi perubahan, dengan perilaku yang diharapkan sebagai berikut:",
    items: [
      "Cepat menyesuaikan diri untuk menjadi lebih baik",
      "Terus-menerus melakukan perbaikan mengikuti perkembangan teknologi",
      "Bertindak proaktif",
    ],
  },
  {
    title: "Kolaboratif",
    image:
      "https://admin-web.pupuk-kujang.co.id/proxy-file?source=corporate-info/visi_misi_dan_budaya_perusahaan/file-En0iM1728012297.png",
    description:
      "Kolaboratif berarti membangun kerja sama yang sinergis dengan perilaku yang diharapkan sebagai berikut:",
    items: [
      "Memberi kesempatan kepada berbagai pihak untuk berkontribusi",
      "Terbuka bekerja sama menghasilkan nilai tambah",
      "Menggerakkan pemanfaatan berbagai sumber daya untuk tujuan Bersama",
    ],
  },
];

export default function HomePage() {
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    router.push(
      `/lowongan?keyword=${encodeURIComponent(
        keyword
      )}&location=${encodeURIComponent(location)}`
    );
  };

  return (
    <main className="min-h-screen bg-[#f7faf8] text-[#18372b]">
      {/* ============================================================
          HERO SECTION
      ============================================================ */}

      <section className="relative overflow-hidden bg-[#f0f8f3]">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#bde4cf]/30 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#d9efe3]/50 blur-3xl" />

        <div className="relative mx-auto grid min-h-[620px] max-w-[1600px] grid-cols-1 items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:px-12 lg:py-20">
          {/* Hero Text */}
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cce6d8] bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[1.5px] text-[#3e9c70] shadow-sm backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#4eae7c]" />
              Career Opportunity
            </div>

            <p className="mb-4 text-xs font-extrabold uppercase tracking-[2px] text-[#4a9e73]">
              Platform Pencarian Kerja PT Pupuk Kujang Cikampek (PKC)
            </p>

            <h1 className="text-5xl font-black leading-[1.02] tracking-[-2.5px] text-[#193d2e] sm:text-6xl lg:text-[70px]">
              Temukan Karir
              <br />
              <span className="text-[#43a675]">
                Impianmu di Sini.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-sm leading-7 text-[#63776d] sm:text-base">
              Temukan peluang karier terbaik dan jadilah bagian dari perjalanan
              PT Pupuk Kujang dalam membangun industri serta masa depan
              Indonesia.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-xs text-[#75867e]">
              <span className="flex items-center gap-2">
                <span className="font-bold text-[#43a675]">✓</span>
                Informasi lowongan terbaru
              </span>

              <span className="flex items-center gap-2">
                <span className="font-bold text-[#43a675]">✓</span>
                Proses rekrutmen transparan
              </span>

              <span className="flex items-center gap-2">
                <span className="font-bold text-[#43a675]">✓</span>
                Kesempatan berkembang
              </span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="group relative overflow-hidden rounded-[28px] border-[10px] border-white shadow-[0_30px_70px_rgba(35,75,56,0.18)]">
              <img
                src="/gambar_pt.jpg"
                alt="PT Pupuk Kujang"
                className="h-[360px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[440px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#183c2d]/70 via-transparent to-transparent" />

              <div className="absolute bottom-7 left-7 right-7 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#cce9da]">
                  PT Pupuk Kujang
                </p>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  Bersama Membangun
                  <br />
                  Indonesia
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          BUDAYA PERUSAHAAN - AKHLAK
      ============================================================ */}

      <section className="bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1450px]">
          {/* Header */}
          <div className="mb-12">
            <div className="mb-5 flex items-center gap-3 text-sm font-extrabold uppercase tracking-wider text-[#3e9d70]">
              <span className="h-1 w-10 rounded-full bg-[#68c394]" />
              Budaya Perusahaan
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
              <div>
                <h2 className="text-4xl font-black leading-tight tracking-[-1.5px] text-[#193d2e] sm:text-5xl">
                  Nilai-Nilai Utama
                  <br />
                  <span className="text-[#43a675]">AKHLAK.</span>
                </h2>
              </div>

              <div className="flex items-center">
                <p className="text-sm leading-7 text-[#63776d] sm:text-base">
                  Nilai-Nilai Utama AKHLAK menjadi landasan budaya kerja dalam
                  menjalankan aktivitas perusahaan. Nilai tersebut mencerminkan
                  sikap dan perilaku yang diharapkan dalam membangun lingkungan
                  kerja yang profesional, bertanggung jawab, dan berorientasi
                  pada kemajuan bersama.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              AKHLAK CARDS
              Desktop = 6 kolom / satu baris
          ======================================================== */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {budayaPerusahaan.map((budaya) => (
              <div
                key={budaya.title}
                className="group rounded-2xl border border-[#e3eee8] bg-[#f8fcfa] p-4 transition duration-300 hover:-translate-y-2 hover:border-[#b9dfca] hover:shadow-[0_15px_35px_rgba(44,105,76,0.1)]"
              >
                {/* Image */}
                <div className="mb-4 h-12 w-12 overflow-hidden rounded-xl shadow-sm">
                  <img
                    src={budaya.image}
                    alt={budaya.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Title */}
                <h3 className="text-sm font-extrabold text-[#234236]">
                  {budaya.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-[11px] leading-5 text-[#7b8e83]">
                  {budaya.description}
                </p>

                {/* Items */}
                <ul className="mt-3 space-y-2 text-[11px] leading-5 text-[#657a6e]">
                  {budaya.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b9b76]" />

                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          COMPANY INTRODUCTION
      ============================================================ */}

      <section className="bg-[#f7faf8] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1450px]">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            {/* Text */}
            <div>
              <div className="mb-5 flex items-center gap-3 text-sm font-extrabold uppercase tracking-wider text-[#3e9d70]">
                <span className="h-1 w-10 rounded-full bg-[#68c394]" />
                Tentang Kami
              </div>

              <h2 className="text-4xl font-black leading-tight tracking-[-1.5px] text-[#193d2e] sm:text-5xl">
                Tumbuh bersama
                <br />
                <span className="text-[#43a675]">
                  PT Pupuk Kujang.
                </span>
              </h2>

              <p className="mt-6 text-sm leading-7 text-[#63776d] sm:text-base">
                Sejak awal berdirinya, PT Pupuk Kujang telah berkomitmen untuk
                mendukung kemajuan pertanian Indonesia. PT Pupuk Kujang tidak
                hanya fokus pada produksi pupuk berkualitas tinggi, tetapi juga
                aktif dalam kegiatan penelitian dan pengembangan untuk
                menghasilkan produk-produk inovatif yang dapat meningkatkan
                produktivitas dan kualitas hasil pertanian.
              </p>

              <p className="mt-4 text-sm leading-7 text-[#63776d] sm:text-base">
                Selain pupuk urea dan amonia, PT Pupuk Kujang juga memproduksi
                berbagai jenis pupuk lainnya, termasuk berbagai jenis NPK,
                serta produk-produk ritel seperti Jeranti, Nitrea, dan Bion-Up.
                PT Pupuk Kujang juga menyediakan layanan jasa pelatihan di
                berbagai bidang terkait industri petrokimia dan pertanian.
              </p>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="overflow-hidden rounded-[30px] shadow-xl">
                <img
                  src="/gambar_pt.jpg"
                  alt="PT Pupuk Kujang"
                  className="h-[350px] w-full object-cover transition duration-700 hover:scale-[1.01] sm:h-[430px]"
                />
              </div>

              <div className="absolute -bottom-6 -left-4 rounded-2xl border border-[#dcece3] bg-white px-6 py-4 shadow-xl sm:-left-6">
                <p className="text-xs text-slate-500">
                  Membangun masa depan
                </p>

                <p className="mt-1 font-bold text-[#18372b]">
                  Bersama insan terbaik
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CAREER CTA
      ============================================================ */}

      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="relative mx-auto max-w-[1450px] overflow-hidden rounded-[30px]">
          <img
            src="/gambar_pt.jpg"
            alt="PT Pupuk Kujang"
            className="h-[330px] w-full object-cover transition duration-700 hover:scale-[1.01] sm:h-[440px]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#15392b]/90 via-[#15392b]/40 to-transparent" />

          <div className="absolute inset-y-0 left-0 flex max-w-2xl flex-col justify-center px-7 sm:px-12 lg:px-16">
            <p className="text-xs font-bold uppercase tracking-[2px] text-[#bde5d0]">
              Karier & Masa Depan
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">
              Jadilah bagian dari
              <br />
              perjalanan kami.
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-6 text-[#e0eee7]">
              Temukan kesempatan untuk berkembang, berkontribusi, dan
              membangun masa depan bersama PT Pupuk Kujang.
            </p>

            <button
              onClick={() => router.push("/lowongan")}
              className="mt-7 w-fit rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#2d805a] shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#f0faf4]"
            >
              Lihat Lowongan →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
