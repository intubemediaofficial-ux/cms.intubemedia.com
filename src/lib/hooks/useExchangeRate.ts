"use client";

import { useState, useEffect } from "react";

interface ExchangeRateData {
  rate: number;
  loading: boolean;
  date: string;
}

const rateCache: Record<string, number> = {};

export function useExchangeRate(currency: string = "USD"): ExchangeRateData {
  const [rate, setRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");

  useEffect(() => {
    const key = currency.toUpperCase();
    if (key === "INR") {
      setRate(1);
      setLoading(false);
      return;
    }
    if (rateCache[key]) {
      setRate(rateCache[key]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/exchange-rate?action=getTodayRate&currencies=${key}`);
        if (res.ok) {
          const json = await res.json();
          const r = json.data?.rates?.[key];
          if (r && !cancelled) {
            rateCache[key] = r;
            setRate(r);
            setDate(json.data?.date || "");
          }
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [currency]);

  return { rate, loading, date };
}

export function toINR(amount: number, rate: number): number {
  return Math.round(amount * rate);
}
