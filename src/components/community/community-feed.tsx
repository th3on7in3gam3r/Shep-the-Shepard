"use client";

import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getDailyPrompt } from "@/lib/verse-tags";
import { formatRelativeTime } from "@/lib/dashboard-utils";
import { useCommunityStore } from "@/stores/community-store";
import { useFavoritesStore } from "@/stores/favorites-store";

export function CommunityFeed() {
  const posts = useCommunityStore((s) => s.posts);
  const addPost = useCommunityStore((s) => s.addPost);
  const removePost = useCommunityStore((s) => s.removePost);
  const favorites = useFavoritesStore((s) => s.favorites);

  const [reference, setReference] = useState("");
  const [text, setText] = useState("");
  const prompt = getDailyPrompt();

  const shareFromFavorite = (ref: string, verseText: string) => {
    setReference(ref);
    setText(verseText);
  };

  const handleShare = () => {
    if (!reference.trim() || !text.trim()) return;
    addPost({ reference: reference.trim(), text: text.trim() });
    setReference("");
    setText("");
  };

  return (
    <div className="space-y-4">
      <Card className="border-shepherd-sky/25 bg-shepherd-cream/20 dark:bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-shepherd-sage" />
            Community
            <Badge variant="outline" className="text-[10px] font-normal">
              Local only
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm italic text-muted-foreground">{prompt}</p>
          <Input
            placeholder="Verse reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          <Textarea
            placeholder="Share why this verse encourages you…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
          {favorites.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {favorites.slice(0, 4).map((f) => (
                <Button
                  key={f.id}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => shareFromFavorite(f.reference, f.text)}
                >
                  {f.reference}
                </Button>
              ))}
            </div>
          )}
          <Button
            className="w-full bg-shepherd-sage hover:bg-shepherd-sage/90"
            onClick={handleShare}
            disabled={!reference.trim() || !text.trim()}
          >
            Share to local feed
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Posts stay on this device only — cloud community coming later.
          </p>
        </CardContent>
      </Card>

      {posts.length > 0 && (
        <div className="space-y-2">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="space-y-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-shepherd-sage">
                      {post.reference}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {post.authorName} · {formatRelativeTime(post.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removePost(post.id)}
                    aria-label="Remove post"
                  >
                    <Trash2 className="size-3.5 text-muted-foreground" />
                  </Button>
                </div>
                <p className="font-serif text-sm leading-relaxed">{post.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
