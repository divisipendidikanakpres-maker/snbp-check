"use client";

import { useEffect, useState } from "react";
import { useSekolah, type Sekolah } from "@/hooks/useSekolah";
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

export default function SekolahPage() {
  const { list, create, update, remove } = useSekolah();
  const [data, setData] = useState<Sekolah[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({
    namaSekolah: "",
    akreditasi: "-" as "A" | "B" | "C" | "-",
  });
  const { page, limit, handlePageChange, handleLimitChange } = usePagination();

  const { query, setQuery, searching } = useSearch(async (searchQuery) => {
    setLoading(true);
    try {
      const res = await list(searchQuery || undefined, 1, limit);
      setData(res.data);
      setTotal(res.total);
      handlePageChange(1);
    } finally {
      setLoading(false);
    }
  });


  useEffect(() => {
    setLoading(true);
    list(query || undefined, page, limit).then((res) => {
      setData(res.data);
      setTotal(res.total);
      setLoading(false);
    });
  }, [page, limit]);

  const handleSave = async () => {
    try {
      if (editingId) {
        const res = await update(editingId, form);
        setData(data.map((d) => (d.id === editingId ? res.data : d)));
      } else {
        const res = await create(form);
        setData([res.data, ...data]);
      }
      setDialogOpen(false);
      setForm({ namaSekolah: "", akreditasi: "-" });
      setEditingId(null);
    } catch (err) {
      alert("Gagal menyimpan");
    }
  };

  const handleEdit = (sekolah: Sekolah) => {
    setEditingId(sekolah.id);
    setForm({
      namaSekolah: sekolah.namaSekolah,
      akreditasi: sekolah.akreditasi as "A" | "B" | "C" | "-",
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
    setForm({ namaSekolah: "", akreditasi: "-" });
    setDialogOpen(true);
  };

  const handleExport = () => {
    const rows = data.map((sekolah) => ({
      "Nama Sekolah": sekolah.namaSekolah,
      Akreditasi: sekolah.akreditasi,
    }));

    exportRowsToExcel(rows, `sekolah-${new Date().toISOString().slice(0, 10)}`);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-5">
      {/* Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#02747A' }}>Manajemen Sekolah</h1>
          <p className="text-xs text-gray-400 mt-0.5">Kelola data SMA/SMK/MA terdaftar</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            placeholder="Cari sekolah..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-64 text-xs rounded-xl border-[#d2e5e5] focus:border-[#03989E] bg-[#F8FAFA]"
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
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Nama Sekolah</TableHead>
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Akreditasi</TableHead>
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((sekolah) => {
                const isAkreditasiA = sekolah.akreditasi === "A";
                const isAkreditasiB = sekolah.akreditasi === "B";
                return (
                  <TableRow key={sekolah.id} className="hover:bg-[#f2f8f8]/60 transition-colors border-b border-[#f0f6f6]">
                    <TableCell className="py-3.5 px-5">
                      <p className="font-semibold text-gray-800 text-xs sm:text-sm leading-tight">{sekolah.namaSekolah}</p>
                      <p className="text-[11px] text-gray-400 font-normal">
                        {sekolah.npsn ? `NPSN: ${sekolah.npsn}` : "NPSN Terdaftar"}
                        {sekolah.kota ? ` • ${sekolah.kota}` : ""}
                        {sekolah.provinsi ? `, ${sekolah.provinsi}` : ""}
                      </p>
                    </TableCell>
                    <TableCell className="py-3.5 px-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${
                        isAkreditasiA
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isAkreditasiB
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        Akreditasi {sekolah.akreditasi}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(sekolah)}
                          className="h-8 px-3 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 transition-all text-xs font-medium"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleting(sekolah.id)}
                          className="h-8 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold"
                        >
                          Hapus
                        </Button>
                      </div>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Sekolah" : "Tambah Sekolah"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Nama Sekolah</Label>
              <Input
                value={form.namaSekolah}
                onChange={(e) =>
                  setForm({ ...form, namaSekolah: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Akreditasi</Label>
              <Input
                value={form.akreditasi}
                onChange={(e) =>
                  setForm({
                    ...form,
                    akreditasi: e.target.value as "A" | "B" | "C" | "-",
                  })
                }
                placeholder="A, B, C, atau -"
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
          <AlertDialogTitle>Hapus Sekolah</AlertDialogTitle>
          <AlertDialogDescription>
            Yakin ingin menghapus sekolah ini?
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
