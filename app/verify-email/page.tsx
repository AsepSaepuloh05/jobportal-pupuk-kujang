"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MailCheck,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

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
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Verifikasi OTP gagal.");
        return;
      }

      setMessage("Email berhasil diverifikasi. Mengarahkan ke halaman login...");

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
        body: JSON.stringify({ email }),
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
    <main className="relative flex min-h-screen items-center justify-center bg-[#f5faf7] px-4 py-6">
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#bde4cf]/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#d9efe3]/60 blur-3xl" />

      <div className="relative w-full max-w-[420px]">
        {/* Brand */}
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#3e9d70]">
            <ShieldCheck size={19} className="text-white" />
          </div>

          <p className="text-[10px] font-extrabold uppercase tracking-[2px] text-[#3e9d70]">
            SIO Karir
          </p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-[22px] border border-[#e2eee7] bg-white shadow-[0_20px_50px_rgba(35,75,56,0.10)]">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#3e9d70] to-[#348b62] px-6 py-6 text-center text-white">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[15px] bg-white/15">
              <MailCheck size={27} strokeWidth={1.8} />
            </div>

            <h1 className="text-[21px] font-black">
              Verifikasi Email
            </h1>

            <p className="mx-auto mt-1.5 max-w-[290px] text-xs leading-5 text-green-50/90">
              Masukkan kode verifikasi yang telah kami kirimkan ke email Anda.
            </p>
          </div>

          {/* Content */}
          <div className="px-5 py-5 sm:px-7">
            {/* Email */}
            <div className="mb-5 rounded-xl border border-[#e2eee7] bg-[#f7fbf8] px-3 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8a9b92]">
                Kode dikirim ke
              </p>

              <p className="mt-1 break-all text-xs font-bold text-[#234236]">
                {email || "-"}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                <p className="text-[11px] font-medium leading-4 text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="mb-4 flex gap-2.5 rounded-xl border border-green-100 bg-green-50 px-3 py-2.5">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-[#3e9d70]"
                />
                <p className="text-[11px] font-medium leading-4 text-[#327a58]">
                  {message}
                </p>
              </div>
            )}

            <form onSubmit={handleVerify}>
              <label
                htmlFor="otp"
                className="mb-2 block text-center text-xs font-bold text-[#29483a]"
              >
                Masukkan Kode OTP
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
                placeholder="000000"
                autoFocus
                className="h-[58px] w-full rounded-xl border border-[#dce9e1] bg-[#fbfdfc] px-4 text-center text-[24px] font-black tracking-[0.4em] text-[#234236] outline-none transition placeholder:text-[#c8d5ce] focus:border-[#3e9d70] focus:bg-white focus:ring-4 focus:ring-[#3e9d70]/10"
              />

              <p className="mt-2 text-center text-[10px] text-[#8a9b92]">
                OTP terdiri dari 6 digit dan berlaku selama 5 menit.
              </p>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#3e9d70] text-xs font-bold text-white transition hover:bg-[#348b62] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <MailCheck size={17} />
                    Verifikasi Email
                  </>
                )}
              </button>
            </form>

            {/* Resend */}
            <div className="mt-5 border-t border-[#edf2ef] pt-4 text-center">
              <p className="text-[10px] text-[#8a9b92]">
                Tidak menerima kode?
              </p>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending || countdown > 0}
                className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#3e9d70] hover:text-[#2e8059] disabled:cursor-not-allowed disabled:text-[#aab9b1]"
              >
                {resending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Mengirim OTP...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <RefreshCw size={13} />
                    Kirim ulang dalam {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw size={13} />
                    Kirim Ulang OTP
                  </>
                )}
              </button>
            </div>

            {/* Back */}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="mx-auto mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#84948c] hover:text-[#3e9d70]"
            >
              <ArrowLeft size={14} />
              Kembali ke Registrasi
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-[9px] text-[#9aaaa1]">
          © {new Date().getFullYear()} SIO Karir
        </p>
      </div>
    </main>
  );
}
