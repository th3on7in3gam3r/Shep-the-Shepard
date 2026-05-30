"use client";

import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  name?: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "size-10 text-sm",
  md: "size-16 text-xl",
  lg: "size-24 text-3xl",
};

export function ProfileAvatar({
  name,
  photoUrl,
  size = "md",
  className,
}: ProfileAvatarProps) {
  const initial = (name?.trim()?.[0] ?? "S").toUpperCase();

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name ? `${name}'s profile` : "Profile"}
        className={cn(
          "rounded-full object-cover ring-2 ring-shepherd-sage/30",
          sizes[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-shepherd-sage to-shepherd-sky font-semibold text-primary-foreground ring-2 ring-shepherd-sage/30",
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {initial !== "S" ? initial : <UserRound className="size-1/2" />}
    </span>
  );
}
