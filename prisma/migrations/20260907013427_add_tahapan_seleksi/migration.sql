/*
  Warnings:

  - You are about to drop the column `gaji` on the `lowongan` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "tahapan_seleksi" AS ENUM ('SCREENING', 'ASSESSMENT', 'INTERVIEW', 'TECHNICAL_TEST', 'MCU', 'OFFERING');

-- AlterTable
ALTER TABLE "lowongan" DROP COLUMN "gaji",
ADD COLUMN     "gajiMax" INTEGER,
ADD COLUMN     "gajiMin" INTEGER,
ADD COLUMN     "kategori" TEXT,
ADD COLUMN     "pendidikan" TEXT,
ADD COLUMN     "pengalaman" TEXT,
ADD COLUMN     "tahapanSeleksi" "tahapan_seleksi"[] DEFAULT ARRAY['SCREENING', 'ASSESSMENT', 'INTERVIEW', 'TECHNICAL_TEST', 'MCU', 'OFFERING']::"tahapan_seleksi"[],
ADD COLUMN     "tanggungJawab" TEXT;
