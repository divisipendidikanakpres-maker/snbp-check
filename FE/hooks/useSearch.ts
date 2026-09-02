import { useEffect, useState, useRef } from "react";

export function useSearch(
  onSearch: (query: string) => Promise<void>,
  debounceMs = 400
) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const isInitial = useRef(true);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setSearching(true);
      onSearchRef.current(query.trim()).finally(() => setSearching(false));
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return { query, setQuery, searching };
}

