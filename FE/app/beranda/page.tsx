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
import { SNBP_DATA } from "@/lib/data-univ";
import { badgeClass, getStatusInfo, slugify } from "@/lib/utils-snbp";
import { useSekolah } from "@/hooks/useSekolah";
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
  const [jurusanCode, setJurusanCode] = useState("");
  const [selectedJurusanCodeGlobal, setSelectedJurusanCodeGlobal] = useState<
    string | null
  >(null);

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

  useEffect(() => {
    listSekolah()
      .then((res) => setSekolahList(res.data))
      .catch(() => setSekolahList([]));
  }, []);

  const schoolItems = useMemo(() => {
    return sekolahList.map((s) => ({
      value: s.id,
      label: `${s.namaSekolah}`,
      namaSekolah: s.namaSekolah,
      akreditasi: s.akreditasi,
    }));
  }, [sekolahList]);

  const selectedSchoolItem = schoolItems.find(
    (item) => item.value === schoolNpsn,
  ) ?? {
    value: "",
    label: "-- Pilih Sekolah --",
    namaSekolah: "",
    akreditasi: "-" as const,
    kecamatan: "",
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
      npsn: item.value,
      namaSekolah: item.namaSekolah,
      akreditasi: item.akreditasi,
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

      if (value < 60 || value > 100) {
        nextErrors[id] = true;
        hasError = true;
        return;
      }

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
      text: `Rata-rata TKA wajib: ${wajibAvg !== null ? wajibAvg.toFixed(2) : "-"} | Rata-rata TKA pendukung: ${
        pendukungAvg !== null ? pendukungAvg.toFixed(2) : "-"
      } | Rata-rata TKA keseluruhan: ${allAvg.toFixed(2)}`,
    });
    setStep(4);
  }

  const unis = useMemo(() => {
    const map = new Map<string, (typeof SNBP_DATA)[number]>();
    SNBP_DATA.forEach((d) => {
      if (!map.has(d.universitas)) map.set(d.universitas, d);
    });
    return [...map.values()].sort((a, b) => a.rankingPTN - b.rankingPTN);
  }, []);

  const jurusanOptions = useMemo(() => {
    if (!ptn) return [];
    return SNBP_DATA.filter((d) => d.universitas === ptn).sort(
      (a, b) => b.estimasiNilaiMin - a.estimasiNilaiMin,
    );
  }, [ptn]);

  const ptnItems = useMemo(() => {
    return unis.map((u) => ({
      value: u.universitas,
      label: `#${u.rankingPTN}. ${u.universitas} (${u.singkatan})`,
      universitas: u.universitas,
      singkatan: u.singkatan,
      rankingPTN: u.rankingPTN,
    }));
  }, [unis]);

  const selectedPtnItem = ptnItems.find((item) => item.value === ptn) ?? {
    value: "",
    label: "-- Pilih PTN --",
    universitas: "",
    singkatan: "",
    rankingPTN: 0,
  };

  const jurusanItems = useMemo(() => {
    return jurusanOptions.map((d) => ({
      value: d.code,
      label: `${d.programStudi} (Est. ${d.estimasiNilaiMin})`,
      code: d.code,
      programStudi: d.programStudi,
      estimasiNilaiMin: d.estimasiNilaiMin,
      universitas: d.universitas,
    }));
  }, [jurusanOptions]);

  const selectedJurusanItem = jurusanItems.find(
    (item) => item.value === jurusanCode,
  ) ?? {
    value: "",
    label: "-- Pilih Program Studi --",
    code: "",
    programStudi: "",
    estimasiNilaiMin: 0,
    universitas: "",
  };

  function loadJurusan(val: string) {
    setPtn(val);
    setJurusanCode("");
    setSelectedJurusanCodeGlobal(null);
  }

  function onJurusanChange(code: string) {
    setJurusanCode(code);
    if (!code) {
      setSelectedJurusanCodeGlobal(null);
      return;
    }
    setSelectedJurusanCodeGlobal(code);
  }

  const currentJurusan = useMemo(
    () => SNBP_DATA.find((x) => x.code === jurusanCode) ?? null,
    [jurusanCode],
  );

  function hitungRasionalisasi() {
    if (!jurusanCode) {
      alert("Pilih PTN dan jurusan terlebih dahulu.");
      return;
    }
    if (avgRaporGlobal === null) {
      alert("Nilai rapor belum dihitung. Mulai dari langkah 1.");
      return;
    }
    const d = SNBP_DATA.find((x) => x.code === jurusanCode);
    if (!d) return;

    const estimasi = d.estimasiNilaiMin;
    let nilaiAkhir = avgRaporGlobal;
    let bobotRapor = 1.0;
    let bobotTKA = 0.0;
    if (avgTKAAll !== null) {
      bobotRapor = 0.85;
      bobotTKA = 0.15;
      nilaiAkhir = bobotRapor * avgRaporGlobal + bobotTKA * avgTKAAll;
    }

    const selisih = nilaiAkhir - estimasi;

    const params = new URLSearchParams({
      code: jurusanCode,
      avgRapor: avgRaporGlobal.toFixed(2),
      avgTKA: avgTKAAll !== null ? avgTKAAll.toFixed(2) : "",
      bobotRapor: bobotRapor.toString(),
      bobotTKA: bobotTKA.toString(),
      nilaiAkhir: nilaiAkhir.toFixed(2),
      selisih: selisih.toFixed(1),
    });

    router.push(`/hasil?${params.toString()}`);
  }

  return (
    <>
      <NavBar title="GoPrestasi" />

      <section className="text-black pt-10 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-3">
            Cek Rasionalisasi SNBP
          </h1>
          <p className="text-sm md:text-base text-black max-w-3xl">
            Isi nilai rata-rata rapor per semester, nilai TKA (opsional), lalu
            pilih PTN & jurusan. Sistem akan membandingkan nilaimu dengan
            estimasi nilai minimum SNBP setiap jurusan.
          </p>

          <div className="mt-6 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`step-circle ${step === 1 ? "active" : ""} ${doneSteps.includes(1) ? "done" : ""}`}
              >
                1
              </div>
              <span>Data Diri</span>
            </div>

            <div className="flex-1 h-px bg-indigo-200" />

            <div className="flex items-center gap-2">
              <div
                className={`step-circle ${step === 2 ? "active" : ""} ${doneSteps.includes(2) ? "done" : ""}`}
              >
                2
              </div>
              <span>Nilai Rapor</span>
            </div>

            <div className="flex-1 h-px bg-indigo-200" />

            <div className="flex items-center gap-2">
              <div
                className={`step-circle ${step === 3 ? "active" : ""} ${doneSteps.includes(3) ? "done" : ""}`}
              >
                3
              </div>
              <span>Nilai TKA</span>
            </div>

            <div className="flex-1 h-px bg-indigo-200" />

            <div className="flex items-center gap-2">
              <div
                className={`step-circle ${step === 4 ? "active" : ""} ${doneSteps.includes(4) ? "done" : ""}`}
              >
                4
              </div>
              <span>Rasionalisasi Jurusan</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-8">
        {step === 1 && (
          <Card className="rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 animate-fade">
            <h2 className="text-xl font-bold text-gray-800">Data Sekolah</h2>
            <Alert variant={"info"}>
              <InfoIcon />
              <AlertDescription>
                Pilih sekolah dan kurikulum terlebih dahulu. Akreditasi akan
                terisi otomatis berdasarkan sekolah yang dipilih.
              </AlertDescription>
            </Alert>

            <Separator />

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
                        className={`w-full justify-between border-2 rounded-xl px-3 py-2.5 text-sm font-normal bg-white hover:bg-white ${
                          kurikulumErrors.sekolah
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
                    />
                    <ComboboxEmpty>Sekolah tidak ditemukan.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.label}
                        </ComboboxItem>
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
                  value={selectedSchool ? selectedSchool.akreditasi : ""}
                  readOnly
                  className="text-sm bg-gray-50"
                />
              </div>

              <div className="md:col-span-2">
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
                        className={`w-full justify-between border-2 rounded-xl px-3 py-2.5 text-sm font-normal bg-white hover:bg-white ${
                          kurikulumErrors.kurikulum
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
                      {(item) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.label}
                        </ComboboxItem>
                      )}
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

            <div className="mt-4 flex flex-col md:items-end gap-3">
              <Button
                onClick={simpanSekolahDanNext}
                className="text-white px-10 py-4 text-sm hover:opacity-90 transition hover:-translate-y-0.5 shadow-md cursor-pointer"
              >
                Simpan
              </Button>

              {hasilSekolahMsg && (
                <div
                  className={`text-xs ${hasilSekolahMsg.error ? "text-red-500" : "text-gray-700"}`}
                >
                  {hasilSekolahMsg.text}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8">
        {step === 2 && (
          <Card className="rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 animate-fade">
            <h2 className="text-xl font-bold text-gray-800">Nilai Rapor</h2>
            <Alert variant={"info"}>
              <InfoIcon />
              <AlertDescription>
                Masukkan nilai rata-rata rapor untuk setiap semester. Nilai
                rata-rata adalah jumlah dari semua nilai mata pelajaran di
                semester tersebut dibagi dengan jumlah mata pelajaran. settings.
              </AlertDescription>
            </Alert>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {RAPOR_FIELDS.map(({ id, label }) => (
                <div key={id}>
                  <Label className="block text-xs font-semibold mb-1.5">
                    {label} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={60}
                    max={100}
                    step={0.1}
                    placeholder="contoh: 88"
                    value={rapor[id] ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRapor((prev) => ({ ...prev, [id]: value }));
                      setRaporErrors((prev) => ({ ...prev, [id]: false }));
                    }}
                    className={`text-sm focus-visible:border-indigo-400 ${
                      raporErrors[id]
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
                  className={`text-xs ${
                    hasilRaporMsg.error ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  {hasilRaporMsg.error ? (
                    hasilRaporMsg.text
                  ) : (
                    <>
                      Rata-rata rapor keseluruhan:{" "}
                      <span className="font-bold text-indigo-600">
                        {avgRaporGlobal?.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col md:items-end md:justify-between gap-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="px-10 py-4 text-sm hover:opacity-90 transition hover:-translate-y-0.5 shadow-md cursor-pointer"
                  onClick={() => setStep(1)}
                >
                  Kembali
                </Button>
                <Button
                  onClick={hitungRaporDanNext}
                  className="text-white px-10 py-4 text-sm hover:opacity-90 transition hover:-translate-y-0.5 shadow-md cursor-pointer"
                >
                  Simpan
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="rounded-3xl shadow-xl border mb-4 border-gray-100 p-6 md:p-8 animate-fade">
            <h2 className="text-xl font-bold text-gray-800">Nilai TKA</h2>
            <Alert>
              <InfoIcon />
              <AlertDescription>
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
                className="flex items-center gap-4 text-xs"
                value={
                  punyaTKA === null ? undefined : punyaTKA ? "ya" : "tidak"
                }
                onValueChange={(v) => onToggleTKA(v === "ya")}
              >
                <div className="inline-flex items-center gap-1.5">
                  <RadioGroupItem
                    value="ya"
                    id="tka-ya"
                    className="accent-indigo-500"
                  />
                  <Label htmlFor="tka-ya">Ya</Label>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <RadioGroupItem
                    value="tidak"
                    id="tka-tidak"
                    className="accent-indigo-500"
                  />
                  <Label htmlFor="tka-tidak">Tidak</Label>
                </div>
              </RadioGroup>
              <Alert variant={"info"}>
                <InfoIcon />
                <AlertDescription>
                  Kalau kamu pilih <strong>&quot;Tidak&quot;</strong>, nilai TKA
                  tidak akan dipakai dalam perhitungan peluang.
                </AlertDescription>
              </Alert>
            </div>

            {punyaTKA && (
              <div className="space-y-5 animate-fade">
                <Separator />
                <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-gray-700">
                      Mata Pelajaran Wajib TKA
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Boleh dikosongkan jika tidak punya nilai
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                    {TKA_WAJIB_FIELDS.map(({ id, label }) => (
                      <div key={id} className="flex flex-col gap-1">
                        <span className="text-gray-600">{label}</span>
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
                          className="text-sm focus-visible:border-indigo-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col md:items-end md:justify-between gap-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="px-10 py-4 text-sm hover:opacity-90 transition hover:-translate-y-0.5 shadow-md cursor-pointer"
                  onClick={() => setStep(2)}
                >
                  Kembali
                </Button>
                <Button
                  onClick={hitungTKAAndNext}
                  className="text-white px-10 py-4 text-sm hover:opacity-90 transition hover:-translate-y-0.5 shadow-md cursor-pointer"
                >
                  Simpan
                </Button>
              </div>
              {hasilTKAMsg && (
                <div
                  className={`text-xs ${hasilTKAMsg.error ? "text-red-500" : "text-gray-700"} animate-fade`}
                >
                  {hasilTKAMsg.text}
                </div>
              )}
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card className="rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 animate-fade mb-4">
            <h2 className="text-base font-bold text-gray-800">
              Rasionalisasi Jurusan SNBP
            </h2>
            <Alert variant={"info"}>
              <InfoIcon />
              <AlertDescription>
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
                    <Label className="block text-xs font-semibold text-gray-600 mb-1.5">
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
                        />
                        <ComboboxEmpty>
                          Universitas tidak ditemukan.
                        </ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <div>
                    <Label className="block text-xs font-semibold text-gray-600 mb-1.5">
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
                        />
                        <ComboboxEmpty>
                          Program studi tidak ditemukan.
                        </ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                </div>
                {currentJurusan && (
                  <div className="mt-4 bg-zinc-50 border border-zinc-100 rounded-2xl p-3 text-xs text-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                        Prodi
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-800">
                          {currentJurusan.programStudi}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          <span className="flex">
                            {currentJurusan.universitas}
                          </span>
                          <span>
                            Estimasi : {currentJurusan.estimasiNilaiMin}
                          </span>
                        </div>
                      </div>
                      <span
                        className={badgeClass(currentJurusan.levelKeketatan)}
                      >
                        {currentJurusan.levelKeketatan}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-gray-100 rounded-2xl p-3 bg-gray-50 text-xs">
                <div className="font-semibold text-gray-700 mb-2">
                  Ringkasan Nilai Kamu
                </div>
                <div>
                  {avgRaporGlobal !== null && (
                    <div>
                      Rata-rata rapor keseluruhan:{" "}
                      <span className="font-bold text-indigo-600">
                        {avgRaporGlobal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {avgTKAAll !== null ? (
                    <>
                      <div>
                        Rata-rata TKA keseluruhan:{" "}
                        <span className="font-bold text-indigo-600">
                          {avgTKAAll.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        Perhitungan akhir: ~85% rapor + 15% TKA.
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        Nilai TKA:{" "}
                        <span className="font-semibold text-gray-500">
                          tidak digunakan
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        Perhitungan akhir memakai 100% nilai rapor.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col md:items-end md:justify-between gap-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="px-10 py-4 text-sm hover:opacity-90 transition hover:-translate-y-0.5 shadow-md cursor-pointer"
                  onClick={() => setStep(3)}
                >
                  Kembali
                </Button>
                <Button
                  onClick={hitungRasionalisasi}
                  className="text-white px-10 py-4 text-sm hover:opacity-90 transition hover:-translate-y-0.5 shadow-md cursor-pointer"
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
                          {hasilRasionalisasi.levelKeketatan}
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
