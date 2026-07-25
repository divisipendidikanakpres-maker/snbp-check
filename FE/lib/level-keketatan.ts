import type { LevelKeketatan } from "@/hooks/useProdi";

export const LEVEL_KEKETATAN_INFO: Record<
  LevelKeketatan,
  { label: string; className: string }
> = {
  SANGAT_KETAT: { label: "Sangat Ketat", className: "text-red-600" },
  KETAT: { label: "Ketat", className: "text-yellow-500" },
  SEDANG: { label: "Sedang", className: "text-green-500" },
  TERBUKA: { label: "Terbuka", className: "text-blue-400" },
};
