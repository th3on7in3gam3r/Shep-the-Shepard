"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Check,
  Copy,
  Heart,
  History,
  Loader2,
  NotebookPen,
  Search,
  Share2,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { BIBLE_BOOKS } from "@/lib/bible-books";
import { BOOK_NAME_TO_ID, DEFAULT_TRANSLATION } from "@/lib/bible-helloao";
import { getDailyVerse } from "@/lib/daily-verses";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useActivityStore } from "@/stores/activity-store";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { useBibleRecentStore } from "@/stores/bible-recent-store";
import { useJournalStore } from "@/stores/journal-store";
import { useDailyPackStore } from "@/stores/daily-pack-store";
import { useStudySession } from "@/hooks/use-study-session";
import { todayKey } from "@/lib/date-utils";
import { ShareVerseButton } from "@/components/favorites/share-verse-button";
import {
  BibleStudyNotesPanel,
  BibleStudyNotesPicker,
} from "@/components/bible/bible-study-notes";
import { AskShepPassageActions } from "@/components/bible/ask-shep-passage";
import { BibleReaderSkeleton } from "@/components/bible/bible-reader-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Translation = { id: string; name: string };
type CommentaryOption = { id: string; name: string };

type BiblePassage = {
  reference: string;
  text: string;
  translationName: string;
  translationId: string;
  verses: { number: number; text: string }[];
};

type CommentaryChapter = {
  reference: string;
  commentaryName: string;
  introduction?: string;
  entries: { verseStart: number; text: string }[];
};

