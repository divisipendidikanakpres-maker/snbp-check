"use client";

import { useEffect, useState } from "react";
import { useHistory, type HistoryItem } from "@/hooks/useHistory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function RiwayatPage() {
  const { list } = useHistory();
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    setError(null);
    list()
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError(err?.message ?? "Gagal memuat riwayat.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Cek</h1>
          <p className="text-sm text-muted-foreground">
            Menampilkan riwayat pemeriksaan yang dilakukan pengguna.
          </p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="p-4">Memuat riwayat...</div>
      ) : error ? (
        <div className="p-4 text-sm text-red-600">{error}</div>
      ) : data.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">Belum ada riwayat pemeriksaan.</div>
      ) : (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
