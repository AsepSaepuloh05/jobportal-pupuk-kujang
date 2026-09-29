/*
  Warnings:

  - Made the column `tahunSelesai` on table `pengalaman` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "pengalaman" ALTER COLUMN "tahunSelesai" SET NOT NULL;