export function BibleReader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPassage = searchParams.get("passage");

  const defaultTranslation = useSettingsStore((s) => s.defaultTranslation);
  const logActivity = useActivityStore((s) => s.logActivity);
  const completeQuestTask = useDailyQuestStore((s) => s.completeTask);
  const addRecent = useBibleRecentStore((s) => s.addRecent);
  const recent = useBibleRecentStore((s) => s.recent);
  const addJournalEntry = useJournalStore((s) => s.addEntry);
  const packVerse = useDailyPackStore((s) =>
    s.pack?.dateKey === todayKey() ? s.pack.verse : null,
  );

  useStudySession();

  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState("3");
  const [verse, setVerse] = useState("16");
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState(initialPassage ?? "");
  const defaultFromSettings = defaultTranslation || DEFAULT_TRANSLATION;
  const [translation, setTranslation] = useState(defaultFromSettings);
  const [prevDefaultTranslation, setPrevDefaultTranslation] =
    useState(defaultFromSettings);
  const [commentary, setCommentary] = useState("");
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [commentaries, setCommentaries] = useState<CommentaryOption[]>([]);
  const [passage, setPassage] = useState<BiblePassage | null>(null);
  const [commentaryChapter, setCommentaryChapter] =
    useState<CommentaryChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentaryError, setCommentaryError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [actionNote, setActionNote] = useState<string | null>(null);

  const todayVerse = packVerse ?? getDailyVerse();

  const studyNoteSnippet = useMemo(() => {
    if (!commentaryChapter) return undefined;
    const intro = commentaryChapter.introduction?.trim();
    const firstEntry = commentaryChapter.entries[0]?.text?.trim();
    const body = intro || firstEntry;
    if (!body) return undefined;
    return `${commentaryChapter.commentaryName}: ${body}`;
  }, [commentaryChapter]);

  const { favorites, addFavorite, removeFavorite, isFavorite } =
    useFavoritesStore();

  if (defaultFromSettings !== prevDefaultTranslation) {
    setPrevDefaultTranslation(defaultFromSettings);
    setTranslation(defaultFromSettings);
  }

  useEffect(() => {
    fetch("/api/bible/translations")
      .then((r) => r.json())
      .then((data) => {
        if (data.translations?.length) setTranslations(data.translations);
      })
      .catch(() => {});

    fetch("/api/bible/commentaries")
      .then((r) => r.json())
      .then((data) => {
        if (data.commentaries?.length) setCommentaries(data.commentaries);
      })
      .catch(() => {});
  }, []);

  const flashNote = useCallback((msg: string) => {
    setActionNote(msg);
    window.setTimeout(() => setActionNote(null), 2200);
  }, []);

  const buildPassageParams = useCallback(
    (passageOverride?: string) => {
      const params = new URLSearchParams();
      const freeText = (passageOverride ?? query).trim();
      if (freeText) {
        params.set("passage", freeText);
        return params;
      }
      const bookId = BOOK_NAME_TO_ID[book];
      if (!bookId) return null;
      params.set("book", book);
      params.set("chapter", chapter);
      if (verse.trim()) {
        const parts = verse.split(/[-–]/).map((v) => v.trim());
        params.set("verseStart", parts[0]);
        if (parts[1]) params.set("verseEnd", parts[1]);
      }
      return params;
    },
    [book, chapter, verse, query],
  );

  const buildFetchUrl = useCallback(
    (passageOverride?: string) => {
      const params = buildPassageParams(passageOverride);
      if (!params) return null;
      params.set("translation", translation);
      return `/api/bible?${params}`;
    },
    [buildPassageParams, translation],
  );

  const buildCommentaryUrl = useCallback(
    (commentaryId = commentary, passageOverride?: string) => {
      if (!commentaryId) return null;
      const params = buildPassageParams(passageOverride);
      if (!params) return null;
      params.set("commentary", commentaryId);
      return `/api/bible/commentary?${params}`;
    },
    [buildPassageParams, commentary],
  );

  const fetchStudyNotes = useCallback(
    async (commentaryId: string) => {
      const commentaryUrl = buildCommentaryUrl(commentaryId);
      if (!commentaryUrl) return;

      setNotesLoading(true);
      setCommentaryError(null);
      try {
        const commentaryRes = await fetch(commentaryUrl);
        const commentaryData = await commentaryRes.json();
        if (!commentaryRes.ok) {
          setCommentaryChapter(null);
          setCommentaryError(
            commentaryData.error ?? "Could not load study notes for this passage",
          );
        } else {
          setCommentaryChapter(commentaryData);
        }
      } catch {
        setCommentaryChapter(null);
        setCommentaryError("Network error loading study notes.");
      } finally {
        setNotesLoading(false);
      }
    },
    [buildCommentaryUrl],
  );

  const fetchPassage = useCallback(
    async (passageOverride?: string) => {
      if (passageOverride?.trim()) {
        setQuery(passageOverride.trim());
      }
      const url = buildFetchUrl(passageOverride);
      const commentaryUrl = buildCommentaryUrl(undefined, passageOverride);
      if (!url) {
        setError("Could not resolve book. Try a free-text reference.");
        return;
      }
      setLoading(true);
      setError(null);
      setCommentaryError(null);
      setCopied(false);
      try {
        const [scriptureRes, commentaryRes] = await Promise.all([
          fetch(url),
          commentaryUrl ? fetch(commentaryUrl) : Promise.resolve(null),
        ]);
        const data = await scriptureRes.json();
        if (!scriptureRes.ok) {
          setError(data.error ?? "Could not find that passage");
          setPassage(null);
          setCommentaryChapter(null);
          return;
        }
        setPassage(data);
        addRecent({
          reference: data.reference,
          translationId: data.translationId,
          translationName: data.translationName,
        });
        completeQuestTask("word");
        logActivity({
          type: "bible",
          title: data.reference,
          subtitle: data.translationName,
        });

        if (commentaryRes) {
          const commentaryData = await commentaryRes.json();
          if (!commentaryRes.ok) {
            setCommentaryChapter(null);
            setCommentaryError(
              commentaryData.error ?? "Could not load commentary for this passage",
            );
          } else {
            setCommentaryChapter(commentaryData);
          }
        } else {
          setCommentaryChapter(null);
        }
      } catch {
        setError("Network error. Please try again.");
        setPassage(null);
        setCommentaryChapter(null);
      } finally {
        setLoading(false);
      }
    },
    [
      buildFetchUrl,
      buildCommentaryUrl,
      addRecent,
      logActivity,
      completeQuestTask,
    ],
  );

  const handleCommentaryChange = (id: string) => {
    setCommentary(id);
    setCommentaryError(null);
    if (!id) {
      setCommentaryChapter(null);
      return;
    }
    if (passage) {
      void fetchStudyNotes(id);
    }
  };

  const loadStudyNotes = () => {
    if (commentary) void fetchStudyNotes(commentary);
    else void fetchPassage();
  };

  useEffect(() => {
    if (!initialPassage) return;
    const id = requestAnimationFrame(() => {
      void fetchPassage(initialPassage);
    });
    return () => cancelAnimationFrame(id);
  }, [initialPassage, fetchPassage]);

  const highlightKeyword = (text: string) => {
    if (!keyword.trim()) return text;
    const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="rounded bg-shepherd-meadow/60 px-0.5 text-foreground"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const passageShareText = passage
    ? `${passage.text}\n\n— ${passage.reference} (${passage.translationName})`
    : "";

  const handleCopy = async () => {
    if (!passageShareText) return;
    await navigator.clipboard.writeText(passageShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!passage) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: passage.reference,
          text: passageShareText,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopy();
    }
  };

  const handleSaveFavorite = () => {
    if (!passage) return;
    addFavorite({
      reference: passage.reference,
      text: passage.text,
      translation: passage.translationName,
    });
    logActivity({
      type: "verse_saved",
      title: `Saved ${passage.reference}`,
      subtitle: passage.translationName,
    });
    flashNote(`Saved · ${passage.reference}`);
  };

  const handleJournal = () => {
    if (!passage) return;
    addJournalEntry({
      content: `${passage.text}\n\n— ${passage.reference}`,
      reference: passage.reference,
      chatSnippet: passage.text.slice(0, 200),
    });
    logActivity({
      type: "journal",
      title: `Journaled ${passage.reference}`,
      subtitle: passage.translationName,
    });
    flashNote("Saved to your journal");
    window.setTimeout(() => router.push("/journal"), 450);
  };

  const startPrompts = [
    {
      id: "today",
      label: "Today's verse",
      reference: todayVerse.reference,
      hint: todayVerse.text.slice(0, 72) + (todayVerse.text.length > 72 ? "…" : ""),
    },
    {
      id: "psalm",
      label: "A short Psalm",
      reference: "Psalm 23",
      hint: "The Lord is my shepherd…",
    },
    {
      id: "john",
      label: "Classic start",
      reference: "John 3:16",
      hint: "For God so loved the world…",
    },
  ] as const;

  const showStartHere = !passage && !loading && !initialPassage;

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "border-shepherd-sage/15",
          passage
            ? "bg-background/70 shadow-none"
            : "border-shepherd-wood/20 bg-card",
        )}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Search className="size-4 text-shepherd-sage" />
            Find a Passage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Translation
            </label>
            <select
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
            >
              {translations.length > 0 ? (
                translations.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              ) : (
                <option value="BSB">Berean Standard Bible</option>
              )}
            </select>
          </div>

          <BibleStudyNotesPicker
            selectedCommentaryId={commentary}
            commentaries={commentaries}
            onCommentaryChange={handleCommentaryChange}
          />

          <div className="grid grid-cols-3 gap-2">
            <select
              value={book}
              onChange={(e) => setBook(e.target.value)}
              className="col-span-2 h-9 rounded-lg border border-input bg-background px-2 text-sm"
            >
              {BIBLE_BOOKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <Input
              type="number"
              min={1}
              placeholder="Ch."
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Verse (e.g. 16 or 1-4)"
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
            />
            <Input
              placeholder="Highlight keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <Input
            placeholder='Or type: "Psalm 23:1-4", "Romans 8:28"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            className="w-full bg-shepherd-sage hover:bg-shepherd-sage/90"
            onClick={() => void fetchPassage()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <BookOpen className="size-4" />
                Read Passage
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {showStartHere && (
        <Card className="overflow-hidden border-shepherd-sage/20 bg-gradient-to-br from-shepherd-cream via-shepherd-meadow/30 to-shepherd-sky/20 dark:from-shepherd-sage/15 dark:via-card dark:to-card">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-shepherd-amber" />
              <p className="text-sm font-semibold">Start here</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Shep is ready when you are. Pick a gentle place to begin, or use Find a
              Passage above.
            </p>
            <div className="grid gap-2">
              {startPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => void fetchPassage(prompt.reference)}
                  className="rounded-2xl border border-shepherd-sage/20 bg-background/75 px-3.5 py-3 text-left transition-colors hover:border-shepherd-sage/40 hover:bg-shepherd-meadow/25"
                >
                  <p className="text-xs font-medium text-shepherd-sage">{prompt.label}</p>
                  <p className="mt-0.5 text-sm font-semibold">{prompt.reference}</p>
                  <p className="mt-0.5 font-serif text-xs leading-relaxed text-muted-foreground">
                    {prompt.hint}
                  </p>
                </button>
              ))}
            </div>
            {recent.length > 0 && (
              <div className="pt-1">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <History className="size-3" />
                  Continue where you left off
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {recent.slice(0, 4).map((item) => (
                    <button
                      key={`${item.reference}-${item.readAt}`}
                      type="button"
                      onClick={() => void fetchPassage(item.reference)}
                      className="rounded-full border border-shepherd-sage/25 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-shepherd-sage hover:bg-shepherd-meadow/35"
                    >
                      {item.reference}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loading && !passage && <BibleReaderSkeleton label="Opening the Word…" />}

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {commentaryError && !error && !passage && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
          {commentaryError}
        </p>
      )}

      {passage && (
        <Card className="border-shepherd-sage/20 bg-gradient-to-br from-shepherd-cream/90 via-shepherd-cream/50 to-shepherd-meadow/25 shadow-[0_8px_28px_-14px_rgba(60,90,80,0.2)] dark:from-shepherd-sage/10 dark:via-card dark:to-card">
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
            <div>
              <CardTitle className="font-serif text-xl leading-snug tracking-wide">
                {passage.reference}
              </CardTitle>
              <Badge variant="secondary" className="mt-1.5 text-xs">
                {passage.translationName}
              </Badge>
            </div>
            <div className="flex shrink-0 gap-0.5">
              <ShareVerseButton
                reference={passage.reference}
                text={passage.text}
                translation={passage.translationName}
                size="icon-sm"
                variant="ghost"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopy}
                aria-label="Copy passage"
              >
                {copied ? (
                  <Check className="size-4 text-shepherd-sage" />
                ) : (
                  <Copy className="size-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleShare}
                aria-label="Share passage"
              >
                <Share2 className="size-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleSaveFavorite}
                disabled={isFavorite(passage.reference)}
                aria-label="Save to favorites"
              >
                <Heart
                  className={
                    isFavorite(passage.reference)
                      ? "fill-shepherd-sage text-shepherd-sage"
                      : "text-muted-foreground"
                  }
                />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 px-5 pb-5 sm:px-6">
            {passage.verses.length > 1 ? (
              <div className="space-y-4 font-serif text-lg leading-[1.8] tracking-wide text-foreground/95">
                {passage.verses.map((v) => (
                  <p key={v.number}>
                    <sup className="mr-1.5 font-sans text-xs font-semibold text-shepherd-sage">
                      {v.number}
                    </sup>
                    {highlightKeyword(v.text)}
                  </p>
                ))}
              </div>
            ) : (
              <p className="font-serif text-lg leading-[1.8] tracking-wide text-foreground/95">
                {highlightKeyword(passage.text)}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-shepherd-sage/30"
                onClick={handleJournal}
              >
                <NotebookPen className="size-3.5" />
                Journal this
              </Button>
              <Link
                href="/saved"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-shepherd-sage/25 bg-background/70 px-3 text-xs font-medium text-shepherd-sage hover:bg-shepherd-meadow/30"
              >
                <Star className="size-3.5" />
                Saved verses
              </Link>
            </div>

            {actionNote && (
              <p className="text-xs font-medium text-shepherd-sage" role="status">
                {actionNote}
              </p>
            )}

            <AskShepPassageActions
              reference={passage.reference}
              text={passage.text}
              translationName={passage.translationName}
              studyNote={studyNoteSnippet}
            />

            {recent.length > 1 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <History className="size-3" />
                  Recently read
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {recent
                    .filter(
                      (item) =>
                        item.reference.toLowerCase() !==
                        passage.reference.toLowerCase(),
                    )
                    .slice(0, 5)
                    .map((item) => (
                      <button
                        key={`${item.reference}-${item.readAt}`}
                        type="button"
                        onClick={() => void fetchPassage(item.reference)}
                        className="rounded-full border border-shepherd-sage/20 bg-background/70 px-2.5 py-1 text-[11px] font-medium hover:bg-shepherd-meadow/30"
                      >
                        {item.reference}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <BibleStudyNotesPanel
        passageReference={passage?.reference ?? null}
        selectedCommentaryId={commentary}
        commentaries={commentaries}
        onCommentaryChange={handleCommentaryChange}
        onLoadNotes={loadStudyNotes}
        loading={notesLoading || (loading && !!commentary)}
        notes={commentaryChapter}
        error={commentaryError}
      />

      {favorites.length > 0 && (
        <>
          <Separator />
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Star className="size-4 text-shepherd-sage" />
                Saved Verses
              </h2>
              <Link
                href="/saved"
                className="text-xs font-medium text-shepherd-sage hover:underline"
              >
                View all
              </Link>
            </div>
            <ScrollArea className="max-h-64">
              <div className="space-y-2 pr-2">
                {favorites.map((fav) => (
                  <Card key={fav.id} className="py-3">
                    <CardContent className="flex gap-2 p-0 px-4">
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => void fetchPassage(fav.reference)}
                      >
                        <p className="text-xs font-medium text-shepherd-sage">
                          {fav.reference}
                        </p>
                        <p className="line-clamp-2 font-serif text-sm leading-relaxed text-muted-foreground">
                          {fav.text}
                        </p>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFavorite(fav.id)}
                        aria-label="Remove favorite"
                      >
                        <Trash2 className="size-3.5 text-muted-foreground" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      <p className="text-center text-[10px] text-muted-foreground">
        Scripture via{" "}
        <a
          href="https://bible.helloao.org"
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          bible.helloao.org
        </a>
      </p>
    </div>
  );
}
