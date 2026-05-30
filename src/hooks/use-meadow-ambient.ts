"use client";

import { useCallback, useEffect, useRef } from "react";

type MeadowAmbientOptions = {
  enabled: boolean;
  ducked: boolean;
  volume?: number;
};

/**
 * Procedural meadow ambient via Web Audio — no audio file required.
 * Soft filtered noise with a gentle low-frequency pulse.
 */
export function useMeadowAmbient({
  enabled,
  ducked,
  volume = 0.06,
}: MeadowAmbientOptions) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const startedRef = useRef(false);

  const stop = useCallback(() => {
    nodesRef.current.forEach((node) => {
      try {
        if ("stop" in node && typeof node.stop === "function") {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        /* already stopped */
      }
    });
    nodesRef.current = [];
    if (ctxRef.current && ctxRef.current.state !== "closed") {
      void ctxRef.current.close();
    }
    ctxRef.current = null;
    gainRef.current = null;
    startedRef.current = false;
  }, []);

  const start = useCallback(async () => {
    if (startedRef.current || typeof window === "undefined") return;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = ducked ? volume * 0.25 : volume;
    gainRef.current = master;
    master.connect(ctx.destination);

    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      output[i] = last * 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 420;

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 80;

    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(master);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = volume * 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);

    noise.start();
    lfo.start();

    nodesRef.current = [noise, lfo, lowpass, highpass, lfoGain, master];
    startedRef.current = true;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  }, [ducked, volume]);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    void start();
    return stop;
  }, [enabled, start, stop]);

  useEffect(() => {
    if (!gainRef.current || !ctxRef.current) return;
    const target = ducked ? volume * 0.2 : volume;
    gainRef.current.gain.setTargetAtTime(target, ctxRef.current.currentTime, 0.4);
  }, [ducked, volume]);

  return { stop };
}
