"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useClientValue } from "@/hooks/use-is-client";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "shepherd-pwa-dismissed";
const dismissListeners = new Set<() => void>();

function subscribeDismissed(onStoreChange: () => void) {
  dismissListeners.add(onStoreChange);
  return () => dismissListeners.delete(onStoreChange);
}

function notifyDismissedListeners() {
  dismissListeners.forEach((listener) => listener());
}

function getDismissedSnapshot() {
  return localStorage.getItem(DISMISS_KEY) === "1";
}

function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandaloneDisplay() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const dismissed = useSyncExternalStore(
    subscribeDismissed,
    getDismissedSnapshot,
    () => false,
  );

  const isIos = useClientValue(isIosDevice, false);
  const isStandalone = useClientValue(isStandaloneDisplay, false);

  useEffect(() => {
    if (typeof window === "undefined" || dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    notifyDismissedListeners();
    setDeferred(null);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setDeferred(null);
  };

  if (dismissed || isStandalone) return null;

  if (deferred) {
    return (
      <Card className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-lg border-shepherd-sage/30 shadow-lg">
        <CardContent className="flex items-start gap-3 p-4">
          <Download className="mt-0.5 size-5 shrink-0 text-shepherd-sage" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Install Shepherd</p>
            <p className="text-xs text-muted-foreground">
              Add to your home screen for quick access to Shep and your saved verses.
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                className="bg-shepherd-sage hover:bg-shepherd-sage/90"
                onClick={install}
              >
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Not now
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={dismiss} aria-label="Dismiss">
            <X className="size-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isIos) return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-lg border-shepherd-sage/30 shadow-lg">
      <CardContent className="flex items-start gap-3 p-4">
        <Share className="mt-0.5 size-5 shrink-0 text-shepherd-sage" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Add Shepherd to Home Screen</p>
          <p className="text-xs text-muted-foreground">
            Tap Share in Safari, then &ldquo;Add to Home Screen&rdquo; for a full-screen app
            experience with Shep.
          </p>
          <Button size="sm" variant="ghost" className="mt-2" onClick={dismiss}>
            Got it
          </Button>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={dismiss} aria-label="Dismiss">
          <X className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
