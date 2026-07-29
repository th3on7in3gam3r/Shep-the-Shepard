"use client";

import { useEffect } from "react";
import { buildDailyPack } from "@/lib/daily-pack";
import { todayKey } from "@/lib/date-utils";
import { useDailyPackStore } from "@/stores/daily-pack-store";

/** Prefetch and cache today's daily pack for offline PWA use. */
export function DailyPackBootstrap() {
  const setPack = useDailyPackStore((s) => s.setPack);
  const clearIfStale = useDailyPackStore((s) => s.clearIfStale);
  const getTodayPack = useDailyPackStore((s) => s.getTodayPack);
  const setOfflineFallback = useDailyPackStore((s) => s.setOfflineFallback);

  useEffect(() => {
    clearIfStale();
  }, [clearIfStale]);

  useEffect(() => {
    let cancelled = false;

    async function syncPack() {
      if (getTodayPack()?.studyChapter) return;

      try {
        const res = await fetch("/api/daily-pack");
        if (!res.ok) throw new Error("fetch failed");
        const pack = await res.json();
        if (!cancelled && pack.dateKey === todayKey()) {
          setPack(pack);
        }
      } catch {
        if (cancelled) return;
        const local = buildDailyPack();
        const existing = getTodayPack();
        setPack(existing ?? local);
        if (!navigator.onLine) {
          setOfflineFallback(true);
        }
      }
    }

    void syncPack();
    return () => {
      cancelled = true;
    };
  }, [getTodayPack, setOfflineFallback, setPack]);

  return null;
}
