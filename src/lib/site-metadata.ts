import type { Metadata } from "next";
import { APP_NAME, APP_TAGLINE, SHEP_FULL_NAME } from "@/lib/constants";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shep-the-shepard.vercel.app";

export const defaultSiteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: `${SHEP_FULL_NAME} helps you build a gentle daily rhythm of Scripture, prayer, and conversation — voice-first Bible companion.`,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_TAGLINE,
  },
  robots: { index: true, follow: true },
};

export function pageMetadata(
  title: string,
  description: string,
): Metadata {
  return {
    title,
    description,
    openGraph: { title: `${title} · ${APP_NAME}`, description },
  };
}
