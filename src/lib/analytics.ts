/** Lightweight analytics — Vercel Analytics + optional Plausible domain. */

export type AnalyticsEvent =
  | "quest_complete"
  | "quest_task_complete"
  | "chat_send"
  | "mood_select"
  | "verse_save"
  | "onboarding_finish";

type EventProps = Record<string, string | number | boolean | undefined>;

export function track(event: AnalyticsEvent, props?: EventProps): void {
  if (typeof window === "undefined") return;

  const payload = { event, ...props };

  if (process.env.NODE_ENV === "development") {
    console.debug("[shepherd-analytics]", payload);
  }

  window.dispatchEvent(
    new CustomEvent("shepherd-analytics", { detail: payload }),
  );

  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (plausibleDomain && "plausible" in window) {
    (
      window as Window & {
        plausible?: (name: string, opts?: { props?: EventProps }) => void;
      }
    ).plausible?.(event, { props });
  }
}
