-- AlterTable
ALTER TABLE "lowongan" ADD COLUMN     "desaDiizinkan" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "filterDomisiliAktif" BOOLEAN NOT NULL DEFAULT false;
