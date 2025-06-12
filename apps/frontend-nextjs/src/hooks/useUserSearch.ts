"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { User } from "@/types/profile";

export function useUserSearch(query: string) {
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await api.get(
          `/profile/search?query=${encodeURIComponent(debouncedQuery)}`
        );
        const data = res.data;
        setResults(data.data || []);
      } catch (err) {
        console.error("[useUserSearch] Error fetching search results:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedQuery]);

  return { results, loading };
}
