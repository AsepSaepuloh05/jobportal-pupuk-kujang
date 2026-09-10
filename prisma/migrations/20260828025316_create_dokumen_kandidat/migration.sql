-- CreateEnum
CREATE TYPE "jenis_dokumen" AS ENUM ('CV', 'KTP', 'IJAZAH', 'TRANSKRIP');

-- CreateTable
CREATE TABLE "dokumen_kandidat" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jenisDokumen" "jenis_dokumen" NOT NULL,
    "namaFile" TEXT NOT NULL,
    "namaAsli" TEXT NOT NULL,
    "pathFile" TEXT NOT NULL,
    "tipeFile" TEXT NOT NULL,
    "ukuranFile" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dokumen_kandidat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dokumen_kandidat_userId_jenisDokumen_key" ON "dokumen_kandidat"("userId", "jenisDokumen");

-- AddForeignKey
ALTER TABLE "dokumen_kandidat" ADD CONSTRAINT "dokumen_kandidat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
