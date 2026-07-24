export type SekolahItem = {
  id?: string;
  npsn?: string;
  namaSekolah: string;
  akreditasi: "A" | "B" | "C" | "-";
  kecamatan?: string;
};

export const SEKOLAH_DATA: SekolahItem[] = [
  { npsn: "20252519", namaSekolah: "SMAN 15 BEKASI", akreditasi: "A", kecamatan: "Kec. Bantargebang" },
  { npsn: "69973604", namaSekolah: "SMAN 22 KOTA BEKASI", akreditasi: "B", kecamatan: "Kec. Bantargebang" },
  { npsn: "20231741", namaSekolah: "SMKN 2 KOTA BEKASI", akreditasi: "A", kecamatan: "Kec. Bantargebang" },
  { npsn: "20223136", namaSekolah: "SMKN 1 KOTA BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Barat" },
  { npsn: "20231718", namaSekolah: "SMAN 12 BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Barat" },
  { npsn: "20223041", namaSekolah: "SMAN 8 BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Selatan" },
  { npsn: "20271648", namaSekolah: "SMKN 9 KOTA BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Selatan" },
  { npsn: "20223033", namaSekolah: "SMAN 2 BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Selatan" },
  { npsn: "20223046", namaSekolah: "SMAN 3 BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Selatan" },
  { npsn: "20276429", namaSekolah: "SMAN 17 BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Selatan" },
  { npsn: "20223020", namaSekolah: "SMAN 1 BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Timur" },
  { npsn: "20269651", namaSekolah: "SMKN 6 KOTA BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Timur" },
  { npsn: "69760562", namaSekolah: "SMAN 18 BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Timur" },
  { npsn: "20258176", namaSekolah: "SMKN 5 KOTA BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Utara" },
  { npsn: "69755585", namaSekolah: "SMKN 11 BEKASI", akreditasi: "B", kecamatan: "Kec. Bekasi Utara" },
  { npsn: "69952197", namaSekolah: "SMA NEGERI 20 KOTA BEKASI", akreditasi: "B", kecamatan: "Kec. Bekasi Utara" },
  { npsn: "20223045", namaSekolah: "SMAN 4 BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Utara" },
  { npsn: "20231720", namaSekolah: "SMAN 14 BEKASI", akreditasi: "A", kecamatan: "Kec. Bekasi Utara" },
  { npsn: "20269981", namaSekolah: "SMKN 4 KOTA BEKASI", akreditasi: "A", kecamatan: "Kec. Jati Sampurna" },
  { npsn: "69949162", namaSekolah: "SMK NEGERI 14 KOTA BEKASI", akreditasi: "A", kecamatan: "Kec. Jati Sampurna" },
  { npsn: "20223042", namaSekolah: "SMAN 7 BEKASI", akreditasi: "A", kecamatan: "Kec. Jati Sampurna" },
  { npsn: "20269696", namaSekolah: "SMKN 7 BEKASI", akreditasi: "A", kecamatan: "Kec. Jatiasih" },
  { npsn: "20223043", namaSekolah: "SMAN 6 BEKASI", akreditasi: "A", kecamatan: "Kec. Jatiasih" },
  { npsn: "20223032", namaSekolah: "SMAN 11 BEKASI", akreditasi: "A", kecamatan: "Kec. Jatiasih" },
  { npsn: "69947763", namaSekolah: "SMK NEGERI 13 KOTA BEKASI", akreditasi: "C", kecamatan: "Kec. Medan Satria" },
  { npsn: "20223019", namaSekolah: "SMAN 10 BEKASI", akreditasi: "A", kecamatan: "Kec. Medan Satria" },
  { npsn: "69972531", namaSekolah: "SMAN 19 KOTA BEKASI", akreditasi: "A", kecamatan: "Kec. Mustika Jaya" },
  { npsn: "69948380", namaSekolah: "SMK NEGERI 15 KOTA BEKASI", akreditasi: "A", kecamatan: "Kec. Mustika Jaya" },
  { npsn: "20253307", namaSekolah: "SMKN 3 KOTA BEKASI", akreditasi: "A", kecamatan: "Kec. Mustika Jaya" },
  { npsn: "20223040", namaSekolah: "SMAN 9 BEKASI", akreditasi: "A", kecamatan: "Kec. Mustika Jaya" },
  { npsn: "20271593", namaSekolah: "SMKN 10 KOTA BEKASI", akreditasi: "B", kecamatan: "Kec. Pondok Melati" },
  { npsn: "20275048", namaSekolah: "SMAN 16 BEKASI", akreditasi: "A", kecamatan: "Kec. Pondok Melati" },
  { npsn: "20223044", namaSekolah: "SMAN 5 BEKASI", akreditasi: "A", kecamatan: "Kec. Pondokgede" },
  { npsn: "69950346", namaSekolah: "SMA NEGERI 21 KOTA BEKASI", akreditasi: "B", kecamatan: "Kec. Pondokgede" },
  { npsn: "69904742", namaSekolah: "SMK NEGERI 12 KOTA BEKASI", akreditasi: "A", kecamatan: "Kec. Pondokgede" },
  { npsn: "20271658", namaSekolah: "SMKN 8 KOTA BEKASI", akreditasi: "A", kecamatan: "Kec. Rawalumbu" },
  { npsn: "20231719", namaSekolah: "SMAN 13 BEKASI", akreditasi: "A", kecamatan: "Kec. Rawalumbu" },
];
