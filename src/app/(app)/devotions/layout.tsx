import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata(
  "Devotions",
  "Daily devotion with reflection, prayer, and Scripture.",
);

export default function DevotionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
