import { bacaSesi, type PeranSesi } from "@/lib/session";

export interface IdentitasPengguna {
    userId: string | undefined;
    userRole: PeranSesi | undefined;
}

/**
 * Mengambil identitas pengguna dari sesi bertanda tangan (JWT),
 * BUKAN dari cookie biasa yang bisa diubah sendiri oleh pengguna.
 *
 * Bentuk keluarannya sengaja sama dengan pola lama
 * (userId string, userRole) agar logika di tiap route tidak berubah.
 * Jika sesi tidak ada / tidak valid / kedaluwarsa, keduanya undefined.
 */
export async function bacaIdentitas(): Promise<IdentitasPengguna> {
    const sesi = await bacaSesi();

    if (!sesi) {
        return { userId: undefined, userRole: undefined };
    }

    return {
        userId: String(sesi.userId),
        userRole: sesi.role,
    };
}
