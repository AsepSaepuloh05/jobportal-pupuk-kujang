-- CreateTable
CREATE TABLE "lamaran_tahapan" (
    "id" SERIAL NOT NULL,
    "lamaranId" INTEGER NOT NULL,
    "tahapan" "tahapan_seleksi" NOT NULL,
    "urutan" INTEGER NOT NULL,
    "selesaiPada" TIMESTAMP(3),

    CONSTRAINT "lamaran_tahapan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lamaran_tahapan_lamaranId_tahapan_key" ON "lamaran_tahapan"("lamaranId", "tahapan");

-- AddForeignKey
ALTER TABLE "lamaran_tahapan" ADD CONSTRAINT "lamaran_tahapan_lamaranId_fkey" FOREIGN KEY ("lamaranId") REFERENCES "lamaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;
