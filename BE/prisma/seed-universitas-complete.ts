import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Complete list of 50 PTN universities from SNBP ranking
const UNIVERSITAS_DATA = [
  { namaUniversitas: "Universitas Indonesia", singkatan: "UI", provinsi: "DKI Jakarta", ranking: 1 },
  { namaUniversitas: "Universitas Gadjah Mada", singkatan: "UGM", provinsi: "DI Yogyakarta", ranking: 2 },
  { namaUniversitas: "Institut Teknologi Bandung", singkatan: "ITB", provinsi: "Jawa Barat", ranking: 3 },
  { namaUniversitas: "Institut Pertanian Bogor", singkatan: "IPB", provinsi: "Jawa Barat", ranking: 4 },
  { namaUniversitas: "Institut Teknologi Sepuluh Nopember", singkatan: "ITS", provinsi: "Jawa Timur", ranking: 5 },
  { namaUniversitas: "Universitas Padjadjaran", singkatan: "Unpad", provinsi: "Jawa Barat", ranking: 6 },
  { namaUniversitas: "Universitas Airlangga", singkatan: "Unair", provinsi: "Jawa Timur", ranking: 7 },
  { namaUniversitas: "Universitas Diponegoro", singkatan: "Undip", provinsi: "Jawa Tengah", ranking: 8 },
  { namaUniversitas: "Universitas Brawijaya", singkatan: "UB", provinsi: "Jawa Timur", ranking: 9 },
  { namaUniversitas: "Universitas Sebelas Maret", singkatan: "UNS", provinsi: "Jawa Tengah", ranking: 10 },
  { namaUniversitas: "Universitas Hasanuddin", singkatan: "Unhas", provinsi: "Sulawesi Selatan", ranking: 11 },
  { namaUniversitas: "Universitas Pendidikan Indonesia", singkatan: "UPI", provinsi: "Jawa Barat", ranking: 12 },
  { namaUniversitas: "Universitas Negeri Yogyakarta", singkatan: "UNY", provinsi: "DI Yogyakarta", ranking: 13 },
  { namaUniversitas: "Universitas Sumatera Utara", singkatan: "USU", provinsi: "Sumatera Utara", ranking: 14 },
  { namaUniversitas: "Universitas Andalas", singkatan: "Unand", provinsi: "Sumatera Barat", ranking: 15 },
  { namaUniversitas: "Universitas Negeri Jakarta", singkatan: "UNJ", provinsi: "DKI Jakarta", ranking: 16 },
  { namaUniversitas: "Universitas Negeri Semarang", singkatan: "Unnes", provinsi: "Jawa Tengah", ranking: 17 },
  { namaUniversitas: "Universitas Jenderal Soedirman", singkatan: "Unsoed", provinsi: "Jawa Tengah", ranking: 18 },
  { namaUniversitas: "Universitas Negeri Malang", singkatan: "UM", provinsi: "Jawa Timur", ranking: 19 },
  { namaUniversitas: "Universitas Udayana", singkatan: "Unud", provinsi: "Bali", ranking: 20 },
  { namaUniversitas: "Universitas Sriwijaya", singkatan: "Unsri", provinsi: "Sumatera Selatan", ranking: 21 },
  { namaUniversitas: "Universitas Lampung", singkatan: "Unila", provinsi: "Lampung", ranking: 22 },
  { namaUniversitas: "Universitas Negeri Surabaya", singkatan: "Unesa", provinsi: "Jawa Timur", ranking: 23 },
  { namaUniversitas: "Universitas Riau", singkatan: "Unri", provinsi: "Riau", ranking: 24 },
  { namaUniversitas: "Universitas Jember", singkatan: "Unej", provinsi: "Jawa Timur", ranking: 25 },
  { namaUniversitas: "Universitas Negeri Padang", singkatan: "UNP", provinsi: "Sumatera Barat", ranking: 26 },
  { namaUniversitas: "Universitas Tidar", singkatan: "Untidar", provinsi: "Jawa Tengah", ranking: 27 },
  { namaUniversitas: "Universitas Sam Ratulangi", singkatan: "Unsrat", provinsi: "Sulawesi Utara", ranking: 28 },
  { namaUniversitas: "Universitas Haluoleo", singkatan: "UHO", provinsi: "Sulawesi Tenggara", ranking: 29 },
  { namaUniversitas: "Universitas Bangka Belitung", singkatan: "UBB", provinsi: "Kep. Bangka Belitung", ranking: 30 },
  { namaUniversitas: "Universitas Mataram", singkatan: "Unram", provinsi: "NTB", ranking: 31 },
  { namaUniversitas: "Universitas Negeri Gorontalo", singkatan: "UNG", provinsi: "Gorontalo", ranking: 32 },
  { namaUniversitas: "Universitas Tanjungpura", singkatan: "Untan", provinsi: "Kalimantan Barat", ranking: 33 },
  { namaUniversitas: "Universitas Tadulako", singkatan: "Untad", provinsi: "Sulawesi Tengah", ranking: 34 },
  { namaUniversitas: "Universitas Lambung Mangkurat", singkatan: "ULM", provinsi: "Kalimantan Selatan", ranking: 35 },
  { namaUniversitas: "Universitas Mulawarman", singkatan: "Unmul", provinsi: "Kalimantan Timur", ranking: 36 },
  { namaUniversitas: "Universitas Nusa Cendana", singkatan: "Undana", provinsi: "NTT", ranking: 37 },
  { namaUniversitas: "Universitas Negeri Makassar", singkatan: "UNM", provinsi: "Sulawesi Selatan", ranking: 38 },
  { namaUniversitas: "Universitas Sultan Ageng Tirtayasa", singkatan: "Untirta", provinsi: "Banten", ranking: 39 },
  { namaUniversitas: "Universitas Palangka Raya", singkatan: "UPR", provinsi: "Kalimantan Tengah", ranking: 40 },
  { namaUniversitas: "Universitas Pattimura", singkatan: "Unpatti", provinsi: "Maluku", ranking: 41 },
  { namaUniversitas: "Universitas Borneo Tarakan", singkatan: "UBT", provinsi: "Kalimantan Utara", ranking: 42 },
  { namaUniversitas: "Universitas Khairun", singkatan: "Unkhair", provinsi: "Maluku Utara", ranking: 43 },
  { namaUniversitas: "Universitas Cendrawasih", singkatan: "Uncen", provinsi: "Papua", ranking: 44 },
  { namaUniversitas: "Universitas Musamus Merauke", singkatan: "Unmus", provinsi: "Papua Selatan", ranking: 45 },
  { namaUniversitas: "UIN Syarif Hidayatullah Jakarta", singkatan: "UIN Jakarta", provinsi: "DKI Jakarta", ranking: 46 },
  { namaUniversitas: "UIN Sunan Kalijaga", singkatan: "UIN Yogya", provinsi: "DI Yogyakarta", ranking: 47 },
  { namaUniversitas: "UIN Maulana Malik Ibrahim Malang", singkatan: "UIN Malang", provinsi: "Jawa Timur", ranking: 48 },
  { namaUniversitas: "Institut Seni Indonesia Yogyakarta", singkatan: "ISI Yogya", provinsi: "DI Yogyakarta", ranking: 49 },
  { namaUniversitas: "Politeknik Negeri Bandung", singkatan: "Polban", provinsi: "Jawa Barat", ranking: 50 },
];

async function main() {
  console.log('Seeding 50 universitas...');

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
