"use client";

import { useCallback, useRef, useState } from "react";

const MAX_MS = 60_000;

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "audio/webm";
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRecording = useCallback((): Promise<{
    dataUrl: string;
    mimeType: string;
    durationMs: number;
  } | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }

      recorder.onstop = async () => {
        if (maxTimerRef.current) {
          clearTimeout(maxTimerRef.current);
          maxTimerRef.current = null;
        }

        const mimeType = recorder.mimeType || pickMimeType();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        recorderRef.current = null;
        setIsRecording(false);

        if (blob.size === 0) {
          resolve(null);
          return;
        }

        const durationMs = Math.max(
          0,
          Date.now() - startedAtRef.current,
        );

        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            dataUrl: reader.result as string,
            mimeType,
            durationMs,
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      };

      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
    });
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Voice recording is not supported in this browser.");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250);
      setIsRecording(true);

      maxTimerRef.current = setTimeout(() => {
        void stopRecording();
      }, MAX_MS);

      return true;
    } catch {
      setError("Microphone access was denied.");
      return false;
    }
  }, [stopRecording]);

  const cancelRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      chunksRef.current = [];
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((t) => t.stop());
        recorderRef.current = null;
        setIsRecording(false);
      };
      recorder.stop();
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  }, []);

  return {
    isRecording,
    error,
    isSupported:
      typeof window !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined",
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
