"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";

const CACHE_PREFIX = "yt_cache_";

function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    // Cache valid for 30 minutes
    if (Date.now() - timestamp > 30 * 60 * 1000) return null;
    return data as T;
  } catch {
    return null;
  }
}

function setCachedData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* storage full — ignore */ }
}

export function useYouTubeData<T>(
  action: string,
  params: Record<string, string> = {},
  fallback: T
) {
  const { data: session, status } = useSession();
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);
  const viewerKey = session?.user?.email?.trim().toLowerCase() || "anonymous";
  const cacheKey = `${viewerKey}_${action}_${paramsKey}`;
  const fallbackRef = useRef(fallback);

  // Load from account-scoped localStorage cache immediately for instant display
  const [data, setData] = useState<T>(() => getCachedData<T>(cacheKey) || fallback);
  const [loading, setLoading] = useState(() => !getCachedData<T>(cacheKey));
  const [error, setError] = useState<string | null>(null);
  const [isReal, setIsReal] = useState(() => !!getCachedData<T>(cacheKey));
  const [cached, setCached] = useState(() => !!getCachedData<T>(cacheKey));
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    // Allow both OAuth users (have accessToken) and credentials users (admin or client with email/password)
    const isCredentialsLogin = !session?.accessToken && !!session?.user?.email;
    if (!session?.accessToken && !isCredentialsLogin) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    const fetchData = async () => {
      const cachedData = getCachedData<T>(cacheKey);
      setData(cachedData ?? fallbackRef.current);
      setIsReal(!!cachedData);
      setCached(!!cachedData);
      setLastUpdated(null);
      if (!cachedData) setLoading(true);
      setError(null);
      try {
        const parsedParams = JSON.parse(paramsKey) as Record<string, string>;
        const queryParams = new URLSearchParams({ action, ...parsedParams });
        const res = await fetch(`/api/youtube?${queryParams}`);
        const json = await res.json();

        if (res.ok && json.data) {
          setData(json.data);
          setIsReal(true);
          setCached(!!json._cached);
          setLastUpdated(json._lastUpdated || null);
          // Save to localStorage for instant load next time
          setCachedData(cacheKey, json.data);
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

    queueMicrotask(() => void fetchData());
  }, [session?.accessToken, session?.user?.role, session?.user?.email, status, action, paramsKey, cacheKey]);

  return { data, loading, error, isReal, cached, lastUpdated };
}
