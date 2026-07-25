"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProdi, type Prodi } from "@/hooks/useProdi";
import { useLookup, type LookupItem } from "@/hooks/useLookup";
import { useUniversitas, type Universitas } from "@/hooks/useUniversitas";
import { LEVEL_KEKETATAN_INFO } from "@/lib/level-keketatan";
import { LookupSelect } from "@/components/admin/lookup-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const EMPTY_FORM = {
  programStudi: "",
  kelompokId: "",
  jenjangId: "",
  nilai: "",
};

export default function ProdiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const universitasId = searchParams.get("universitasId") ?? "";

  const { list, create, update, remove } = useProdi();
  const { listKelompok, createKelompok, listJenjang, createJenjang } = useLookup();
  const { getById } = useUniversitas();

  const [universitas, setUniversitas] = useState<Universitas | null>(null);
  const [data, setData] = useState<Prodi[]>([]);
  const [kelompokList, setKelompokList] = useState<LookupItem[]>([]);
  const [jenjangList, setJenjangList] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!universitasId) {
      router.replace("/admin/universitas");
      return;
    }

    Promise.all([
      getById(universitasId).then((res) => setUniversitas(res.data)),
      list(universitasId).then((res) => setData(res.data)),
      listKelompok().then((res) => setKelompokList(res.data)),
      listJenjang().then((res) => setJenjangList(res.data)),
    ]).finally(() => setLoading(false));
  }, [universitasId]);

  const openNewDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setDialogOpen(true);
  };

  const handleEdit = (prodi: Prodi) => {
    setEditingId(prodi.id);
    setForm({
      programStudi: prodi.programStudi,
      kelompokId: prodi.kelompokId,
      jenjangId: prodi.jenjangId,
      nilai: String(prodi.nilai),
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setError(null);

    if (!form.kelompokId || !form.jenjangId) {
      setError("Kelompok dan jenjang wajib dipilih.");
      return;
    }
    const nilai = parseFloat(form.nilai.replace(",", "."));
    if (isNaN(nilai)) {
      setError("Nilai tidak valid.");
      return;
    }

    const payload = {
      universitasId,
      programStudi: form.programStudi,
      kelompokId: form.kelompokId,
      jenjangId: form.jenjangId,
      nilai,
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
      setError("Gagal menyimpan data prodi.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      setData(data.filter((d) => d.id !== id));
      setDeleting(null);
    } catch (err) {
      alert("Gagal menghapus prodi");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/universitas")}
            className="mb-1 -ml-2"
          >
            ← Kembali
          </Button>
          <h1 className="text-2xl font-bold">
            Manajemen Prodi{universitas ? ` — ${universitas.namaUniversitas}` : ""}
          </h1>
        </div>
        <Button onClick={openNewDialog}>+ Tambah Prodi</Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program Studi</TableHead>
              <TableHead>Jenjang</TableHead>
              <TableHead>Kelompok</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead>Level Keketatan</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((prodi) => {
              const levelInfo = LEVEL_KEKETATAN_INFO[prodi.levelKeketatan];
              return (
                <TableRow key={prodi.id}>
                  <TableCell>{prodi.programStudi}</TableCell>
                  <TableCell>{prodi.jenjang.nama}</TableCell>
                  <TableCell>{prodi.kelompok.nama}</TableCell>
                  <TableCell>{prodi.nilai}</TableCell>
                  <TableCell className={`font-semibold ${levelInfo.className}`}>
                    {levelInfo.label}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(prodi)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleting(prodi.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Prodi" : "Tambah Prodi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Program Studi</Label>
              <Input
                value={form.programStudi}
                onChange={(e) =>
                  setForm({ ...form, programStudi: e.target.value })
                }
              />
            </div>

            <div>
              <Label className="mb-1.5">Kelompok</Label>
              <LookupSelect
                items={kelompokList}
                value={form.kelompokId}
                onValueChange={(id) => setForm({ ...form, kelompokId: id })}
                onCreate={async (nama) => {
                  const res = await createKelompok(nama);
                  setKelompokList((prev) => [...prev, res.data]);
                  return res.data;
                }}
                placeholder="Pilih kelompok"
              />
            </div>

            <div>
              <Label className="mb-1.5">Jenjang</Label>
              <LookupSelect
                items={jenjangList}
                value={form.jenjangId}
                onValueChange={(id) => setForm({ ...form, jenjangId: id })}
                onCreate={async (nama) => {
                  const res = await createJenjang(nama);
                  setJenjangList((prev) => [...prev, res.data]);
                  return res.data;
                }}
                placeholder="Pilih jenjang"
              />
            </div>

            <div>
              <Label>Nilai</Label>
              <Input
                type="number"
                step="0.1"
                min={0}
                max={100}
                value={form.nilai}
                onChange={(e) => setForm({ ...form, nilai: e.target.value })}
                placeholder="contoh: 92.5"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Prodi</AlertDialogTitle>
          <AlertDialogDescription>
            Yakin ingin menghapus prodi ini?
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
