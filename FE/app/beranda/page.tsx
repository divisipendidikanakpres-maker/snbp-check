"use client";

import { NavBar } from "@/components/nav-bar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { KURIKULUM_DATA } from "@/lib/data-kurikulum";
import { SEKOLAH_DATA, SekolahItem } from "@/lib/data-sekolah";
import { PROVINSI_DATA, type Provinsi } from "@/lib/data-wilayah";
import { badgeClass, getStatusInfo, slugify } from "@/lib/utils-snbp";
import { LEVEL_KEKETATAN_INFO } from "@/lib/level-keketatan";
import { useSekolah } from "@/hooks/useSekolah";
import { useUniversitas, type Universitas } from "@/hooks/useUniversitas";
import { useProdi, type Prodi } from "@/hooks/useProdi";
import { useHistory } from "@/hooks/useHistory";
import { InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const RAPOR_FIELDS = [
  { id: "rapor_10_1", label: "Kelas 10 - Semester 1" },
  { id: "rapor_10_2", label: "Kelas 10 - Semester 2" },
  { id: "rapor_11_1", label: "Kelas 11 - Semester 1" },
  { id: "rapor_11_2", label: "Kelas 11 - Semester 2" },
  { id: "rapor_12_1", label: "Kelas 12 - Semester 1" },
];

const TKA_WAJIB_FIELDS = [
  { id: "tka_wajib_matematika", label: "Matematika" },
  { id: "tka_wajib_bahasa_indonesia", label: "Bahasa Indonesia" },
  { id: "tka_wajib_bahasa_inggris", label: "Bahasa Inggris" },
];

export default function Home() {
  const router = useRouter();
  const { list: listSekolah } = useSekolah();
  const { list: listUniversitas } = useUniversitas();
  const { list: listProdi, getById, suggest } = useProdi();
  const { create: createHistory } = useHistory();

  const [step, setStepState] = useState(1);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [sekolahList, setSekolahList] = useState<any[]>([]);

  const [rapor, setRapor] = useState<Record<string, string>>({});
  const [avgRaporGlobal, setAvgRaporGlobal] = useState<number | null>(null);
  const [hasilRaporMsg, setHasilRaporMsg] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  const [punyaTKA, setPunyaTKA] = useState<boolean | null>(null);
  const [tkaWajib, setTkaWajib] = useState<Record<string, string>>({});
  const [selectedPendukung, setSelectedPendukung] = useState<string[]>([]);
  const [tkaPendukungValues, setTkaPendukungValues] = useState<
    Record<string, string>
  >({});
  const [avgTKAWajib, setAvgTKAWajib] = useState<number | null>(null);
  const [avgTKAPendukung, setAvgTKAPendukung] = useState<number | null>(null);
  const [avgTKAAll, setAvgTKAAll] = useState<number | null>(null);
  const [hasilTKAMsg, setHasilTKAMsg] = useState<{
    text: string;
    error?: boolean;
  } | null>(null);

  const [ptn, setPtn] = useState("");
  const [jurusanId, setJurusanId] = useState("");
  const [universitasList, setUniversitasList] = useState<Universitas[]>([]);
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [selectedUniversitas, setSelectedUniversitas] = useState<Universitas | null>(null);

  const [hasilRasionalisasi, setHasilRasionalisasi] = useState<{
    programStudi: string;
    universitas: string;
    estimasi: number;
    levelKeketatan: string;
    referensiRanking: string;
    stat: ReturnType<typeof getStatusInfo>;
    selisihText: string;
    avgRaporGlobal: number;
    avgTKAAll: number | null;
    bobotRapor: number;
    bobotTKA: number;
    nilaiAkhir: number;
  } | null>(null);

  const [raporErrors, setRaporErrors] = useState<Record<string, boolean>>({});

  const [schoolNpsn, setSchoolNpsn] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<SekolahItem | null>(
    null,
  );

  const [kurikulum, setKurikulum] = useState("");

  const [kurikulumErrors, setKurikulumErrors] = useState<{
    sekolah?: boolean;
    kurikulum?: boolean;
  }>({});

  // --- Wilayah: Provinsi → Kota cascade ---
  const [selectedProvinsi, setSelectedProvinsi] = useState<Provinsi | null>(null);
  const [selectedKota, setSelectedKota] = useState<{ value: string; label: string } | null>(null);

  const kotaList = useMemo(() => selectedProvinsi?.kota ?? [], [selectedProvinsi]);

  // --- Infinite remote loading states for selects (schools, universities, prodi) ---
  const [schoolPage, setSchoolPage] = useState(1);
  const [schoolLimit] = useState(20);
  const [schoolTotal, setSchoolTotal] = useState<number | null>(null);
  const [schoolLoadingMore, setSchoolLoadingMore] = useState(false);
  const [schoolQuery, setSchoolQuery] = useState("");

  const [uniPage, setUniPage] = useState(1);
  const [uniLimit] = useState(20);
  const [uniTotal, setUniTotal] = useState<number | null>(null);
  const [uniLoadingMore, setUniLoadingMore] = useState(false);
  const [uniQuery, setUniQuery] = useState("");

  const [prodiPage, setProdiPage] = useState(1);
  const [prodiLimit] = useState(20);
  const [prodiTotal, setProdiTotal] = useState<number | null>(null);
  const [prodiLoadingMore, setProdiLoadingMore] = useState(false);
  const [prodiQuery, setProdiQuery] = useState("");

  // initial load universitas
  useEffect(() => {
    listUniversitas(undefined, undefined, 1, uniLimit)
      .then((res) => {
        setUniversitasList(res.data);
        setUniTotal(res.total);
        setUniPage(1);
      })
      .catch(() => setUniversitasList([]));
  }, []);

  // Load sekolah saat kota dipilih (cascade) atau saat schoolQuery berubah
  useEffect(() => {
    // Strip prefix seperti "Kota ", "Kab. " dari nama kota sebelum dikirim ke API
    const stripPrefix = (s: string) =>
      s.replace(/^(Kota|Kab\.|Kabupaten|Prov\.)\s*/i, '').trim();

    const query = schoolQuery
      ? schoolQuery  // user mengetik manual di search box
      : selectedKota?.value
        ? stripPrefix(selectedKota.value)  // gunakan nama kota yang sudah di-strip
        : undefined;

    setSchoolLoadingMore(true);
    listSekolah(query, 1, schoolLimit)
      .then((res) => {
        setSekolahList(res.data);
        setSchoolTotal(res.total);
        setSchoolPage(1);
      })
      .catch(() => setSekolahList([]))
      .finally(() => setSchoolLoadingMore(false));
  }, [selectedKota, schoolQuery]);

  // reset prodi list when selected university changes
  useEffect(() => {
    setProdiList([]);
    setProdiPage(1);
    setProdiTotal(null);
    setProdiQuery("");
  }, [selectedUniversitas]);

  const schoolItems = useMemo(() => {
    return sekolahList.map((s: any) => {
      const lokasiParts: string[] = [];
      if (s.kota) lokasiParts.push(s.kota);
      if (s.provinsi) lokasiParts.push(s.provinsi);
      const lokasi = lokasiParts.join(', ');
      return {
        value: s.id,
        label: s.namaSekolah,
        subLabel: lokasi,
        namaSekolah: s.namaSekolah,
        akreditasi: (s.akreditasi ?? '-') as 'A' | 'B' | 'C' | '-',
        provinsi: s.provinsi ?? '',
        kota: s.kota ?? '',
        kecamatan: s.kecamatan ?? '',
        npsn: s.npsn ?? s.id,
      };
    });
  }, [sekolahList]);

  const selectedSchoolItem = schoolItems.find(
    (item) => item.value === schoolNpsn,
  ) ?? {
    value: "",
    label: "-- Pilih Sekolah --",
    subLabel: "",
    namaSekolah: "",
    akreditasi: "-" as const,
    provinsi: "",
    kota: "",
    kecamatan: "",
    npsn: "",
  };

  const selectedKurikulumItem = KURIKULUM_DATA.find(
    (k) => k.value === kurikulum,
  ) ?? {
    value: "",
    label: "-- Pilih Kurikulum --",
  };

  function onSelectSekolah(item: (typeof schoolItems)[number] | null) {
    if (!item?.value) return;
    setSchoolNpsn(item.value);
    setSelectedSchool({
      npsn: item.npsn || item.value,
      namaSekolah: item.namaSekolah,
      akreditasi: item.akreditasi,
      provinsi: item.provinsi,
      kota: item.kota,
      kecamatan: item.kecamatan,
    });
    setKurikulumErrors((prev) => ({ ...prev, sekolah: false }));
  }

  function onSelectKurikulum(item: { value: string; label: string } | null) {
    if (!item?.value) return;
    setKurikulum(item.value);
    setKurikulumErrors((prev) => ({ ...prev, kurikulum: false }));
  }

  function setStep(active: number) {
    setStepState(active);
    setDoneSteps((prev) => {
      const next = [1, 2, 3, 4].filter((s) => s < active);
      return next;
    });
  }

  // helper to safely read label from LEVEL_KEKETATAN_INFO without TS index errors
  function getLevelLabel(level?: string | null) {
    if (!level) return "";
    const key = level as keyof typeof LEVEL_KEKETATAN_INFO;
    return (LEVEL_KEKETATAN_INFO[key] && LEVEL_KEKETATAN_INFO[key].label) || String(level);
  }

  function simpanSekolahDanNext() {
    const errors: { sekolah?: boolean; kurikulum?: boolean } = {};

    if (!schoolNpsn) errors.sekolah = true;
    if (!kurikulum) errors.kurikulum = true;

    setKurikulumErrors(errors);

    if (errors.sekolah || errors.kurikulum) {
      setHasilRaporMsg({
        text: "Pilih sekolah dan kurikulum terlebih dahulu.",
        error: true,
      });
      return;
    }

    setHasilRaporMsg(null);
    setStep(2);
  }

  const [hasilSekolahMsg, setHasilSekolahMsg] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  function hitungRaporDanNext() {
    const nextErrors: Record<string, boolean> = {};
    let total = 0;
    let count = 0;
    let hasError = false;

    RAPOR_FIELDS.forEach(({ id }) => {
      const raw = (rapor[id] ?? "").trim();
      const value = parseFloat(raw);

      if (raw === "" || isNaN(value)) {
        nextErrors[id] = true;
        hasError = true;
        return;
      }

      // Accept any numeric value for rapor (no range restriction here).

      nextErrors[id] = false;
      total += value;
      count++;
    });

    setRaporErrors(nextErrors);

    if (hasError) {
      setHasilRaporMsg({
        text: "Semua nilai rapor wajib diisi",
        error: true,
      });
      return;
    }

    const avg = total / count;
    setAvgRaporGlobal(avg);
    setHasilRaporMsg({
      text: `Rata-rata rapor keseluruhan: ${avg.toFixed(2)} (dari ${count} semester)`,
      error: false,
    });
    setStep(3);
  }

  function onToggleTKA(ya: boolean) {
    setPunyaTKA(ya);
    if (!ya) {
      setTkaWajib({});
      setSelectedPendukung([]);
      setTkaPendukungValues({});
    }
  }

  // const rekomSet = useMemo(() => {
  //   const code = selectedJurusanCodeGlobal;
  //   let set = new Set<string>();
  //   if (code) {
  //     const d = SNBP_DATA.find((x) => x.code === code);
  //     if (d && d.mapelPendukungJurusan) {
  //       set = new Set(
  //         d.mapelPendukungJurusan
  //           .map((m) => LANJUT_MAP[m] || m)
  //           .filter((m) => ALL_TKA_PENDUKUNG.includes(m)),
  //       );
  //     }
  //   }
  //   return set;
  // }, [selectedJurusanCodeGlobal]);

  // function onTogglePendukung(mapel: string, isChecked: boolean) {
  //   setSelectedPendukung((prev) => {
  //     if (isChecked) {
  //       if (!prev.includes(mapel)) return [...prev, mapel];
  //       return prev;
  //     }
  //     return prev.filter((m) => m !== mapel);
  //   });
  // }

  function hitungTKAAndNext() {
    if (!punyaTKA) {
      setAvgTKAAll(null);
      setAvgTKAWajib(null);
      setAvgTKAPendukung(null);
      setHasilTKAMsg({
        text: "Kamu memilih tidak punya nilai TKA. Rasionalisasi akan memakai 100% nilai rapor.",
      });
      setStep(4);
      return;
    }

    let totalWajib = 0;
    let countWajib = 0;
    TKA_WAJIB_FIELDS.forEach(({ id }) => {
      const v = parseFloat(tkaWajib[id] ?? "");
      if (!isNaN(v)) {
        totalWajib += v;
        countWajib++;
      }
    });
    const wajibAvg = countWajib ? totalWajib / countWajib : null;
    setAvgTKAWajib(wajibAvg);

    let totalPendukung = 0;
    let countPendukung = 0;
    selectedPendukung.forEach((mapel) => {
      const id = `tka_pendukung_${slugify(mapel)}`;
      const v = parseFloat(tkaPendukungValues[id] ?? "");
      if (!isNaN(v)) {
        totalPendukung += v;
        countPendukung++;
      }
    });
    const pendukungAvg = countPendukung
      ? totalPendukung / countPendukung
      : null;
    setAvgTKAPendukung(pendukungAvg);

    let totalAll = 0;
    let countAll = 0;
    if (wajibAvg !== null) {
      totalAll += wajibAvg * countWajib;
      countAll += countWajib;
    }
    if (pendukungAvg !== null) {
      totalAll += pendukungAvg * countPendukung;
      countAll += countPendukung;
    }
    const allAvg = countAll ? totalAll / countAll : null;
    setAvgTKAAll(allAvg);

    if (allAvg === null) {
      setHasilTKAMsg({
        text: 'Isi minimal satu nilai TKA (wajib atau pendukung) atau pilih "Tidak" punya TKA.',
        error: true,
      });
      return;
    }

    setHasilTKAMsg({
      text: `Rata-rata TKA wajib: ${wajibAvg !== null ? wajibAvg.toFixed(2) : "-"} | Rata-rata TKA pendukung: ${pendukungAvg !== null ? pendukungAvg.toFixed(2) : "-"
        } | Rata-rata TKA keseluruhan: ${allAvg.toFixed(2)}`,
    });
    setStep(4);
  }

  // --- helper functions for infinite remote loading ---
  async function fetchSchoolPage(pageNum: number, q?: string) {
    try {
      // Strip prefix jika perlu
      const stripPrefix = (s: string) =>
        s.replace(/^(Kota|Kab\.|Kabupaten|Prov\.)\s*/i, '').trim();

      const query = q
        ? q  // jika ada query manual, gunakan langsung
        : selectedKota?.value
          ? stripPrefix(selectedKota.value)
          : undefined;

      const res = await listSekolah(query, pageNum, schoolLimit);
      return res;
    } catch (e) {
      return { data: [], total: 0, page: pageNum, limit: schoolLimit } as any;
    }
  }

  async function loadMoreSchool() {
    if (schoolLoadingMore) return;
    if (schoolTotal !== null && sekolahList.length >= schoolTotal) return;
    setSchoolLoadingMore(true);
    const next = schoolPage + 1;
    try {
      const res = await fetchSchoolPage(next, schoolQuery);
      setSekolahList((prev) => [...prev, ...res.data]);
      setSchoolPage(next);
      setSchoolTotal(res.total);
    } finally {
      setSchoolLoadingMore(false);
    }
  }

  function handleSchoolScroll(e: any) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 80) {
      loadMoreSchool();
    }
  }

  // Universities
  async function fetchUniPage(pageNum: number, q?: string) {
    try {
      const res = await listUniversitas(undefined, q || undefined, pageNum, uniLimit);
      return res;
    } catch (e) {
      return { data: [], total: 0, page: pageNum, limit: uniLimit } as any;
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setUniLoadingMore(true);
      fetchUniPage(1, uniQuery)
        .then((res) => {
          setUniversitasList(res.data);
          setUniTotal(res.total);
          setUniPage(1);
        })
        .finally(() => setUniLoadingMore(false));
    }, 400);
    return () => clearTimeout(t);
  }, [uniQuery]);

  async function loadMoreUni() {
    if (uniLoadingMore) return;
    if (uniTotal !== null && universitasList.length >= uniTotal) return;
    setUniLoadingMore(true);
    const next = uniPage + 1;
    try {
      const res = await fetchUniPage(next, uniQuery);
      setUniversitasList((prev) => [...prev, ...res.data]);
      setUniPage(next);
      setUniTotal(res.total);
    } finally {
      setUniLoadingMore(false);
    }
  }

  function handleUniScroll(e: any) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 80) {
      loadMoreUni();
    }
  }

  // Prodi (per-universitas)
  async function fetchProdiPage(pageNum: number, uniId?: string, q?: string) {
    if (!uniId) return { data: [], total: 0, page: pageNum, limit: prodiLimit } as any;
    try {
      const res = await listProdi(uniId, 'nilai_tertinggi', q || undefined, pageNum, prodiLimit);
      return res;
    } catch (e) {
      return { data: [], total: 0, page: pageNum, limit: prodiLimit } as any;
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      // prodiQuery changed, reload first page for currently selected university
      if (!selectedUniversitas) return;
      setProdiLoadingMore(true);
      fetchProdiPage(1, selectedUniversitas.id, prodiQuery)
        .then((res) => {
          setProdiList(res.data);
          setProdiTotal(res.total);
          setProdiPage(1);
        })
        .finally(() => setProdiLoadingMore(false));
    }, 400);
    return () => clearTimeout(t);
  }, [prodiQuery, selectedUniversitas]);

  async function loadMoreProdi() {
    if (prodiLoadingMore) return;
    if (!selectedUniversitas) return;
    if (prodiTotal !== null && prodiList.length >= prodiTotal) return;
    setProdiLoadingMore(true);
    const next = prodiPage + 1;
    try {
      const res = await fetchProdiPage(next, selectedUniversitas.id, prodiQuery);
      setProdiList((prev) => [...prev, ...res.data]);
      setProdiPage(next);
      setProdiTotal(res.total);
    } finally {
      setProdiLoadingMore(false);
    }
  }

  function handleProdiScroll(e: any) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 80) {
      loadMoreProdi();
    }
  }

  const ptnItems = useMemo(() => {
    return universitasList
      .slice()
      .sort((a, b) => (a.ranking ?? 999) - (b.ranking ?? 999))
      .map((u) => ({
        value: u.id,
        label: u.ranking != null
          ? `${u.ranking}. ${u.namaUniversitas}${u.singkatan ? ` (${u.singkatan})` : ''}`
          : `${u.namaUniversitas}${u.singkatan ? ` (${u.singkatan})` : ''}`,
      }));
  }, [universitasList]);

  const jurusanItems = useMemo(() => {
    return prodiList
      .slice()
      .sort((a, b) => b.nilai - a.nilai)
      .map((d) => ({
        value: d.id,
        label: d.kelompok?.nama
          ? `${d.programStudi} (${d.kelompok.nama})`
          : `${d.programStudi}${d.jenjang?.nama ? ` - ${d.jenjang.nama}` : ''}`,
      }));
  }, [prodiList]);

  const selectedPtnItem = ptnItems.find((item) => item.value === ptn) ?? {
    value: "",
    label: "-- Pilih PTN --",
  };

  const selectedJurusanItem = jurusanItems.find(
    (item) => item.value === jurusanId,
  ) ?? {
    value: "",
    label: "-- Pilih Program Studi --",
  };

  function loadJurusan(val: string) {
    setPtn(val);
    setJurusanId("");
    const universitas = universitasList.find((u) => u.id === val);
    setSelectedUniversitas(universitas ?? null);
    if (universitas) {
      // load first page of prodi for this university
      listProdi(universitas.id, 'nilai_tertinggi', undefined, 1, prodiLimit)
        .then((res) => {
          setProdiList(res.data);
          setProdiTotal(res.total);
          setProdiPage(1);
        })
        .catch(() => setProdiList([]));
    } else {
      setProdiList([]);
    }
  }

  function onJurusanChange(id: string) {
    setJurusanId(id);
  }

  const currentJurusan = useMemo(
    () => prodiList.find((x) => x.id === jurusanId) ?? null,
    [jurusanId, prodiList],
  );

  async function hitungRasionalisasi() {
    if (!jurusanId) {
      alert("Pilih PTN dan jurusan terlebih dahulu.");
      return;
    }
    if (avgRaporGlobal === null) {
      alert("Nilai rapor belum dihitung. Mulai dari langkah 1.");
      return;
    }

    const prodi = prodiList.find((item) => item.id === jurusanId);
    const universitas = selectedUniversitas;

    if (!prodi || !universitas) {
      alert("Data PTN atau jurusan tidak lengkap.");
      return;
    }

    const estimasi = prodi.nilai;
    let nilaiAkhir = avgRaporGlobal;
    let bobotRapor = 1.0;
    let bobotTKA = 0.0;
    if (avgTKAAll !== null) {
      bobotRapor = 0.85;
      bobotTKA = 0.15;
      nilaiAkhir = bobotRapor * avgRaporGlobal + bobotTKA * avgTKAAll;
    }

    const selisih = nilaiAkhir - estimasi;
    const stat = getStatusInfo(selisih);

    const params = new URLSearchParams({
      prodiId: jurusanId,
      avgRapor: avgRaporGlobal.toFixed(2),
      avgTKA: avgTKAAll !== null ? avgTKAAll.toFixed(2) : "",
      bobotRapor: bobotRapor.toString(),
      bobotTKA: bobotTKA.toString(),
      nilaiAkhir: nilaiAkhir.toFixed(2),
      selisih: selisih.toFixed(1),
    });

    createHistory({
      sekolahId: selectedSchool?.npsn,
      sekolahNama: selectedSchool?.namaSekolah ?? "-",
      universitasId: universitas.id,
      universitasNama: universitas.namaUniversitas,
      prodiId: prodi.id,
      prodiNama: prodi.programStudi,
      avgRapor: avgRaporGlobal,
      avgTKA: avgTKAAll,
      nilaiAkhir,
      persentase: stat.pct,
      selisih,
    }).catch(() => {
      // ignore history errors for now
    });

    router.push(`/beranda/hasil?${params.toString()}`);
  }

  return (
    <>
      <NavBar />

      <section className="pt-8 pb-14 px-4 bg-[#F8FAFA] border-b border-[#e0eded]">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#02747A] mb-2 leading-tight">
            Cek Rasionalisasi SNBP
          </h1>
          <p className="text-xs md:text-sm text-gray-500 max-w-3xl leading-relaxed">
            Isi nilai rata-rata rapor per semester, nilai TKA (opsional), lalu
            pilih PTN & jurusan. Sistem akan membandingkan nilaimu dengan
            estimasi nilai minimum SNBP setiap jurusan.
          </p>

          <div className="mt-8 flex items-center gap-2 sm:gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <div
                className={`step-circle ${step === 1 ? "active" : ""} ${doneSteps.includes(1) ? "done" : ""}`}
              >
                1
              </div>
              <span className={step === 1 ? "text-[#02747A] font-bold" : "text-gray-500"}>Data Diri</span>
            </div>

            <div className={`flex-1 h-0.5 transition-colors ${doneSteps.includes(1) ? "bg-[#02747A]" : "bg-[#d2e5e5]"}`} />

            <div className="flex items-center gap-2">
              <div
                className={`step-circle ${step === 2 ? "active" : ""} ${doneSteps.includes(2) ? "done" : ""}`}
              >
                2
              </div>
              <span className={step === 2 ? "text-[#02747A] font-bold" : "text-gray-500"}>Nilai Rapor</span>
            </div>

            <div className={`flex-1 h-0.5 transition-colors ${doneSteps.includes(2) ? "bg-[#02747A]" : "bg-[#d2e5e5]"}`} />

            <div className="flex items-center gap-2">
              <div
                className={`step-circle ${step === 3 ? "active" : ""} ${doneSteps.includes(3) ? "done" : ""}`}
              >
                3
              </div>
              <span className={step === 3 ? "text-[#02747A] font-bold" : "text-gray-500"}>Nilai TKA</span>
            </div>

            <div className={`flex-1 h-0.5 transition-colors ${doneSteps.includes(3) ? "bg-[#02747A]" : "bg-[#d2e5e5]"}`} />

            <div className="flex items-center gap-2">
              <div
                className={`step-circle ${step === 4 ? "active" : ""} ${doneSteps.includes(4) ? "done" : ""}`}
              >
                4
              </div>
              <span className={step === 4 ? "text-[#02747A] font-bold" : "text-gray-500"}>Rasionalisasi Jurusan</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-6 pb-8 md:pb-12">
        {step === 1 && (
          <Card className="rounded-2xl shadow-sm border border-[#e0eded] p-6 md:p-8 animate-fade bg-white space-y-5">
            <h2 className="text-lg font-extrabold text-[#02747A]">Data Sekolah</h2>
            <Alert variant={"info"} className="rounded-xl border-[#03989E]/30 bg-[#03989E]/5 text-[#02747A]">
              <InfoIcon className="text-[#03989E]" />
              <AlertDescription className="text-xs text-[#02747A]">
                Pilih provinsi dan kota terlebih dahulu, lalu pilih sekolah. Akreditasi akan
                terisi otomatis berdasarkan sekolah yang dipilih.
              </AlertDescription>
            </Alert>

            <Separator />

            {/* Provinsi & Kota cascade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Provinsi <span className="text-red-500">*</span>
                </Label>
                <Combobox
                  items={PROVINSI_DATA.map((p) => ({ value: p.value, label: p.label }))}
                  value={selectedProvinsi ? { value: selectedProvinsi.value, label: selectedProvinsi.label } : { value: "", label: "-- Pilih Provinsi --" }}
                  onValueChange={(item) => {
                    const prov = PROVINSI_DATA.find((p) => p.value === item?.value) ?? null;
                    setSelectedProvinsi(prov);
                    setSelectedKota(null);
                    setSchoolNpsn("");
                    setSelectedSchool(null);
                    setSekolahList([]);
                    setSchoolQuery("");
                  }}
                >
                  <ComboboxTrigger
                    render={
                      <Button
                        variant="outline"
                        className="w-full justify-between border-2 rounded-xl px-3 py-2.5 text-sm font-normal bg-white hover:bg-white border-gray-200"
                      >
                        <ComboboxValue placeholder="-- Pilih Provinsi --" />
                      </Button>
                    }
                  />
                  <ComboboxContent>
                    <ComboboxInput showTrigger={false} placeholder="Cari provinsi..." />
                    <ComboboxEmpty>Provinsi tidak ditemukan.</ComboboxEmpty>
                    <ComboboxList>
                      {PROVINSI_DATA.map((p) => (
                        <ComboboxItem key={p.value} value={{ value: p.value, label: p.label }}>
                          {p.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div>
                <Label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Kota / Kabupaten <span className="text-red-500">*</span>
                </Label>
                <Combobox
                  items={kotaList}
                  value={selectedKota ?? { value: "", label: selectedProvinsi ? "-- Pilih Kota --" : "-- Pilih Provinsi dulu --" }}
                  onValueChange={(item) => {
                    setSelectedKota(item ?? null);
                    setSchoolNpsn("");
                    setSelectedSchool(null);
                    setSekolahList([]);
                    setSchoolQuery("");
                  }}
                >
                  <ComboboxTrigger
                    render={
                      <Button
                        variant="outline"
                        className={`w-full justify-between border-2 rounded-xl px-3 py-2.5 text-sm font-normal bg-white hover:bg-white ${
                          !selectedProvinsi ? "border-gray-100 text-gray-300" : "border-gray-200"
                        }`}
                        disabled={!selectedProvinsi}
                      >
                        <ComboboxValue placeholder={selectedProvinsi ? "-- Pilih Kota --" : "-- Pilih Provinsi dulu --"} />
                      </Button>
                    }
                  />
                  <ComboboxContent>
                    <ComboboxInput showTrigger={false} placeholder="Cari kota..." />
                    <ComboboxEmpty>Kota tidak ditemukan.</ComboboxEmpty>
                    <ComboboxList>
                      {kotaList.map((k) => (
                        <ComboboxItem key={k.value} value={k}>
                          {k.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            {/* Sekolah & Akreditasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Sekolah <span className="text-red-500">*</span>
                </Label>

                <Combobox
                  items={schoolItems}
                  value={selectedSchoolItem}
                  onValueChange={onSelectSekolah}
                >
                  <ComboboxTrigger
                    render={
                      <Button
                        variant="outline"
                        className={`w-full justify-between border-2 rounded-xl px-3 py-2.5 text-sm font-normal bg-white hover:bg-white ${kurikulumErrors.sekolah
                            ? "border-red-500"
                            : "border-gray-200"
                          }`}
                      >
                        <ComboboxValue placeholder="-- Pilih Sekolah --" />
                      </Button>
                    }
                  />
                  <ComboboxContent>
                    <ComboboxInput
                      showTrigger={false}
                      placeholder="Cari sekolah..."
                      onInput={(e: any) => {
                        const v = e.target.value ?? "";
                        setSchoolQuery(v);
                      }}
                    />
                    <ComboboxEmpty>
                      {schoolLoadingMore ? "Memuat data sekolah..." : "Sekolah tidak ditemukan."}
                    </ComboboxEmpty>
                    <ComboboxList onScroll={handleSchoolScroll}>
                      {schoolItems.map((item) => (
                        <ComboboxItem key={item.value} value={item}>
                          <div className="flex flex-col">
                            <span className="font-medium text-xs leading-tight">{item.label}</span>
                            {item.subLabel && (
                              <span className="text-[10px] text-gray-400 leading-tight">{item.subLabel}</span>
                            )}
                          </div>
                        </ComboboxItem>
                      ))}
                      {schoolLoadingMore && (
                        <div className="p-2 text-center text-xs text-gray-400">
                          Memuat sekolah...
                        </div>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                {kurikulumErrors.sekolah && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Sekolah wajib dipilih.
                  </p>
                )}
              </div>

              <div>
                <Label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Akreditasi
                </Label>
                <Input
                  disabled
                  value={
                    selectedSchool
                      ? `Akreditasi ${selectedSchool.akreditasi}`
                      : ""
                  }
                  placeholder="Terisi otomatis"
                  className="bg-gray-50 text-xs font-semibold text-[#02747A] rounded-xl border-[#d2e5e5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Kurikulum <span className="text-red-500">*</span>
                </Label>

                <Combobox
                  items={KURIKULUM_DATA}
                  value={selectedKurikulumItem}
                  onValueChange={onSelectKurikulum}
                >
                  <ComboboxTrigger
                    render={
                      <Button
                        variant="outline"
                        className={`w-full justify-between border-2 rounded-xl px-3 py-2.5 text-sm font-normal bg-white hover:bg-white ${kurikulumErrors.kurikulum
                            ? "border-red-500"
                            : "border-gray-200"
                          }`}
                      >
                        <ComboboxValue placeholder="-- Pilih Kurikulum --" />
                      </Button>
                    }
                  />
                  <ComboboxContent>
                    <ComboboxInput
                      showTrigger={false}
                      placeholder="Cari kurikulum..."
                    />
                    <ComboboxEmpty>Kurikulum tidak ditemukan.</ComboboxEmpty>
                    <ComboboxList>
                      {KURIKULUM_DATA.map((item) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                {kurikulumErrors.kurikulum && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Kurikulum wajib dipilih.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col md:items-end gap-3">
              <Button
                onClick={simpanSekolahDanNext}
                className="rounded-xl bg-[#03989E] hover:bg-[#02747A] text-white font-bold px-8 py-2.5 text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                Simpan
              </Button>

              {hasilSekolahMsg && (
                <div
                  className={`text-xs ${hasilSekolahMsg.error ? "text-red-500" : "text-[#02747A] font-medium"}`}
                >
                  {hasilSekolahMsg.text}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">
        {step === 2 && (
          <Card className="rounded-2xl shadow-sm border border-[#e0eded] p-6 md:p-8 animate-fade bg-white space-y-5">
            <h2 className="text-lg font-extrabold text-[#02747A]">Nilai Rapor</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {RAPOR_FIELDS.map(({ id, label }) => (
                <div key={id}>
                  <Label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {label} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step={0.1}
                    placeholder="contoh: 88"
                    value={rapor[id] ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRapor((prev) => ({ ...prev, [id]: value }));
                      setRaporErrors((prev) => ({ ...prev, [id]: false }));
                    }}
                    className={`text-xs sm:text-sm rounded-xl border-[#d2e5e5] focus:border-[#03989E] ${raporErrors[id]
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                      }`}
                  />
                </div>
              ))}
            </div>

            <div className="">
              {hasilRaporMsg && (
                <div
                  className={`text-xs ${hasilRaporMsg.error ? "text-red-500" : "text-gray-700"
                    }`}
                >
                  {hasilRaporMsg.error ? (
                    hasilRaporMsg.text
                  ) : (
                    <>
                      Rata-rata rapor keseluruhan:{" "}
                      <span className="font-bold text-[#03989E]">
                        {avgRaporGlobal?.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col md:items-end md:justify-between gap-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="rounded-xl border-[#d2e5e5] text-gray-600 hover:border-[#03989E] hover:text-[#03989E] font-semibold px-7 py-2 text-xs sm:text-sm transition-all cursor-pointer"
                  onClick={() => setStep(1)}
                >
                  Kembali
                </Button>
                <Button
                  onClick={hitungRaporDanNext}
                  className="rounded-xl bg-[#03989E] hover:bg-[#02747A] text-white font-bold px-8 py-2 text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                >
                  Simpan
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="rounded-2xl shadow-sm border border-[#e0eded] p-6 md:p-8 animate-fade bg-white space-y-5 mb-4">
            <h2 className="text-lg font-extrabold text-[#02747A]">Nilai TKA</h2>
            <Alert variant={"info"} className="rounded-xl border-[#03989E]/30 bg-[#03989E]/5 text-[#02747A]">
              <InfoIcon className="text-[#03989E]" />
              <AlertDescription className="text-xs text-[#02747A]">
                Jika kamu punya skor TKA, masukkan di sini untuk memperkuat
                rasionalisasi. Kalau tidak punya, pilih &quot;Tidak&quot; dan
                langkah ini akan dilewati (rasionalisasi 100% dari nilai rapor).
              </AlertDescription>
            </Alert>
            <Separator />

            <div className="flex flex-col gap-3 mb-5">
              <div className="text-xs font-semibold text-gray-700">
                Apakah kamu punya nilai TKA?
              </div>
              <RadioGroup
                className="flex items-center gap-4 text-xs font-semibold"
                value={
                  punyaTKA === null ? undefined : punyaTKA ? "ya" : "tidak"
                }
                onValueChange={(v) => onToggleTKA(v === "ya")}
              >
                <div className="inline-flex items-center gap-2">
                  <RadioGroupItem
                    value="ya"
                    id="tka-ya"
                    className="border-[#03989E] text-[#03989E]"
                  />
                  <Label htmlFor="tka-ya" className="cursor-pointer">Ya</Label>
                </div>
                <div className="inline-flex items-center gap-2">
                  <RadioGroupItem
                    value="tidak"
                    id="tka-tidak"
                    className="border-[#03989E] text-[#03989E]"
                  />
                  <Label htmlFor="tka-tidak" className="cursor-pointer">Tidak</Label>
                </div>
              </RadioGroup>
            </div>

            {punyaTKA && (
              <div className="space-y-5 animate-fade">
                <Separator />
                <div className="border border-[#e0eded] rounded-2xl p-4 bg-[#F8FAFA]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-[#02747A]">
                      Mata Pelajaran Wajib TKA
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Boleh dikosongkan jika tidak punya nilai
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                    {TKA_WAJIB_FIELDS.map(({ id, label }) => (
                      <div key={id} className="flex flex-col gap-1.5">
                        <span className="text-gray-700 font-medium">{label}</span>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          placeholder="contoh: 88"
                          value={tkaWajib[id] ?? ""}
                          onChange={(e) =>
                            setTkaWajib((prev) => ({
                              ...prev,
                              [id]: e.target.value,
                            }))
                          }
                          className="text-xs sm:text-sm rounded-xl border-[#d2e5e5] bg-white focus:border-[#03989E]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col md:items-end md:justify-between gap-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="rounded-xl border-[#d2e5e5] text-gray-600 hover:border-[#03989E] hover:text-[#03989E] font-semibold px-7 py-2 text-xs sm:text-sm transition-all cursor-pointer"
                  onClick={() => setStep(2)}
                >
                  Kembali
                </Button>
                <Button
                  onClick={hitungTKAAndNext}
                  className="rounded-xl bg-[#03989E] hover:bg-[#02747A] text-white font-bold px-8 py-2 text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                >
                  Simpan
                </Button>
              </div>
              {hasilTKAMsg && (
                <div
                  className={`text-xs ${hasilTKAMsg.error ? "text-red-500" : "text-[#02747A] font-medium"} animate-fade`}
                >
                  {hasilTKAMsg.text}
                </div>
              )}
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card className="rounded-2xl shadow-sm border border-[#e0eded] p-6 md:p-8 animate-fade bg-white space-y-5 mb-4">
            <h2 className="text-lg font-extrabold text-[#02747A]">
              Rasionalisasi Jurusan SNBP
            </h2>
            <Alert variant={"info"} className="rounded-xl border-[#03989E]/30 bg-[#03989E]/5 text-[#02747A]">
              <InfoIcon className="text-[#03989E]" />
              <AlertDescription className="text-xs text-[#02747A]">
                Pilih PTN dan jurusan. Sistem akan menggunakan nilai rapor
                rata-rata dan TKA (jika ada) untuk membandingkan dengan estimasi
                nilai minimum jurusan dari database SNBP.
              </AlertDescription>
            </Alert>
            <Separator />

            <div className="grid gap-4 md:grid-cols-[1.2fr,1fr]">
              <div>
                <div className="space-y-3">
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Universitas
                    </Label>
                    <Combobox
                      items={ptnItems}
                      value={selectedPtnItem}
                      onValueChange={(item) => {
                        if (!item?.value) return;
                        loadJurusan(item.value);
                      }}
                    >
                      <ComboboxTrigger
                        render={
                          <Button
                            variant="outline"
                            className="w-full justify-between border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-normal bg-white hover:bg-white"
                          >
                            <ComboboxValue placeholder="-- Pilih PTN --" />
                          </Button>
                        }
                      />
                      <ComboboxContent>
                        <ComboboxInput
                          showTrigger={false}
                          placeholder="Cari universitas..."
                          onInput={(e: any) => setUniQuery(e.target.value ?? "")}
                        />
                        <ComboboxEmpty>
                          Universitas tidak ditemukan.
                        </ComboboxEmpty>
                        <ComboboxList onScroll={handleUniScroll}>
                          {ptnItems.map((item) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          ))}
                          {uniLoadingMore && (
                            <div className="px-3 py-2 text-sm text-center text-gray-500">Memuat...</div>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Program Studi
                    </Label>
                    <Combobox
                      items={jurusanItems}
                      value={selectedJurusanItem}
                      onValueChange={(item) => {
                        if (!item?.value) return;
                        onJurusanChange(item.value);
                      }}
                    >
                      <ComboboxTrigger
                        render={
                          <Button
                            variant="outline"
                            disabled={!ptn}
                            className="w-full justify-between border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-normal bg-white hover:bg-white disabled:opacity-50"
                          >
                            <ComboboxValue placeholder="-- Pilih Program Studi --" />
                          </Button>
                        }
                      />
                      <ComboboxContent>
                        <ComboboxInput
                          showTrigger={false}
                          placeholder="Cari program studi..."
                          onInput={(e: any) => setProdiQuery(e.target.value ?? "")}
                        />
                        <ComboboxEmpty>
                          Program studi tidak ditemukan.
                        </ComboboxEmpty>
                        <ComboboxList onScroll={handleProdiScroll}>
                          {jurusanItems.map((item) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          ))}
                          {prodiLoadingMore && (
                            <div className="px-3 py-2 text-sm text-center text-gray-500">Memuat...</div>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                </div>
                {currentJurusan && (
                  <div className="mt-4 bg-[#F8FAFA] border border-[#e0eded] rounded-2xl p-3.5 text-xs text-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#03989E]/10 text-[#02747A] flex items-center justify-center text-xs font-bold shrink-0">
                        Prodi
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-gray-800">
                          {currentJurusan.programStudi}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          <span className="block text-[#03989E] font-semibold">
                            {currentJurusan.universitas.namaUniversitas}
                          </span>
                          <span>Estimasi Nilai: <strong>{currentJurusan.nilai.toFixed(1)}</strong></span>
                        </div>
                      </div>
                      <span
                        className={badgeClass(currentJurusan.levelKeketatan)}
                      >
                        {getLevelLabel(currentJurusan.levelKeketatan)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-[#e0eded] rounded-2xl p-4 bg-[#F8FAFA] text-xs space-y-2">
                <div className="font-bold text-[#02747A] mb-2">
                  Ringkasan Nilai Kamu
                </div>
                <div>
                  {avgRaporGlobal !== null && (
                    <div>
                      Rata-rata rapor keseluruhan:{" "}
                      <span className="font-bold text-[#03989E]">
                        {avgRaporGlobal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {avgTKAAll !== null ? (
                    <>
                      <div>
                        Rata-rata TKA keseluruhan:{" "}
                        <span className="font-bold text-[#03989E]">
                          {avgTKAAll.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        Perhitungan akhir: ~85% rapor + 15% TKA.
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        Nilai TKA:{" "}
                        <span className="font-semibold text-gray-400">
                          tidak digunakan
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        Perhitungan akhir memakai 100% nilai rapor.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col md:items-end md:justify-between gap-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="rounded-xl border-[#d2e5e5] text-gray-600 hover:border-[#03989E] hover:text-[#03989E] font-semibold px-7 py-2 text-xs sm:text-sm transition-all cursor-pointer"
                  onClick={() => setStep(3)}
                >
                  Kembali
                </Button>
                <Button
                  onClick={hitungRasionalisasi}
                  className="rounded-xl bg-[#03989E] hover:bg-[#02747A] text-white font-bold px-8 py-2 text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                >
                  Lihat Hasil
                </Button>
              </div>
            </div>

            {hasilRasionalisasi && (
              <div className="mt-5 animate-fade">
                <div className="mt-4 bg-white rounded-3xl shadow-lg border border-gray-100 p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-500">
                        Hasil Rasionalisasi
                      </div>
                      <div className="text-lg font-bold text-gray-800 mt-1">
                        {hasilRasionalisasi.programStudi}
                      </div>
                      <div className="text-xs text-gray-500">
                        {hasilRasionalisasi.universitas} • Estimasi min:{" "}
                        <span className="font-semibold text-gray-800">
                          {hasilRasionalisasi.estimasi.toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-2">
                        <span
                          className={badgeClass(
                            hasilRasionalisasi.levelKeketatan as any,
                          )}
                        >
                          {getLevelLabel(hasilRasionalisasi.levelKeketatan)}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {hasilRasionalisasi.referensiRanking}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`${hasilRasionalisasi.stat.cls} rounded-2xl px-4 py-3 md:min-w-[220px]`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold">
                          {hasilRasionalisasi.stat.label}
                        </div>
                        <div className="text-xl font-extrabold">
                          {hasilRasionalisasi.selisihText}
                        </div>
                      </div>
                      <div className="text-[11px] mt-1.5">
                        {hasilRasionalisasi.stat.msg}
                      </div>
                      <div className="progress-bar mt-2">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${hasilRasionalisasi.stat.pct}%`,
                            background: "currentColor",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-gray-50 rounded-2xl p-3">
                      <div className="text-[11px] text-gray-500 mb-0.5">
                        Rata-rata rapor
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        {hasilRasionalisasi.avgRaporGlobal.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Bobot {(hasilRasionalisasi.bobotRapor * 100).toFixed(0)}
                        %
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3">
                      <div className="text-[11px] text-gray-500 mb-0.5">
                        Rata-rata TKA
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        {hasilRasionalisasi.avgTKAAll !== null
                          ? hasilRasionalisasi.avgTKAAll.toFixed(1)
                          : "-"}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Bobot {(hasilRasionalisasi.bobotTKA * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3">
                      <div className="text-[11px] text-gray-500 mb-0.5">
                        Nilai akhir rasionalisasi
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        {hasilRasionalisasi.nilaiAkhir.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Selisih {hasilRasionalisasi.selisihText} dari estimasi
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
