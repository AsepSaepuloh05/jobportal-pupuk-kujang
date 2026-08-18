"use client";

import "../css/lowongan.css";

import { useState } from "react";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  category: string;
  logo: string;
  description: string;
};

const jobs: Job[] = [
  {
    id: 1,
    title: "Software Engineer",
    company: "PT Teknologi Indonesia",
    location: "Jakarta",
    type: "Full Time",
    salary: "Rp 8 - 12 Juta",
    category: "IT & Software",
    logo: "💻",
    description:
      "Mengembangkan dan memelihara aplikasi web serta bekerja sama dengan tim untuk menghasilkan solusi teknologi terbaik.",
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "Digital Kreatif Indonesia",
    location: "Bandung",
    type: "Full Time",
    salary: "Rp 6 - 9 Juta",
    category: "Design",
    logo: "🎨",
    description:
      "Merancang pengalaman pengguna dan antarmuka aplikasi yang menarik, mudah digunakan, dan sesuai kebutuhan pengguna.",
  },
  {
    id: 3,
    title: "IT Support",
    company: "PT Nusantara Digital",
    location: "Subang",
    type: "Full Time",
    salary: "Rp 5 - 7 Juta",
    category: "IT & Support",
    logo: "🖥️",
    description:
      "Memberikan dukungan teknis kepada pengguna serta melakukan troubleshooting perangkat keras dan perangkat lunak.",
  },
  {
    id: 4,
    title: "Digital Marketing",
    company: "PT Maju Bersama",
    location: "Jakarta",
    type: "Full Time",
    salary: "Rp 5 - 8 Juta",
    category: "Marketing",
    logo: "📈",
    description:
      "Mengembangkan strategi pemasaran digital untuk meningkatkan brand awareness dan pertumbuhan perusahaan.",
  },
  {
    id: 5,
    title: "Staff Administrasi",
    company: "PT Karya Indonesia",
    location: "Bekasi",
    type: "Full Time",
    salary: "Rp 4 - 6 Juta",
    category: "Administrasi",
    logo: "📋",
    description:
      "Mengelola dokumen, data administrasi, laporan, serta mendukung kegiatan operasional perusahaan.",
  },
  {
    id: 6,
    title: "Data Analyst",
    company: "PT Solusi Data",
    location: "Jakarta",
    type: "Full Time",
    salary: "Rp 7 - 11 Juta",
    category: "Data",
    logo: "📊",
    description:
      "Menganalisis data perusahaan dan menghasilkan insight yang dapat membantu pengambilan keputusan bisnis.",
  },
];

