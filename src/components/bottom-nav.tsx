"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, MessageCircle, NotebookPen, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayKey } from "@/lib/date-utils";
import { useClientValue } from "@/hooks/use-is-client";
import { useDailyQuestStore } from "@/stores/daily-quest-store";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/bible", label: "Bible", icon: BookOpen },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/profile", label: "You", icon: UserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const questIncomplete = useClientValue(() => {
    const { dateKey, questCompletedAt } = useDailyQuestStore.getState();
    return dateKey === todayKey() && !questCompletedAt;
  }, false);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card/90 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]"
      aria-label="Main"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          const showQuestDot = href === "/" && questIncomplete && !active;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors sm:text-xs",
                active
                  ? "text-shepherd-sage"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "relative flex size-10 items-center justify-center rounded-2xl transition-colors",
                  active && "bg-shepherd-meadow/60 shadow-sm dark:bg-shepherd-sage/25",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.35 : 1.75} />
                {showQuestDot && (
                  <span
                    className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-shepherd-amber ring-2 ring-card"
                    aria-hidden
                  />
                )}
              </span>
              {label}
              {showQuestDot && (
                <span className="sr-only">Daily quest unfinished</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
