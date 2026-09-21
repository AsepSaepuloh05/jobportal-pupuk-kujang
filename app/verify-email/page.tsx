"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, ArrowLeft, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError("Email tidak ditemukan. Silakan melakukan registrasi kembali.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP harus terdiri dari 6 digit.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Verifikasi OTP gagal.");
        return;
      }

      setMessage(
        "Email berhasil diverifikasi. Mengarahkan ke halaman login..."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error) {
      console.error(error);
      setError("Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    setError("");
    setMessage("");
    setResending(true);

    try {
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal mengirim ulang OTP.");
        return;
      }

      setMessage("OTP baru berhasil dikirim ke email Anda.");
      setCountdown(60);
      setOtp("");
    } catch (error) {
      console.error(error);
      setError("Terjadi kesalahan saat mengirim ulang OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#3e9d70] px-6 py-8 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <MailCheck size={34} />
            </div>

            <h1 className="text-2xl font-bold">
              Verifikasi Email
            </h1>

            <p className="mt-2 text-sm text-green-50">
              Masukkan kode OTP yang telah dikirim ke email Anda
            </p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-500">
                Kode verifikasi dikirim ke:
              </p>

              <p className="mt-1 font-semibold text-gray-800 break-all">
                {email || "-"}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            <form onSubmit={handleVerify}>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Kode OTP
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Masukkan 6 digit OTP"
                className="w-full rounded-xl border border-gray-300 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none transition focus:border-[#3e9d70] focus:ring-2 focus:ring-green-100"
              />

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3e9d70] px-4 py-3.5 font-semibold text-white transition hover:bg-[#348a61] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Memverifikasi...
                  </>
                ) : (
                  "Verifikasi Email"
                )}
              </button>
            </form>

            {/* Resend */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Tidak menerima kode?
              </p>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending || countdown > 0}
                className="mt-2 text-sm font-semibold text-[#3e9d70] hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
              >
                {resending
                  ? "Mengirim..."
                  : countdown > 0
                  ? `Kirim ulang dalam ${countdown} detik`
                  : "Kirim Ulang OTP"}
              </button>
            </div>

            {/* Back */}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#3e9d70]"
            >
              <ArrowLeft size={16} />
              Kembali ke Registrasi
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}