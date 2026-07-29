"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  BookMarked,
  Keyboard,
  Mic,
  Music,
  Music2,
  NotebookPen,
  Radio,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Shep3DScene, ShepSceneFallback } from "@/components/chat/shep-3d-scene";
import type { ShepMood } from "@/components/shep-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useShepSpeech } from "@/hooks/use-shep-speech";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useIsClient } from "@/hooks/use-is-client";
import { isWebGLAvailable } from "@/lib/webgl-capability";
import { getLastAssistantText, getMessageText, dedupeChatMessages } from "@/lib/chat-utils";
import { extractVerseFromText } from "@/lib/extract-verse";
import { getLocalTimeOfDay } from "@/lib/build-shep-system-prompt";
import { USER_OPENAI_KEY_HEADER } from "@/lib/openai-user-key";
import { useChatContextStore } from "@/stores/chat-context-store";
import { useChatStore } from "@/stores/chat-store";
import { ChatContextBanner, GuidedFlowPanel } from "@/components/chat/guided-flow-panel";
import { FirstTokenIndicator } from "@/components/chat/typing-indicator";
import { useActivityStore } from "@/stores/activity-store";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useJournalStore } from "@/stores/journal-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useProfileStore } from "@/stores/profile-store";
import { useStudySession } from "@/hooks/use-study-session";
import { useMeadowAmbient } from "@/hooks/use-meadow-ambient";
import { getSeasonalShepLine } from "@/lib/seasonal-content";
import { SHEP_FULL_NAME } from "@/lib/constants";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** Matches `Button size="icon-sm"` footprint for stable SSR/client layout. */
const ICON_BTN_PLACEHOLDER = "size-7 shrink-0 rounded-lg";

function IconButtonPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(ICON_BTN_PLACEHOLDER, "bg-card/40", className)}
      aria-hidden
    />
  );
}

type VoiceToggleButtonProps = {
  autoSpeak: boolean;
  onToggle: () => void;
};

function VoiceToggleButton({ autoSpeak, onToggle }: VoiceToggleButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      suppressHydrationWarning
      aria-label={autoSpeak ? "Disable auto-speak" : "Enable auto-speak"}
      onClick={onToggle}
      className={cn(
        "bg-card/80 backdrop-blur-sm",
        autoSpeak && "text-shepherd-sage",
      )}
    >
      {autoSpeak ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
    </Button>
  );
}

type AmbientToggleButtonProps = {
  enabled: boolean;
  onToggle: () => void;
};

function AmbientToggleButton({ enabled, onToggle }: AmbientToggleButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      suppressHydrationWarning
      aria-label={enabled ? "Turn off meadow ambient" : "Turn on meadow ambient"}
      onClick={onToggle}
      className={cn(
        "bg-card/80 backdrop-blur-sm",
        enabled && "text-shepherd-sage",
      )}
    >
      {enabled ? <Music2 className="size-4" /> : <Music className="size-4" />}
    </Button>
  );
}

type HoldMicProps = {
  disabled: boolean;
  holding: boolean;
  listening: boolean;
  onHoldStart: () => void;
  onHoldEnd: () => void;
};

function attachHoldPointerHandlers(
  onHoldStart: () => void,
  onHoldEnd: () => void,
) {
  return {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      onHoldStart();
    },
    onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      onHoldEnd();
    },
    onPointerCancel: onHoldEnd,
    onLostPointerCapture: onHoldEnd,
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
  };
}

