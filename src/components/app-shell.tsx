"use client";

import { BottomNav } from "@/components/bottom-nav";
import { DailyQuestBootstrap } from "@/components/daily-quest/daily-quest-bootstrap";
import { DailyPackBootstrap } from "@/components/daily-pack/daily-pack-bootstrap";
import { ShepOnboarding } from "@/components/onboarding/shep-onboarding";
import { AppFooter } from "@/components/layout/app-footer";
import { PwaInstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-background">
      <ServiceWorkerRegister />
      <DailyQuestBootstrap />
      <DailyPackBootstrap />
      <ShepOnboarding />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-shepherd-cream via-shepherd-meadow/20 to-transparent dark:from-shepherd-sage/15 dark:via-transparent" />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />
      <main className="relative mx-auto min-h-dvh max-w-lg px-4 pb-24 pt-6">
        {children}
        <AppFooter />
      </main>
      <BottomNav />
      <PwaInstallPrompt />
    </div>
  );
}
