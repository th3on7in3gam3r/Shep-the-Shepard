import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata(
  "Your Journey",
  "Faith stats, streaks, saved verses, and activity.",
);

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
