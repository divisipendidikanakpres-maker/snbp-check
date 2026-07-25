import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KELOMPOK_DEFAULTS = ['Saintek', 'Soshum', 'Vokasi', 'Agama', 'Seni'];
const JENJANG_DEFAULTS = ['S1', 'D3/D4'];

async function main() {
  for (const nama of KELOMPOK_DEFAULTS) {
    await prisma.kelompok.upsert({
      where: { nama },
      update: {},
      create: { nama },
    });
  }

  for (const nama of JENJANG_DEFAULTS) {
    await prisma.jenjang.upsert({
      where: { nama },
      update: {},
      create: { nama },
    });
  }

  console.log('Kelompok and Jenjang defaults seeded.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
