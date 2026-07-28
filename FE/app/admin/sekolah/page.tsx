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
      const res = await list(searchQuery, page, limit);
      setData(res.data);
      setTotal(res.total);
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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:justify-between md:items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Manajemen Sekolah</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <Input
            placeholder="Cari sekolah..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          {searching && <span className="text-xs text-gray-500">Searching...</span>}
          <Button onClick={openNewDialog} className="w-full sm:w-auto">+ Tambah</Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Sekolah</TableHead>
              <TableHead>Akreditasi</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((sekolah) => (
              <TableRow key={sekolah.id}>
                <TableCell>{sekolah.namaSekolah}</TableCell>
                <TableCell>{sekolah.akreditasi}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(sekolah)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleting(sekolah.id)}
                  >
                    Hapus
                  </Button>
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
