"use client";

import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

type ShareVerseButtonProps = {
  reference: string;
  text: string;
  translation?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon-sm";
};

async function renderVerseCard(
  reference: string,
  text: string,
  translation?: string,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, "#e8f0e4");
  gradient.addColorStop(0.5, "#f7f4ee");
  gradient.addColorStop(1, "#dce8f4");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.strokeStyle = "rgba(92, 122, 86, 0.25)";
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, 960, 960);

  ctx.fillStyle = "#5c7a56";
  ctx.font = "600 36px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(reference, 540, 180);

  ctx.fillStyle = "#2a3328";
  ctx.font = "400 42px Georgia, serif";
  const words = `"${text}"`.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  const maxWidth = 880;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  let y = 320;
  for (const ln of lines.slice(0, 10)) {
    ctx.fillText(ln, 540, y);
    y += 58;
  }

  if (translation) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "400 28px system-ui, sans-serif";
    ctx.fillText(translation, 540, 920);
  }

  ctx.fillStyle = "#5c7a56";
  ctx.font = "500 32px system-ui, sans-serif";
  ctx.fillText(`${APP_NAME} · with Shep`, 540, 980);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export function ShareVerseButton({
  reference,
  text,
  translation,
  variant = "outline",
  size = "sm",
}: ShareVerseButtonProps) {
  const [busy, setBusy] = useState(false);

  const shareText = `${text}\n\n— ${reference}${translation ? ` (${translation})` : ""}`;

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await renderVerseCard(reference, text, translation);

      if (blob && navigator.share && navigator.canShare?.({ files: [new File([blob], "verse.png", { type: "image/png" })] })) {
        const file = new File([blob], "verse.png", { type: "image/png" });
        await navigator.share({
          title: reference,
          text: shareText,
          files: [file],
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({ title: reference, text: shareText });
        return;
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reference.replace(/\s+/g, "-")}.png`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await navigator.clipboard.writeText(shareText);
      }
    } catch {
      /* cancelled or failed */
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleShare} disabled={busy}>
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <>
          <Share2 className="size-4" />
          {size !== "icon-sm" && "Share"}
        </>
      )}
    </Button>
  );
}

export function ShareVerseIconButton(props: Omit<ShareVerseButtonProps, "size">) {
  return <ShareVerseButton {...props} size="icon-sm" variant="ghost" />;
}
