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
      const res = await list(searchQuery, page, limit);
      setUsers(res.data);
      setTotal(res.total);
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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Manajemen Akun</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari akun..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64"
          />
          {searching && <span className="text-xs text-gray-500">Searching...</span>}
        </div>
      </div>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {currentUserId === user.id ? (
                    <span className="text-sm text-foreground/70">{user.role}</span>
                  ) : (
                    <Select
                      value={user.role}
                      onValueChange={(val) =>
                        handleRoleChange(user.id, val as "USER" | "ADMIN")
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">USER</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(user)}
                  >
                    Edit
                  </Button>
                  {currentUserId !== user.id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleting(user.id)}
                    >
                      Hapus
                    </Button>
                  )}
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
