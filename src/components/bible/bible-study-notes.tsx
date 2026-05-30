"use client";

import { BookMarked, Loader2, ScrollText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FEATURED_COMMENTARIES } from "@/lib/bible-helloao";

export type StudyNotesData = {
  reference: string;
  commentaryName: string;
  introduction?: string;
  entries: { verseStart: number; text: string }[];
};

type CommentaryOption = { id: string; name: string };

type BibleStudyNotesProps = {
  passageReference: string | null;
  selectedCommentaryId: string;
  commentaries: CommentaryOption[];
  onCommentaryChange: (id: string) => void;
  onLoadNotes: () => void;
  loading: boolean;
  notes: StudyNotesData | null;
  error: string | null;
};

const STUDY_GUIDE_HINTS: Record<string, string> = {
  "matthew-henry": "Classic verse-by-verse exposition",
  "jamieson-fausset-brown": "Concise historical & textual notes",
  "john-gill": "Detailed Reformed commentary",
  "adam-clarke": "Methodist scholarly notes",
  "keil-delitzsch": "Old Testament focus",
  tyndale: "Modern open study notes",
};

export function BibleStudyNotesPicker({
  selectedCommentaryId,
  commentaries,
  onCommentaryChange,
  compact = false,
}: Pick<
  BibleStudyNotesProps,
  "selectedCommentaryId" | "commentaries" | "onCommentaryChange"
> & { compact?: boolean }) {
  const options =
    commentaries.length > 0 ? commentaries : [...FEATURED_COMMENTARIES];
  const hint = selectedCommentaryId
    ? STUDY_GUIDE_HINTS[selectedCommentaryId]
    : null;

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <label className="block text-xs font-medium text-muted-foreground">
        Study notes
      </label>
      <select
        value={selectedCommentaryId}
        onChange={(e) => onCommentaryChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-shepherd-sage/25 bg-background px-2 text-sm"
        aria-label="Choose a study guide"
      >
        <option value="">None — scripture only</option>
        {options.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {hint && (
        <p className="text-[11px] text-shepherd-sage">{hint}</p>
      )}
      {!selectedCommentaryId && !compact && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Matthew Henry, Tyndale Study Notes, and other classic guides appear
          below your passage.
        </p>
      )}
    </div>
  );
}

export function BibleStudyNotesPanel({
  passageReference,
  selectedCommentaryId,
  commentaries,
  onCommentaryChange,
  onLoadNotes,
  loading,
  notes,
  error,
}: BibleStudyNotesProps) {
  if (!passageReference) return null;

  const hasNotes =
    notes &&
    (notes.introduction || notes.entries.length > 0);

  return (
    <Card className="border-shepherd-sky/30 bg-gradient-to-br from-shepherd-cream/40 via-background to-shepherd-meadow/20 dark:from-shepherd-sage/10 dark:via-card dark:to-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ScrollText className="size-4 shrink-0 text-shepherd-sage" />
            Study notes
          </CardTitle>
          {notes?.commentaryName && (
            <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
              {notes.commentaryName}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Insights for{" "}
          <span className="font-medium text-foreground">{passageReference}</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <BibleStudyNotesPicker
          selectedCommentaryId={selectedCommentaryId}
          commentaries={commentaries}
          onCommentaryChange={onCommentaryChange}
          compact
        />

        {!selectedCommentaryId && (
          <div className="rounded-xl border border-dashed border-shepherd-sage/30 bg-shepherd-meadow/15 px-4 py-5 text-center">
            <BookMarked className="mx-auto mb-2 size-8 text-shepherd-sage/70" />
            <p className="text-sm font-medium">Pick a study guide</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Choose Matthew Henry, Tyndale Open Study Notes, or another guide
              above, then load notes for this passage.
            </p>
          </div>
        )}

        {selectedCommentaryId && !hasNotes && !error && !loading && (
          <Button
            variant="outline"
            className="w-full border-shepherd-sage/30"
            onClick={onLoadNotes}
          >
            <ScrollText className="size-4" />
            Load study notes
          </Button>
        )}

        {loading && selectedCommentaryId && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-shepherd-sage" />
            Loading study notes…
          </div>
        )}

        {error && selectedCommentaryId && (
          <div className="rounded-xl bg-amber-500/10 px-3 py-3 text-sm text-amber-950 dark:text-amber-100">
            {error}
            <Button
              variant="link"
              size="sm"
              className="mt-1 h-auto p-0 text-shepherd-sage"
              onClick={onLoadNotes}
            >
              Try again
            </Button>
          </div>
        )}

        {hasNotes && notes && (
          <div className="space-y-4 border-t border-shepherd-sage/15 pt-4 text-sm leading-relaxed text-foreground/90">
            {notes.introduction && (
              <div className="rounded-xl bg-shepherd-meadow/20 px-3 py-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-shepherd-sage">
                  Chapter overview
                </p>
                <p className="whitespace-pre-wrap font-serif italic text-muted-foreground">
                  {notes.introduction}
                </p>
              </div>
            )}
            {notes.entries.map((entry) => (
              <section
                key={entry.verseStart}
                className="rounded-xl border border-shepherd-sage/15 bg-background/60 px-3 py-3"
              >
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-shepherd-sage">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-shepherd-sage/15 font-sans text-[10px]">
                    {entry.verseStart}
                  </span>
                  Verse {entry.verseStart}
                </h3>
                <p className="whitespace-pre-wrap font-serif leading-relaxed">
                  {entry.text}
                </p>
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
