import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shep-the-shepard.vercel.app";

const routes = [
  "",
  "/chat",
  "/bible",
  "/devotions",
  "/journal",
  "/saved",
  "/profile",
  "/settings",
  "/about",
  "/privacy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/chat" ? 0.9 : 0.7,
  }));
}
