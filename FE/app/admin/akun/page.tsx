"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useUsers, type User } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/admin/pagination";
import { Input } from "@/components/ui/input";
import type { ApiError } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { exportRowsToExcel } from "@/lib/export-excel";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AkunPage() {
  const { list, update, updateRole, remove } = useUsers();
  const { me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [editing, setEditing] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { page, limit, handlePageChange, handleLimitChange } = usePagination();

  const { query, setQuery, searching } = useSearch(async (searchQuery) => {
    setLoading(true);
    try {
      const res = await list(searchQuery || undefined, 1, limit);
      setUsers(res.data);
      setTotal(res.total);
      handlePageChange(1);
    } finally {
      setLoading(false);
    }
  });


  useEffect(() => {
    Promise.all([
      me().then((res) => setCurrentUserId(res.user.id)),
      list(query || undefined, page, limit).then((res) => {
        setUsers(res.data);
        setTotal(res.total);
      }),
    ]).finally(() => setLoading(false));
  }, [page, limit]);

  const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
    try {
      const res = await updateRole(userId, { role: newRole });
      setUsers(users.map((u) => (u.id === userId ? res.data : u)));
    } catch (err) {
      alert("Gagal mengubah role");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await remove(userId);
      setUsers(users.filter((u) => u.id !== userId));
      setDeleting(null);
    } catch (err) {
      alert("Gagal menghapus user");
    }
  };

  const handleExport = () => {
    const rows = users.map((user) => ({
      Nama: user.fullName,
      Telepon: user.phone,
      Email: user.email,
      Role: user.role,
    }));

    exportRowsToExcel(rows, `akun-${new Date().toISOString().slice(0, 10)}`);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setEditForm({ fullName: user.fullName, email: user.email, password: "" });
    setShowPassword(false);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setEditError(null);
    setSaving(true);
    try {
      const res = await update(editing.id, {
        fullName: editForm.fullName,
        email: editForm.email,
        ...(editForm.password ? { password: editForm.password } : {}),
      });
      setUsers(users.map((u) => (u.id === editing.id ? res.data : u)));
      setEditing(null);
    } catch (err) {
      setEditError((err as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-[#03989E]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#03989E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Memuat data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#02747A' }}>Manajemen Akun</h1>
          <p className="text-xs text-gray-400 mt-0.5">Kelola data pengguna SNBP Check</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <div className="relative">
            <Input
              placeholder="Cari akun..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-64 pl-4 rounded-xl border-[#d2e5e5] focus:border-[#03989E] bg-[#F8FAFA]"
            />
          </div>
          {searching && <span className="text-xs text-gray-400">Mencari...</span>}
          <Button
            variant="outline"
            onClick={handleExport}
            className="w-full sm:w-auto rounded-xl border-[#03989E] text-[#03989E] hover:bg-[#03989E] hover:text-white transition"
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Table Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e0eded] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f2f8f8] border-b border-[#e0eded]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Nama Pengguna</TableHead>
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Telepon</TableHead>
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Email</TableHead>
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase">Role</TableHead>
                <TableHead className="py-3.5 px-5 text-xs font-bold text-[#02747A] tracking-wider uppercase text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const userInitial = user.fullName ? user.fullName[0].toUpperCase() : "U";
                return (
                  <TableRow key={user.id} className="hover:bg-[#f2f8f8]/60 transition-colors border-b border-[#f0f6f6]">
                    <TableCell className="py-3.5 px-5 font-semibold text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#03989E]/10 border border-[#03989E]/20 text-[#02747A] font-bold text-xs flex items-center justify-center shrink-0">
                          {userInitial}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-xs sm:text-sm leading-tight">{user.fullName}</p>
                          <p className="text-[11px] text-gray-400 font-normal">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-5 text-xs text-gray-600 font-medium">
                      {user.phone || "-"}
                    </TableCell>
                    <TableCell className="py-3.5 px-5 text-xs text-gray-600 font-medium">
                      {user.email}
                    </TableCell>
                    <TableCell className="py-3.5 px-5">
                      {currentUserId === user.id ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#03989E]/10 text-[#02747A] border border-[#03989E]/30">
                          {user.role} (Anda)
                        </span>
                      ) : (
                        <Select
                          value={user.role}
                          onValueChange={(val) =>
                            handleRoleChange(user.id, val as "USER" | "ADMIN")
                          }
                        >
                          <SelectTrigger className="w-28 h-8 text-xs font-semibold rounded-xl border-[#d2e5e5] bg-[#F8FAFA] focus:border-[#03989E]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="USER" className="text-xs font-medium">USER</SelectItem>
                            <SelectItem value="ADMIN" className="text-xs font-bold text-[#02747A]">ADMIN</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(user)}
                          className="h-8 px-3 rounded-xl border-[#03989E]/30 text-[#02747A] hover:bg-[#03989E] hover:text-white transition-all text-xs font-semibold"
                        >
                          Edit
                        </Button>
                        {currentUserId !== user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleting(user.id)}
                            className="h-8 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold"
                          >
                            Hapus
                          </Button>
                        )}
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

      <AlertDialog open={!!deleting}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus User</AlertDialogTitle>
          <AlertDialogDescription>
            Yakin ingin menghapus user ini?
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

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Akun</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-fullName">Nama</Label>
              <InputGroup>
                <InputGroupInput
                  id="edit-fullName"
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                />
              </InputGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <InputGroup>
                <InputGroupInput
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </InputGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-password">Password Baru (opsional)</Label>
              <InputGroup>
                <InputGroupInput
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Kosongkan jika tidak diganti"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>

            {editError && (
              <p className="text-xs text-destructive">{editError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
