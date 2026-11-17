/**
 * Pindahkan berkas lama dari folder PUBLIK (public/uploads/...) ke folder
 * PRIVAT (uploads/...) dan perbarui path di database dari
 *   /uploads/<folder>/<file>  ->  /api/berkas/<folder>/<file>
 *
 * Berkas di public/ bisa dibuka siapa pun tanpa login lewat URL langsung.
 *
 * Pemakaian:
 *   npx tsx prisma/migrate-berkas-lama.ts            (dry-run, tidak mengubah apa pun)
 *   npx tsx prisma/migrate-berkas-lama.ts --apply    (pindahkan file + update DB)
 *
 * Aman dijalankan ulang. File tidak pernah ditimpa: jika tujuan sudah ada,
 * file dilewati dan dilaporkan.
 */
import "dotenv/config";

import path from "path";
import { promises as fs } from "fs";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const APPLY = process.argv.includes("--apply");

const SUMBER = path.join(process.cwd(), "public", "uploads");
const TUJUAN = path.join(process.cwd(), "uploads");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function daftarFile(dir: string): Promise<string[]> {
    let entri;
    try {
        entri = await fs.readdir(dir, { withFileTypes: true });
    } catch {
        return [];
    }

    const hasil: string[] = [];

    for (const e of entri) {
        const penuh = path.join(dir, e.name);
        if (e.isDirectory()) {
            hasil.push(...(await daftarFile(penuh)));
        } else if (e.isFile()) {
            hasil.push(penuh);
        }
    }

    return hasil;
}

async function pindahkanFile() {
    const files = await daftarFile(SUMBER);
    let dipindah = 0;
    let dilewati = 0;

    for (const asal of files) {
        const relatif = path.relative(SUMBER, asal);
        const tujuan = path.join(TUJUAN, relatif);

        try {
            await fs.access(tujuan);
            console.log(`  LEWATI (tujuan sudah ada): ${relatif}`);
            dilewati++;
            continue;
        } catch {
            // tujuan belum ada -> lanjut
        }

        console.log(`  ${APPLY ? "PINDAH" : "akan pindah"}: ${relatif}`);

        if (APPLY) {
            await fs.mkdir(path.dirname(tujuan), { recursive: true });
            // copy + hapus (rename bisa gagal antar-drive di Windows)
            await fs.copyFile(asal, tujuan);
            await fs.unlink(asal);
        }

        dipindah++;
    }

    console.log(
        `File: ${dipindah} ${APPLY ? "dipindahkan" : "akan dipindahkan"}, ${dilewati} dilewati.`
    );
}

function pathBaru(lama: string) {
    return lama.replace(/^\/uploads\//, "/api/berkas/");
}

async function perbaruiDatabase() {
    const awalan = { startsWith: "/uploads/" };
    let total = 0;

    const tugas: Array<{
        nama: string;
        ambil: () => Promise<Array<{ id: number; nilai: string }>>;
        simpan: (id: number, nilai: string) => Promise<unknown>;
    }> = [
        {
            nama: "dokumen_profil.pathFile",
            ambil: async () =>
                (await prisma.dokumenProfil.findMany({
                    where: { pathFile: awalan },
                    select: { id: true, pathFile: true },
                })).map((r) => ({ id: r.id, nilai: r.pathFile })),
            simpan: (id, nilai) =>
                prisma.dokumenProfil.update({ where: { id }, data: { pathFile: nilai } }),
        },
        {
            nama: "dokumen_kandidat.pathFile",
            ambil: async () =>
                (await prisma.dokumenKandidat.findMany({
                    where: { pathFile: awalan },
                    select: { id: true, pathFile: true },
                })).map((r) => ({ id: r.id, nilai: r.pathFile })),
            simpan: (id, nilai) =>
                prisma.dokumenKandidat.update({ where: { id }, data: { pathFile: nilai } }),
        },
        {
            nama: "pendidikan.ijazahPathFile",
            ambil: async () =>
                (await prisma.pendidikan.findMany({
                    where: { ijazahPathFile: awalan },
                    select: { id: true, ijazahPathFile: true },
                })).map((r) => ({ id: r.id, nilai: r.ijazahPathFile as string })),
            simpan: (id, nilai) =>
                prisma.pendidikan.update({ where: { id }, data: { ijazahPathFile: nilai } }),
        },
        {
            nama: "pendidikan.transkripPathFile",
            ambil: async () =>
                (await prisma.pendidikan.findMany({
                    where: { transkripPathFile: awalan },
                    select: { id: true, transkripPathFile: true },
                })).map((r) => ({ id: r.id, nilai: r.transkripPathFile as string })),
            simpan: (id, nilai) =>
                prisma.pendidikan.update({ where: { id }, data: { transkripPathFile: nilai } }),
        },
        {
            nama: "pengalaman.paklaringPathFile",
            ambil: async () =>
                (await prisma.pengalaman.findMany({
                    where: { paklaringPathFile: awalan },
                    select: { id: true, paklaringPathFile: true },
                })).map((r) => ({ id: r.id, nilai: r.paklaringPathFile as string })),
            simpan: (id, nilai) =>
                prisma.pengalaman.update({ where: { id }, data: { paklaringPathFile: nilai } }),
        },
        {
            nama: "sertifikasi.sertifikatPathFile",
            ambil: async () =>
                (await prisma.sertifikasi.findMany({
                    where: { sertifikatPathFile: awalan },
                    select: { id: true, sertifikatPathFile: true },
                })).map((r) => ({ id: r.id, nilai: r.sertifikatPathFile as string })),
            simpan: (id, nilai) =>
                prisma.sertifikasi.update({ where: { id }, data: { sertifikatPathFile: nilai } }),
        },
    ];

    for (const t of tugas) {
        const baris = await t.ambil();

        console.log(`${t.nama}: ${baris.length} baris memakai path lama`);

        for (const r of baris) {
            if (APPLY) {
                await t.simpan(r.id, pathBaru(r.nilai));
            }
        }

        total += baris.length;
    }

    console.log(
        `Database: ${total} path ${APPLY ? "diperbarui" : "akan diperbarui"}.`
    );
}

async function main() {
    console.log(
        APPLY
            ? "MODE APPLY: file dipindahkan dan database diperbarui.\n"
            : "MODE DRY-RUN: tidak ada perubahan. Tambahkan --apply untuk menjalankan.\n"
    );

    console.log("== Berkas ==");
    await pindahkanFile();

    console.log("\n== Database ==");
    await perbaruiDatabase();
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

