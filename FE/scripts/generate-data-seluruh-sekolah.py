"""
BAN-PDM Scraper - seluruh wilayah + akreditasi terbaru
Output: 1 sekolah = 1 baris, mengambil riwayat akreditasi terbaru dari halaman detail.
Bisa difilter seluruh Indonesia, per provinsi, atau per kabupaten.
"""
import requests, time, json, csv
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE = "https://ban-pdm.id"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
}

PROVINCES = [
    "ACEH", "BALI", "BANTEN", "BENGKULU", "DI YOGYAKARTA", "DKI JAKARTA", "GORONTALO",
    "JAMBI", "JAWA BARAT", "JAWA TENGAH", "JAWA TIMUR", "KALIMANTAN BARAT",
    "KALIMANTAN SELATAN", "KALIMANTAN TENGAH", "KALIMANTAN TIMUR", "KALIMANTAN UTARA",
    "KEPULAUAN BANGKA BELITUNG", "KEPULAUAN RIAU", "LAMPUNG", "MALUKU", "MALUKU UTARA",
    "NUSA TENGGARA BARAT", "NUSA TENGGARA TIMUR", "PAPUA", "PAPUA BARAT", "PAPUA BARAT DAYA",
    "PAPUA PEGUNUNGAN", "PAPUA SELATAN", "PAPUA TENGAH", "RIAU", "SULAWESI BARAT",
    "SULAWESI SELATAN", "SULAWESI TENGAH", "SULAWESI TENGGARA", "SULAWESI UTARA",
    "SUMATERA BARAT", "SUMATERA SELATAN", "SUMATERA UTARA"
]

def make_session():
    s = requests.Session()
    retries = Retry(total=5, backoff_factor=1.5, status_forcelist=[429, 500, 502, 503, 504])
    s.mount("https://", HTTPAdapter(max_retries=retries))
    return s

session = make_session()

def fetch_data(code_path="", max_attempts=15, wait=2):
    if code_path:
        url = f"{BASE}/data-akreditasi-sekolah/getDataAkreditasi/{code_path}"
        referer = f"{BASE}/data-akreditasi-sekolah/{code_path}"
    else:
        url = f"{BASE}/data-akreditasi-sekolah/getDataAkreditasi"
        referer = f"{BASE}/data-akreditasi-sekolah"

    headers = dict(HEADERS)
    headers["Referer"] = referer
    data = {"url": url}

    for _ in range(max_attempts):
        try:
            resp = session.post(url, headers=headers, data=data, timeout=30)
        except Exception:
            time.sleep(3)
            continue
        try:
            payload = json.loads(resp.text)
        except Exception:
            payload = None
        if payload and payload.get("status") == "queued":
            time.sleep(wait)
            continue
        return resp.text
    return None

def get_region_links(html):
    soup = BeautifulSoup(html, "lxml")
    links = []
    seen = set()
    for a in soup.select("a[href]"):
        href = a["href"]
        text = a.get_text(strip=True)
        if "/data-akreditasi-sekolah/" in href and href.rstrip("/") != f"{BASE}/data-akreditasi-sekolah":
            code = href.split("/data-akreditasi-sekolah/")[-1]
            key = (text, code)
            if key not in seen:
                seen.add(key)
                links.append((text, code))
    return links

def get_school_rows(html):
    soup = BeautifulSoup(html, "lxml")
    table = soup.find("table")
    if not table:
        return []
    rows = []
    for tr in table.find_all("tr"):
        cols = [td.get_text(strip=True) for td in tr.find_all("td")]
        if len(cols) >= 6 and cols[0].isdigit():
            rows.append(cols)
    return rows

