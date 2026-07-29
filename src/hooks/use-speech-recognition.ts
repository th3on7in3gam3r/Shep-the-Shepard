"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type ListenOptions = {
  continuous?: boolean;
  /**
   * Keep finals across phrases until stop (hold-to-speak).
   * When false (Continuous mode), each final utterance is delivered then cleared.
   */
  accumulateSession?: boolean;
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
};

const SOFT_ERRORS = new Set(["no-speech", "audio-capture"]);

const emptySubscribe = () => () => {};

function getSpeechSupportedSnapshot() {
  return !!getSpeechRecognition();
}

function joinTranscript(finals: string, interim: string) {
  return [finals.trim(), interim.trim()].filter(Boolean).join(" ");
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const isSupported = useSyncExternalStore(
    emptySubscribe,
    getSpeechSupportedSnapshot,
    () => false,
  );
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const optionsRef = useRef<ListenOptions>({});
  const continuousRef = useRef(false);
  const accumulateRef = useRef(false);
  const shouldRestartRef = useRef(false);
  /** Accumulated final phrases for the current listening session. */
  const finalsRef = useRef("");

  const bindRecognition = useCallback((recognition: SpeechRecognitionInstance) => {
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let newFinal = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (newFinal) {
        const chunk = newFinal.trim();
        if (accumulateRef.current) {
          finalsRef.current = joinTranscript(finalsRef.current, chunk);
          setTranscript(finalsRef.current);
          setInterimTranscript("");
          // Chunk for API symmetry; live text comes from onInterim with full session.
          optionsRef.current.onFinal?.(chunk);
          optionsRef.current.onInterim?.(finalsRef.current);
        } else {
          setTranscript(chunk);
          setInterimTranscript("");
          finalsRef.current = "";
          optionsRef.current.onFinal?.(chunk);
        }
      }

      if (interim) {
        const full = joinTranscript(finalsRef.current, interim);
        setInterimTranscript(interim.trim());
        optionsRef.current.onInterim?.(full);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      if (SOFT_ERRORS.has(event.error) && continuousRef.current) {
        shouldRestartRef.current = true;
        return;
      }
      setError(
        event.error === "not-allowed"
          ? "Microphone permission denied."
          : `Speech recognition error: ${event.error}`,
      );
      setIsListening(false);
      shouldRestartRef.current = false;
    };

    recognition.onend = () => {
      if (continuousRef.current && shouldRestartRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          /* already started */
        }
      }
      setIsListening(false);
      setInterimTranscript("");
      shouldRestartRef.current = false;
    };
  }, []);

  const createRecognition = useCallback(
    (continuous: boolean) => {
      const SpeechRecognition = getSpeechRecognition();
      if (!SpeechRecognition) return null;

      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      bindRecognition(recognition);
      return recognition;
    },
    [bindRecognition],
  );

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    continuousRef.current = false;
    accumulateRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    (onFinal?: (text: string) => void, options?: Omit<ListenOptions, "onFinal">) => {
      const SpeechRecognition = getSpeechRecognition();
      if (!SpeechRecognition) {
        setError("Speech recognition is not supported in this browser.");
        return;
      }

      stopListening();
      setError(null);
      setTranscript("");
      setInterimTranscript("");
      finalsRef.current = "";

      const continuous = options?.continuous ?? false;
      const accumulateSession = options?.accumulateSession ?? false;
      continuousRef.current = continuous;
      accumulateRef.current = accumulateSession;
      shouldRestartRef.current = continuous;
      optionsRef.current = { ...options, onFinal };

      const recognition = createRecognition(continuous);
      if (!recognition) return;

      recognitionRef.current = recognition;
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        setError("Could not start microphone.");
      }
    },
    [createRecognition, stopListening],
  );

  /** Hold-to-speak: continuous + session accumulate while held. */
  const startHoldListening = useCallback(
    (options?: Omit<ListenOptions, "continuous" | "accumulateSession">) => {
      startListening(options?.onFinal, {
        ...options,
        continuous: true,
        accumulateSession: true,
      });
    },
    [startListening],
  );

  /** Hold-to-speak: call on pointer up */
  const endHoldListening = useCallback(() => {
    stopListening();
  }, [stopListening]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    startHoldListening,
    endHoldListening,
    stopListening,
  };
}
