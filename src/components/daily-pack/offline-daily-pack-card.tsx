"use client";

import Link from "next/link";
import { BookOpen, CloudOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { todayKey } from "@/lib/date-utils";
import { useDailyPackStore } from "@/stores/daily-pack-store";

export function OfflineDailyPackCard() {
  const pack = useDailyPackStore((s) =>
    s.pack?.dateKey === todayKey() ? s.pack : null,
  );
  const isOffline = useDailyPackStore((s) => s.isOfflineFallback);

  if (!pack?.studyChapter) return null;

  return (
    <Card className="border-shepherd-sky/25 bg-shepherd-sky/5">
      <CardContent className="space-y-2 pt-5">
        <div className="flex items-center gap-2 text-xs font-medium text-shepherd-sky">
          {isOffline ? (
            <>
              <CloudOff className="size-3.5" />
              Offline daily pack
            </>
          ) : (
            <>Today&apos;s study chapter — saved for offline</>
          )}
        </div>
        <p className="font-medium text-sm text-shepherd-sage">
          {pack.studyChapter.reference}
        </p>
        <p className="line-clamp-3 font-serif text-sm leading-relaxed text-muted-foreground">
          {pack.studyChapter.text}
        </p>
        <Link
          href={`/bible?passage=${encodeURIComponent(pack.studyChapter.reference)}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-shepherd-sage hover:underline"
        >
          <BookOpen className="size-3" />
          Read full chapter
        </Link>
      </CardContent>
    </Card>
  );
}
