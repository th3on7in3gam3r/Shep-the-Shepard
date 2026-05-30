"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Heart, Search, Tag, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShareVerseButton } from "@/components/favorites/share-verse-button";
import { VerseVoicePrayer } from "@/components/favorites/verse-voice-prayer";
import { VERSE_TAGS } from "@/lib/verse-tags";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useActivityStore } from "@/stores/activity-store";

export function SavedVersesView() {
  const favorites = useFavoritesStore((s) => s.favorites);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);
  const updateFavoriteTag = useFavoritesStore((s) => s.updateFavoriteTag);
  const getTags = useFavoritesStore((s) => s.getTags);
  const logActivity = useActivityStore((s) => s.logActivity);

  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const tags = getTags();

  const filtered = useMemo(() => {
    let list = filterTag
      ? favorites.filter((f) => f.tag === filterTag)
      : favorites;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) =>
          f.reference.toLowerCase().includes(q) ||
          f.text.toLowerCase().includes(q) ||
          f.tag?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [favorites, filterTag, search]);

  useEffect(() => {
    if (favorites.length > 0) {
      logActivity({
        type: "verse_saved",
        title: "Viewed saved verses",
        subtitle: `${favorites.length} saved`,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveTag = (id: string) => {
    updateFavoriteTag(id, tagInput);
    setEditingTagId(null);
    setTagInput("");
  };

  return (
    <div className="space-y-4">
      {favorites.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="space-y-3 p-6 text-center">
            <Heart className="mx-auto size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No saved verses yet. Open the Bible reader and tap the heart on any
              passage.
            </p>
            <Link href="/bible">
              <Button className="bg-shepherd-sage hover:bg-shepherd-sage/90">
                <BookOpen className="size-4" />
                Go to Bible
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved verses…"
              className="pl-9"
            />
          </div>

          <ScrollArea className="w-full">
            <div className="flex flex-wrap gap-2 pb-1">
              <Badge
                variant={filterTag === null ? "default" : "outline"}
                className="cursor-pointer shrink-0"
                onClick={() => setFilterTag(null)}
              >
                All ({favorites.length})
              </Badge>
              {VERSE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={filterTag === tag ? "default" : "outline"}
                  className="cursor-pointer shrink-0"
                  onClick={() => setFilterTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {tags
                .filter((t) => !(VERSE_TAGS as readonly string[]).includes(t))
                .map((tag) => (
                  <Badge
                    key={tag}
                    variant={filterTag === tag ? "default" : "outline"}
                    className="cursor-pointer shrink-0"
                    onClick={() => setFilterTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
            </div>
          </ScrollArea>

          <div className="space-y-3">
            {filtered.map((fav) => (
              <Card key={fav.id} className="border-shepherd-sage/15">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-shepherd-sage">{fav.reference}</p>
                      {fav.translation && (
                        <p className="text-[10px] text-muted-foreground">{fav.translation}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      <ShareVerseButton
                        reference={fav.reference}
                        text={fav.text}
                        translation={fav.translation}
                        size="icon-sm"
                        variant="ghost"
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFavorite(fav.id)}
                        aria-label="Remove"
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  <p className="font-serif text-sm leading-relaxed">{fav.text}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {editingTagId === fav.id ? (
                      <>
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Tag"
                          className="h-8 text-xs"
                          list="verse-tag-suggestions"
                          onKeyDown={(e) => e.key === "Enter" && saveTag(fav.id)}
                        />
                        <datalist id="verse-tag-suggestions">
                          {VERSE_TAGS.map((t) => (
                            <option key={t} value={t} />
                          ))}
                        </datalist>
                        <Button size="sm" variant="outline" onClick={() => saveTag(fav.id)}>
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setEditingTagId(fav.id);
                            setTagInput(fav.tag ?? "");
                          }}
                        >
                          <Tag className="size-3" />
                          {fav.tag ?? "Add tag"}
                        </Button>
                        {VERSE_TAGS.map((t) => (
                          <Button
                            key={t}
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[10px]"
                            onClick={() => updateFavoriteTag(fav.id, t)}
                          >
                            {t}
                          </Button>
                        ))}
                      </>
                    )}
                  </div>
                  <Link
                    href={`/bible?passage=${encodeURIComponent(fav.reference)}`}
                    className="inline-block text-xs font-medium text-shepherd-sage hover:underline"
                  >
                    Open in Bible →
                  </Link>
                  <VerseVoicePrayer reference={fav.reference} favoriteId={fav.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
