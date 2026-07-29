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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-shepherd-meadow/25 via-transparent to-transparent dark:from-shepherd-sage/10" />
      <main className="relative mx-auto min-h-dvh max-w-lg px-4 pb-24 pt-6">
        {children}
        <AppFooter />
      </main>
      <BottomNav />
      <PwaInstallPrompt />
    </div>
  );
}
