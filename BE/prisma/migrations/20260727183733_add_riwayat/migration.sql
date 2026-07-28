-- CreateTable
CREATE TABLE "riwayat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sekolahId" TEXT,
    "sekolahNama" TEXT NOT NULL,
    "universitasId" TEXT NOT NULL,
    "universitasNama" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,
    "prodiNama" TEXT NOT NULL,
    "avgRapor" DOUBLE PRECISION NOT NULL,
    "avgTKA" DOUBLE PRECISION,
    "nilaiAkhir" DOUBLE PRECISION NOT NULL,
    "persentase" INTEGER NOT NULL,
    "selisih" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "riwayat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "riwayat" ADD CONSTRAINT "riwayat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
