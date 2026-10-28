/**
 * In-memory Rate Limiter dengan pembersihan otomatis.
 *
 * Mencegah serangan brute-force (password guessing) dan
 * request spam (DoS / pendaftaran massal) tanpa dependensi eksternal.
 */

interface LimitRecord {
    count: number;
    resetAt: number; // timestamp ms saat batas di-reset
}

// Map penyimpanan di memory proses Node.js
const storage = new Map<string, LimitRecord>();

// Bersihkan data lama secara berkala setiap 5 menit agar memori tidak bocor
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

    lastCleanup = now;
    for (const [key, record] of storage.entries()) {
        if (now > record.resetAt) {
            storage.delete(key);
        }
    }
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
}

/**
 * Memeriksa dan mencatat percobaan request.
 *
 * @param key Identifier unik (misal: "login:ip:127.0.0.1" atau "login:email:user@mail.com")
 * @param maxAttempts Jumlah maksimal percobaan yang diizinkan
 * @param windowSeconds Durasi jendela waktu (dalam detik)
 */
export function checkRateLimit(
    key: string,
    maxAttempts: number,
    windowSeconds: number
): RateLimitResult {
    cleanupExpired();

    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const record = storage.get(key);

    // Belum pernah request atau window sudah kedaluwarsa -> reset
    if (!record || now > record.resetAt) {
        storage.set(key, {
            count: 1,
            resetAt: now + windowMs,
        });

        return {
            allowed: true,
            remaining: maxAttempts - 1,
            retryAfterSeconds: 0,
        };
    }

    // Jika sudah melebihi batas
    if (record.count >= maxAttempts) {
        const retryAfterSeconds = Math.max(
            1,
            Math.ceil((record.resetAt - now) / 1000)
        );

        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds,
        };
    }

    // Masih dalam batas yang diizinkan -> tambah counter
    record.count += 1;
    return {
        allowed: true,
        remaining: maxAttempts - record.count,
        retryAfterSeconds: 0,
    };
}

/**
 * Reset counter rate limit (misal saat user berhasil login,
 * percobaan salah sebelumnya langsung dihapus).
 */
export function resetRateLimit(key: string): void {
    storage.delete(key);
}

/**
 * Mengambil IP klien dari header request secara aman.
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        // Ambil IP klien pertama jika di belakang proxy/load balancer
        const first = forwarded.split(",")[0]?.trim();
        if (first) return first;
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    return "127.0.0.1";
}
