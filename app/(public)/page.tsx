"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


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

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#f0f8f3]">

        {/* Decorative Background */}

        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#bde4cf]/30 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#d9efe3]/50 blur-3xl" />

        <div className="relative mx-auto grid min-h-[620px] max-w-[1600px] grid-cols-1 items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:px-12 lg:py-20">

          {/* =================================================
              HERO LEFT
          ================================================= */}

          <div className="max-w-3xl">

            {/* Badge */}

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cce6d8] bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[1.5px] text-[#3e9c70] shadow-sm backdrop-blur">

              <span className="h-2 w-2 animate-pulse rounded-full bg-[#4eae7c]" />

              Career Opportunity

            </div>


            {/* Label */}

            <p className="mb-4 text-xs font-extrabold uppercase tracking-[2px] text-[#4a9e73]">

              Platform Pencarian Kerja PT Pupuk Kujang Cikampek (PKC)

            </p>


            {/* Heading */}

            <h1 className="text-5xl font-black leading-[1.02] tracking-[-2.5px] text-[#193d2e] sm:text-6xl lg:text-[70px]">

              Temukan Karir

              <br />

              <span className="text-[#43a675]">
                Impianmu di Sini.
              </span>

            </h1>


            {/* Description */}

            <p className="mt-7 max-w-2xl text-sm leading-7 text-[#63776d] sm:text-base">

              Temukan peluang karier terbaik dan jadilah bagian dari perjalanan PT Pupuk Kujang dalam membangun industri serta masa depan Indonesia.

            </p>


            {/* =================================================
                SEARCH BOX
            ================================================= */}

            <div className="mt-9 rounded-2xl border border-white/80 bg-white p-2 shadow-[0_25px_60px_rgba(34,75,56,0.12)]">

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr_auto]">

                {/* Keyword */}

                <div className="flex items-center gap-3 px-4 py-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f6ee] text-xl text-[#42a574]">
                    ⌕
                  </div>

                  <div className="min-w-0 flex-1">

                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#91a199]">
                      Posisi / Pekerjaan
                    </label>

                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                      placeholder="Cari posisi atau perusahaan"
                      className="mt-1 w-full border-none bg-transparent text-sm font-medium text-[#234236] outline-none placeholder:text-[#a3aea8]"
                    />

                  </div>

                </div>


                {/* Location */}

                <div className="flex items-center gap-3 border-t border-[#e5eee9] px-4 py-3 lg:border-l lg:border-t-0">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f6ee] text-sm text-[#42a574]">
                    ●
                  </div>

                  <div className="min-w-0 flex-1">

                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#91a199]">
                      Lokasi
                    </label>

                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                      placeholder="Kota atau provinsi"
                      className="mt-1 w-full border-none bg-transparent text-sm font-medium text-[#234236] outline-none placeholder:text-[#a3aea8]"
                    />

                  </div>

                </div>


                {/* Button */}

                <button
                  onClick={handleSearch}
                  className="m-1 rounded-xl bg-[#3e9d70] px-7 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#328861] hover:shadow-lg"
                >
                  Cari Lowongan →
                </button>

              </div>

            </div>


            {/* Quick Information */}

            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-xs text-[#75867e]">

              <span className="flex items-center gap-2">
                <span className="font-bold text-[#43a675]">
                  ✓
                </span>

                Informasi lowongan terbaru
              </span>


              <span className="flex items-center gap-2">
                <span className="font-bold text-[#43a675]">
                  ✓
                </span>

                Proses rekrutmen transparan
              </span>


              <span className="flex items-center gap-2">
                <span className="font-bold text-[#43a675]">
                  ✓
                </span>

                Kesempatan berkembang
              </span>

            </div>

          </div>


          {/* =================================================
              HERO RIGHT
          ================================================= */}

          <div className="relative">

            {/* Main Image */}

            <div className="group relative overflow-hidden rounded-[28px] border-[10px] border-white shadow-[0_30px_70px_rgba(35,75,56,0.18)]">

              <img
                src="/gambar_pt.jpg"
                alt="PT Pupuk Kujang"
                className="h-[360px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[440px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#183c2d]/70 via-transparent to-transparent" />


              {/* Image Text */}

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


            {/* Floating Career Card */}

            {/* <div className="absolute -bottom-7 -left-3 flex items-center gap-3 rounded-2xl border border-[#e4eee9] bg-white p-4 shadow-[0_15px_40px_rgba(35,75,56,0.15)] sm:-left-8">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f6ee] text-xl">
                💼
              </div>

              <div>
{/* 
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#93a098]">
                  Career Portal
                </p>

                <p className="text-sm font-extrabold text-[#234236]">
                  Peluang Karier
                </p> */}
{/* 
              </div>

            </div> */} 


            {/* Floating Badge */}

            {/* <div className="absolute -right-2 top-8 rounded-2xl bg-[#3e9d70] px-5 py-4 text-white shadow-xl sm:-right-6">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#d9f1e4]">
                Future
              </p>

              <p className="text-lg font-black">
                Starts Here.
              </p>

            </div> */}

          </div>

        </div>

      </section>


      {/* =====================================================
          COMPANY INTRODUCTION
      ===================================================== */}

      <section className="bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-28">

        <div className="mx-auto max-w-[1450px]">

          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">

            {/* LEFT */}

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

                Sejak awal berdirinya, PT Pupuk Kujang telah
                berkomitmen untuk mendukung kemajuan pertanian
                Indonesia. PT Pupuk Kujang tidak hanya fokus pada
                produksi pupuk berkualitas tinggi, tetapi juga aktif
                dalam kegiatan penelitian dan pengembangan untuk
                menghasilkan produk-produk inovatif yang dapat
                meningkatkan produktivitas dan kualitas hasil pertanian.

              </p>


              <p className="mt-4 text-sm leading-7 text-[#63776d] sm:text-base">

                Selain pupuk urea dan amonia, PT Pupuk Kujang juga
                memproduksi berbagai jenis pupuk lainnya, termasuk
                berbagai jenis NPK, serta produk-produk ritel seperti
                Jeranti, Nitrea, dan Bion-Up. PT Pupuk Kujang juga
                menyediakan layanan jasa pelatihan di berbagai bidang
                terkait industri petrokimia dan pertanian.

              </p>

            </div>


            {/* RIGHT - VALUES */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              {/* AMANAH */}

              <div className="group rounded-2xl border border-[#e3eee8] bg-[#f8fcfa] p-5 transition duration-300 hover:-translate-y-2 hover:border-[#b9dfca] hover:shadow-[0_15px_35px_rgba(44,105,76,0.1)]">

  {/* Icon / Image */}
              <div className="mb-5 h-14 w-14 overflow-hidden rounded-2xl shadow-sm">
                  <img
                    src="/amanah.jpg"
                    alt="Amanah"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-[#234236]">
                  Amanah
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs leading-6 text-[#7b8e83]">
                  Memegang teguh kepercayaan yang diberikan dengan perilaku yang
                  diharapkan sebagai berikut:
                </p>

                {/* List */}
                <ul className="mt-3 space-y-2 text-xs leading-5 text-[#657a6e]">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b9b76]" />
                    <span>Memenuhi janji dan komitmen</span>
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b9b76]" />
                    <span>
                      Bertanggung jawab atas tugas, keputusan, dan tindakan yang dilakukan
                    </span>
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b9b76]" />
                    <span>Berpegang teguh kepada nilai moral dan etika</span>
                  </li>
                </ul>

              </div>


              {/* HARMONIS */}
<div className="group rounded-2xl border border-[#e3eee8] bg-[#f8fcfa] p-5 transition duration-300 hover:-translate-y-2 hover:border-[#b9dfca] hover:shadow-[0_15px_35px_rgba(44,105,76,0.1)]">

  {/* Icon / Image */}
              <div className="mb-5 h-14 w-14 overflow-hidden rounded-2xl shadow-sm">
                  <img
                    src="/harmonis.png"
                    alt="Harmonis"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-[#234236]">
                  Harmonis
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs leading-6 text-[#7b8e83]">
                  Saling peduli dan menghargai perbedaan, dengan perilaku yang
                  diharapkan sebagai berikut:
                </p>

                {/* List */}
                <ul className="mt-3 space-y-2 text-xs leading-5 text-[#657a6e]">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b9b76]" />
                    <span>
                      Menghargai setiap orang apapun latar belakangnya
                    </span>
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b9b76]" />
                    <span>
                      Suka menolong orang lain
                    </span>
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b9b76]" />
                    <span>
                      Membangun lingkungan kerja yang kondusif
                    </span>
                  </li>
                </ul>

              </div>


              {/* KESEMPATAN LUAS */}

              <div className="group rounded-2xl border border-[#e3eee8] bg-[#f8fcfa] p-5 transition duration-300 hover:-translate-y-2 hover:border-[#b9dfca] hover:shadow-[0_15px_35px_rgba(44,105,76,0.1)]">

              {/* Icon / Image */}
              <div className="mb-5 h-14 w-14 overflow-hidden rounded-2xl shadow-sm">
                <img
                  src="/kompeten.jpg"
                  alt="Kesempatan Luas"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              </div>

              {/* Title */}
              <h3 className="font-extrabold text-[#234236]">
                Kesempatan Luas
              </h3>

              {/* Description */}
              <p className="mt-2 text-xs leading-6 text-[#7b8e83]">
                Terus belajar dan mengembangkan kapabilitas, dengan perilaku yang
                diharapkan sebagai berikut:
              </p>

              {/* List */}
              <ul className="mt-3 space-y-2 text-xs leading-5 text-[#657a6e]">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b9b76]" />
                  <span>
                    Meningkatkan kompetensi diri untuk menjawab tantangan yang selalu
                    berubah
                  </span>
                </li>

                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b9b76]" />
                  <span>Membantu orang lain belajar</span>
                </li>

                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b9b76]" />
                  <span>Menyelesaikan tugas dengan kualitas terbaik</span>
                </li>
              </ul>

            </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          COMPANY IMAGE / CAREER CTA
      ===================================================== */}

      <section className="px-5 pb-20 sm:px-8 lg:px-12">

        <div className="relative mx-auto max-w-[1450px] overflow-hidden rounded-[30px]">

          <img
            src="/gambar_pt.jpg"
            alt="PT Pupuk Kujang"
            className="h-[330px] w-full object-cover transition duration-700 hover:scale-[1.01] sm:h-[440px]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#15392b]/90 via-[#15392b]/40 to-transparent" />


          {/* CTA CONTENT */}

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

              Temukan kesempatan untuk berkembang,
              berkontribusi, dan membangun masa depan
              bersama PT Pupuk Kujang.

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