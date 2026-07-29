export function BibleReaderSkeleton({
  label = "Opening the Word…",
}: {
  label?: string;
}) {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-label={label}>
      <div className="rounded-2xl border border-shepherd-sage/15 bg-shepherd-cream/40 p-4 dark:bg-card">
        <div className="mb-3 h-3 w-28 animate-pulse rounded-full bg-shepherd-meadow/70" />
        <div className="space-y-2">
          <div className="h-9 animate-pulse rounded-lg bg-muted/70" />
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 h-9 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-9 animate-pulse rounded-lg bg-muted/60" />
          </div>
          <div className="h-9 animate-pulse rounded-lg bg-muted/50" />
        </div>
      </div>
      <div className="rounded-2xl border border-shepherd-sage/20 bg-gradient-to-br from-shepherd-cream via-shepherd-meadow/25 to-shepherd-sky/15 p-5 dark:from-shepherd-sage/15 dark:via-card dark:to-card">
        <p className="text-center text-xs font-medium text-shepherd-sage">{label}</p>
        <div className="mt-4 space-y-3">
          <div className="mx-auto h-4 w-40 animate-pulse rounded-full bg-shepherd-sage/20" />
          <div className="h-3.5 w-full animate-pulse rounded-full bg-muted/70" />
          <div className="h-3.5 w-[92%] animate-pulse rounded-full bg-muted/60" />
          <div className="h-3.5 w-[88%] animate-pulse rounded-full bg-muted/55" />
          <div className="h-3.5 w-[70%] animate-pulse rounded-full bg-muted/50" />
        </div>
      </div>
    </div>
  );
}
