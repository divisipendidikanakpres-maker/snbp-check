import { useEffect, useState, useRef } from "react";

export function useSearch(
  onSearch: (query: string) => Promise<void>,
  debounceMs = 500
) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const onSearchRef = useRef(onSearch);

  // keep ref updated without changing identity used by effect
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = query.trim();
      if (q) {
        setSearching(true);
        onSearchRef.current(q).finally(() => setSearching(false));
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return { query, setQuery, searching };
}
