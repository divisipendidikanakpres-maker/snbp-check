-- CreateEnum
CREATE TYPE "LevelKeketatan" AS ENUM ('SANGAT_KETAT', 'KETAT', 'SEDANG', 'TERBUKA');

-- AlterTable
ALTER TABLE "universitas" ADD COLUMN     "ranking" INTEGER;
ALTER TABLE "universitas" DROP COLUMN "jumlahProdi";
ALTER TABLE "universitas" DROP COLUMN "nilaiRataRata";

-- CreateTable
CREATE TABLE "kelompok" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "kelompok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenjang" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "jenjang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prodi" (
    "id" TEXT NOT NULL,
    "programStudi" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "levelKeketatan" "LevelKeketatan" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "universitasId" TEXT NOT NULL,
    "kelompokId" TEXT NOT NULL,
    "jenjangId" TEXT NOT NULL,

    CONSTRAINT "prodi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kelompok_nama_key" ON "kelompok"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "jenjang_nama_key" ON "jenjang"("nama");

-- AddForeignKey
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_universitasId_fkey" FOREIGN KEY ("universitasId") REFERENCES "universitas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_kelompokId_fkey" FOREIGN KEY ("kelompokId") REFERENCES "kelompok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_jenjangId_fkey" FOREIGN KEY ("jenjangId") REFERENCES "jenjang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
