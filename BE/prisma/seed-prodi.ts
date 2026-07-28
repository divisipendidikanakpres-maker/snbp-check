import { PrismaClient, LevelKeketatan } from '@prisma/client';

const prisma = new PrismaClient();

// Data extracted from FE/lib/data-univ.ts
// Only includes: universitas, programStudi, jenjang, kelompok, estimasiNilaiMin (as nilai)
// estimasiNilaiMin is used as 'nilai' for level keketatan calculation (system auto-computes it)
const PRODI_DATA = [
  // UI (Universitas Indonesia)
  { universitas: "Universitas Indonesia", programStudi: "Pendidikan Dokter", jenjang: "S1", kelompok: "Saintek", nilai: 97.0 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Hukum", jenjang: "S1", kelompok: "Soshum", nilai: 96.9 },
  { universitas: "Universitas Indonesia", programStudi: "Manajemen", jenjang: "S1", kelompok: "Soshum", nilai: 96.9 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Psikologi", jenjang: "S1", kelompok: "Soshum", nilai: 96.5 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Komunikasi", jenjang: "S1", kelompok: "Soshum", nilai: 96.0 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Komputer", jenjang: "S1", kelompok: "Saintek", nilai: 95.8 },
  { universitas: "Universitas Indonesia", programStudi: "Farmasi", jenjang: "S1", kelompok: "Saintek", nilai: 95.3 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Keperawatan", jenjang: "S1", kelompok: "Saintek", nilai: 95.3 },
  { universitas: "Universitas Indonesia", programStudi: "Kriminologi", jenjang: "S1", kelompok: "Soshum", nilai: 95.0 },

  // ITB (Institut Teknologi Bandung)
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Sipil", jenjang: "S1", kelompok: "Saintek", nilai: 95.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Mesin", jenjang: "S1", kelompok: "Saintek", nilai: 95.2 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Elektro", jenjang: "S1", kelompok: "Saintek", nilai: 95.0 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Industri", jenjang: "S1", kelompok: "Saintek", nilai: 94.8 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Kimia", jenjang: "S1", kelompok: "Saintek", nilai: 94.5 },

  // UGM (Universitas Gadjah Mada)
  { universitas: "Universitas Gadjah Mada", programStudi: "Kedokteran", jenjang: "S1", kelompok: "Saintek", nilai: 94.8 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Teknik Sipil", jenjang: "S1", kelompok: "Saintek", nilai: 94.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Ilmu Ekonomi", jenjang: "S1", kelompok: "Soshum", nilai: 93.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Hukum", jenjang: "S1", kelompok: "Soshum", nilai: 93.2 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Akuntansi", jenjang: "S1", kelompok: "Soshum", nilai: 92.8 },

  // IPB (Institut Pertanian Bogor)
  { universitas: "Institut Pertanian Bogor", programStudi: "Agribisnis", jenjang: "S1", kelompok: "Saintek", nilai: 93.5 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Teknologi Hasil Pertanian", jenjang: "S1", kelompok: "Saintek", nilai: 92.8 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Ilmu dan Teknologi Pangan", jenjang: "S1", kelompok: "Saintek", nilai: 92.5 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Manajemen Bisnis", jenjang: "S1", kelompok: "Soshum", nilai: 92.0 },

  // UNAIR (Universitas Airlangga)
  { universitas: "Universitas Airlangga", programStudi: "Kedokteran", jenjang: "S1", kelompok: "Saintek", nilai: 92.5 },
  { universitas: "Universitas Airlangga", programStudi: "Farmasi", jenjang: "S1", kelompok: "Saintek", nilai: 91.8 },
  { universitas: "Universitas Airlangga", programStudi: "Keperawatan", jenjang: "S1", kelompok: "Saintek", nilai: 91.5 },
  { universitas: "Universitas Airlangga", programStudi: "Ilmu Hukum", jenjang: "S1", kelompok: "Soshum", nilai: 91.2 },
  { universitas: "Universitas Airlangga", programStudi: "Manajemen", jenjang: "S1", kelompok: "Soshum", nilai: 90.8 },

  // UNDIP (Universitas Diponegoro)
  { universitas: "Universitas Diponegoro", programStudi: "Teknik Sipil", jenjang: "S1", kelompok: "Saintek", nilai: 90.5 },
  { universitas: "Universitas Diponegoro", programStudi: "Teknik Mesin", jenjang: "S1", kelompok: "Saintek", nilai: 90.2 },
  { universitas: "Universitas Diponegoro", programStudi: "Hukum", jenjang: "S1", kelompok: "Soshum", nilai: 89.8 },
  { universitas: "Universitas Diponegoro", programStudi: "Ekonomi Pembangunan", jenjang: "S1", kelompok: "Soshum", nilai: 89.5 },

  // UNPAD (Universitas Padjadjaran)
  { universitas: "Universitas Padjadjaran", programStudi: "Kedokteran", jenjang: "S1", kelompok: "Saintek", nilai: 90.0 },
  { universitas: "Universitas Padjadjaran", programStudi: "Ilmu Hukum", jenjang: "S1", kelompok: "Soshum", nilai: 89.5 },
  { universitas: "Universitas Padjadjaran", programStudi: "Manajemen", jenjang: "S1", kelompok: "Soshum", nilai: 89.0 },
  { universitas: "Universitas Padjadjaran", programStudi: "Akuntansi", jenjang: "S1", kelompok: "Soshum", nilai: 88.8 },

  // UB (Universitas Brawijaya)
  { universitas: "Universitas Brawijaya", programStudi: "Teknik Sipil", jenjang: "S1", kelompok: "Saintek", nilai: 88.5 },
  { universitas: "Universitas Brawijaya", programStudi: "Ilmu Hukum", jenjang: "S1", kelompok: "Soshum", nilai: 88.2 },
  { universitas: "Universitas Brawijaya", programStudi: "Manajemen", jenjang: "S1", kelompok: "Soshum", nilai: 87.8 },

  // UNHAS (Universitas Hasanuddin)
  { universitas: "Universitas Hasanuddin", programStudi: "Kedokteran", jenjang: "S1", kelompok: "Saintek", nilai: 87.5 },
  { universitas: "Universitas Hasanuddin", programStudi: "Hukum", jenjang: "S1", kelompok: "Soshum", nilai: 87.0 },
  { universitas: "Universitas Hasanuddin", programStudi: "Manajemen", jenjang: "S1", kelompok: "Soshum", nilai: 86.5 },

  // UNAND (Universitas Andalas)
  { universitas: "Universitas Andalas", programStudi: "Teknik Sipil", jenjang: "S1", kelompok: "Saintek", nilai: 85.8 },
  { universitas: "Universitas Andalas", programStudi: "Hukum", jenjang: "S1", kelompok: "Soshum", nilai: 85.2 },

  // UNSYIAH (Universitas Syiah Kuala)
  { universitas: "Universitas Syiah Kuala", programStudi: "Kedokteran", jenjang: "S1", kelompok: "Saintek", nilai: 85.0 },
  { universitas: "Universitas Syiah Kuala", programStudi: "Hukum", jenjang: "S1", kelompok: "Soshum", nilai: 84.5 },

  // USU (Universitas Sumatera Utara)
  { universitas: "Universitas Sumatera Utara", programStudi: "Teknik Sipil", jenjang: "S1", kelompok: "Saintek", nilai: 84.2 },
  { universitas: "Universitas Sumatera Utara", programStudi: "Hukum", jenjang: "S1", kelompok: "Soshum", nilai: 83.8 },

  // UNRI (Universitas Riau)
  { universitas: "Universitas Riau", programStudi: "Teknik Sipil", jenjang: "S1", kelompok: "Saintek", nilai: 82.5 },
  { universitas: "Universitas Riau", programStudi: "Manajemen", jenjang: "S1", kelompok: "Soshum", nilai: 82.0 },

  // UNJA (Universitas Jambi)
  { universitas: "Universitas Jambi", programStudi: "Pendidikan", jenjang: "S1", kelompok: "Soshum", nilai: 81.5 },

  // UNSRI (Universitas Sriwijaya)
  { universitas: "Universitas Sriwijaya", programStudi: "Teknik Sipil", jenjang: "S1", kelompok: "Saintek", nilai: 81.2 },

  // UNILA (Universitas Lampung)
  { universitas: "Universitas Lampung", programStudi: "Teknik Sipil", jenjang: "S1", kelompok: "Saintek", nilai: 80.8 },

  // UNJ (Universitas Negeri Jakarta)
  { universitas: "Universitas Negeri Jakarta", programStudi: "Pendidikan Teknik", jenjang: "S1", kelompok: "Saintek", nilai: 80.5 },

  // UPI (Universitas Pendidikan Indonesia)
  { universitas: "Universitas Pendidikan Indonesia", programStudi: "Pendidikan Matematika", jenjang: "S1", kelompok: "Soshum", nilai: 80.2 },

  // UM (Universitas Negeri Malang)
  { universitas: "Universitas Negeri Malang", programStudi: "Pendidikan Fisika", jenjang: "S1", kelompok: "Saintek", nilai: 79.8 },

  // UNNES (Universitas Negeri Semarang)
  { universitas: "Universitas Negeri Semarang", programStudi: "Pendidikan Biologi", jenjang: "S1", kelompok: "Saintek", nilai: 79.5 },
];

function computeLevelKeketatan(nilai: number): LevelKeketatan {
  if (nilai >= 93) return LevelKeketatan.SANGAT_KETAT;
  if (nilai >= 88) return LevelKeketatan.KETAT;
  if (nilai >= 83) return LevelKeketatan.SEDANG;
  return LevelKeketatan.TERBUKA;
}

async function main() {
  console.log('Seeding prodi data...');

  let seededCount = 0;
  let skippedCount = 0;

  for (const data of PRODI_DATA) {
    try {
      // Find universitas
      const universitas = await prisma.universitas.findFirst({
        where: { namaUniversitas: data.universitas },
      });

      if (!universitas) {
        console.log(`⚠ Universitas '${data.universitas}' not found, skipping prodi`);
        skippedCount++;
        continue;
      }

      // Find kelompok
      const kelompok = await prisma.kelompok.findUnique({
        where: { nama: data.kelompok },
      });

      if (!kelompok) {
        console.log(`⚠ Kelompok '${data.kelompok}' not found, skipping prodi`);
        skippedCount++;
        continue;
      }

      // Find jenjang
      const jenjang = await prisma.jenjang.findUnique({
        where: { nama: data.jenjang },
      });

      if (!jenjang) {
        console.log(`⚠ Jenjang '${data.jenjang}' not found, skipping prodi`);
        skippedCount++;
        continue;
      }

      // Check if prodi already exists
      const existingProdi = await prisma.prodi.findFirst({
        where: {
          universitasId: universitas.id,
          programStudi: data.programStudi,
          kelompokId: kelompok.id,
          jenjangId: jenjang.id,
        },
      });

      if (existingProdi) {
        console.log(`↺ ${data.universitas} - ${data.programStudi} already exists`);
        skippedCount++;
        continue;
      }

      // Create prodi
      const levelKeketatan = computeLevelKeketatan(data.nilai);
      await prisma.prodi.create({
        data: {
          universitasId: universitas.id,
          programStudi: data.programStudi,
          kelompokId: kelompok.id,
          jenjangId: jenjang.id,
          nilai: data.nilai,
          levelKeketatan,
        },
      });

      console.log(
        `✓ ${data.universitas} - ${data.programStudi} (${levelKeketatan})`
      );
      seededCount++;
    } catch (err) {
      console.error(
        `✗ Error seeding ${data.universitas} - ${data.programStudi}:`,
        err
      );
    }
  }

  console.log(
    `\n✅ Prodi seeding complete: ${seededCount} created, ${skippedCount} skipped`
  );
}

main()
  .catch((err) => {
    console.error('Error in seed-prodi:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