/** Full-width hold control for voice mode (keyboard hidden). */
function HoldToSpeakButton({
  disabled,
  holding,
  listening,
  onHoldStart,
  onHoldEnd,
}: HoldMicProps) {
  const active = holding || listening;
  return (
    <div className="relative flex justify-center py-1">
      {active && (
        <>
          <span
            className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-full border-2 border-shepherd-sage/40 motion-safe:animate-hold-ring"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-x-12 top-1/2 h-20 -translate-y-1/2 rounded-full border-2 border-shepherd-sky/35 motion-safe:animate-hold-ring-delay"
            aria-hidden
          />
        </>
      )}
      <button
        type="button"
        disabled={disabled}
        suppressHydrationWarning
        aria-label={active ? "Release to send message" : "Hold to speak"}
        {...attachHoldPointerHandlers(onHoldStart, onHoldEnd)}
        className={cn(
          "relative z-10 flex min-h-28 w-full max-w-sm flex-col items-center justify-center gap-2 rounded-3xl px-6 py-6 transition-all touch-none select-none",
          "[touch-action:none] [-webkit-user-select:none] [-webkit-touch-callout:none]",
          active
            ? "scale-[0.96] bg-shepherd-sage text-primary-foreground shadow-inner"
            : "bg-gradient-to-br from-shepherd-sage to-shepherd-sky text-primary-foreground shadow-lg motion-safe:animate-hold-breathe",
          disabled && "opacity-60 motion-safe:animate-none",
        )}
      >
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-full bg-primary-foreground/15",
            active && "bg-primary-foreground/25",
          )}
        >
          <Mic className={cn("size-7", active && "animate-pulse")} />
        </span>
        <span className="text-base font-semibold tracking-tight">
          {active ? "Release to send" : "Hold to Speak"}
        </span>
        <span className="text-[11px] font-medium opacity-80">
          {active ? "Holding your words with care…" : "Press and hold, then release"}
        </span>
      </button>
    </div>
  );
}

/** Compact mic beside the text field in typing mode. */
function CompactHoldMic({
  disabled,
  holding,
  listening,
  onHoldStart,
  onHoldEnd,
}: HoldMicProps) {
  const active = holding || listening;
  return (
    <button
      type="button"
      disabled={disabled}
      suppressHydrationWarning
      aria-label={active ? "Release to send message" : "Hold to speak"}
      {...attachHoldPointerHandlers(onHoldStart, onHoldEnd)}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl transition-all touch-none select-none",
        "[touch-action:none] [-webkit-user-select:none] [-webkit-touch-callout:none]",
        active
          ? "bg-shepherd-sage text-primary-foreground shadow-inner"
          : "bg-gradient-to-br from-shepherd-sage to-shepherd-sky text-primary-foreground shadow-sm",
        disabled && "opacity-60",
      )}
    >
      <Mic className={cn("size-4", active && "animate-pulse")} />
    </button>
  );
}

type ReplyFollowUpsProps = {
  text: string;
  onContinue: () => void;
  onPray: () => void;
};

function ReplyFollowUps({ text, onContinue, onPray }: ReplyFollowUpsProps) {
  const router = useRouter();
  const addFavorite = useFavoritesStore((s) => s.addFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const addEntry = useJournalStore((s) => s.addEntry);
  const logActivity = useActivityStore((s) => s.logActivity);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const verse = useMemo(() => extractVerseFromText(text), [text]);
  const alreadySaved = verse ? isFavorite(verse.reference) : false;

  const chipClass = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "h-8 gap-1 rounded-full border-shepherd-sage/25 bg-background/70 px-2.5 text-[11px] font-medium text-foreground hover:bg-shepherd-meadow/35",
  );

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={chipClass} onClick={onContinue}>
          <Mic className="size-3" />
          Continue talking
        </button>
        <button
          type="button"
          className={chipClass}
          onClick={() => {
            const snippet = text.trim().slice(0, 500);
            addEntry({
              content: snippet,
              reference: verse?.reference,
              chatSnippet: snippet.slice(0, 200),
            });
            logActivity({
              type: "journal",
              title: "Journaled from chat",
              subtitle: snippet.slice(0, 80),
            });
            setSavedNote("Saved to your journal");
            track("chat_followup", { action: "journal" });
            window.setTimeout(() => router.push("/journal"), 400);
          }}
        >
          <NotebookPen className="size-3" />
          Journal this
        </button>
        {verse && (
          <button
            type="button"
            className={chipClass}
            disabled={alreadySaved}
            onClick={() => {
              addFavorite({
                reference: verse.reference,
                text: verse.text,
              });
              logActivity({
                type: "verse_saved",
                title: "Saved a verse",
                subtitle: verse.reference,
              });
              setSavedNote(`Saved ${verse.reference}`);
              track("chat_followup", { action: "save_verse" });
            }}
          >
            <BookMarked className="size-3" />
            {alreadySaved ? "Verse saved" : "Save this verse"}
          </button>
        )}
        <button
          type="button"
          className={chipClass}
          onClick={() => {
            track("chat_followup", { action: "pray" });
            onPray();
          }}
        >
          Pray with me
        </button>
      </div>
      {savedNote && (
        <p className="text-[10px] text-shepherd-sage" role="status">
          {savedNote}
        </p>
      )}
    </div>
  );
}

