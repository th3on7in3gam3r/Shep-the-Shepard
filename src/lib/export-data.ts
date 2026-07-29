const STORAGE_KEYS = [
  "shepherd-profile",
  "shepherd-settings",
  "shepherd-streak",
  "shepherd-daily-quest",
  "shepherd-journal",
  "shepherd-activity",
  "shepherd-favorites",
  "shepherd-community",
  "shepherd-chat",
  "shepherd-mood",
  "shepherd-journey",
  "shepherd-guided-flow",
  "shepherd-verse-prayers",
  "shepherd-daily-pack",
] as const;

export function exportShepherdData(): string {
  const data: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    version: 1,
  };

  if (typeof window !== "undefined") {
    for (const key of STORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          data[key] = JSON.parse(raw);
        } catch {
          data[key] = raw;
        }
      }
    }
  }

  return JSON.stringify(data, null, 2);
}

export function downloadShepherdExport(): void {
  const json = exportShepherdData();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shepherd-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function clearAllShepherdData(): void {
  if (typeof window === "undefined") return;
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}
