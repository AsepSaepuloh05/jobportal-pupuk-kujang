-- CreateTable
CREATE TABLE "pendidikan" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jenjang" TEXT NOT NULL,
    "institusi" TEXT NOT NULL,
    "jurusan" TEXT NOT NULL,
    "tahunMulai" TEXT NOT NULL,
    "tahunSelesai" TEXT NOT NULL,
    "nilai" TEXT,
    "ijazahNamaFile" TEXT,
    "ijazahNamaAsli" TEXT,
    "ijazahPathFile" TEXT,
    "ijazahTipeFile" TEXT,
    "ijazahUkuranFile" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengalaman" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "posisi" TEXT NOT NULL,
    "perusahaan" TEXT NOT NULL,
    "lokasi" TEXT,
    "tahunMulai" TEXT NOT NULL,
    "tahunSelesai" TEXT,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengalaman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sertifikasi" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "penerbit" TEXT NOT NULL,
    "nomor" TEXT,
    "tanggalTerbit" TEXT,
    "tanggalKadaluarsa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sertifikasi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pendidikan" ADD CONSTRAINT "pendidikan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengalaman" ADD CONSTRAINT "pengalaman_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikasi" ADD CONSTRAINT "sertifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
