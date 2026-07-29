import { ShepAvatar } from "@/components/shep-avatar";

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <ShepAvatar size="sm" mood="thinking" />
      <div className="rounded-2xl border border-shepherd-meadow/40 bg-card px-4 py-3">
        <div className="flex gap-1">
          <span className="size-2 animate-bounce rounded-full bg-shepherd-sage [animation-delay:-0.3s]" />
          <span className="size-2 animate-bounce rounded-full bg-shepherd-sage [animation-delay:-0.15s]" />
          <span className="size-2 animate-bounce rounded-full bg-shepherd-sage" />
        </div>
        <span className="sr-only">Shep is thinking</span>
      </div>
    </div>
  );
}

/** Shown after send, before the model streams its first token. */
export function FirstTokenIndicator() {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border border-shepherd-sage/25 bg-shepherd-meadow/20 px-3 py-2.5"
      role="status"
      aria-live="polite"
      aria-label="Waiting for Shep's first word"
    >
      <ShepAvatar size="sm" mood="thinking" className="ring-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-shepherd-sage">
          Waiting for Shep&apos;s first word…
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-shepherd-sage/70" />
          <span className="size-1.5 animate-pulse rounded-full bg-shepherd-sage/50 [animation-delay:150ms]" />
          <span className="size-1.5 animate-pulse rounded-full bg-shepherd-sage/35 [animation-delay:300ms]" />
          <span className="text-[10px] text-muted-foreground">just a moment</span>
        </div>
      </div>
    </div>
  );
}
