import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata(
  "Saved Verses",
  "Your bookmarked Scripture passages.",
);

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