export default function LowonganPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const filteredJobs = jobs.filter((job) => {
    const keywordMatch =
      job.title.toLowerCase().includes(keyword.toLowerCase()) ||
      job.company.toLowerCase().includes(keyword.toLowerCase()) ||
      job.category.toLowerCase().includes(keyword.toLowerCase());

    const locationMatch =
      job.location.toLowerCase().includes(location.toLowerCase());

    return keywordMatch && locationMatch;
  });

  return (
    <main className="job-page">

      {/* =========================
          TOP BAR
      ========================= */}

      <div className="job-top-bar">
        <div className="job-top-container">

          <div className="job-top-left">
            <span>✉</span>
            <span>info@jobportal.com</span>

            <span className="job-phone">
              ☎
            </span>

            <span>
              (021) 1234-5678
            </span>
          </div>

          <div className="job-top-right">
            <span>ⓘ Tentang Kami</span>
            <span>♧ Kontak</span>
            <span>↪ Masuk</span>
          </div>

        </div>
      </div>


      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="job-navbar">

        <div className="job-navbar-container">

          {/* LOGO */}

          <a href="/" className="logo">
            <img
              src="/Logo_kujang.jpg"
              alt="JobPortal Logo"
              className="logo-image"
            />
          </a>


          {/* MENU */}

          <div className="job-nav-menu">

            <a
              href="/"
              className="job-nav-link"
            >
              Beranda
            </a>

            <a
              href="/lowongan"
              className="job-nav-link active"
            >
              Lowongan Pekerjaan
            </a>

            <a
              href="/login"
              className="job-login-button"
            >
              Login
            </a>

          </div>

        </div>

      </nav>


      {/* =========================
          HEADER
      ========================= */}

      <section className="job-header">

        <div className="job-header-content">

          <p className="job-header-label">
            PELUANG KARIR
          </p>

          <h1>
            Temukan Lowongan
            <br />
            <span>Pekerjaan Terbaik</span>
          </h1>

          <p>
            Temukan berbagai peluang kerja dari perusahaan
            terpercaya yang sesuai dengan keahlian dan
            pengalamanmu.
          </p>

        </div>

      </section>


      {/* =========================
          SEARCH
      ========================= */}

      <section className="job-search-section">

        <div className="job-search-container">

          <div className="job-search-field">

            <span>
              ⌕
            </span>

            <div>

              <label>
                Posisi / Perusahaan
              </label>

              <input
                type="text"
                placeholder="Cari pekerjaan atau perusahaan..."
                value={keyword}
                onChange={(e) =>
                  setKeyword(e.target.value)
                }
              />

            </div>

          </div>


          <div className="job-search-field job-location-field">

            <span>
              ●
            </span>

            <div>

              <label>
                Lokasi
              </label>

              <input
                type="text"
                placeholder="Contoh: Jakarta, Bandung..."
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
              />

            </div>

          </div>

          <button className="job-search-button">
            Cari Lowongan
          </button>

        </div>

      </section>


      {/* =========================
          JOB LIST
      ========================= */}

      <section className="jobs-section">

        <div className="jobs-container">

          {/* TITLE */}

          <div className="jobs-heading">

            <div>

              <p>
                LOWONGAN TERSEDIA
              </p>

              <h2>
                Pekerjaan Terbaru
              </h2>

            </div>

            <span>
              {filteredJobs.length} lowongan ditemukan
            </span>

          </div>


          {/* CONTENT */}

          <div className="jobs-layout">

            {/* JOB LIST */}

            <div className="job-list">

              {filteredJobs.length > 0 ? (

                filteredJobs.map((job) => (

                  <article
                    key={job.id}
                    className="job-card"
                  >

                    {/* LOGO */}

                    <div className="job-card-logo">
                      {job.logo}
                    </div>


                    {/* CONTENT */}

                    <div className="job-card-content">

                      <div className="job-card-top">

                        <div>

                          <h3>
                            {job.title}
                          </h3>

                          <p className="job-company">
                            {job.company}
                          </p>

                        </div>

                        <button className="bookmark-button">
                          ♡
                        </button>

                      </div>


                      <div className="job-meta">

                        <span>
                          ● {job.location}
                        </span>

                        <span>
                          ◷ {job.type}
                        </span>

                        <span>
                          💰 {job.salary}
                        </span>

                      </div>


                      <p className="job-description">
                        {job.description}
                      </p>


                      <div className="job-card-bottom">

                        <span className="job-category">
                          {job.category}
                        </span>

                        <button className="detail-button">
                          Lihat Detail →
                        </button>

                      </div>

                    </div>

                  </article>

                ))

              ) : (

                <div className="no-job">

                  <div>
                    🔍
                  </div>

                  <h3>
                    Lowongan tidak ditemukan
                  </h3>

                  <p>
                    Coba gunakan kata kunci atau lokasi
                    yang berbeda.
                  </p>

                </div>

              )}

            </div>


            {/* SIDEBAR */}

            <aside className="job-sidebar">

              <div className="sidebar-card">

                <div className="sidebar-icon">
                  💼
                </div>

                <h3>
                  Sedang mencari pekerjaan?
                </h3>

                <p>
                  Buat akun JobPortal dan temukan
                  peluang karir yang sesuai dengan
                  keahlianmu.
                </p>

                <a
                  href="/login"
                  className="sidebar-button"
                >
                  Masuk / Daftar
                </a>

              </div>


              <div className="sidebar-info">

                <h3>
                  Tips Mencari Kerja
                </h3>

                <div>
                  ✓ Lengkapi profil dan CV
                </div>

                <div>
                  ✓ Gunakan kata kunci yang tepat
                </div>

                <div>
                  ✓ Periksa persyaratan pekerjaan
                </div>

                <div>
                  ✓ Persiapkan diri untuk interview
                </div>

              </div>

            </aside>

          </div>

        </div>

      </section>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="job-footer">

        <div>
          © 2026 JobPortal. All rights reserved.
        </div>

        <div>
          Platform Pencarian Kerja Indonesia
        </div>

      </footer>

    </main>
  );
}