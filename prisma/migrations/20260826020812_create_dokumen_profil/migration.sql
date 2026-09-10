-- CreateTable
CREATE TABLE "dokumen_profil" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "namaFile" TEXT NOT NULL,
    "namaAsli" TEXT NOT NULL,
    "pathFile" TEXT NOT NULL,
    "tipeFile" TEXT NOT NULL,
    "ukuranFile" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dokumen_profil_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dokumen_profil_userId_key" ON "dokumen_profil"("userId");

-- AddForeignKey
ALTER TABLE "dokumen_profil" ADD CONSTRAINT "dokumen_profil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