def fetch_latest_akreditasi(npsn):
    url = f"{BASE}/satuanpendidikan/{npsn}"
    try:
        resp = session.get(url, headers={"User-Agent": HEADERS["User-Agent"]}, timeout=30)
    except Exception:
        return {
            "peringkat": "",
            "no_sk": "",
            "tahun_akreditasi": "",
            "provinsi_riwayat": "",
            "tahun_berakhir": "",
            "program": "",
        }

    soup = BeautifulSoup(resp.text, "lxml")
    tables = soup.find_all("table")
    if len(tables) < 2:
        return {
            "peringkat": "",
            "no_sk": "",
            "tahun_akreditasi": "",
            "provinsi_riwayat": "",
            "tahun_berakhir": "",
            "program": "",
        }

    akr_table = tables[1]
    for tr in akr_table.find_all("tr"):
        cols = [td.get_text(" ", strip=True) for td in tr.find_all("td")]
        if len(cols) >= 7 and cols[0].isdigit():
            return {
                "program": cols[1],
                "peringkat": cols[2],
                "no_sk": cols[3],
                "tahun_akreditasi": cols[4],
                "provinsi_riwayat": cols[5],
                "tahun_berakhir": cols[6],
            }

    return {
        "peringkat": "",
        "no_sk": "",
        "tahun_akreditasi": "",
        "provinsi_riwayat": "",
        "tahun_berakhir": "",
        "program": "",
    }

def get_all_provinces_map():
    html = fetch_data("")
    provinces = get_region_links(html)
    mapping = {}
    for name, code in provinces:
        mapping[name.upper()] = code
    return mapping

def crawl(output_csv="sma_smk_seluruh_indonesia_terbaru.csv", target_provinces=None, kabupaten_filter=None, checkpoint_every=100):
    provinces_map = get_all_provinces_map()

    if not target_provinces:
        target_provinces = list(provinces_map.keys())

    all_rows = []
    seen_npsn = set()
    processed = 0

    fieldnames = [
        "npsn", "nama_sekolah", "alamat", "kelurahan", "status", "kecamatan", "kabupaten", "provinsi",
        "program", "peringkat", "no_sk", "tahun_akreditasi", "provinsi_riwayat", "tahun_berakhir"
    ]

    for prov_name in target_provinces:
        prov_name_up = prov_name.upper()
        prov_code = provinces_map.get(prov_name_up)
        if not prov_code:
            print(f"Provinsi tidak ditemukan: {prov_name}")
            continue

        print(f"=== PROVINSI: {prov_name_up} ({prov_code}) ===")
        kab_html = fetch_data(prov_code)
        if not kab_html:
            continue

        kab_links = get_region_links(kab_html)
        if kabupaten_filter:
            kab_links = [(t, c) for t, c in kab_links if kabupaten_filter.upper() in t.upper()]

        for kab_name, kab_code in kab_links:
            print(f"-- {kab_name}")
            kec_html = fetch_data(kab_code)
            if not kec_html:
                continue

            kec_links = get_region_links(kec_html)
            for kec_name, kec_code in kec_links:
                html = fetch_data(kec_code)
                if not html:
                    continue

                rows = get_school_rows(html)
                for row in rows:
                    if len(row) < 6:
                        continue
                    if not any(k in row[2].upper() for k in ["SMA", "SMK"]):
                        continue

                    npsn = row[1]
                    if npsn in seen_npsn:
                        continue
                    seen_npsn.add(npsn)

                    akr = fetch_latest_akreditasi(npsn)
                    all_rows.append({
                        "npsn": npsn,
                        "nama_sekolah": row[2],
                        "alamat": row[3],
                        "kelurahan": row[4],
                        "status": row[5],
                        "kecamatan": kec_name,
                        "kabupaten": kab_name,
                        "provinsi": prov_name_up,
                        **akr,
                    })
                    processed += 1

                    if processed % checkpoint_every == 0:
                        with open(output_csv, "w", newline="", encoding="utf-8-sig") as f:
                            writer = csv.DictWriter(f, fieldnames=fieldnames)
                            writer.writeheader()
                            writer.writerows(all_rows)
                        print(f"checkpoint {processed} sekolah -> {output_csv}")

                    time.sleep(0.3)
                time.sleep(1)
            time.sleep(1)

    with open(output_csv, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"Selesai. Total sekolah: {len(all_rows)} -> {output_csv}")
    return all_rows

if __name__ == "__main__":
    # Seluruh Indonesia
    crawl(output_csv="sma_smk_seluruh_indonesia_terbaru.csv")

    # Contoh per provinsi:
    # crawl(output_csv="sma_smk_jawa_barat_terbaru.csv", target_provinces=["JAWA BARAT"])

    # Contoh per kabupaten di satu provinsi:
    # crawl(output_csv="sma_smk_kota_bekasi_terbaru.csv", target_provinces=["JAWA BARAT"], kabupaten_filter="KOTA BEKASI")