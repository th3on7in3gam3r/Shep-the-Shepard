import type { Metadata, Viewport } from "next";
import { DM_Sans, Lora } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ThemeInit } from "@/components/theme-init";
import { ThemeSync } from "@/components/theme-sync";
import { HighContrastSync } from "@/components/settings/high-contrast-sync";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_TAGLINE,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#1a2420" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${dmSans.variable} ${lora.variable} min-h-full font-sans antialiased`}
      >
        <ThemeProvider>
          <SupabaseProvider>
            <ThemeInit />
            <ThemeSync />
            <HighContrastSync />
            {children}
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
