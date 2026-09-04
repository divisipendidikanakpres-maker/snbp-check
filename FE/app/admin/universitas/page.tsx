"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUniversitas, type Universitas } from "@/hooks/useUniversitas";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/admin/pagination";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exportRowsToExcel } from "@/lib/export-excel";

const EMPTY_FORM = {
  namaUniversitas: "",
  singkatan: "",
  provinsi: "",
  ranking: "",
};

export default function UniversitasPage() {
  const router = useRouter();
  const { list, create, update, remove } = useUniversitas();
  const [data, setData] = useState<Universitas[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'ranking_tertinggi' | 'ranking_terendah'>('ranking_tertinggi');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { page, limit, handlePageChange, handleLimitChange } = usePagination();

  const { query, setQuery, searching } = useSearch(async (searchQuery) => {
    setLoading(true);
    try {
      const res = await list(sort, searchQuery || undefined, 1, limit);
      setData(res.data);
      setTotal(res.total);
      handlePageChange(1);
    } finally {
      setLoading(false);
    }
  });


  useEffect(() => {
    setLoading(true);
    list(sort, query || undefined, page, limit).then((res) => {
      setData(res.data);
      setTotal(res.total);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [sort, page, limit]);

  const handleSave = async () => {
    const payload = {
      namaUniversitas: form.namaUniversitas,
      singkatan: form.singkatan,
      provinsi: form.provinsi,
      ranking: form.ranking.trim() === "" ? null : Number(form.ranking),
    };
    try {
      if (editingId) {
        const res = await update(editingId, payload);
        setData(data.map((d) => (d.id === editingId ? res.data : d)));
      } else {
        const res = await create(payload);
        setData([res.data, ...data]);
      }
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      alert("Gagal menyimpan");
    }
  };

  const handleEdit = (univ: Universitas) => {
    setEditingId(univ.id);
    setForm({
      namaUniversitas: univ.namaUniversitas,
      singkatan: univ.singkatan,
      provinsi: univ.provinsi,
      ranking: univ.ranking !== null ? String(univ.ranking) : "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      setData(data.filter((d) => d.id !== id));
      setDeleting(null);
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  const openNewDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const goToProdi = (univ: Universitas) => {
    router.push(`/admin/universitas/prodi?universitasId=${univ.id}`);
  };

  const handleExport = () => {
    const rows = data.map((univ) => ({
      Ranking: univ.ranking ?? "-",
      "Nama Universitas": univ.namaUniversitas,
      Singkatan: univ.singkatan,
      Provinsi: univ.provinsi,
      "Jumlah Prodi": univ.jumlahProdi,
      "Nilai Rata-rata": univ.nilaiRataRata !== null ? univ.nilaiRataRata : "-",
    }));

    exportRowsToExcel(rows, `universitas-${new Date().toISOString().slice(0, 10)}`);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-5">
      {/* Title & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#02747A' }}>Manajemen Universitas</h1>
          <p className="text-xs text-gray-400 mt-0.5">Kelola data PTN dan Program Studi SNBP</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="text-xs rounded-xl border border-[#d2e5e5] bg-[#F8FAFA] px-3 py-2 text-gray-700 font-semibold focus:border-[#03989E] outline-none cursor-pointer"
          >
            <option value="ranking_tertinggi">Ranking tertinggi</option>
            <option value="ranking_terendah">Ranking terendah</option>
          </select>

          <Input
            placeholder="Cari universitas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-56 text-xs rounded-xl border-[#d2e5e5] focus:border-[#03989E] bg-[#F8FAFA]"
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
            onClick={openNewDialog}
            className="rounded-xl bg-[#03989E] text-white hover:bg-[#02747A] transition text-xs font-bold shadow-xs"
          >
            + Tambah
          </Button>
        </div>
      </div>

      {/* Table Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e0eded] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f2f8f8] border-b border-[#e0eded]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase hidden md:table-cell">Ranking</TableHead>
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Nama Universitas</TableHead>
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase hidden sm:table-cell">Singkatan</TableHead>
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase hidden lg:table-cell">Provinsi</TableHead>
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase hidden md:table-cell">Jumlah Prodi</TableHead>
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase hidden lg:table-cell">Rata-rata Nilai</TableHead>
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((univ) => (
                <TableRow key={univ.id} className="hover:bg-[#f2f8f8]/60 transition-colors border-b border-[#f0f6f6]">
                  <TableCell className="py-3.5 px-5 hidden md:table-cell">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#03989E]/10 text-[#02747A] font-bold text-xs">
                      {univ.ranking ?? "-"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-5">
                    <div className="font-semibold text-gray-800 text-xs sm:text-sm">{univ.namaUniversitas}</div>
                    <div className="text-[11px] text-gray-400 sm:hidden">{univ.singkatan} • {univ.provinsi}</div>
                  </TableCell>
                  <TableCell className="py-3.5 px-5 hidden sm:table-cell text-xs font-bold text-[#02747A]">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200">
                      {univ.singkatan}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-5 hidden lg:table-cell text-xs text-gray-600 font-medium">{univ.provinsi}</TableCell>
                  <TableCell className="py-3.5 px-5 hidden md:table-cell text-xs text-gray-700 font-semibold">{univ.jumlahProdi} Prodi</TableCell>
                  <TableCell className="py-3.5 px-5 hidden lg:table-cell text-xs">
                    {univ.nilaiRataRata !== null ? (
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {univ.nilaiRataRata.toFixed(1)}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToProdi(univ)}
                        className="h-8 px-2.5 rounded-xl border-[#03989E]/30 text-[#02747A] hover:bg-[#03989E] hover:text-white transition-all text-xs font-semibold"
                      >
                        Prodi
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(univ)}
                        className="h-8 px-2.5 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 transition-all text-xs font-medium"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleting(univ.id)}
                        className="h-8 px-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold"
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Universitas" : "Tambah Universitas"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Nama Universitas</Label>
              <Input
                value={form.namaUniversitas}
                onChange={(e) =>
                  setForm({ ...form, namaUniversitas: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Singkatan</Label>
              <Input
                value={form.singkatan}
                onChange={(e) =>
                  setForm({ ...form, singkatan: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Provinsi</Label>
              <Input
                value={form.provinsi}
                onChange={(e) =>
                  setForm({ ...form, provinsi: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Ranking</Label>
              <Input
                type="number"
                min={1}
                value={form.ranking}
                onChange={(e) =>
                  setForm({ ...form, ranking: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Universitas</AlertDialogTitle>
          <AlertDialogDescription>
            Yakin ingin menghapus universitas ini?
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel onClick={() => setDeleting(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && handleDelete(deleting)}
            >
              Hapus
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
