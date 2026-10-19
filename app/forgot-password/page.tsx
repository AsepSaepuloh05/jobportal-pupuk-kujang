// Letakkan di: app/forgot-password/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, X } from "lucide-react";

import { PASSWORD_RULES, validatePassword } from "@/lib/password";

const RESEND_SECONDS = 60;

const inputClass =
  "w-full rounded-xl border border-[#dce9e1] bg-[#f9fcfa] px-4 py-3 text-sm text-[#234236] outline-none transition placeholder:text-[#a2b2aa] focus:border-[#4c9b70] focus:bg-white focus:ring-4 focus:ring-[#4c9b70]/10 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "mb-2 block text-sm font-semibold text-[#234236]";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<"request" | "reset">("request");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [success, setSuccess] = useState(false);

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // ==============================================
  // STEP 1: MINTA OTP
  // ==============================================

  const requestOtp = async () => {
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Gagal mengirim kode OTP");
        return false;
      }

      setInfo(data.message);
      setCountdown(RESEND_SECONDS);

      return true;
    } catch (err) {
      console.error("FORGOT PASSWORD ERROR:", err);
      setError("Tidak dapat terhubung ke server.");

      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    if (await requestOtp()) {
      setStep("reset");
    }
  };

  // ==============================================
  // STEP 2: RESET PASSWORD
  // ==============================================

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Kode OTP harus 6 digit angka");
      return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp,
          password,
          confirmPassword,
        }),
      });

      let data;

      try {
        data = await res.json();
      } catch {
        setError(
          `Server mengembalikan respons tidak valid (status ${res.status}). Cek terminal npm run dev.`
        );
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.message || "Gagal mereset password");
        return;
      }

      setSuccess(true);

      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      console.error("RESET PASSWORD ERROR:", err);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const confirmMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f8f5] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(44,105,76,0.12)] sm:p-10">
        <div className="mb-8 flex justify-center">
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

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#234236]">
            Lupa Password
          </h1>

          <p className="mt-2 text-sm text-[#7b8e83]">
            {step === "request"
              ? "Masukkan email akun Anda untuk menerima kode OTP"
              : `Masukkan kode OTP yang dikirim ke ${email} dan buat password baru`}
          </p>
        </div>

        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-700">
            Password berhasil direset. Mengalihkan ke halaman login...
          </div>
        ) : step === "request" ? (
          // ================= STEP 1 =================
          <form onSubmit={handleRequest} className="space-y-5">
            <div>
              <label htmlFor="email" className={labelClass}>
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
                className={inputClass}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#236b4c] px-4 py-3.5 text-sm font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#1b5b40] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? "Mengirim..." : "Kirim Kode OTP"}
            </button>
          </form>
        ) : (
          // ================= STEP 2 =================
          <form onSubmit={handleReset} className="space-y-5">
            {info && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {info}
              </div>
            )}

            <div>
              <label htmlFor="otp" className={labelClass}>
                Kode OTP
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6 digit kode OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                maxLength={6}
                disabled={loading}
                className={`${inputClass} text-center text-lg tracking-[0.5em]`}
              />

              <div className="mt-2 text-right text-xs">
                {countdown > 0 ? (
                  <span className="text-[#7b8e83]">
                    Kirim ulang kode dalam {countdown} detik
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={requestOtp}
                    disabled={loading}
                    className="font-semibold text-[#236b4c] hover:text-[#1b5b40] disabled:opacity-60"
                  >
                    Kirim ulang kode
                  </button>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password Baru
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password baru"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className={`${inputClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  disabled={loading}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Lihat password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#7b8e83] transition hover:bg-[#eaf4ee] hover:text-[#236b4c]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <ul className="mt-3 space-y-1.5 rounded-xl bg-[#f4faf6] px-4 py-3">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  const touched = password.length > 0;

                  return (
                    <li
                      key={rule.id}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        passed
                          ? "text-[#236b4c]"
                          : touched
                            ? "text-red-500"
                            : "text-[#7b8e83]"
                      }`}
                    >
                      {passed ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <X size={14} strokeWidth={3} />
                      )}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Konfirmasi Password Baru
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className={`${inputClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  disabled={loading}
                  aria-label={
                    showConfirm
                      ? "Sembunyikan konfirmasi password"
                      : "Lihat konfirmasi password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#7b8e83] transition hover:bg-[#eaf4ee] hover:text-[#236b4c]"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {confirmMismatch && (
                <p className="mt-2 text-xs text-red-500">
                  Konfirmasi password tidak cocok
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#236b4c] px-4 py-3.5 text-sm font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#1b5b40] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? "Memproses..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("request");
                setError("");
                setInfo("");
                setOtp("");
              }}
              disabled={loading}
              className="w-full text-center text-sm font-medium text-[#5f796b] transition hover:text-[#236b4c]"
            >
              ← Ubah email
            </button>
          </form>
        )}

        <div className="mt-8 border-t border-[#edf2ef] pt-6 text-center">
          <a
            href="/login"
            className="text-sm font-semibold text-[#236b4c] transition hover:text-[#1b5b40]"
          >
            ← Kembali ke Login
          </a>
        </div>
      </div>
    </main>
  );
}