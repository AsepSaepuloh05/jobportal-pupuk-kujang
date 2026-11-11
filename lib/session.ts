import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const NAMA_COOKIE_SESI = "session";

const DURASI_DETIK = 60 * 60 * 24; // 24 jam

export type PeranSesi = "HR" | "KANDIDAT";

export interface Sesi {
    userId: number;
    role: PeranSesi;
    /**
     * Versi sesi (User.tokenVersion) saat token dibuat. Jika tokenVersion
     * di database sudah naik (password diganti/direset), token ini dianggap
     * dicabut. Token lama tanpa klaim ini dianggap versi 0.
     */
    versi: number;
}

function ambilKunci() {
    const rahasia = process.env.SESSION_SECRET;

    if (!rahasia || rahasia.length < 32) {
        throw new Error(
            "SESSION_SECRET belum diatur di .env atau kurang dari 32 karakter"
        );
    }

    return new TextEncoder().encode(rahasia);
}

export async function buatTokenSesi(sesi: Sesi) {
    return new SignJWT({ role: sesi.role, tv: sesi.versi })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(sesi.userId))
        .setIssuedAt()
        .setExpirationTime(DURASI_DETIK + "s")
        .sign(ambilKunci());
}

/**
 * Hanya memverifikasi tanda tangan & masa berlaku token (tanpa database,
 * aman dipakai di proxy). Pengecekan status akun/role/versi ada di
 * bacaSesiValid() pada lib/auth.ts.
 */
export async function verifikasiTokenSesi(
    token: string
): Promise<Sesi | null> {
    const kunci = ambilKunci();

    try {
        const { payload } = await jwtVerify(token, kunci, {
            algorithms: ["HS256"],
        });

        const userId = Number(payload.sub);
        const role = payload.role;
        const versi =
            typeof payload.tv === "number" && Number.isInteger(payload.tv)
                ? payload.tv
                : 0;

        if (!Number.isInteger(userId) || userId <= 0) return null;
        if (role !== "HR" && role !== "KANDIDAT") return null;

        return { userId, role, versi };
    } catch {
        return null;
    }
}

export async function bacaSesi(): Promise<Sesi | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(NAMA_COOKIE_SESI)?.value;

    if (!token) return null;

    return verifikasiTokenSesi(token);
}

export function opsiCookieSesi() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: DURASI_DETIK,
    };
}
