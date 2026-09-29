/*
  Warnings:

  - The `tahunSelesai` column on the `pengalaman` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tanggalTerbit` column on the `sertifikasi` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tanggalKadaluarsa` column on the `sertifikasi` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `tahunMulai` on the `pendidikan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tahunSelesai` on the `pendidikan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tahunMulai` on the `pengalaman` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "pendidikan" DROP COLUMN "tahunMulai",
ADD COLUMN     "tahunMulai" INTEGER NOT NULL,
DROP COLUMN "tahunSelesai",
ADD COLUMN     "tahunSelesai" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "pengalaman" DROP COLUMN "tahunMulai",
ADD COLUMN     "tahunMulai" INTEGER NOT NULL,
DROP COLUMN "tahunSelesai",
ADD COLUMN     "tahunSelesai" INTEGER;

-- AlterTable
ALTER TABLE "sertifikasi" DROP COLUMN "tanggalTerbit",
ADD COLUMN     "tanggalTerbit" TIMESTAMP(3),
DROP COLUMN "tanggalKadaluarsa",
ADD COLUMN     "tanggalKadaluarsa" TIMESTAMP(3);
