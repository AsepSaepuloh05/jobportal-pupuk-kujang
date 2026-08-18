"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../css/home.css";

interface User {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
}

export default function HomePage() {
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [checkingLogin, setCheckingLogin] = useState(true);

  // =========================
  // CEK STATUS LOGIN
  // =========================

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await fetch("/api/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("CHECK LOGIN ERROR:", error);
        setUser(null);
      } finally {
        setCheckingLogin(false);
      }
    };

    checkLogin();
  }, []);

  // =========================
  // SEARCH LOWONGAN
  // =========================

  const handleSearch = () => {
    console.log("Keyword:", keyword);
    console.log("Location:", location);

    router.push(
      `/lowongan?keyword=${encodeURIComponent(
        keyword
      )}&location=${encodeURIComponent(location)}`
    );
  };

  // =========================
  // PROFILE USER
  // =========================

  const handleProfileClick = () => {
    if (!user) return;

    if (user.role === "KANDIDAT") {
      router.push("/kandidat");
    } else if (user.role === "HR") {
      router.push("/hr");
    }
  };

  return (
    <main className="home-page">

      {/* =========================
          TOP BAR
      ========================= */}

      <div className="top-bar">
        <div className="top-container">

          <div className="top-left">

            <span>✉</span>
            <span>info@jobportal.com</span>

            <span className="phone-icon">
              ☎
            </span>

            <span>
              (021) 1234-5678
            </span>

          </div>

          <div className="top-right">

            <span>
              ⓘ Tentang Kami
            </span>

            <span>
              ♧ Kontak
            </span>

            {!user && (
              <span
                onClick={() => router.push("/login")}
                style={{ cursor: "pointer" }}
              >
                ↪ Masuk
              </span>
            )}

          </div>

        </div>
      </div>


      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="main-navbar">

        <div className="navbar-container">

          {/* LOGO */}

          <a href="/" className="logo">

            <img
              src="/Logo_kujang.jpg"
              alt="JobPortal Logo"
              className="logo-image"
            />

          </a>


          {/* MENU */}

          <div className="nav-menu">

            <a
              href="/"
              className="nav-link active"
            >
              <span></span>
              Beranda
            </a>


            <a
              href="/lowongan"
              className="nav-link"
            >
              <span></span>
              Lowongan Pekerjaan
            </a>


            {/* =========================
                LOGIN / PROFILE
            ========================= */}

            {checkingLogin ? (

              <div className="profile-loading">
                ...
              </div>

            ) : user ? (

              <button
                type="button"
                className="navbar-profile"
                onClick={handleProfileClick}
              >

                {/* AVATAR */}

                <div className="navbar-avatar">

                  {user.nama
                    .charAt(0)
                    .toUpperCase()}

                </div>


                {/* USER INFO */}

                <div className="navbar-user-info">

                  <strong>
                    {user.nama}
                  </strong>

                  <span>

                    {user.role === "HR"
                      ? "Human Resources"
                      : "Kandidat"}

                  </span>

                </div>


                {/* ARROW */}

                <span className="profile-arrow">
                  ▾
                </span>

              </button>

            ) : (

              <a
                href="/login"
                className="login-button"
              >
                Login
              </a>

            )}

          </div>

        </div>

      </nav>


      {/* =========================
          HERO
      ========================= */}

      <section className="hero-section">

        <div className="hero-container">

          {/* HERO LEFT */}

          <div className="hero-content">

            <p className="hero-label">
              PLATFORM PENCARIAN KERJA PT PUPUK KUJANG CIKAMPEK
            </p>

            <h1>

              Temukan Karir

              <br />

              <span>
                Impianmu di Sini
              </span>

            </h1>

            <p className="hero-description">

              Platform terbaik untuk menemukan berbagai
              lowongan pekerjaan dari perusahaan terpercaya
              di seluruh Indonesia.

            </p>


            {/* =========================
                SEARCH
            ========================= */}

            <div className="search-container">

              {/* KEYWORD */}

              <div className="search-field">

                <span className="search-icon">
                  ⌕
                </span>

                <div>

                  <label>
                    Pekerjaan
                  </label>

                  <input
                    type="text"
                    placeholder="Cari pekerjaan, posisi, atau perusahaan"
                    value={keyword}
                    onChange={(e) =>
                      setKeyword(e.target.value)
                    }
                  />

                </div>

              </div>


              {/* LOCATION */}

              <div className="search-field location-field">

                <span className="location-icon">
                  ●
                </span>

                <div>

                  <label>
                    Lokasi
                  </label>

                  <input
                    type="text"
                    placeholder="Kota atau provinsi"
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                  />

                </div>

              </div>


              {/* SEARCH BUTTON */}

              <button
                className="search-button"
                onClick={handleSearch}
              >

                Cari Lowongan

              </button>

            </div>

          </div>


          {/* =========================
              HERO RIGHT
          ========================= */}

          <div className="hero-illustration">

            {/* FLOATING CARD */}

            <div className="floating-card card-one">

              <div className="small-avatar">
                👤
              </div>

              <div>

                <div className="line long"></div>

                <div className="line short"></div>

              </div>

            </div>


            {/* OFFICE SCENE */}

            <div className="office-scene">

              {/* CHAIR */}

              <div className="office-chair">

                <div className="chair-back"></div>

                <div className="chair-seat"></div>

                <div className="chair-arm left"></div>

                <div className="chair-arm right"></div>

                <div className="chair-base"></div>

              </div>


              {/* PLANT */}

              <div className="plant">

                <div className="plant-leaf leaf-one"></div>

                <div className="plant-leaf leaf-two"></div>

                <div className="plant-leaf leaf-three"></div>

                <div className="plant-pot"></div>

              </div>

            </div>


            {/* FLOATING SEARCH CARD */}

            <div className="floating-card card-two">

              <span>
                ⌕
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          COMPANY PROFILE
      ========================= */}

      <section className="company-section">

        <div className="company-container">

          {/* LEFT */}

          <div className="company-content">

            <div className="section-label">

              <span></span>

              Tentang Kami

            </div>


            <h2>
              PT Pupuk Kujang Persero
            </h2>


            <p>

              Sejak awal berdirinya, PT Pupuk Kujang telah
              berkomitmen untuk mendukung kemajuan pertanian
              Indonesia. PT Pupuk Kujang tidak hanya fokus pada
              produksi pupuk berkualitas tinggi, tetapi juga aktif
              dalam kegiatan penelitian dan pengembangan untuk
              menghasilkan produk-produk inovatif yang dapat
              meningkatkan produktivitas dan kualitas hasil pertanian.

            </p>


            <p>

              Selain pupuk urea dan amonia, PT Pupuk Kujang juga
              memproduksi berbagai jenis pupuk lainnya, termasuk
              berbagai jenis NPK, serta produk-produk ritel seperti
              Jeranti, Nitrea, dan Bion-Up. PT Pupuk Kujang juga
              menyediakan layanan jasa pelatihan di berbagai bidang
              terkait industri petrokimia dan pertanian, seperti
              pengoperasian pabrik, pemeliharaan, keselamatan kerja,
              dan pengendalian mutu.

            </p>


            {/* FEATURES */}

            <div className="feature-list">

              {/* FEATURE 1 */}

              <div className="feature-item">

                <div className="feature-icon">

                  <img
                    src="/amanah.jpg"
                    alt="Amanah"
                  />

                </div>

                <div>

                  <h3>
                    Amanah
                  </h3>

                  <p>
                    Amanah berarti memegang teguh kepercayaan yang diberikan
                  </p>

                </div>

              </div>


              {/* FEATURE 2 */}

              <div className="feature-item">

                <div className="feature-icon green">

                  <img
                    src="/harmonis.png"
                    alt="Harmonis"
                  />

                </div>

                <div>

                  <h3>
                    Harmonis
                  </h3>

                  <p>
                    Kompeten berarti terus belajar dan mengembangkan kapabilitas
                  </p>

                </div>

              </div>


              {/* FEATURE 3 */}

              <div className="feature-item">

                <div className="feature-icon purple">

                  <img
                    src="/kompeten.jpg"
                    alt="Kompeten"
                  />

                </div>

                <div>

                  <h3>
                    Kesempatan Luas
                  </h3>

                  <p>
                    Harmonis berarti saling peduli dan menghargai perbedaan
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* RIGHT IMAGE */}

          <div className="company-image">

            <img
              src="/gambar_pt.jpg"
              alt="Company Profile JobPortal"
              className="company-photo"
            />

          </div>

        </div>

      </section>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="footer">

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