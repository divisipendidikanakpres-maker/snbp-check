import type { LevelKeketatan } from '@prisma/client';

export function computeLevelKeketatan(nilai: number): LevelKeketatan {
  if (nilai >= 93.0) return 'SANGAT_KETAT';
  if (nilai >= 88.0) return 'KETAT';
  if (nilai >= 83.0) return 'SEDANG';
  return 'TERBUKA';
}
