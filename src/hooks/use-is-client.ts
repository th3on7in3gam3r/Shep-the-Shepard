"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** True only after hydration — safe for browser-only UI without mismatches. */
export function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

/** Read a client-only value after hydration; returns `serverValue` during SSR/hydration. */
export function useClientValue<T>(getValue: () => T, serverValue: T): T {
  return useSyncExternalStore(emptySubscribe, getValue, () => serverValue);
}
