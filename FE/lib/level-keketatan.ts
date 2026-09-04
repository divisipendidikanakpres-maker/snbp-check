import type { LevelKeketatan } from "@/hooks/useProdi";

export const LEVEL_KEKETATAN_INFO: Record<
  string,
  { label: string; className: string }
> = {
  SANGAT_KETAT: { label: "Sangat Ketat", className: "text-red-600" },
  KETAT: { label: "Ketat", className: "text-yellow-500" },
  SEDANG: { label: "Sedang", className: "text-green-500" },
  TERBUKA: { label: "Terbuka", className: "text-blue-400" },
  "Sangat Ketat": { label: "Sangat Ketat", className: "text-red-600" },
  Ketat: { label: "Ketat", className: "text-yellow-500" },
  Sedang: { label: "Sedang", className: "text-green-500" },
  Terbuka: { label: "Terbuka", className: "text-blue-400" },
};

export function getLevelKeketatanInfo(level?: string | null) {
  if (!level) return LEVEL_KEKETATAN_INFO.KETAT;
  if (LEVEL_KEKETATAN_INFO[level]) return LEVEL_KEKETATAN_INFO[level];
  const normalized = String(level).toUpperCase().replace(/\s+/g, '_');
  if (LEVEL_KEKETATAN_INFO[normalized]) return LEVEL_KEKETATAN_INFO[normalized];
  return { label: String(level), className: "text-gray-600" };
}

