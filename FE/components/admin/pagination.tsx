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
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-3.5 bg-white border-t border-[#e0eded] rounded-b-2xl">
      {/* Limit Selector */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <span>Tampilkan:</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="text-xs rounded-xl border border-[#d2e5e5] bg-[#F8FAFA] px-2.5 py-1 text-gray-700 font-semibold focus:border-[#03989E] outline-none transition cursor-pointer"
        >
          <option value={5}>5 per halaman</option>
          <option value={10}>10 per halaman</option>
          <option value={20}>20 per halaman</option>
          <option value={999999}>Semua data</option>
        </select>
      </div>

      {/* Counter */}
      <div className="text-xs text-gray-500 font-medium text-center">
        Menampilkan <span className="font-bold text-gray-800">{start}</span>–<span className="font-bold text-gray-800">{end}</span> dari <span className="font-bold text-[#02747A]">{total}</span> data
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 p-0 rounded-xl border-[#d2e5e5] text-gray-600 hover:border-[#03989E] hover:text-[#03989E] disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="px-3 py-1 bg-[#F8FAFA] rounded-xl border border-[#e0eded] text-xs font-bold text-gray-700">
          <span className="text-[#02747A]">{page}</span> <span className="text-gray-400 font-normal">/</span> {totalPages || 1}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 p-0 rounded-xl border-[#d2e5e5] text-gray-600 hover:border-[#03989E] hover:text-[#03989E] disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

