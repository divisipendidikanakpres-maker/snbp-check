"use client";

import { useEffect, useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { useHistory, type HistoryItem } from "@/hooks/useHistory";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/admin/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calculator, Calendar, GraduationCap, History, School, Trash2 } from "lucide-react";
import Link from "next/link";

function formatTimestamp(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function UserRiwayatPage() {
  const { listMine, remove } = useHistory();
  const [data, setData] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { page, limit, handlePageChange, handleLimitChange } = usePagination();

  const { query, setQuery, searching } = useSearch(async (searchQuery) => {
    setLoading(true);
    try {
      const res = await listMine(searchQuery || undefined, 1, limit);
      setData(res.data);
      setTotal(res.total);
      handlePageChange(1);
    } catch (err) {
      setError((err as any)?.message ?? "Gagal memuat riwayat.");
    } finally {
      setLoading(false);
    }
  });


  const refresh = () => {
    setLoading(true);
    setError(null);
    listMine(query || undefined, page, limit)
      .then((res) => {
        setData(res.data);
        setTotal(res.total);
      })
      .catch((err) => {
        setError(err?.message ?? "Gagal memuat riwayat.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await remove(id);
      refresh();
      setDeleting(null);
    } catch (err) {
      setError((err as any)?.message ?? "Gagal menghapus riwayat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [page, limit]);

  return (
    <div className="min-h-screen bg-[#F8FAFA] flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e0eded] shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#03989E]/10 flex items-center justify-center text-[#02747A] shrink-0">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-800">Riwayat Pengecekan Saya</h1>
              <p className="text-xs text-gray-400 mt-0.5">Daftar hasil perhitungan rasionalisasi SNBP yang pernah Anda simpan</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <Input
              placeholder="Cari PTN, jurusan, atau sekolah..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-72 text-xs rounded-xl border-[#d2e5e5] focus:border-[#03989E] bg-[#F8FAFA]"
            />
            {searching && <span className="text-xs text-gray-400">Mencari...</span>}

            <Link href="/beranda">
              <Button className="w-full sm:w-auto rounded-xl bg-[#03989E] hover:bg-[#02747A] text-white text-xs font-bold gap-2 shadow-xs transition">
                <Calculator className="h-4 w-4" />
                <span>Cek Nilai Baru</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Content Table / Empty state */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-[#03989E]">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-[#03989E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-400">Memuat data riwayat Anda...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 text-xs text-red-600 border border-red-200">{error}</div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e0eded] p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#03989E]/10 text-[#02747A] flex items-center justify-center mx-auto mb-4">
              <History className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-gray-800 text-base mb-1">Belum Ada Riwayat Pengecekan</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
              Anda belum pernah melakukan kalkulasi rasionalisasi nilai SNBP. Cek peluang lolos Anda sekarang!
            </p>
            <Link href="/beranda">
              <Button className="rounded-xl bg-[#03989E] hover:bg-[#02747A] text-white text-xs font-bold gap-2 shadow-xs transition">
                <Calculator className="h-4 w-4" />
                <span>Mulai Rasionalisasi Nilai</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-[#e0eded] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#f2f8f8] border-b border-[#e0eded]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Sekolah</TableHead>
                    <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">PTN & Program Studi</TableHead>
                    <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Nilai Rapor</TableHead>
                    <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Nilai Akhir</TableHead>
                    <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Peluang Lolos</TableHead>
                    <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Tanggal</TableHead>
                    <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => {
                    const persentase = item.persentase;
                    const isHigh = persentase >= 70;
                    const isMed = persentase >= 45 && persentase < 70;
                    return (
                      <TableRow key={item.id} className="hover:bg-[#f2f8f8]/60 transition-colors border-b border-[#f0f6f6]">
                        <TableCell className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <School className="h-4 w-4 text-[#03989E] shrink-0" />
                            <span className="font-semibold text-gray-800 text-xs sm:text-sm">{item.sekolahNama}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-5">
                          <p className="font-semibold text-gray-800 text-xs sm:text-sm">{item.prodiNama}</p>
                          <p className="text-[11px] text-[#03989E] font-medium flex items-center gap-1 mt-0.5">
                            <GraduationCap className="h-3 w-3 shrink-0" />
                            <span>{item.universitasNama}</span>
                          </p>
                        </TableCell>
                        <TableCell className="py-3.5 px-5 text-xs font-medium text-gray-600">
                          {item.avgRapor.toFixed(1)}
                        </TableCell>
                        <TableCell className="py-3.5 px-5 text-xs font-bold text-gray-800">
                          {item.nilaiAkhir.toFixed(1)}
                        </TableCell>
                        <TableCell className="py-3.5 px-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                            isHigh
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isMed
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {persentase}% Peluang
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 px-5 text-xs text-gray-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>{formatTimestamp(item.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleting(item.id)}
                            className="h-8 px-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold"
                            title="Hapus riwayat"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Integrated Pagination */}
            <Pagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleting}>
        <AlertDialogContent className="rounded-2xl border border-[#e0eded]">
          <AlertDialogTitle className="text-base font-bold text-gray-800">Hapus Riwayat Pengecekan</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-gray-500">
            Apakah Anda yakin ingin menghapus data riwayat pengecekan ini? Data yang dihapus tidak dapat dikembalikan.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end mt-4">
            <AlertDialogCancel
              onClick={() => setDeleting(null)}
              className="rounded-xl text-xs font-semibold"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && handleDelete(deleting)}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              Hapus
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
