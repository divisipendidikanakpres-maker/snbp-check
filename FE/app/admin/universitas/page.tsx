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
      const res = await list(sort, searchQuery, page, limit);
      setData(res.data);
      setTotal(res.total);
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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Manajemen Universitas</h1>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="text-sm rounded-md border px-2 py-1"
          >
            <option value="ranking_tertinggi">Ranking tertinggi</option>
            <option value="ranking_terendah">Ranking terendah</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari universitas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64"
          />
          {searching && <span className="text-xs text-gray-500">Searching...</span>}
        </div>
        <Button onClick={openNewDialog}>+ Tambah Universitas</Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ranking</TableHead>
              <TableHead>Nama Universitas</TableHead>
              <TableHead>Singkatan</TableHead>
              <TableHead>Provinsi</TableHead>
              <TableHead>Jumlah Prodi</TableHead>
              <TableHead>Nilai Rata-rata</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((univ) => (
              <TableRow key={univ.id}>
                <TableCell>{univ.ranking ?? "-"}</TableCell>
                <TableCell>{univ.namaUniversitas}</TableCell>
                <TableCell>{univ.singkatan}</TableCell>
                <TableCell>{univ.provinsi}</TableCell>
                <TableCell>{univ.jumlahProdi}</TableCell>
                <TableCell>
                  {univ.nilaiRataRata !== null
                    ? univ.nilaiRataRata.toFixed(1)
                    : "-"}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => goToProdi(univ)}
                  >
                    Prodi
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(univ)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleting(univ.id)}
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
