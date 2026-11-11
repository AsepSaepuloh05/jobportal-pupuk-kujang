import { bacaSesi, type PeranSesi, type Sesi } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export interface IdentitasPengguna {
    userId: string | undefined;
    userRole: PeranSesi | undefined;
}

/**
 * Membaca sesi dari token bertanda tangan DAN memvalidasinya ke database.
 *
 * Token JWT saja tidak cukup karena berlaku 24 jam dan tidak bisa dicabut.
 * Sesi dianggap tidak valid jika:
 * - user sudah dihapus,
 * - akun dinonaktifkan (isActive = false),
 * - role di database berbeda dengan role di token,
 * - tokenVersion di database sudah naik (password diganti/direset).
 *
 * Tidak dipakai di proxy.ts (proxy hanya memeriksa tanda tangan token).
 */
export async function bacaSesiValid(): Promise<Sesi | null> {
    const sesi = await bacaSesi();

    if (!sesi) return null;

    const user = await prisma.user.findUnique({
        where: { id: sesi.userId },
        select: { role: true, isActive: true, tokenVersion: true },
    });

    if (!user) return null;
    if (!user.isActive) return null;
    if (user.role !== sesi.role) return null;
    if (user.tokenVersion !== sesi.versi) return null;

    return sesi;
}

/**
 * Mengambil identitas pengguna dari sesi bertanda tangan (JWT) yang
 * sudah divalidasi ke database, BUKAN dari cookie biasa yang bisa
 * diubah sendiri oleh pengguna.
 *
 * Bentuk keluarannya sengaja sama dengan pola lama
 * (userId string, userRole) agar logika di tiap route tidak berubah.
 * Jika sesi tidak ada / tidak valid / kedaluwarsa / dicabut, keduanya undefined.
 */
export async function bacaIdentitas(): Promise<IdentitasPengguna> {
    const sesi = await bacaSesiValid();

    if (!sesi) {
        return { userId: undefined, userRole: undefined };
    }

    return {
        userId: String(sesi.userId),
        userRole: sesi.role,
    };
}
