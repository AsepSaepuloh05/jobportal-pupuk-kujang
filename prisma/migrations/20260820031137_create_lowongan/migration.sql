-- CreateEnum
CREATE TYPE "StatusLowongan" AS ENUM ('AKTIF', 'DRAFT', 'DITUTUP');

-- CreateTable
CREATE TABLE "Lowongan" (
    "id" SERIAL NOT NULL,
    "posisi" TEXT NOT NULL,
    "departemen" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "status" "StatusLowongan" NOT NULL DEFAULT 'DRAFT',
    "pelamar" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lowongan_pkey" PRIMARY KEY ("id")
);
