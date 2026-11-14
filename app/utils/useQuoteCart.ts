"use client";

import { useCallback, useEffect, useState } from "react";
import type { QuoteLine } from "@/app/utils/pricing";

const STORAGE_KEY = "context-portal-quote";

export interface CartItem {
  key: string;
  line: QuoteLine;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Guards against stale or hand-edited localStorage data crashing the page. */
function isCartItem(value: unknown): value is CartItem {
  if (!isRecord(value) || typeof value.key !== "string") return false;
  const line = value.line;
  if (!isRecord(line)) return false;
  return (
    typeof line.serviceId === "string" &&
    typeof line.titleEn === "string" &&
    typeof line.titleAr === "string" &&
    typeof line.summaryEn === "string" &&
    typeof line.summaryAr === "string" &&
    typeof line.total === "number" &&
    Array.isArray(line.rows) &&
    line.rows.every(
      (item) =>
        isRecord(item) &&
        typeof item.labelEn === "string" &&
        typeof item.labelAr === "string" &&
        typeof item.amount === "number"
    )
  );
}

/** The saved quote: persisted in localStorage and restored after mount. */
export function useQuoteCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter(isCartItem));
      }
    } catch {
      // Unreadable or unavailable storage: start with an empty quote.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or blocked: the quote still works for this session.
    }
  }, [items, loaded]);

  const add = useCallback((line: QuoteLine) => {
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((previous) => [...previous, { key, line }]);
  }, []);

  const remove = useCallback((key: string) => {
    setItems((previous) => previous.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return { items, add, remove, clear };
}
