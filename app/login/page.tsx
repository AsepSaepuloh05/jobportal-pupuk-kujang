"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "../css/login.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Email atau password salah");
        return;
      }

      // Redirect berdasarkan role
      if (data.user.role === "KANDIDAT") {
        router.replace("/kandidat");
      } else if (data.user.role === "HR") {
        router.replace("/hr");
      } else {
        setError("Role pengguna tidak dikenali");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">

        {/* KIRI */}
        <div className="login-info">
          <a href="/" className="login-logo">
            <img
              src="/Logo_kujang.jpg"
              alt="Logo JobPortal"
            />
          </a>

          <h1>
            Temukan Karir
            <br />
            <span>Impianmu di Sini</span>
          </h1>

          <p>
            Masuk ke akun JobPortal untuk menemukan
            peluang kerja dan mengelola informasi
            karirmu.
          </p>
        </div>

        {/* KANAN */}
        <div className="login-card">

          <div className="login-header">
            <h2>Selamat Datang</h2>
            <p>Silakan masuk ke akun Anda</p>
          </div>

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>

          </form>

          <div className="login-footer">
            <a href="/">
              ← Kembali ke Beranda
            </a>
          </div>

        </div>

      </div>
    </main>
  );
}
