"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-4 pt-4 border-t">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <span className="text-xs sm:text-sm text-gray-600">Tampilkan per halaman:</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="text-xs sm:text-sm rounded-md border px-2 py-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={999999}>Semua</option>
        </select>
      </div>

      <div className="text-xs sm:text-sm text-gray-600 text-center">
        Menampilkan {start} hingga {end} dari {total}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-xs sm:text-sm text-center">
          {page} / {totalPages || 1}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
