import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extracted from FE/lib/data-univ.ts - only namaUniversitas, singkatan, provinsi fields
const UNIVERSITAS_DATA = [
  { namaUniversitas: "Universitas Indonesia", singkatan: "UI", provinsi: "DKI Jakarta", ranking: 1 },
  { namaUniversitas: "Institut Teknologi Bandung", singkatan: "ITB", provinsi: "Jawa Barat", ranking: 2 },
  { namaUniversitas: "Universitas Gadjah Mada", singkatan: "UGM", provinsi: "DI Yogyakarta", ranking: 3 },
  { namaUniversitas: "Institut Pertanian Bogor", singkatan: "IPB", provinsi: "Jawa Barat", ranking: 4 },
  { namaUniversitas: "Universitas Airlangga", singkatan: "UNAIR", provinsi: "Jawa Timur", ranking: 5 },
  { namaUniversitas: "Universitas Diponegoro", singkatan: "UNDIP", provinsi: "Jawa Tengah", ranking: 6 },
  { namaUniversitas: "Universitas Padjadjaran", singkatan: "UNPAD", provinsi: "Jawa Barat", ranking: 7 },
  { namaUniversitas: "Universitas Brawijaya", singkatan: "UB", provinsi: "Jawa Timur", ranking: 8 },
  { namaUniversitas: "Universitas Hasanuddin", singkatan: "UNHAS", provinsi: "Sulawesi Selatan", ranking: 9 },
  { namaUniversitas: "Universitas Andalas", singkatan: "UNAND", provinsi: "Sumatera Barat", ranking: 10 },
  { namaUniversitas: "Universitas Syiah Kuala", singkatan: "UNSYIAH", provinsi: "Aceh", ranking: 11 },
  { namaUniversitas: "Universitas Sumatera Utara", singkatan: "USU", provinsi: "Sumatera Utara", ranking: 12 },
  { namaUniversitas: "Universitas Riau", singkatan: "UNRI", provinsi: "Riau", ranking: 13 },
  { namaUniversitas: "Universitas Jambi", singkatan: "UNJA", provinsi: "Jambi", ranking: 14 },
  { namaUniversitas: "Universitas Sriwijaya", singkatan: "UNSRI", provinsi: "Sumatera Selatan", ranking: 15 },
  { namaUniversitas: "Universitas Lampung", singkatan: "UNILA", provinsi: "Lampung", ranking: 16 },
  { namaUniversitas: "Universitas Negeri Jakarta", singkatan: "UNJ", provinsi: "DKI Jakarta", ranking: 17 },
  { namaUniversitas: "Universitas Pendidikan Indonesia", singkatan: "UPI", provinsi: "Jawa Barat", ranking: 18 },
  { namaUniversitas: "Universitas Negeri Malang", singkatan: "UM", provinsi: "Jawa Timur", ranking: 19 },
  { namaUniversitas: "Universitas Negeri Semarang", singkatan: "UNNES", provinsi: "Jawa Tengah", ranking: 20 },
];

async function main() {
  console.log('Seeding universitas...');

  for (const data of UNIVERSITAS_DATA) {
    const existing = await prisma.universitas.findFirst({
      where: { namaUniversitas: data.namaUniversitas },
    });

    if (existing) {
      await prisma.universitas.update({
        where: { id: existing.id },
        data: { ranking: data.ranking },
      });
      console.log(`↺ ${data.namaUniversitas} (updated)`);
    } else {
      await prisma.universitas.create({
        data: {
          namaUniversitas: data.namaUniversitas,
          singkatan: data.singkatan,
          provinsi: data.provinsi,
          ranking: data.ranking,
        },
      });
      console.log(`✓ ${data.namaUniversitas}`);
    }
  }

  console.log(`\n✅ ${UNIVERSITAS_DATA.length} universitas processed successfully`);
}

main()
  .catch((err) => {
    console.error('Error seeding universitas:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
