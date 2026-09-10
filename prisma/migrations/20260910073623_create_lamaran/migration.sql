-- CreateEnum
CREATE TYPE "status_lamaran" AS ENUM ('DIPROSES', 'INTERVIEW', 'LOLOS', 'DITOLAK');

-- CreateTable
CREATE TABLE "lamaran" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "lowonganId" INTEGER NOT NULL,
    "status" "status_lamaran" NOT NULL DEFAULT 'DIPROSES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lamaran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lamaran_userId_lowonganId_key" ON "lamaran"("userId", "lowonganId");

-- AddForeignKey
ALTER TABLE "lamaran" ADD CONSTRAINT "lamaran_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lamaran" ADD CONSTRAINT "lamaran_lowonganId_fkey" FOREIGN KEY ("lowonganId") REFERENCES "lowongan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
