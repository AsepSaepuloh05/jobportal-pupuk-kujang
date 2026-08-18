"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../css/hr.css";

interface User {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
}

export default function HRDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/me");

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (data.user.role !== "HR") {
          router.replace("/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("GET USER ERROR:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      router.replace("/login");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  };

  if (loading) {
    return (
      <div className="hr-loading">
        Memuat dashboard...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="hr-dashboard">

      {/* SIDEBAR */}
      <aside className="hr-sidebar">

        <div className="hr-brand">
          <img
            src="/Logo_kujang.jpg"
            alt="Logo"
          />

          <div>
            <strong>JobPortal</strong>
            <span>HR Management</span>
          </div>
        </div>

        <nav className="hr-navigation">

          <p className="nav-title">
            MENU UTAMA
          </p>

          <a
            href="/hr"
            className="active"
          >
            <span>📊</span>
            Dashboard
          </a>

          <a href="/hr/lowongan">
            <span>💼</span>
            Kelola Lowongan
          </a>

          <a href="/hr/kandidat">
            <span>👥</span>
            Data Kandidat
          </a>

          <a href="/hr/lamaran">
            <span>📄</span>
            Lamaran Masuk
          </a>

          <a href="/hr/seleksi">
            <span>✅</span>
            Proses Seleksi
          </a>

          <p className="nav-title second">
            LAINNYA
          </p>

          <a href="/hr/profile">
            <span>👤</span>
            Profil Saya
          </a>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>🚪</span>
            Keluar
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <section className="hr-main">

        {/* HEADER */}
        <header className="hr-header">

          <div>
            <h1>Dashboard</h1>
            <p>
              Kelola proses rekrutmen dan kandidat
              melalui dashboard HR.
            </p>
          </div>

          <div className="hr-profile">

            <div className="hr-avatar">
              {user.nama.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.nama}</strong>
              <span>Human Resources</span>
            </div>

          </div>

        </header>

        {/* WELCOME */}
        <div className="hr-welcome">

          <div>
            <span>Selamat datang kembali 👋</span>

            <h2>
              Halo, {user.nama}
            </h2>

            <p>
              Berikut ringkasan aktivitas rekrutmen
              hari ini.
            </p>
          </div>

          <button
            onClick={() => router.push("/hr/lowongan")}
          >
            + Buat Lowongan
          </button>

        </div>

        {/* STATISTICS */}
        <div className="hr-statistics">

          <div className="hr-stat-card">

            <div className="stat-icon green">
              💼
            </div>

            <div>
              <span>Lowongan Aktif</span>
              <strong>12</strong>
              <small>
                +2 bulan ini
              </small>
            </div>

          </div>

          <div className="hr-stat-card">

            <div className="stat-icon blue">
              👥
            </div>

            <div>
              <span>Total Kandidat</span>
              <strong>248</strong>
              <small>
                +18 minggu ini
              </small>
            </div>

          </div>

          <div className="hr-stat-card">

            <div className="stat-icon orange">
              📄
            </div>

            <div>
              <span>Lamaran Masuk</span>
              <strong>86</strong>
              <small>
                +14 hari ini
              </small>
            </div>

          </div>

          <div className="hr-stat-card">

            <div className="stat-icon purple">
              ✅
            </div>

            <div>
              <span>Dalam Seleksi</span>
              <strong>24</strong>
              <small>
                8 perlu diproses
              </small>
            </div>

          </div>

        </div>

        {/* CONTENT GRID */}
        <div className="hr-content-grid">

          {/* LOWONGAN */}
          <div className="hr-panel">

            <div className="panel-header">

              <div>
                <h3>Lowongan Terbaru</h3>
                <p>
                  Daftar lowongan yang sedang aktif
                </p>
              </div>

              <button
                onClick={() =>
                  router.push("/hr/lowongan")
                }
              >
                Lihat Semua
              </button>

            </div>

            <div className="job-list">

              <div className="job-item">

                <div className="job-icon">
                  IT
                </div>

                <div className="job-info">
                  <strong>
                    IT Support
                  </strong>

                  <span>
                    Departemen IT
                  </span>
                </div>

                <div className="job-status">
                  Aktif
                </div>

              </div>

              <div className="job-item">

                <div className="job-icon">
                  QA
                </div>

                <div className="job-info">
                  <strong>
                    Quality Assurance
                  </strong>

                  <span>
                    Departemen IT
                  </span>
                </div>

                <div className="job-status">
                  Aktif
                </div>

              </div>

              <div className="job-item">

                <div className="job-icon">
                  HR
                </div>

                <div className="job-info">
                  <strong>
                    HR Staff
                  </strong>

                  <span>
                    Departemen MPSDM
                  </span>
                </div>

                <div className="job-status">
                  Aktif
                </div>

              </div>

              <div className="job-item">

                <div className="job-icon">
                  FN
                </div>

                <div className="job-info">
                  <strong>
                    Finance Staff
                  </strong>

                  <span>
                    Departemen Keuangan
                  </span>
                </div>

                <div className="job-status">
                  Aktif
                </div>

              </div>

            </div>

          </div>

          {/* AKTIVITAS */}
          <div className="hr-panel">

            <div className="panel-header">

              <div>
                <h3>Aktivitas Terbaru</h3>
                <p>
                  Aktivitas kandidat
                </p>
              </div>

            </div>

            <div className="activity-list">

              <div className="activity-item">

                <div className="activity-icon">
                  📄
                </div>

                <div>
                  <strong>
                    Lamaran baru diterima
                  </strong>

                  <p>
                    Kandidat melamar posisi
                    IT Support
                  </p>

                  <small>
                    10 menit yang lalu
                  </small>
                </div>

              </div>

              <div className="activity-item">

                <div className="activity-icon">
                  ✅
                </div>

                <div>
                  <strong>
                    Kandidat lolos seleksi
                  </strong>

                  <p>
                    Kandidat telah lolos tahap
                    administrasi
                  </p>

                  <small>
                    35 menit yang lalu
                  </small>
                </div>

              </div>

              <div className="activity-item">

                <div className="activity-icon">
                  👤
                </div>

                <div>
                  <strong>
                    Kandidat baru terdaftar
                  </strong>

                  <p>
                    Kandidat baru membuat akun
                  </p>

                  <small>
                    1 jam yang lalu
                  </small>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
