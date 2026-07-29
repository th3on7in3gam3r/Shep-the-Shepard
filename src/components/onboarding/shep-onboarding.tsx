"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Flame, MessageCircle, Sparkles } from "lucide-react";
import { ShepAvatar } from "@/components/shep-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_NAME, SHEP_FULL_NAME, SHEP_NAME } from "@/lib/constants";
import { track } from "@/lib/analytics";
import { useIsClient } from "@/hooks/use-is-client";
import { useProfileStore } from "@/stores/profile-store";
import { useChatStore } from "@/stores/chat-store";
import { useStreakStore } from "@/stores/streak-store";
import { cn } from "@/lib/utils";

const STEPS = ["welcome", "name", "tour"] as const;
type Step = (typeof STEPS)[number];

function isReturningUser(): boolean {
  const { name, onboardingComplete } = useProfileStore.getState();
  if (onboardingComplete) return true;
  const { messages } = useChatStore.getState();
  const { lastActiveDate } = useStreakStore.getState();
  return !!(name.trim() || messages.length > 0 || lastActiveDate);
}

export function ShepOnboarding() {
  const router = useRouter();
  const isClient = useIsClient();
  const onboardingComplete = useProfileStore((s) => s.onboardingComplete);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);
  const setName = useProfileStore((s) => s.setName);
  const storedName = useProfileStore((s) => s.name);

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<Step>("welcome");
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (!isClient) return;
    if (isReturningUser()) {
      completeOnboarding();
      return;
    }
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [isClient, completeOnboarding]);

  const goToNameStep = () => {
    setNameInput(storedName);
    setStep("name");
  };

  if (!isClient || !ready || onboardingComplete) return null;

  const stepIndex = STEPS.indexOf(step);

  const finish = (name?: string) => {
    if (name?.trim()) setName(name.trim());
    track("onboarding_finish");
    completeOnboarding();
  };

  const nextFromName = () => {
    if (nameInput.trim()) setName(nameInput);
    setStep("tour");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 pb-[calc(5rem+env(safe-area-inset-bottom)+1rem)] backdrop-blur-sm sm:items-center sm:pb-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shep-onboarding-title"
    >
      <Card className="w-full max-w-md border-shepherd-sage/30 shadow-2xl">
        <CardContent className="space-y-5 p-5">
          <div className="flex justify-center gap-1.5">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === stepIndex
                    ? "w-6 bg-shepherd-sage"
                    : i < stepIndex
                      ? "w-1.5 bg-shepherd-sage/50"
                      : "w-1.5 bg-muted",
                )}
              />
            ))}
          </div>

          <div className="flex flex-col items-center text-center">
            <ShepAvatar size="xl" mood="happy" entrance />
            {step === "welcome" && (
              <>
                <h2
                  id="shep-onboarding-title"
                  className="mt-4 font-heading text-xl font-semibold"
                >
                  Welcome to {APP_NAME}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  I&apos;m {SHEP_FULL_NAME} — your gentle companion for Scripture,
                  prayer, and daily encouragement. I&apos;m so glad you&apos;re here.
                </p>
              </>
            )}
            {step === "name" && (
              <>
                <h2
                  id="shep-onboarding-title"
                  className="mt-4 font-heading text-xl font-semibold"
                >
                  What should I call you?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Optional — you can always change this in your profile.
                </p>
                <Input
                  className="mt-4 text-center"
                  placeholder="Your name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && nextFromName()}
                  autoFocus
                />
              </>
            )}
            {step === "tour" && (
              <>
                <h2
                  id="shep-onboarding-title"
                  className="mt-4 font-heading text-xl font-semibold"
                >
                  Here&apos;s how we&apos;ll walk together
                </h2>
                <ul className="mt-4 w-full space-y-2.5 text-left">
                  <li className="flex items-start gap-3 rounded-xl bg-shepherd-meadow/25 px-3 py-2.5">
                    <Flame className="mt-0.5 size-4 shrink-0 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Daily Quest</p>
                      <p className="text-xs text-muted-foreground">
                        Three small tasks each day to grow your faith streak.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-xl bg-shepherd-meadow/25 px-3 py-2.5">
                    <MessageCircle className="mt-0.5 size-4 shrink-0 text-shepherd-sage" />
                    <div>
                      <p className="text-sm font-medium">Talk with {SHEP_NAME}</p>
                      <p className="text-xs text-muted-foreground">
                        Hold to speak or type — warm, Scripture-grounded chat.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-xl bg-shepherd-meadow/25 px-3 py-2.5">
                    <BookOpen className="mt-0.5 size-4 shrink-0 text-shepherd-sage" />
                    <div>
                      <p className="text-sm font-medium">Bible & devotions</p>
                      <p className="text-xs text-muted-foreground">
                        Read, save verses, and reflect with daily devotions.
                      </p>
                    </div>
                  </li>
                </ul>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {step === "welcome" && (
              <Button
                className="w-full bg-shepherd-sage hover:bg-shepherd-sage/90"
                onClick={goToNameStep}
              >
                <Sparkles className="size-4" />
                Nice to meet you, Shep!
              </Button>
            )}
            {step === "name" && (
              <>
                <Button
                  className="w-full bg-shepherd-sage hover:bg-shepherd-sage/90"
                  onClick={nextFromName}
                >
                  Continue
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep("tour")}>
                  Skip for now
                </Button>
              </>
            )}
            {step === "tour" && (
              <>
                <Button
                  className="w-full bg-shepherd-sage hover:bg-shepherd-sage/90"
                  onClick={() => {
                    finish(nameInput);
                    router.push("/chat");
                  }}
                >
                  Talk to {SHEP_NAME}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => finish(nameInput)}
                >
                  Explore home
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
