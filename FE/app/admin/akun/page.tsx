"use client";

import { useEffect, useState } from "react";
import { useUsers, type User } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
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

export default function AkunPage() {
  const { list, updateRole, remove } = useUsers();
  const { me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      me().then((res) => setCurrentUserId(res.user.id)),
      list().then((res) => setUsers(res.data)),
    ]).finally(() => setLoading(false));
  }, []);

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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Manajemen Akun</h1>
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
                <TableCell>
                  {currentUserId === user.id ? (
                    <span className="text-xs text-foreground/50">-</span>
                  ) : (
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
    </div>
  );
}