export function ChatInterface() {
  const isClient = useIsClient();
  const [input, setInput] = useState("");
  const [welcomeMood, setWelcomeMood] = useState(true);
  const [holding, setHolding] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  /** Assistant message id hidden until TTS audio starts (auto-speak sync). */
  const [pendingRevealId, setPendingRevealId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastSpokenIdRef = useRef<string | null>(null);
  const pendingSendRef = useRef("");
  const contextConsumedRef = useRef(false);
  const messagesHydratedRef = useRef(false);
  const holdSentRef = useRef(false);
  const holdingRef = useRef(false);

  const holdMicRef = useRef<HTMLDivElement>(null);

  const setStoredMessages = useChatStore((s) => s.setMessages);
  const clearStoredMessages = useChatStore((s) => s.clearMessages);
  const consumePending = useChatContextStore((s) => s.consumePending);
  const autoSpeak = useChatStore((s) => s.autoSpeak);
  const setAutoSpeak = useChatStore((s) => s.setAutoSpeak);
  const continuousListen = useChatStore((s) => s.continuousListen);
  const setContinuousListen = useChatStore((s) => s.setContinuousListen);
  const showTextInput = useChatStore((s) => s.showTextInput);
  const setShowTextInput = useChatStore((s) => s.setShowTextInput);
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);
  const ambientSoundEnabled = useSettingsStore((s) => s.ambientSoundEnabled);
  const setAmbientSoundEnabled = useSettingsStore((s) => s.setAmbientSoundEnabled);
  const profileName = useProfileStore((s) => s.name);
  const profileNameRef = useRef(profileName);
  profileNameRef.current = profileName;
  const logActivity = useActivityStore((s) => s.logActivity);
  const completeQuestTask = useDailyQuestStore((s) => s.completeTask);

  const [chatLive, setChatLive] = useState<boolean | null>(null);

  useStudySession();

  useEffect(() => {
    if (!isClient) return;
    void fetch("/api/chat/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { live?: boolean } | null) => {
        setChatLive(Boolean(data?.live));
      })
      .catch(() => setChatLive(false));
  }, [isClient]);

  const chatTransport = useMemo(
    () =>
      new DefaultChatTransport({
        body: () => ({
          userName: profileNameRef.current.trim() || undefined,
          timeOfDay: getLocalTimeOfDay(),
        }),
        headers: () => {
          const key = useSettingsStore.getState().userOpenAiApiKey.trim();
          const headers: Record<string, string> = {};
          if (key) headers[USER_OPENAI_KEY_HEADER] = key;
          return headers;
        },
      }),
    [],
  );

  const { messages, sendMessage, setMessages, status, error } = useChat({
    id: "shep-main",
    transport: chatTransport,
    onFinish: ({ messages: finished }) => {
      setStoredMessages(dedupeChatMessages(finished));
    },
  });

  useEffect(() => {
    const t = setTimeout(() => setWelcomeMood(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const {
    isListening,
    isSupported: sttSupported,
    interimTranscript,
    error: sttError,
    startListening,
    startHoldListening,
    endHoldListening,
    stopListening,
  } = useSpeechRecognition();

  const {
    isSpeaking,
    isSupported: ttsSupported,
    speak,
    stopSpeaking,
  } = useShepSpeech();

  useMeadowAmbient({
    enabled: isClient && ambientSoundEnabled,
    ducked: isSpeaking || isListening || holding,
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isThinking = status === "submitted";
  const isStreaming = status === "streaming";

  useEffect(() => {
    if (!isClient || messagesHydratedRef.current) return;

    const hydrate = () => {
      if (messagesHydratedRef.current) return;
      const stored = dedupeChatMessages(useChatStore.getState().messages);
      if (stored.length > 0) {
        setMessages(stored);
      }
      messagesHydratedRef.current = true;
    };

    if (useChatStore.persist.hasHydrated()) {
      hydrate();
      return;
    }

    return useChatStore.persist.onFinishHydration(hydrate);
  }, [isClient, setMessages]);

  const lastAssistant = messages.filter((m) => m.role === "assistant").at(-1);
  const streamingText =
    isStreaming && lastAssistant ? getMessageText(lastAssistant) : "";
  const awaitingFirstToken = isThinking && !streamingText.trim();
  const streamStarted = isStreaming && !!streamingText.trim();
  const deferSpeechReveal = Boolean(
    autoSpeak && voiceEnabled && ttsSupported,
  );
  const hideStreamingAssistant =
    deferSpeechReveal && isStreaming && !!lastAssistant?.id;
  const showSpeechWait =
    deferSpeechReveal &&
    (isThinking || isStreaming || !!pendingRevealId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, awaitingFirstToken, streamStarted, pendingRevealId]);

  useEffect(() => {
    if (
      !isClient ||
      !autoSpeak ||
      !voiceEnabled ||
      !ttsSupported ||
      status !== "ready" ||
      !lastAssistant?.id ||
      lastSpokenIdRef.current === lastAssistant.id
    ) {
      return;
    }
    const text = getLastAssistantText(messages);
    if (!text || !lastAssistant.id) return;

    const id = lastAssistant.id;
    lastSpokenIdRef.current = id;
    setPendingRevealId(id);
    speak(text, {
      onStart: () => setPendingRevealId((current) => (current === id ? null : current)),
      onEnd: () => setPendingRevealId((current) => (current === id ? null : current)),
    });
  }, [
    isClient,
    status,
    lastAssistant?.id,
    messages,
    autoSpeak,
    voiceEnabled,
    ttsSupported,
    speak,
  ]);

  const sendUserMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      stopSpeaking();
      setPendingRevealId(null);
      track("chat_send");
      sendMessage({ text: trimmed });
      completeQuestTask("connect");
      logActivity({
        type: "chat",
        title: "Chat with Shep",
        subtitle: trimmed.slice(0, 80) + (trimmed.length > 80 ? "…" : ""),
      });
      setInput("");
      pendingSendRef.current = "";
    },
    [isLoading, stopSpeaking, sendMessage, logActivity, completeQuestTask],
  );

  useEffect(() => {
    if (!isClient || contextConsumedRef.current || isLoading || status !== "ready") {
      return;
    }
    const ctx = consumePending();
    if (!ctx?.initialMessage) return;
    contextConsumedRef.current = true;
    const message = ctx.initialMessage;
    queueMicrotask(() => sendUserMessage(message));
  }, [isClient, isLoading, status, consumePending, sendUserMessage]);

  const handleVoiceFinal = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      if (continuousListen) {
        sendUserMessage(text.trim());
        pendingSendRef.current = "";
        setLiveTranscript("");
        return;
      }
      // Hold mode: pendingSendRef is kept current via onInterim (full session text).
      if (!holding && !holdSentRef.current) {
        const toSend = pendingSendRef.current.trim() || text.trim();
        sendUserMessage(toSend);
        pendingSendRef.current = "";
        setLiveTranscript("");
      }
    },
    [continuousListen, holding, sendUserMessage],
  );

  useEffect(() => {
    if (!isClient || !continuousListen || !sttSupported) {
      stopListening();
      return;
    }
    if (isLoading || isSpeaking) return;

    startListening(handleVoiceFinal, {
      continuous: true,
      onInterim: (t) => {
        pendingSendRef.current = t;
        setLiveTranscript(t);
      },
    });

    return () => stopListening();
  }, [
    isClient,
    continuousListen,
    sttSupported,
    isLoading,
    isSpeaking,
    startListening,
    stopListening,
    handleVoiceFinal,
  ]);

  const handleHoldStart = () => {
    if (!sttSupported || isLoading) return;
    if (holdingRef.current) return;
    holdingRef.current = true;
    holdSentRef.current = false;
    setHolding(true);
    stopSpeaking();
    pendingSendRef.current = "";
    setLiveTranscript("");
    startHoldListening({
      onFinal: handleVoiceFinal,
      onInterim: (t) => {
        pendingSendRef.current = t;
        setLiveTranscript(t);
      },
    });
  };

  const handleHoldEnd = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    endHoldListening();
    if (pendingSendRef.current.trim()) {
      holdSentRef.current = true;
      sendUserMessage(pendingSendRef.current);
      pendingSendRef.current = "";
      setLiveTranscript("");
    }
  };

  const mood = useMemo((): ShepMood => {
    if (!isClient) return "idle";
    if (welcomeMood && messages.length === 0) return "happy";
    if (isListening || holding) return "listening";
    if (isSpeaking) return "speaking";
    if (isThinking || isStreaming) return "thinking";
    return "idle";
  }, [
    isClient,
    welcomeMood,
    messages.length,
    isListening,
    holding,
    isSpeaking,
    isThinking,
    isStreaming,
  ]);

  const getStatusText = () => {
    if (!isClient) return `${SHEP_FULL_NAME} is here for you`;
    if (welcomeMood && messages.length === 0)
      return `I'm Shep the Shepherd — hold to speak or tap the mic.`;
    if (holding || isListening) return "Holding your words with care…";
    if (isSpeaking) return "Speaking to you…";
    if (pendingRevealId) return "Preparing to speak…";
    if (awaitingFirstToken) return "Waiting for Shep's first word…";
    if (streamStarted || (deferSpeechReveal && isStreaming))
      return deferSpeechReveal ? "Preparing to speak…" : "Shep is responding…";
    if (isStreaming) return "Sharing wisdom…";
    return getSeasonalShepLine("chat-idle") ?? `${SHEP_FULL_NAME} is here for you`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendUserMessage(input);
  };

  const handleClearChat = () => {
    stopSpeaking();
    stopListening();
    setPendingRevealId(null);
    clearStoredMessages();
    setMessages([]);
    lastSpokenIdRef.current = null;
  };

  const liveVoiceLine =
    isClient && (holding || isListening)
      ? liveTranscript || interimTranscript
      : "";
  const emptyHint =
    isClient && messages.length === 0 && !liveVoiceLine
      ? "Hold the button below and share what's on your heart."
      : !isClient
        ? "Hold the button below and share what's on your heart."
        : "";
  const displayLine = liveVoiceLine || emptyHint;

  const showClearChat = isClient && messages.length > 0;
  const showHoldToSpeak = isClient && sttSupported && !continuousListen;
  const showReplyActions =
    isClient &&
    status === "ready" &&
    !holding &&
    !pendingRevealId &&
    !!lastAssistant?.id &&
    lastAssistant.role === "assistant";

  const handleContinueTalking = useCallback(() => {
    setShowTextInput(false);
    holdMicRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [setShowTextInput]);

  const handlePrayFollowUp = useCallback(() => {
    sendUserMessage(
      "Pray with me about what we just talked about. Keep it gentle and short.",
    );
  }, [sendUserMessage]);

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] flex-col">
      {/* Compact Shep presence — WebGL with 2D fallback */}
      <div className="relative shrink-0 px-0.5">
        {isClient && isWebGLAvailable() ? (
          <Shep3DScene
            mood={mood}
            isSpeaking={isSpeaking}
            className="h-80 w-full rounded-2xl border border-shepherd-sage/25 shadow-[0_6px_24px_-8px_rgba(0,0,0,0.14),0_0_20px_-6px_rgba(0,180,160,0.18)] ring-1 ring-shepherd-meadow/40 sm:h-80"
          />
        ) : (
          <ShepSceneFallback
            mood={mood}
            className="h-80 w-full rounded-2xl border border-shepherd-sage/25 shadow-[0_6px_24px_-8px_rgba(0,0,0,0.14)] ring-1 ring-shepherd-meadow/40 sm:h-80"
          />
        )}
        <div className="absolute bottom-2 left-0 right-0 px-3 text-center">
          <p
            className="truncate text-xs font-medium text-shepherd-sage/90"
            suppressHydrationWarning
          >
            {getStatusText()}
          </p>
        </div>
        <div className="absolute right-2 top-2 flex gap-0.5">
          {isClient ? (
            <>
              <AmbientToggleButton
                enabled={ambientSoundEnabled}
                onToggle={() => setAmbientSoundEnabled(!ambientSoundEnabled)}
              />
              {ttsSupported ? (
                <VoiceToggleButton
                  autoSpeak={autoSpeak}
                  onToggle={() => setAutoSpeak(!autoSpeak)}
                />
              ) : (
                <IconButtonPlaceholder className="invisible" />
              )}
              {showClearChat ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Clear chat"
                  onClick={handleClearChat}
                  className="bg-card/80 backdrop-blur-sm"
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              ) : (
                <IconButtonPlaceholder className="invisible" />
              )}
            </>
          ) : (
            <>
              <IconButtonPlaceholder />
              <IconButtonPlaceholder className="invisible" />
            </>
          )}
        </div>
      </div>

      {/* Full conversation thread */}
      <ScrollArea className="mt-2.5 min-h-0 flex-1">
        <div className="space-y-2.5 px-1 pb-2">
          {isClient &&
            messages.map((message) => {
              const text = getMessageText(message);
              if (!text.trim()) return null;
              const isUser = message.role === "user";
              const withholdSpeech =
                !isUser &&
                deferSpeechReveal &&
                (message.id === pendingRevealId ||
                  (hideStreamingAssistant && message.id === lastAssistant?.id));
              if (withholdSpeech) return null;
              const isLatestAssistant =
                showReplyActions &&
                message.id === lastAssistant?.id &&
                !isUser;
              return (
                <div
                  key={message.id}
                  className={cn("flex", isUser ? "justify-end" : "justify-start")}
                >
                  <div className="max-w-[92%]">
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        isUser
                          ? "bg-shepherd-sage text-primary-foreground"
                          : "border border-shepherd-sage/15 bg-shepherd-cream/40 dark:bg-card",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{text}</p>
                    </div>
                    {isLatestAssistant && (
                      <ReplyFollowUps
                        text={text}
                        onContinue={handleContinueTalking}
                        onPray={handlePrayFollowUp}
                      />
                    )}
                  </div>
                </div>
              );
            })}

          {isClient && (awaitingFirstToken || showSpeechWait) && (
            <FirstTokenIndicator
              label={
                holding
                  ? "Holding your words with care…"
                  : pendingRevealId || (deferSpeechReveal && isStreaming)
                    ? "Preparing to speak…"
                    : "Waiting for Shep's first word…"
              }
            />
          )}

          {displayLine && (
            <p
              className="rounded-xl bg-shepherd-meadow/25 px-3 py-2 font-serif text-sm leading-relaxed text-foreground/90"
              suppressHydrationWarning
            >
              {displayLine}
              {liveVoiceLine && (
                <span className="ml-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-shepherd-sage/80">
                  <span className="size-1.5 rounded-full bg-shepherd-sage animate-pulse" />
                  listening
                </span>
              )}
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {isClient && chatLive === false && (
        <p className="px-1 text-xs text-muted-foreground">
          Shep is in offline mode right now. You can still talk — replies are limited
          until connection is restored.
        </p>
      )}

      {isClient && (error || sttError) && (
        <p className="px-1 text-xs text-destructive">{error?.message ?? sttError}</p>
      )}

      {/* Voice / type composer */}
      <div className="mt-2 shrink-0 space-y-1.5 border-t border-border/60 pt-2">
        <ChatContextBanner />
        <GuidedFlowPanel onSendStep={sendUserMessage} />

        {showHoldToSpeak && !(isClient && showTextInput) && (
          <div ref={holdMicRef}>
            <HoldToSpeakButton
              disabled={isLoading}
              holding={holding}
              listening={isListening}
              onHoldStart={handleHoldStart}
              onHoldEnd={handleHoldEnd}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 px-0.5">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
            <Radio className="size-3.5 text-shepherd-sage" />
            Continuous
            <Switch
              checked={isClient ? continuousListen : false}
              disabled={!isClient}
              onCheckedChange={(v) => {
                setContinuousListen(v);
                if (!v) stopListening();
              }}
            />
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-xl border-shepherd-sage/30 bg-background/70 px-3 text-xs font-medium hover:bg-shepherd-meadow/35"
            disabled={!isClient}
            onClick={() => setShowTextInput(!showTextInput)}
          >
            <Keyboard className="size-3.5 text-shepherd-sage" />
            {isClient && showTextInput ? "Hide keyboard" : "Type instead"}
          </Button>
        </div>

        {isClient && showTextInput && (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            {sttSupported && !continuousListen && (
              <CompactHoldMic
                disabled={isLoading}
                holding={holding}
                listening={isListening}
                onHoldStart={handleHoldStart}
                onHoldEnd={handleHoldEnd}
              />
            )}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type a message to Shep…"
              rows={1}
              className="min-h-10 max-h-28 resize-none text-sm"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-10 shrink-0 bg-shepherd-sage hover:bg-shepherd-sage/90"
            >
              Send
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
