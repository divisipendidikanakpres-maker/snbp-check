import { Jurusan, SNBP_DATA } from "./data-univ";

export function badgeClass(level?: string | null) {
  if (!level) return "badge-terbuka";
  const upper = String(level).toUpperCase();
  if (upper.includes("SANGAT") || upper === "SANGAT_KETAT") return "badge-sangat-ketat";
  if (upper === "KETAT") return "badge-ketat";
  if (upper === "SEDANG") return "badge-sedang";
  return "badge-terbuka";
}

export interface StatusInfo {
  label: string;
  cls: string;
  pct: number;
  msg: string;
}

export function suggestAlternatives(
  targetCode: string,
  nilaiAkhir: number,
  limit = 5,
): Jurusan[] {
  const target = SNBP_DATA.find((j) => j.code === targetCode);
  if (!target) return [];

  return SNBP_DATA.filter((j) => {
    if (j.code === target.code) return false;
    if (j.universitas !== target.universitas) return false;
    if (j.kelompok !== target.kelompok) return false;

    // jurusan yang estimasinya DI BAWAH estimasi target (lebih mudah)
    // tapi tidak harus di bawah nilaiAkhir user, supaya tetap ada saran
    if (j.estimasiNilaiMin >= target.estimasiNilaiMin) return false;

    return true;
  })
    .sort((a, b) => {
      // urutkan berdasarkan seberapa jauh level jurusan turun dari target,
      // tapi tetap mempertimbangkan jarak ke nilai user
      const da =
        Math.abs(a.estimasiNilaiMin - nilaiAkhir) +
        (target.estimasiNilaiMin - a.estimasiNilaiMin);
      const db =
        Math.abs(b.estimasiNilaiMin - nilaiAkhir) +
        (target.estimasiNilaiMin - b.estimasiNilaiMin);
      return da - db;
    })
    .slice(0, limit);
}

export function getStatusInfo(selisih: number): StatusInfo {
  if (selisih >= 3)
    return {
      label: "\ud83d\udfe2 Aman",
      cls: "status-aman",
      pct: 95,
      msg: "Peluang lolos sangat besar. Nilai kamu jauh di atas estimasi minimum.",
    };
  if (selisih >= 1)
    return {
      label: "\ud83d\udd35 Cukup",
      cls: "status-cukup",
      pct: 75,
      msg: "Peluang bagus. Nilai kamu di atas estimasi minimum.",
    };
  if (selisih >= -1)
    return {
      label: "\ud83d\udfe1 Borderline",
      cls: "status-borderline",
      pct: 45,
      msg: "Peluang masih ada namun tipis, pertimbangkan backup.",
    };
  return {
    label: "\ud83d\udd34 Kurang",
    cls: "status-kurang",
    pct: 15,
    msg: "Nilai kamu di bawah estimasi minimum.",
  };
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/ /g, "_").replace(/-/g, "_");
}

export const LANJUT_MAP: Record<string, string> = {
  Matematika: "Matematika Tingkat Lanjut",
  "Bahasa Indonesia": "Bahasa Indonesia Tingkat Lanjut",
  "Bahasa Inggris": "Bahasa Inggris Tingkat Lanjut",
};
