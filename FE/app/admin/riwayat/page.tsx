"use client";

import { useEffect, useState } from "react";
import { useHistory, type HistoryItem } from "@/hooks/useHistory";
import { useSearch } from "@/hooks/useSearch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/admin/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportRowsToExcel } from "@/lib/export-excel";

function formatTimestamp(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return `${date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}, ${date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}

export default function RiwayatPage() {
  const { list, remove } = useHistory();
  const [data, setData] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { page, limit, handlePageChange, handleLimitChange } = usePagination();
  const [deleting, setDeleting] = useState<string | null>(null);

  const { query, setQuery, searching } = useSearch(async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const res = await list(searchQuery || undefined, 1, limit);
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
    list(query || undefined, page, limit)
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
      // refresh list after delete
      refresh();
      setDeleting(null);
    } catch (err) {
      setError((err as any)?.message ?? "Gagal menghapus riwayat.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const rows = data.map((item) => ({
      "Nama Pengguna": item.user?.fullName ?? "-",
      Sekolah: item.sekolahNama,
      Universitas: item.universitasNama,
      "Program Studi": item.prodiNama,
      Persentase: `${item.persentase}%`,
      "Nilai Akhir": item.nilaiAkhir,
      Tanggal: formatTimestamp(item.createdAt),
    }));

    exportRowsToExcel(rows, `riwayat-${new Date().toISOString().slice(0, 10)}`);
  };

  useEffect(() => {
    refresh();
  }, [page, limit]);

  return (
    <div className="space-y-5">
      {/* Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#02747A' }}>Riwayat Cek SNBP</h1>
          <p className="text-xs text-gray-400 mt-0.5">Daftar pemeriksaan peluang lolos yang dilakukan pengguna</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            placeholder="Cari riwayat..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-60 text-xs rounded-xl border-[#d2e5e5] focus:border-[#03989E] bg-[#F8FAFA]"
          />
          {searching && <span className="text-xs text-gray-400">Mencari...</span>}
          
          <Button
            variant="outline"
            onClick={handleExport}
            className="rounded-xl border-[#03989E] text-[#03989E] hover:bg-[#03989E] hover:text-white transition text-xs"
          >
            Export Excel
          </Button>

          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
            className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 transition text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#03989E]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#03989E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Memuat riwayat...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 text-xs text-red-600 border border-red-200">{error}</div>
      ) : data.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#e0eded] text-gray-400 text-sm">
          Belum ada riwayat pemeriksaan yang tersimpan.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#e0eded] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#f2f8f8] border-b border-[#e0eded]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Nama Pengguna</TableHead>
                  <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Sekolah</TableHead>
                  <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Universitas & Prodi</TableHead>
                  <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Peluang</TableHead>
                  <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Nilai Akhir</TableHead>
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
                      <TableCell className="py-3.5 px-5 font-semibold text-gray-800 text-xs sm:text-sm">
                        {item.user?.fullName ?? "-"}
                      </TableCell>
                      <TableCell className="py-3.5 px-5 text-xs text-gray-600 font-medium">
                        {item.sekolahNama}
                      </TableCell>
                      <TableCell className="py-3.5 px-5">
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm">{item.prodiNama}</p>
                        <p className="text-[11px] text-[#03989E] font-medium">{item.universitasNama}</p>
                      </TableCell>
                      <TableCell className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isHigh
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isMed
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {persentase}%
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 px-5 text-xs font-bold text-gray-700">
                        {item.nilaiAkhir.toFixed(1)}
                      </TableCell>
                      <TableCell className="py-3.5 px-5 text-xs text-gray-500 font-medium">
                        {formatTimestamp(item.createdAt)}
                      </TableCell>
                      <TableCell className="py-3.5 px-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleting(item.id)}
                          className="h-8 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold"
                        >
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Integrated Pagination inside Card */}
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      )}

     <AlertDialog open={!!deleting}>
       <AlertDialogContent>
         <AlertDialogTitle>Hapus Riwayat</AlertDialogTitle>
         <AlertDialogDescription>
           Yakin ingin menghapus riwayat ini? Aksi tidak bisa dibatalkan.
         </AlertDialogDescription>
         <div className="flex gap-2 justify-end">
           <AlertDialogCancel onClick={() => setDeleting(null)}>
             Batal
           </AlertDialogCancel>
           <AlertDialogAction onClick={() => deleting && handleDelete(deleting)}>
             Hapus
           </AlertDialogAction>
         </div>
       </AlertDialogContent>
     </AlertDialog>

   </div>
 );
}
