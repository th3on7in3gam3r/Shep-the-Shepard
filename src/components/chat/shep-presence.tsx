"use client";

import { ShepAvatar, type ShepMood } from "@/components/shep-avatar";
import { SHEP_FULL_NAME, SHEP_NAME } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

type ShepPresenceProps = {
  mood: ShepMood;
  statusText?: string;
  isLive?: boolean;
};

export function ShepPresence({ mood, statusText, isLive = true }: ShepPresenceProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-shepherd-sage/25 bg-card/80 p-3 shadow-sm backdrop-blur-sm">
      <ShepAvatar size="md" mood={mood} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground">{SHEP_NAME}</p>
          {isLive && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              Live
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {statusText ?? `${SHEP_FULL_NAME} · always here for you`}
        </p>
      </div>
    </div>
  );
}

/** @deprecated */
export const LennyPresence = ShepPresence;
