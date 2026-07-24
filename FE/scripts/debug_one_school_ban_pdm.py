
"""
Debug scraper BAN-PDM untuk 1 sekolah saja.
Cocok untuk ngetes alur Kota Bekasi -> 1 NPSN -> detail akreditasi.
"""
import requests, time, json
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE = "https://ban-pdm.id"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
}

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

    print(f"POST {url}")
    for attempt in range(max_attempts):
        try:
            resp = session.post(url, headers=headers, data=data, timeout=30)
        except Exception as e:
            print("request error:", e)
            time.sleep(3)
            continue

        print(f"attempt={attempt+1} status={resp.status_code} len={len(resp.text)}")
        try:
            payload = json.loads(resp.text)
            print("json payload:", payload)
        except Exception:
            payload = None
            print("html snippet:", resp.text[:300].replace('\n', ' '))

        if payload and payload.get("status") == "queued":
            print("masih queued, tunggu...")
            time.sleep(wait)
            continue
        return resp.text
    return None

def get_region_links(html):
    soup = BeautifulSoup(html, "lxml")
    links = []
    seen = set()
    for a in soup.select("a[href]"):
        href = a.get("href", "")
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
        print("table sekolah tidak ditemukan")
        return []

    rows = []
    for tr in table.find_all("tr"):
        cols = [td.get_text(strip=True) for td in tr.find_all("td")]
        if len(cols) >= 6 and cols[0].isdigit():
            rows.append(cols)
    return rows

def fetch_school_detail(npsn):
    url = f"{BASE}/satuanpendidikan/{npsn}"
    print(f"GET {url}")
    resp = session.get(url, headers={"User-Agent": HEADERS["User-Agent"]}, timeout=30)
    print(f"detail status={resp.status_code} len={len(resp.text)}")

    soup = BeautifulSoup(resp.text, "lxml")
    tables = soup.find_all("table")
    print("jumlah table detail:", len(tables))

    if len(tables) < 2:
        return None

    info_table = tables[0]
    akr_table = tables[1]

    print("--- INFO SEKOLAH ---")
    for tr in info_table.find_all("tr")[:10]:
        cols = [c.get_text(" ", strip=True) for c in tr.find_all(["th", "td"])]
        if cols:
            print(cols)

    print("--- RIWAYAT AKREDITASI ---")
    found = []
    for tr in akr_table.find_all("tr"):
        cols = [td.get_text(" ", strip=True) for td in tr.find_all(["th", "td"])]
        if cols:
            print(cols)
        tds = [td.get_text(" ", strip=True) for td in tr.find_all("td")]
        if len(tds) >= 7 and tds[0].isdigit():
            found.append({
                "riwayat_no": tds[0],
                "program": tds[1],
                "peringkat": tds[2],
                "no_sk": tds[3],
                "tahun_akreditasi": tds[4],
                "provinsi_riwayat": tds[5],
                "tahun_berakhir": tds[6],
            })
    return found

def debug_one_school(target_province="JAWA BARAT", target_kabupaten="KOTA BEKASI", keyword_school="SMAN 8"):
    print("=== STEP 1: daftar provinsi ===")
    prov_html = fetch_data("")
    provinces = get_region_links(prov_html)
    prov_code = None
    for name, code in provinces:
        if target_province.upper() in name.upper():
            prov_code = code
            print("provinsi ditemukan:", name, code)
            break
    if not prov_code:
        print("provinsi tidak ditemukan")
        return

    print("\n=== STEP 2: daftar kabupaten/kota ===")
    kab_html = fetch_data(prov_code)
    kab_links = get_region_links(kab_html)
    kab_code = None
    for name, code in kab_links:
        if target_kabupaten.upper() in name.upper():
            kab_code = code
            print("kabupaten ditemukan:", name, code)
            break
    if not kab_code:
        print("kabupaten tidak ditemukan")
        return

    print("\n=== STEP 3: daftar kecamatan ===")
    kec_html = fetch_data(kab_code)
    kec_links = get_region_links(kec_html)
    print("jumlah kecamatan:", len(kec_links))

    print("\n=== STEP 4: cari sekolah ===")
    for kec_name, kec_code in kec_links:
        print(f"cek kecamatan: {kec_name} ({kec_code})")
        html = fetch_data(kec_code)
        rows = get_school_rows(html)
        print("jumlah rows sekolah:", len(rows))

        for row in rows:
            nama = row[2]
            if keyword_school.upper() in nama.upper():
                print("\nSEKOLAH DITEMUKAN")
                print({
                    "npsn": row[1],
                    "nama": row[2],
                    "alamat": row[3],
                    "kelurahan": row[4],
                    "status": row[5],
                    "kecamatan": kec_name,
                })

                print("\n=== STEP 5: detail sekolah ===")
                akr = fetch_school_detail(row[1])
                print("\nHASIL PARSE AKREDITASI:")
                print(akr)
                return

    print("sekolah tidak ditemukan dengan keyword:", keyword_school)

if __name__ == "__main__":
    debug_one_school(
        target_province="JAWA BARAT",
        target_kabupaten="KOTA BEKASI",
        keyword_school="SMAN 8"
    )
