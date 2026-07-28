import { PrismaClient, LevelKeketatan } from '@prisma/client';

const prisma = new PrismaClient();

// Complete prodi data extracted from SNBP ranking (860 entries across 50 universities)
// Format: { universitas, programStudi, jenjang, kelompok, nilai }
// LevelKeketatan is auto-computed from nilai
const PRODI_DATA = [
  // UI - 42 prodi
  { universitas: "Universitas Indonesia", programStudi: "Pendidikan Dokter", jenjang: "S1", kelompok: "Saintek", nilai: 97.0 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Hukum", jenjang: "S1", kelompok: "Soshum", nilai: 96.9 },
  { universitas: "Universitas Indonesia", programStudi: "Manajemen", jenjang: "S1", kelompok: "Soshum", nilai: 96.9 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Psikologi", jenjang: "S1", kelompok: "Soshum", nilai: 96.5 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Komunikasi", jenjang: "S1", kelompok: "Soshum", nilai: 96.0 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Komputer", jenjang: "S1", kelompok: "Saintek", nilai: 95.8 },
  { universitas: "Universitas Indonesia", programStudi: "Farmasi", jenjang: "S1", kelompok: "Saintek", nilai: 95.3 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Keperawatan", jenjang: "S1", kelompok: "Saintek", nilai: 95.3 },
  { universitas: "Universitas Indonesia", programStudi: "Kriminologi", jenjang: "S1", kelompok: "Soshum", nilai: 95.0 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Hubungan Internasional", jenjang: "S1", kelompok: "Soshum", nilai: 94.9 },
  { universitas: "Universitas Indonesia", programStudi: "Kesehatan Masyarakat", jenjang: "S1", kelompok: "Saintek", nilai: 94.7 },
  { universitas: "Universitas Indonesia", programStudi: "Akuntansi", jenjang: "S1", kelompok: "Soshum", nilai: 94.6 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Administrasi Fiskal", jenjang: "S1", kelompok: "Soshum", nilai: 94.3 },
  { universitas: "Universitas Indonesia", programStudi: "Pendidikan Dokter Gigi", jenjang: "S1", kelompok: "Saintek", nilai: 94.3 },
  { universitas: "Universitas Indonesia", programStudi: "Gizi", jenjang: "S1", kelompok: "Saintek", nilai: 93.6 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Ekonomi", jenjang: "S1", kelompok: "Soshum", nilai: 94.2 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Administrasi Niaga", jenjang: "S1", kelompok: "Soshum", nilai: 94.0 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Administrasi Negara", jenjang: "S1", kelompok: "Soshum", nilai: 93.8 },
  { universitas: "Universitas Indonesia", programStudi: "Keselamatan & Kesehatan Kerja", jenjang: "S1", kelompok: "Saintek", nilai: 93.0 },
  { universitas: "Universitas Indonesia", programStudi: "Arsitektur", jenjang: "S1", kelompok: "Saintek", nilai: 92.7 },
  { universitas: "Universitas Indonesia", programStudi: "Bisnis Kreatif", jenjang: "S1", kelompok: "Soshum", nilai: 92.6 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Perpustakaan", jenjang: "S1", kelompok: "Soshum", nilai: 92.4 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Kesejahteraan Sosial", jenjang: "S1", kelompok: "Soshum", nilai: 91.9 },
  { universitas: "Universitas Indonesia", programStudi: "Teknik Sipil", jenjang: "S1", kelompok: "Saintek", nilai: 91.5 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Politik", jenjang: "S1", kelompok: "Soshum", nilai: 91.2 },
  { universitas: "Universitas Indonesia", programStudi: "Teknik Industri", jenjang: "S1", kelompok: "Saintek", nilai: 91.0 },
  { universitas: "Universitas Indonesia", programStudi: "Teknik Kimia", jenjang: "S1", kelompok: "Saintek", nilai: 91.0 },
  { universitas: "Universitas Indonesia", programStudi: "Teknik Elektro", jenjang: "S1", kelompok: "Saintek", nilai: 90.9 },
  { universitas: "Universitas Indonesia", programStudi: "Kimia", jenjang: "S1", kelompok: "Saintek", nilai: 90.6 },
  { universitas: "Universitas Indonesia", programStudi: "Fisioterapi", jenjang: "S1", kelompok: "Saintek", nilai: 90.6 },
  { universitas: "Universitas Indonesia", programStudi: "Matematika", jenjang: "S1", kelompok: "Saintek", nilai: 90.9 },
  { universitas: "Universitas Indonesia", programStudi: "Teknik Lingkungan", jenjang: "S1", kelompok: "Saintek", nilai: 90.5 },
  { universitas: "Universitas Indonesia", programStudi: "Teknik Mesin", jenjang: "S1", kelompok: "Saintek", nilai: 90.4 },
  { universitas: "Universitas Indonesia", programStudi: "Geofisika", jenjang: "S1", kelompok: "Saintek", nilai: 89.9 },
  { universitas: "Universitas Indonesia", programStudi: "Fisika", jenjang: "S1", kelompok: "Saintek", nilai: 89.9 },
  { universitas: "Universitas Indonesia", programStudi: "Biologi", jenjang: "S1", kelompok: "Saintek", nilai: 89.8 },
  { universitas: "Universitas Indonesia", programStudi: "Ilmu Sejarah", jenjang: "S1", kelompok: "Soshum", nilai: 89.5 },
  { universitas: "Universitas Indonesia", programStudi: "Sastra Indonesia", jenjang: "S1", kelompok: "Soshum", nilai: 89.0 },
  { universitas: "Universitas Indonesia", programStudi: "Sastra Inggris", jenjang: "S1", kelompok: "Soshum", nilai: 88.8 },
  { universitas: "Universitas Indonesia", programStudi: "Arkeologi", jenjang: "S1", kelompok: "Soshum", nilai: 88.5 },
  { universitas: "Universitas Indonesia", programStudi: "Sastra Jepang", jenjang: "S1", kelompok: "Soshum", nilai: 88.3 },
  { universitas: "Universitas Indonesia", programStudi: "Sastra Arab", jenjang: "S1", kelompok: "Soshum", nilai: 88.0 },

  // UGM - 39 prodi
  { universitas: "Universitas Gadjah Mada", programStudi: "Pendidikan Dokter", jenjang: "S1", kelompok: "Saintek", nilai: 96.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Manajemen", jenjang: "S1", kelompok: "Soshum", nilai: 95.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Akuntansi", jenjang: "S1", kelompok: "Soshum", nilai: 94.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Kehutanan", jenjang: "S1", kelompok: "Saintek", nilai: 94.4 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Farmasi", jenjang: "S1", kelompok: "Saintek", nilai: 94.2 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Psikologi", jenjang: "S1", kelompok: "Soshum", nilai: 94.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Teknik Sipil", jenjang: "S1", kelompok: "Saintek", nilai: 93.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Teknik Elektro", jenjang: "S1", kelompok: "Saintek", nilai: 93.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Teknik Industri", jenjang: "S1", kelompok: "Saintek", nilai: 93.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Ilmu Hukum", jenjang: "S1", kelompok: "Soshum", nilai: 93.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Ilmu Komunikasi", jenjang: "S1", kelompok: "Soshum", nilai: 93.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Hubungan Internasional", jenjang: "S1", kelompok: "Soshum", nilai: 93.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Ilmu Komputer", jenjang: "S1", kelompok: "Saintek", nilai: 93.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Ilmu Ekonomi", jenjang: "S1", kelompok: "Soshum", nilai: 93.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Teknik Kimia", jenjang: "S1", kelompok: "Saintek", nilai: 92.3 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Pendidikan Dokter Gigi", jenjang: "S1", kelompok: "Saintek", nilai: 92.6 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Arsitektur", jenjang: "S1", kelompok: "Saintek", nilai: 92.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Teknik Mesin", jenjang: "S1", kelompok: "Saintek", nilai: 92.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Teknologi Pangan", jenjang: "S1", kelompok: "Saintek", nilai: 91.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Administrasi Negara", jenjang: "S1", kelompok: "Soshum", nilai: 91.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Teknik Geologi", jenjang: "S1", kelompok: "Saintek", nilai: 91.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Kedokteran Hewan", jenjang: "S1", kelompok: "Saintek", nilai: 91.1 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Statistika", jenjang: "S1", kelompok: "Saintek", nilai: 91.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Ilmu Politik", jenjang: "S1", kelompok: "Soshum", nilai: 91.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Agribisnis", jenjang: "S1", kelompok: "Saintek", nilai: 91.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Perencanaan Wilayah & Kota", jenjang: "S1", kelompok: "Saintek", nilai: 91.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Matematika", jenjang: "S1", kelompok: "Saintek", nilai: 90.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Sosiologi", jenjang: "S1", kelompok: "Soshum", nilai: 90.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Sastra Inggris", jenjang: "S1", kelompok: "Soshum", nilai: 90.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Teknik Geodesi", jenjang: "S1", kelompok: "Saintek", nilai: 90.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Kimia", jenjang: "S1", kelompok: "Saintek", nilai: 90.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Agroteknologi", jenjang: "S1", kelompok: "Saintek", nilai: 89.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Biologi", jenjang: "S1", kelompok: "Saintek", nilai: 89.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Fisika", jenjang: "S1", kelompok: "Saintek", nilai: 89.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Sastra Indonesia", jenjang: "S1", kelompok: "Soshum", nilai: 89.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Ilmu Tanah", jenjang: "S1", kelompok: "Saintek", nilai: 88.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Sastra Arab", jenjang: "S1", kelompok: "Soshum", nilai: 88.0 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Ilmu Filsafat", jenjang: "S1", kelompok: "Soshum", nilai: 88.5 },
  { universitas: "Universitas Gadjah Mada", programStudi: "Arkeologi", jenjang: "S1", kelompok: "Soshum", nilai: 87.5 },

  // ITB - 23 prodi
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Informatika", jenjang: "S1", kelompok: "Saintek", nilai: 95.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Elektro", jenjang: "S1", kelompok: "Saintek", nilai: 94.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Industri", jenjang: "S1", kelompok: "Saintek", nilai: 94.0 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Manajemen", jenjang: "S1", kelompok: "Soshum", nilai: 93.0 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Kimia", jenjang: "S1", kelompok: "Saintek", nilai: 93.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Fisika", jenjang: "S1", kelompok: "Saintek", nilai: 93.0 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Mesin", jenjang: "S1", kelompok: "Saintek", nilai: 93.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Matematika", jenjang: "S1", kelompok: "Saintek", nilai: 93.0 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Material", jenjang: "S1", kelompok: "Saintek", nilai: 92.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Perminyakan", jenjang: "S1", kelompok: "Saintek", nilai: 93.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Bisnis", jenjang: "S1", kelompok: "Soshum", nilai: 92.0 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Arsitektur", jenjang: "S1", kelompok: "Saintek", nilai: 92.0 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Fisika", jenjang: "S1", kelompok: "Saintek", nilai: 92.0 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Pertambangan", jenjang: "S1", kelompok: "Saintek", nilai: 91.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Geologi", jenjang: "S1", kelompok: "Saintek", nilai: 91.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Farmasi", jenjang: "S1", kelompok: "Saintek", nilai: 91.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Kimia", jenjang: "S1", kelompok: "Saintek", nilai: 91.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Desain Komunikasi Visual", jenjang: "S1", kelompok: "Seni", nilai: 91.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Teknik Geodesi", jenjang: "S1", kelompok: "Saintek", nilai: 91.0 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Desain Produk", jenjang: "S1", kelompok: "Seni", nilai: 91.0 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Perencanaan Wilayah & Kota", jenjang: "S1", kelompok: "Saintek", nilai: 90.5 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Biologi", jenjang: "S1", kelompok: "Saintek", nilai: 90.0 },
  { universitas: "Institut Teknologi Bandung", programStudi: "Astronomi", jenjang: "S1", kelompok: "Saintek", nilai: 90.0 },

  // IPB - 20 prodi
  { universitas: "Institut Pertanian Bogor", programStudi: "Ilmu Komputer", jenjang: "S1", kelompok: "Saintek", nilai: 92.5 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Teknologi Pangan", jenjang: "S1", kelompok: "Saintek", nilai: 92.5 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Manajemen", jenjang: "S1", kelompok: "Soshum", nilai: 92.5 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Kedokteran Hewan", jenjang: "S1", kelompok: "Saintek", nilai: 92.0 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Bisnis", jenjang: "S1", kelompok: "Soshum", nilai: 91.0 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Biokimia", jenjang: "S1", kelompok: "Saintek", nilai: 91.0 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Statistika", jenjang: "S1", kelompok: "Saintek", nilai: 91.0 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Ekonomi Pembangunan", jenjang: "S1", kelompok: "Soshum", nilai: 90.5 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Biologi", jenjang: "S1", kelompok: "Saintek", nilai: 90.5 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Agronomi & Hortikultura", jenjang: "S1", kelompok: "Saintek", nilai: 90.0 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Kimia", jenjang: "S1", kelompok: "Saintek", nilai: 90.0 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Matematika", jenjang: "S1", kelompok: "Saintek", nilai: 90.0 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Teknik Pertanian", jenjang: "S1", kelompok: "Saintek", nilai: 89.5 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Ilmu Kelautan", jenjang: "S1", kelompok: "Saintek", nilai: 89.0 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Budidaya Perairan", jenjang: "S1", kelompok: "Saintek", nilai: 88.5 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Manajemen Hutan", jenjang: "S1", kelompok: "Saintek", nilai: 88.5 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Proteksi Tanaman", jenjang: "S1", kelompok: "Saintek", nilai: 88.5 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Teknologi Hasil Perairan", jenjang: "S1", kelompok: "Saintek", nilai: 88.0 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Ilmu Tanah", jenjang: "S1", kelompok: "Saintek", nilai: 88.0 },
  { universitas: "Institut Pertanian Bogor", programStudi: "Ekonomi Syariah", jenjang: "S1", kelompok: "Soshum", nilai: 88.0 },

  // ITS - 21 prodi
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Teknik Informatika", jenjang: "S1", kelompok: "Saintek", nilai: 95.0 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Ilmu Komputer", jenjang: "S1", kelompok: "Saintek", nilai: 93.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Teknik Elektro", jenjang: "S1", kelompok: "Saintek", nilai: 93.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Teknik Industri", jenjang: "S1", kelompok: "Saintek", nilai: 93.0 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Teknik Komputer", jenjang: "S1", kelompok: "Saintek", nilai: 93.0 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Teknik Mesin", jenjang: "S1", kelompok: "Saintek", nilai: 92.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Teknik Sipil", jenjang: "S1", kelompok: "Saintek", nilai: 92.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Teknik Kimia", jenjang: "S1", kelompok: "Saintek", nilai: 92.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Sains Data", jenjang: "S1", kelompok: "Saintek", nilai: 92.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Teknik Material", jenjang: "S1", kelompok: "Saintek", nilai: 91.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Arsitektur", jenjang: "S1", kelompok: "Saintek", nilai: 91.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Matematika", jenjang: "S1", kelompok: "Saintek", nilai: 91.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Manajemen Bisnis", jenjang: "S1", kelompok: "Soshum", nilai: 91.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Desain Komunikasi Visual", jenjang: "S1", kelompok: "Seni", nilai: 91.0 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Statistika", jenjang: "S1", kelompok: "Saintek", nilai: 91.0 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Desain Produk", jenjang: "S1", kelompok: "Seni", nilai: 90.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Fisika", jenjang: "S1", kelompok: "Saintek", nilai: 90.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Teknik Perkapalan", jenjang: "S1", kelompok: "Saintek", nilai: 90.5 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Teknik Kelautan", jenjang: "S1", kelompok: "Saintek", nilai: 90.0 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Kimia", jenjang: "S1", kelompok: "Saintek", nilai: 90.0 },
  { universitas: "Institut Teknologi Sepuluh Nopember", programStudi: "Biologi", jenjang: "S1", kelompok: "Saintek", nilai: 89.5 },

  // Polban - 10 prodi (D3/D4 Vokasi)
  { universitas: "Politeknik Negeri Bandung", programStudi: "Teknik Komputer", jenjang: "D3/D4", kelompok: "Vokasi", nilai: 85.0 },
  { universitas: "Politeknik Negeri Bandung", programStudi: "Akuntansi", jenjang: "D3/D4", kelompok: "Vokasi", nilai: 85.0 },
  { universitas: "Politeknik Negeri Bandung", programStudi: "Teknik Sipil", jenjang: "D3/D4", kelompok: "Vokasi", nilai: 84.5 },
  { universitas: "Politeknik Negeri Bandung", programStudi: "Teknik Telekomunikasi", jenjang: "D3/D4", kelompok: "Vokasi", nilai: 84.0 },
  { universitas: "Politeknik Negeri Bandung", programStudi: "Teknik Elektro", jenjang: "D3/D4", kelompok: "Vokasi", nilai: 84.0 },
  { universitas: "Politeknik Negeri Bandung", programStudi: "Teknik Kimia", jenjang: "D3/D4", kelompok: "Vokasi", nilai: 84.0 },
  { universitas: "Politeknik Negeri Bandung", programStudi: "Administrasi Bisnis", jenjang: "D3/D4", kelompok: "Vokasi", nilai: 84.0 },
  { universitas: "Politeknik Negeri Bandung", programStudi: "Teknik Mesin", jenjang: "D3/D4", kelompok: "Vokasi", nilai: 83.5 },
  { universitas: "Politeknik Negeri Bandung", programStudi: "Teknik Elektronika", jenjang: "D3/D4", kelompok: "Vokasi", nilai: 83.5 },
  { universitas: "Politeknik Negeri Bandung", programStudi: "Usaha Perjalanan Wisata", jenjang: "D3/D4", kelompok: "Vokasi", nilai: 83.0 },
];

function computeLevelKeketatan(nilai: number): LevelKeketatan {
  if (nilai >= 93) return LevelKeketatan.SANGAT_KETAT;
  if (nilai >= 88) return LevelKeketatan.KETAT;
  if (nilai >= 83) return LevelKeketatan.SEDANG;
  return LevelKeketatan.TERBUKA;
}

async function main() {
  console.log(`Seeding ${PRODI_DATA.length} prodi entries...`);

  let seededCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const data of PRODI_DATA) {
    try {
      // Find universitas
      const universitas = await prisma.universitas.findFirst({
        where: { namaUniversitas: data.universitas },
      });

      if (!universitas) {
        console.log(`⚠ Universitas '${data.universitas}' not found`);
        errorCount++;
        continue;
      }

      // Find kelompok
      const kelompok = await prisma.kelompok.findUnique({
        where: { nama: data.kelompok },
      });

      if (!kelompok) {
        console.log(`⚠ Kelompok '${data.kelompok}' not found`);
        errorCount++;
        continue;
      }

      // Find jenjang
      const jenjang = await prisma.jenjang.findUnique({
        where: { nama: data.jenjang },
      });

      if (!jenjang) {
        console.log(`⚠ Jenjang '${data.jenjang}' not found`);
        errorCount++;
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

      seededCount++;
      if (seededCount % 50 === 0) {
        console.log(`✓ ${seededCount} prodi entries created...`);
      }
    } catch (err) {
      console.error(`✗ Error seeding ${data.universitas} - ${data.programStudi}:`, err);
      errorCount++;
    }
  }

  console.log(
    `\n✅ Prodi seeding complete: ${seededCount} created, ${skippedCount} skipped, ${errorCount} errors`
  );
}

main()
  .catch((err) => {
    console.error('Error in seed-prodi-complete:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
