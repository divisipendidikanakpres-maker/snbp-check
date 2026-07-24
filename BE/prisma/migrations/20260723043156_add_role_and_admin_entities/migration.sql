-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "universitas" (
    "id" TEXT NOT NULL,
    "namaUniversitas" TEXT NOT NULL,
    "singkatan" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "jumlahProdi" INTEGER NOT NULL DEFAULT 0,
    "nilaiRataRata" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sekolah" (
    "id" TEXT NOT NULL,
    "namaSekolah" TEXT NOT NULL,
    "akreditasi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sekolah_pkey" PRIMARY KEY ("id")
);
