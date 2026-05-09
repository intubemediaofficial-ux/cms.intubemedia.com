"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";

export function useYouTubeData<T>(
  action: string,
  params: Record<string, string> = {},
  fallback: T
) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReal, setIsReal] = useState(false);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const parsedParams = JSON.parse(paramsKey) as Record<string, string>;
        const queryParams = new URLSearchParams({ action, ...parsedParams });
        const res = await fetch(`/api/youtube?${queryParams}`);
        const json = await res.json();

        if (res.ok && json.data) {
          setData(json.data);
          setIsReal(true);
        } else {
          console.error(`YouTube API error [${action}]:`, json.error);
          setError(json.error || "Failed to fetch data");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        console.error(`YouTube fetch error [${action}]:`, msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.accessToken, status, action, paramsKey]);

  return { data, loading, error, isReal };
}
