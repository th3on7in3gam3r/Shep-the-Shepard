import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata(
  "Bible",
  "Read Scripture, save verses, and study with commentary support.",
);

export default function BibleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
