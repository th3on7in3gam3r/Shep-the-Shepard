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
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
};

const emptySubscribe = () => () => {};

function getSpeechSupportedSnapshot() {
  return !!getSpeechRecognition();
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
  const shouldRestartRef = useRef(false);

  const bindRecognition = useCallback((recognition: SpeechRecognitionInstance) => {
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) {
        setInterimTranscript(interim);
        optionsRef.current.onInterim?.(interim);
      }
      if (final) {
        const trimmed = final.trim();
        setTranscript(trimmed);
        setInterimTranscript("");
        optionsRef.current.onFinal?.(trimmed);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      if (event.error === "no-speech" && continuousRef.current) {
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

      const continuous = options?.continuous ?? false;
      continuousRef.current = continuous;
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

  /** Hold-to-speak: call on pointer down */
  const startHoldListening = useCallback(
    (options?: Omit<ListenOptions, "continuous">) => {
      startListening(options?.onFinal, { ...options, continuous: false });
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
