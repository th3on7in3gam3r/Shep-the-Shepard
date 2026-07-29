"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { ShepAvatar } from "@/components/shep-avatar";
import { APP_NAME } from "@/lib/constants";

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  showShep?: boolean;
  /** @deprecated use showShep */
  showLenny?: boolean;
};

export function PageHeader({
  title,
  subtitle,
  showShep,
  showLenny,
}: PageHeaderProps) {
  const showAvatar = showShep ?? showLenny ?? false;
  const hasTitle = Boolean(title?.trim());

  if (!hasTitle && !showAvatar) {
    return (
      <header className="flex items-center justify-end pb-2">
        <ThemeToggle />
      </header>
    );
  }

  return (
    <header className="flex items-start justify-between gap-3 pb-4">
      <div className="flex min-w-0 items-center gap-3">
        {showAvatar && <ShepAvatar size="sm" entrance />}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-shepherd-sage">
            {APP_NAME}
          </p>
          {hasTitle && (
            <h1 className="truncate font-heading text-xl font-semibold text-foreground">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
