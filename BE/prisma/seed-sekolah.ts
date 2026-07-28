import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extracted from FE/lib/data-sekolah.ts - only namaSekolah, akreditasi fields
const SEKOLAH_DATA = [
  { namaSekolah: "SMAN 15 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 22 KOTA BEKASI", akreditasi: "B" as const },
  { namaSekolah: "SMKN 2 KOTA BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMKN 1 KOTA BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 12 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 8 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMKN 9 KOTA BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 2 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 3 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 17 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 1 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMKN 6 KOTA BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 18 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMKN 5 KOTA BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMKN 11 BEKASI", akreditasi: "B" as const },
  { namaSekolah: "SMA NEGERI 20 KOTA BEKASI", akreditasi: "B" as const },
  { namaSekolah: "SMAN 4 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 14 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMKN 4 KOTA BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMK NEGERI 14 KOTA BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 7 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMKN 7 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 6 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 11 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMK NEGERI 13 KOTA BEKASI", akreditasi: "C" as const },
  { namaSekolah: "SMAN 10 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 19 KOTA BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMK NEGERI 15 KOTA BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMKN 3 KOTA BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 9 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMKN 10 KOTA BEKASI", akreditasi: "B" as const },
  { namaSekolah: "SMAN 16 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 5 BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMA NEGERI 21 KOTA BEKASI", akreditasi: "B" as const },
  { namaSekolah: "SMK NEGERI 12 KOTA BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMKN 8 KOTA BEKASI", akreditasi: "A" as const },
  { namaSekolah: "SMAN 13 BEKASI", akreditasi: "A" as const },
];

async function main() {
  console.log('Seeding sekolah...');

  for (const data of SEKOLAH_DATA) {
    const existing = await prisma.sekolah.findFirst({
      where: { namaSekolah: data.namaSekolah },
    });

    if (existing) {
      await prisma.sekolah.update({
        where: { id: existing.id },
        data: { akreditasi: data.akreditasi },
      });
      console.log(`↺ ${data.namaSekolah} (${data.akreditasi}) (updated)`);
    } else {
      await prisma.sekolah.create({
        data: {
          namaSekolah: data.namaSekolah,
          akreditasi: data.akreditasi,
        },
      });
      console.log(`✓ ${data.namaSekolah} (${data.akreditasi})`);
    }
  }

  console.log(`\n✅ ${SEKOLAH_DATA.length} sekolah processed successfully`);
}

main()
  .catch((err) => {
    console.error('Error seeding sekolah:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
