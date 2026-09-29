/*
  Warnings:

  - You are about to drop the column `nilai` on the `pendidikan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pendidikan" DROP COLUMN "nilai",
ADD COLUMN     "ipk" DOUBLE PRECISION,
ALTER COLUMN "tahunMulai" SET DATA TYPE TEXT,
ALTER COLUMN "tahunSelesai" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "sertifikasi" ALTER COLUMN "tanggalTerbit" SET DATA TYPE TEXT,
ALTER COLUMN "tanggalKadaluarsa" SET DATA TYPE TEXT;
