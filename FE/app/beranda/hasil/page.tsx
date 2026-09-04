import { ChartPieDonutText } from "@/components/PieChartDonut";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { badgeClass, getStatusInfo } from "@/lib/utils-snbp";
import { LEVEL_KEKETATAN_INFO } from "@/lib/level-keketatan";
import type { LevelKeketatan } from "@/hooks/useProdi";
import { FileChartPie } from "lucide-react";
import Link from "next/link";

const chartConfig: ChartConfig = {
  avgRapor: {
    label: "Rata-rata Rapor",
    color: "hsl(var(--chart-1))",
  },
  avgTKA: {
    label: "Rata-rata TKA",
    color: "hsl(var(--chart-2))",
  },
  bobotRapor: {
    label: "Bobot Rapor (%)",
    color: "hsl(var(--chart-3))",
  },
  bobotTKA: {
    label: "Bobot TKA (%)",
    color: "hsl(var(--chart-4))",
  },
};

const chanceChartConfig: ChartConfig = {
  Peluang: {
    label: "Peluang lolos",
    color: "hsl(var(--chart-5))",
  },
  Sisa: {
    label: "Sisa",
    color: "hsl(var(--chart-2))",
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function fetchProdi(prodiId: string) {
  const res = await fetch(`${API_URL}/prodi/${encodeURIComponent(prodiId)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Gagal mengambil data prodi.');
  }
  const json = await res.json();
  return json.data as {
    id: string;
    programStudi: string;
    nilai: number;
    levelKeketatan: LevelKeketatan;
    universitas: { namaUniversitas: string; singkatan: string; provinsi: string; ranking: number | null };
  };
}

async function fetchSuggestions(prodiId: string, nilaiAkhir: number) {
  const searchParams = new URLSearchParams({
    prodiId,
    nilaiAkhir: nilaiAkhir.toString(),
  });
  const res = await fetch(`${API_URL}/prodi/suggestions?${searchParams.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return [];
  }
  const json = await res.json();
  return json.data as Array<{
    id: string;
    programStudi: string;
    nilai: number;
    levelKeketatan: string;
    universitas: { namaUniversitas: string };
    kelompok: { nama: string };
    jenjang: { nama: string };
  }>;
}

import { NavBar } from "@/components/nav-bar";

export default async function HasilPage({
  searchParams,
}: {
  searchParams: Promise<{
    prodiId?: string;
    prodiNama?: string;
    universitasNama?: string;
    estimasi?: string;
    levelKeketatan?: string;
    avgRapor?: string;
    avgTKA?: string;
    bobotRapor?: string;
    bobotTKA?: string;
    nilaiAkhir?: string;
    selisih?: string;
  }>;
}) {
  const {
    prodiId,
    prodiNama,
    universitasNama,
    estimasi: estimasiParam,
    levelKeketatan: levelKeketatanParam,
    avgRapor,
    avgTKA,
    bobotRapor,
    bobotTKA,
    nilaiAkhir,
    selisih,
  } = await searchParams;

  if (!avgRapor || !nilaiAkhir || !selisih || !bobotRapor || !bobotTKA) {
    return (
      <div className="min-h-screen bg-[#F8FAFA] flex flex-col">
        <NavBar />
        <div className="p-8 text-center text-sm text-gray-500">
          Data hasil tidak lengkap. Silakan <Link href="/beranda" className="text-[#03989E] font-bold underline">kembali ke kalkulator</Link>.
        </div>
      </div>
    );
  }

  let prodi: {
    id: string;
    programStudi: string;
    nilai: number;
    levelKeketatan: LevelKeketatan;
    universitas: { namaUniversitas: string; singkatan: string; provinsi: string; ranking: number | null };
  };

  if (prodiNama && universitasNama) {
    prodi = {
      id: prodiId || '1',
      programStudi: prodiNama,
      nilai: estimasiParam ? parseFloat(estimasiParam) : 85.0,
      levelKeketatan: (levelKeketatanParam as LevelKeketatan) || 'KETAT',
      universitas: {
        namaUniversitas: universitasNama,
        singkatan: '',
        provinsi: 'Indonesia',
        ranking: null,
      },
    };
  } else if (prodiId) {
    try {
      prodi = await fetchProdi(prodiId);
    } catch {
      return (
        <div className="min-h-screen bg-[#F8FAFA] flex flex-col">
          <NavBar />
          <div className="p-8 text-center text-sm text-gray-500">
            Tidak dapat menampilkan hasil prodi. Silakan <Link href="/beranda" className="text-[#03989E] font-bold underline">kembali ke kalkulator</Link>.
          </div>
        </div>
      );
    }
  } else {
    return (
      <div className="min-h-screen bg-[#F8FAFA] flex flex-col">
        <NavBar />
        <div className="p-8 text-center text-sm text-gray-500">
          Data hasil tidak lengkap. Silakan <Link href="/beranda" className="text-[#03989E] font-bold underline">kembali ke kalkulator</Link>.
        </div>
      </div>
    );
  }

  const selisihNum = parseFloat(selisih);
  const estimasi = prodi.nilai;

  const stat = getStatusInfo(selisihNum);
  const avgRaporNum = parseFloat(avgRapor);
  const avgTKANum = avgTKA ? parseFloat(avgTKA) : null;
  const nilaiAkhirNum = parseFloat(nilaiAkhir);
  const bobotRaporNum = parseFloat(bobotRapor);
  const bobotTKANum = parseFloat(bobotTKA);

  const alternatives =
    selisihNum < 0 && prodiId ? await fetchSuggestions(prodiId, nilaiAkhirNum) : [];


  return (
    <div className="min-h-screen bg-[#F8FAFA] flex flex-col pb-12">
      <NavBar />

      <section className="pt-8 pb-14 px-4 bg-[#F8FAFA] border-b border-[#e0eded]">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#02747A] mb-2 leading-tight">
            Hasil Rasionalisasi SNBP
          </h1>
          <p className="text-xs md:text-sm text-gray-500 max-w-3xl leading-relaxed">
            Ringkasan peluang dan rekomendasi jurusan berdasarkan nilai rapor
            dan TKA yang kamu masukkan.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-6 w-full space-y-6">
        <Card className="rounded-2xl shadow-sm border border-[#e0eded] p-6 md:p-8 animate-fade mb-5 bg-white">
          {/* Card hasil utama */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-gray-500">
                Hasil Rasionalisasi
              </div>
              <div className="text-lg font-bold text-gray-800 mt-1">
                {prodi.programStudi}
              </div>
              <div className="text-xs text-gray-500">
                {prodi.universitas.namaUniversitas} • Estimasi min:{" "}
                <span className="font-semibold text-gray-800">
                  {estimasi.toFixed(1)}
                </span>
              </div>
              <div className="mt-2 inline-flex items-center gap-2">
                <span className={badgeClass(prodi.levelKeketatan)}>
                  {LEVEL_KEKETATAN_INFO[prodi.levelKeketatan].label}
                </span>
              </div>
            </div>
            <div
              className={`${stat.cls} rounded-2xl px-4 py-3 md:min-w-[220px]`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">{stat.label}</div>
                <div className="text-xl font-extrabold">
                  {selisihNum >= 0
                    ? `+${selisihNum.toFixed(1)}`
                    : selisihNum.toFixed(1)}
                </div>
              </div>
              <div className="text-[11px] mt-1.5">{stat.msg}</div>
              <div className="progress-bar mt-2">
                <div
                  className="progress-fill"
                  style={{
                    width: `${stat.pct}%`,
                    background: "currentColor",
                  }}
                />
              </div>
            </div>
          </div>

          {/* <div className="p-6">
            <ChartPieSimple
              datakey="value"
              namakey="name"
              chartConfig={chartConfig}
              chartData={[
                {
                  name: "Rata-rata Rapor",
                  value: avgRaporNum,
                  fill: "oklch(88.2% 0.059 254.128)",
                },
                {
                  name: "Rata-rata TKA",
                  value: avgTKANum !== null ? avgTKANum : 0,
                  fill: "oklch(94.5% 0.129 101.54)",
                },
                {
                  name: "Nilai Akhir",
                  value: nilaiAkhirNum,
                  fill: "oklch(92.5% 0.084 155.995)",
                },
              ]}
            >
              <div className="mt-4 grid grid-cols-3 gap-5 text-center text-xs">
                <div className="bg-blue-100 border border-blue-500 rounded-2xl p-3">
                  <div className="text-[11px] text-blue-500 mb-0.5">
                    Rata-rata rapor
                  </div>
                  <div className="text-lg font-bold text-blue-800">
                    {avgRaporNum.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-blue-400">
                    Bobot {(bobotRaporNum * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-yellow-100 border border-yellow-500 rounded-2xl p-3">
                  <div className="text-[11px] text-yellow-500 mb-0.5">
                    Rata-rata TKA
                  </div>
                  <div className="text-lg font-bold text-yellow-800">
                    {avgTKANum !== null ? avgTKANum.toFixed(1) : "-"}
                  </div>
                  <div className="text-[10px] text-yellow-400">
                    Bobot {(bobotTKANum * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-green-100 border border-green-500 rounded-2xl p-3">
                  <div className="text-[11px] text-green-500 mb-0.5">
                    Nilai akhir rasionalisasi
                  </div>
                  <div className="text-lg font-bold text-green-800">
                    {nilaiAkhirNum.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-green-400">
                    Selisih{" "}
                    {selisihNum >= 0
                      ? `+${selisihNum.toFixed(1)}`
                      : selisihNum.toFixed(1)}{" "}
                    dari estimasi
                  </div>
                </div>
              </div>
            </ChartPieSimple>
          </div> */}

          <div className="p-6">
            <ChartPieDonutText
              datakey="value"
              namakey="name"
              valFinal={nilaiAkhirNum}
              final="Hasil"
              chartConfig={chartConfig}
              chartData={[
                {
                  name: "Rata-rata Rapor",
                  value: avgRaporNum,
                  fill: "oklch(88.2% 0.059 254.128)",
                },
                {
                  name: "Rata-rata TKA",
                  value: avgTKANum !== null ? avgTKANum : 0,
                  fill: "oklch(94.5% 0.129 101.54)",
                },
              ]}
            >
              <div className="flex items-center gap-1 leading-none font-medium">
                <FileChartPie className="h-4 w-4" />
                Detail Hasil
              </div>
              <div className="mt-4 grid grid-cols-3 gap-5 text-center text-xs">
                <div className="bg-blue-100 border border-blue-500 rounded-2xl p-3">
                  <div className="text-[11px] text-blue-500 mb-0.5">
                    Rata-rata rapor
                  </div>
                  <div className="text-lg font-bold text-blue-800">
                    {avgRaporNum.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-blue-400">
                    Bobot {(bobotRaporNum * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-yellow-100 border border-yellow-500 rounded-2xl p-3">
                  <div className="text-[11px] text-yellow-500 mb-0.5">
                    Rata-rata TKA
                  </div>
                  <div className="text-lg font-bold text-yellow-800">
                    {avgTKANum !== null ? avgTKANum.toFixed(1) : "-"}
                  </div>
                  <div className="text-[10px] text-yellow-400">
                    Bobot {(bobotTKANum * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-green-100 border border-green-500 rounded-2xl p-3">
                  <div className="text-[11px] text-green-500 mb-0.5">
                    Nilai akhir rasionalisasi
                  </div>
                  <div className="text-lg font-bold text-green-800">
                    {nilaiAkhirNum.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-green-400">
                    Selisih{" "}
                    {selisihNum >= 0
                      ? `+${selisihNum.toFixed(1)}`
                      : selisihNum.toFixed(1)}{" "}
                    dari estimasi
                  </div>
                </div>
              </div>
            </ChartPieDonutText>
          </div>
 
          <div className="p-6">
            <ChartPieDonutText
              datakey="value"
              namakey="name"
              valFinal={stat.pct}
              final="Peluang"
              chartConfig={chanceChartConfig}
              chartData={[
                { name: "Peluang", value: stat.pct, fill: "oklch(66.7% 0.11 234.34)" },
                { name: "Sisa", value: 100 - stat.pct, fill: "oklch(96.3% 0.042 128.79)" },
              ]}
              showPercent={true}
            >
              <div className="flex items-center gap-1 leading-none font-medium">
                <FileChartPie className="h-4 w-4" />
                Perkiraan peluang kelulusan
              </div>
              <div className="mt-4 grid grid-cols-2 gap-5 text-center text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <div className="text-[11px] text-slate-500 mb-0.5">
                    Persentase kesempatan
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {stat.pct}%
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <div className="text-[11px] text-slate-500 mb-0.5">
                    Nilai akhir
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {nilaiAkhirNum.toFixed(1)}
                  </div>
                </div>
              </div>
            </ChartPieDonutText>
          </div>
 
          {selisihNum < 0 && (
            <div className="flex flex-col border-t border-gray-200 pt-4 text-xs">
              <div className="text-lg font-semibold text-gray-800 mb-2">
                Saran jurusan lain di {prodi.universitas.namaUniversitas}
              </div>
              <p className="text-[11px] text-gray-500 mb-8">
                Nilai kamu belum mencapai estimasi minimum jurusan ini. Berikut
                beberapa pilihan lain dengan estimasi nilai lebih rendah namun
                masih satu universitas dan kelompok jurusan.
              </p>
              {alternatives.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
                  Tidak ada saran.
                </div>
              ) : (
                <div className="space-y-3">
                  {alternatives.map((alt) => {
                    const diff = nilaiAkhirNum - alt.nilai;
                    return (
                      <div
                        key={alt.id}
                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                      >
                        <div>
                          <div className="text-xs font-semibold text-gray-800">
                            {alt.programStudi}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            Estimasi min: {" "}
                            <span className="font-semibold text-gray-800">
                              {alt.nilai.toFixed(1)}
                            </span>{" "}
                            • {alt.kelompok.nama}
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-gray-500">
                          Selisih dengan nilai kamu: {" "}
                          <span className="font-semibold text-indigo-600">
                            {diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              asChild
              className="rounded-xl bg-[#03989E] hover:bg-[#02747A] text-white font-bold px-8 py-2.5 text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <Link href="/beranda">Kembali ke Kalkulator</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

