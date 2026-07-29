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
      const res = await list(searchQuery, page, limit);
      setData(res.data);
      setTotal(res.total);
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

  useEffect(() => {
    refresh();
  }, [page, limit]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Riwayat Cek</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Menampilkan riwayat pemeriksaan yang dilakukan pengguna.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <Input
            placeholder="Cari riwayat..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          {searching && <span className="text-xs text-gray-500">Searching...</span>}
          <Button variant="outline" onClick={refresh} disabled={loading} className="w-full sm:w-auto">
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-4">Memuat riwayat...</div>
      ) : error ? (
        <div className="p-4 text-sm text-red-600">{error}</div>
      ) : data.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">Belum ada riwayat pemeriksaan.</div>
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pengguna</TableHead>
                  <TableHead>Sekolah</TableHead>
                  <TableHead>Universitas</TableHead>
                  <TableHead>Program Studi</TableHead>
                  <TableHead>Persentase</TableHead>
                  <TableHead>Nilai Akhir</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.user?.fullName ?? "-"}</TableCell>
                    <TableCell>{item.sekolahNama}</TableCell>
                    <TableCell>{item.universitasNama}</TableCell>
                    <TableCell>{item.prodiNama}</TableCell>
                    <TableCell>{item.persentase}%</TableCell>
                    <TableCell>{item.nilaiAkhir.toFixed(1)}</TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleString("id-ID")}</TableCell>
                   <TableCell>
                     <div className="flex gap-2">
                       <Button variant="destructive" size="sm" onClick={() => setDeleting(item.id)}>
                         Hapus
                       </Button>
                     </div>
                   </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
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
