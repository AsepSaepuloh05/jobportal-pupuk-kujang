-- CreateEnum
CREATE TYPE "tipe_email" AS ENUM ('UNDANGAN', 'HASIL_LOLOS', 'HASIL_DITOLAK', 'BEBAS');

-- CreateEnum
CREATE TYPE "status_email" AS ENUM ('TERKIRIM', 'GAGAL');

-- AlterTable
ALTER TABLE "lamaran_tahapan" ADD COLUMN     "jadwalCatatan" TEXT,
ADD COLUMN     "jadwalLokasi" TEXT,
ADD COLUMN     "jadwalTanggal" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "email_log" (
    "id" SERIAL NOT NULL,
    "lamaranId" INTEGER NOT NULL,
    "tipe" "tipe_email" NOT NULL,
    "tahapan" TEXT,
    "penerima" TEXT NOT NULL,
    "subjek" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "status" "status_email" NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_lamaranId_fkey" FOREIGN KEY ("lamaranId") REFERENCES "lamaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;
