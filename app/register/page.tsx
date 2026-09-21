"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: nama.trim(),
          email: email.trim(),
          nik: nik.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Registrasi gagal, silakan coba lagi");
        return;
      }

      router.replace(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f8f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(44,105,76,0.12)] lg:grid-cols-2">

          {/* ================= KIRI ================= */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#164d36] via-[#236b4c] to-[#2f815d] p-10 text-white lg:flex lg:flex-col lg:justify-center">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10" />

            <div className="relative z-10">
              <a
                href="/"
                className="mb-10 inline-flex items-center transition duration-300 hover:scale-105"
              >
                <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-lg">
                  <img
                    src="/Logo_kujang.jpg"
                    alt="Logo JobPortal"
                    className="h-16 w-16 object-cover"
                  />
                </div>
              </a>

              <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl">
                Mulai Langkah
                <br />
                <span className="text-[#bde8ce]">
                  Karirmu Sekarang
                </span>
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/80">
                Daftar akun JobPortal untuk mulai melamar pekerjaan
                dan mengelola informasi karirmu.
              </p>
            </div>
          </div>

          {/* ================= KANAN ================= */}
          <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
            <div className="w-full max-w-md">

              <div className="mb-8 flex justify-center lg:hidden">
                <a
                  href="/"
                  className="overflow-hidden rounded-2xl shadow-md transition duration-300 hover:scale-105"
                >
                  <img
                    src="/Logo_kujang.jpg"
                    alt="Logo JobPortal"
                    className="h-16 w-16 object-cover"
                  />
                </a>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#234236]">
                  Buat Akun Baru
                </h2>
                <p className="mt-2 text-sm text-[#7b8e83]">
                  Lengkapi data di bawah untuk mendaftar
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label
                    htmlFor="nama"
                    className="mb-2 block text-sm font-semibold text-[#234236]"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    id="nama"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-[#dce9e1] bg-[#f9fcfa] px-4 py-3 text-sm text-[#234236] outline-none transition placeholder:text-[#a2b2aa] focus:border-[#4c9b70] focus:bg-white focus:ring-4 focus:ring-[#4c9b70]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#234236]"
                  >
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
                    className="w-full rounded-xl border border-[#dce9e1] bg-[#f9fcfa] px-4 py-3 text-sm text-[#234236] outline-none transition placeholder:text-[#a2b2aa] focus:border-[#4c9b70] focus:bg-white focus:ring-4 focus:ring-[#4c9b70]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="nik"
                    className="mb-2 block text-sm font-semibold text-[#234236]"
                  >
                    NIK
                  </label>
                  <input
                    id="nik"
                    type="text"
                    placeholder="Masukkan NIK"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    required
                    disabled={loading}
                    maxLength={16}
                    className="w-full rounded-xl border border-[#dce9e1] bg-[#f9fcfa] px-4 py-3 text-sm text-[#234236] outline-none transition placeholder:text-[#a2b2aa] focus:border-[#4c9b70] focus:bg-white focus:ring-4 focus:ring-[#4c9b70]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#234236]"
                  >
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
                    className="w-full rounded-xl border border-[#dce9e1] bg-[#f9fcfa] px-4 py-3 text-sm text-[#234236] outline-none transition placeholder:text-[#a2b2aa] focus:border-[#4c9b70] focus:bg-white focus:ring-4 focus:ring-[#4c9b70]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[#234236]"
                  >
                    Konfirmasi Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-[#dce9e1] bg-[#f9fcfa] px-4 py-3 text-sm text-[#234236] outline-none transition placeholder:text-[#a2b2aa] focus:border-[#4c9b70] focus:bg-white focus:ring-4 focus:ring-[#4c9b70]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#236b4c] px-4 py-3.5 text-sm font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#1b5b40] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Memproses...
                    </span>
                  ) : (
                    "Daftar"
                  )}
                </button>
              </form>

              <div className="mt-8 border-t border-[#edf2ef] pt-6 text-center space-y-3">
                <p className="text-sm text-[#7b8e83]">
                  Sudah punya akun?{" "}
                  <a
                    href="/login"
                    className="font-semibold text-[#236b4c] transition hover:text-[#1b5b40]"
                  >
                    Masuk di sini
                  </a>
                </p>

                <a
                  href="/"
                  className="block text-sm font-medium text-[#5f796b] transition hover:text-[#236b4c]"
                >
                  ← Kembali ke Beranda
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
