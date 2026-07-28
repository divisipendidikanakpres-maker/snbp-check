import { useEffect, useState } from "react";

export function useSearch(
  onSearch: (query: string) => Promise<void>,
  debounceMs = 500
) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setSearching(true);
        onSearch(query.trim()).finally(() => setSearching(false));
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs]);

  return { query, setQuery, searching };
}
