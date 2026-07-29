"use client";

import { useRef, useState } from "react";
import { Mic, Pause, Play, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useVersePrayerStore } from "@/stores/verse-prayer-store";
import { cn } from "@/lib/utils";

type VerseVoicePrayerProps = {
  reference: string;
  favoriteId?: string;
};

function formatRecordedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

function formatDuration(ms: number): string {
  const sec = Math.round(ms / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

export function VerseVoicePrayer({ reference, favoriteId }: VerseVoicePrayerProps) {
  const prayers = useVersePrayerStore((s) => s.getPrayersForReference(reference));
  const addPrayer = useVersePrayerStore((s) => s.addPrayer);
  const removePrayer = useVersePrayerStore((s) => s.removePrayer);
  const { isRecording, error, isSupported, startRecording, stopRecording } =
    useVoiceRecorder();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleToggleRecord = async () => {
    if (isRecording) {
      const result = await stopRecording();
      if (result) {
        addPrayer({
          reference,
          favoriteId,
          audioDataUrl: result.dataUrl,
          mimeType: result.mimeType,
          durationMs: result.durationMs,
        });
      }
      return;
    }
    await startRecording();
  };

  const handlePlay = (id: string, src: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.onended = () => setPlayingId(null);
    void audio.play();
    setPlayingId(id);
  };

  if (!isSupported) return null;

  return (
    <div className="space-y-2 border-t border-border/60 pt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">Voice prayer</p>
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="sm"
          className={cn("h-7 text-xs", isRecording && "animate-pulse")}
          onClick={() => void handleToggleRecord()}
        >
          {isRecording ? (
            <>
              <Square className="size-3" />
              Save prayer
            </>
          ) : (
            <>
              <Mic className="size-3" />
              Record prayer
            </>
          )}
        </Button>
      </div>

      {error && <p className="text-[11px] text-destructive">{error}</p>}

      {prayers.length > 0 && (
        <ul className="space-y-1.5">
          {prayers.map((prayer) => (
            <li
              key={prayer.id}
              className="flex items-center gap-2 rounded-lg bg-muted/30 px-2 py-1.5"
            >
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-7 shrink-0"
                aria-label={playingId === prayer.id ? "Pause prayer" : "Play prayer"}
                onClick={() => handlePlay(prayer.id, prayer.audioDataUrl)}
              >
                {playingId === prayer.id ? (
                  <Pause className="size-3.5" />
                ) : (
                  <Play className="size-3.5" />
                )}
              </Button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs">
                  Play my prayer from {formatRecordedDate(prayer.recordedAt)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDuration(prayer.durationMs)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-7 shrink-0"
                aria-label="Delete prayer"
                onClick={() => removePrayer(prayer.id)}
              >
                <Trash2 className="size-3 text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
