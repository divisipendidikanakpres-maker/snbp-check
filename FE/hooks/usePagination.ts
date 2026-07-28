import { useState } from "react";

export function usePagination(defaultLimit = 5) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);

  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, newPage));
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  return { page, limit, setPage, setLimit, handlePageChange, handleLimitChange };
}
