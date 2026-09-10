/*
  Warnings:

  - You are about to drop the `Lowongan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "role" AS ENUM ('KANDIDAT', 'HR');

-- CreateEnum
CREATE TYPE "status_lowongan" AS ENUM ('AKTIF', 'DRAFT', 'DITUTUP');

-- DropTable
DROP TABLE "Lowongan";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "StatusLowongan";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nama" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "role" NOT NULL DEFAULT 'KANDIDAT',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lowongan" (
    "id" SERIAL NOT NULL,
    "posisi" TEXT NOT NULL,
    "departemen" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "status" "status_lowongan" NOT NULL DEFAULT 'DRAFT',
    "pelamar" INTEGER NOT NULL DEFAULT 0,
    "deskripsi" TEXT,
    "persyaratan" TEXT,
    "gaji" TEXT,
    "tanggalBerakhir" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lowongan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_nik_key" ON "user"("nik");
