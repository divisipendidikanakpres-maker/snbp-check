"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { LookupItem } from "@/hooks/useLookup";

const OTHER_VALUE = "__lainnya__";

interface LookupSelectProps {
  items: LookupItem[];
  value: string;
  onValueChange: (id: string) => void;
  onCreate: (nama: string) => Promise<LookupItem>;
  placeholder?: string;
}

export function LookupSelect({
  items,
  value,
  onValueChange,
  onCreate,
  placeholder = "Pilih...",
}: LookupSelectProps) {
  const [addingNew, setAddingNew] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectChange = (val: string) => {
    if (val === OTHER_VALUE) {
      setAddingNew(true);
      setNewNama("");
      setError(null);
      return;
    }
    onValueChange(val);
  };

  const handleCreate = async () => {
    if (!newNama.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await onCreate(newNama.trim());
      onValueChange(created.id);
      setAddingNew(false);
    } catch (err) {
      setError("Gagal menambahkan data baru.");
    } finally {
      setSaving(false);
    }
  };

  if (addingNew) {
    return (
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <Input
            autoFocus
            value={newNama}
            onChange={(e) => setNewNama(e.target.value)}
            placeholder="Nama baru"
          />
          <Button type="button" size="sm" onClick={handleCreate} disabled={saving}>
            {saving ? "..." : "Tambah"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddingNew(false)}
          >
            Batal
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={handleSelectChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.nama}
          </SelectItem>
        ))}
        <SelectItem value={OTHER_VALUE}>Lainnya...</SelectItem>
      </SelectContent>
    </Select>
  );
}
