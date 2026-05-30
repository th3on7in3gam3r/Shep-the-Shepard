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
