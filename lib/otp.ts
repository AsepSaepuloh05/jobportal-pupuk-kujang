import { createHmac, timingSafeEqual } from "crypto";

/** Batas salah tebak per OTP. Ditegakkan secara atomik di database. */
export const MAKS_PERCOBAAN_OTP = 5;

function ambilKunciOtp() {
    const rahasia = process.env.OTP_SECRET || process.env.SESSION_SECRET;

    if (!rahasia || rahasia.length < 32) {
        throw new Error(
            "OTP_SECRET atau SESSION_SECRET belum diatur di .env atau kurang dari 32 karakter"
        );
    }

    return rahasia;
}

/**
 * Hash OTP dengan HMAC-SHA256 yang terikat ke email.
 *
 * OTP hanya 6 digit (1 juta kemungkinan), jadi SHA-256 polos bisa dibalik
 * seketika jika database bocor. Dengan HMAC, penyerang juga butuh secret
 * di server. Mengikat email mencegah hash dipakai ulang untuk akun lain.
 */
export function hashOtp(email: string, otp: string) {
    return createHmac("sha256", ambilKunciOtp())
        .update(`otp:v1:${email}:${otp}`)
        .digest("hex");
}

export function hashOtpSama(a: string, b: string) {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

