import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CSV_PATH = ROOT / "Ranking_SNBP_Indonesia_Lengkap-Ranking-Jurusan-SNBP.csv"
OUT_PATH = ROOT / "lib" / "data.ts"


def assert_level(val: str) -> str:
    v = val.strip()
    allowed = {"Sangat Ketat", "Ketat", "Sedang", "Terbuka"}
    if v in allowed:
        return v
    lower = v.lower()
    if "sangat" in lower:
        return "Sangat Ketat"
    if "ketat" in lower:
        return "Ketat"
    if "sedang" in lower:
        return "Sedang"
    return "Terbuka"


def make_safe_code(program_studi: str, singkatan: str, no: str, ranking_ptn: int) -> str:
    """
    Generate code unik dan aman:
    - slug nama prodi (A-Z0-9, max 6 char)
    - gabung singkatan (UI, UGM, ITB, dst) kalau ada
    - tambahkan ranking PTN + nomor 'No' untuk menjamin keunikan

    Contoh:
    - UI + Pendidikan Dokter, ranking 1, No=1 -> UI-PENDOK-1-1
    - UI + Ilmu Administrasi Niaga, ranking 1, No=17 -> UI-ILMUAD-1-17
    """
    # slug prodi
    upper = re.sub(r"[^A-Z0-9]", "", program_studi.upper())
    slug = upper[:6] or "PRODI"

    # normalisasi No (ambil angka saja)
    num = re.sub(r"[^0-9]", "", no) or "0"

    # bentuk base code
    if singkatan:
        base = f"{singkatan}-{slug}"
    else:
        base = slug

    return f"{base}-{ranking_ptn}-{num}"


def escape_ts(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def main():
    if not CSV_PATH.exists():
        print(f"CSV tidak ditemukan: {CSV_PATH}")
        return

    text = CSV_PATH.read_text(encoding="utf-8")

    lines = text.splitlines()
    header_idx = next(
        (i for i, line in enumerate(lines) if line.startswith("No,Ranking PTN")),
        -1,
    )
    if header_idx == -1:
        print("Header 'No,Ranking PTN' tidak ditemukan di CSV.")
        return

    cleaned_csv = "\n".join(lines[header_idx:])
    reader = csv.DictReader(cleaned_csv.splitlines())
    rows = list(reader)
    print(f"Total baris (setelah header): {len(rows)}")

    last_univ = ""
    last_prov = ""
    last_rank = ""
    cleaned_rows = []
    for r in rows:
        univ = (r.get("Universitas") or "").strip()
        prov = (r.get("Provinsi") or "").strip()
        rank = (r.get("Ranking PTN") or "").strip()

        if univ:
            last_univ = univ
        else:
            r["Universitas"] = last_univ

        if prov:
            last_prov = prov
        else:
            r["Provinsi"] = last_prov

        if rank:
            last_rank = rank
        else:
            r["Ranking PTN"] = last_rank

        cleaned_rows.append(r)

    jurusan_rows = [
        r for r in cleaned_rows if (r.get("Program Studi") or "").strip()
    ]
    print(f"Baris dengan Program Studi: {len(jurusan_rows)}")

    entries = []
    for r in jurusan_rows:
        try:
            ranking_str = (r.get("Ranking PTN") or "").strip()
            ranking_ptn = int(ranking_str) if ranking_str else 0

            no = (r.get("No") or "").strip()
            program_studi = (r.get("Program Studi") or "").strip()
            singkatan = (r.get("Singkatan") or "").strip()
            universitas = (r.get("Universitas") or "").strip()
            provinsi = (r.get("Provinsi") or "").strip()
            referensi = (r.get("Referensi Ranking") or "").strip()
            jenjang = (r.get("Jenjang") or "").strip()
            kelompok = (r.get("Kelompok") or "").strip()
            estimasi_str = (r.get("Estimasi Nilai Raport Min.") or "").strip()
            level_str = (r.get("Level Keketatan") or "").strip()

            if not program_studi or not estimasi_str or not level_str:
                continue

            estimasi = float(estimasi_str.replace(",", "."))
            level = assert_level(level_str)
            code = make_safe_code(program_studi, singkatan, no, ranking_ptn)

            entry = f'''  {{
    code: "{escape_ts(code)}",
    rankingPTN: {ranking_ptn},
    universitas: "{escape_ts(universitas)}",
    singkatan: "{escape_ts(singkatan)}",
    provinsi: "{escape_ts(provinsi)}",
    referensiRanking: "{escape_ts(referensi)}",
    programStudi: "{escape_ts(program_studi)}",
    jenjang: "{escape_ts(jenjang)}",
    kelompok: "{escape_ts(kelompok)}",
    estimasiNilaiMin: {estimasi},
    levelKeketatan: "{level}",
    mapelPendukungJurusan: [],
  }}'''
            entries.append(entry)
        except Exception as e:
            print("Skip row karena error:", e)
            continue

    # Pastikan tidak ada code duplikat
    codes = [re.search(r'code: "([^"]+)"', e).group(1) for e in entries]
    if len(codes) != len(set(codes)):
        print("⚠ Masih ada code duplikat, cek fungsi make_safe_code lagi.")
    else:
        print("✅ Semua code unik.")

    body = ",\n".join(entries)

    ts_content = f'''export interface Jurusan {{
  code: string;
  rankingPTN: number;
  universitas: string;
  singkatan: string;
  provinsi: string;
  referensiRanking: string;
  programStudi: string;
  jenjang: string;
  kelompok: string;
  estimasiNilaiMin: number;
  levelKeketatan: "Sangat Ketat" | "Ketat" | "Sedang" | "Terbuka";
  mapelPendukungJurusan: string[];
}}

// Generated from Ranking_SNBP_Indonesia_Lengkap-Ranking-Jurusan-SNBP.csv
export const SNBP_DATA: Jurusan[] = [
{body}
];

export const ALL_TKA_PENDUKUNG: string[] = [
  "Matematika Tingkat Lanjut",
  "Fisika",
  "Kimia",
  "Biologi",
  "Ekonomi",
  "Sosiologi",
  "Sejarah Indonesia",
  "Geografi",
  "Bahasa Indonesia Tingkat Lanjut",
  "Bahasa Inggris Tingkat Lanjut",
  "Seni Budaya",
];
'''

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(ts_content, encoding="utf-8")
    print(f"✅ Generated {len(entries)} jurusan ke {OUT_PATH}")


if __name__ == "__main__":
    main()