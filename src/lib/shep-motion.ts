import type { ShepMood } from "@/components/shep-avatar";
import * as THREE from "three";

const WAVE_DURATION = 2.6;
const WAVE_INTERVAL = 14;

export function getShepWaveBlend(
  t: number,
  mood: ShepMood,
  isSpeaking: boolean,
): number {
  if (
    isSpeaking ||
    mood === "speaking" ||
    mood === "listening" ||
    mood === "thinking" ||
    mood === "happy"
  ) {
    return 0;
  }

  const cycle = t % WAVE_INTERVAL;
  if (cycle > WAVE_DURATION) return 0;

  return Math.sin((cycle / WAVE_DURATION) * Math.PI);
}

export function getHappyGreetBlend(mood: ShepMood): number {
  return mood === "happy" ? 1 : 0;
}

/** Subtle idle look-around — makes Shep feel present. */
function applyIdleLife(
  t: number,
  head: THREE.Object3D,
  group: THREE.Group,
  mood: ShepMood,
  isSpeaking: boolean,
  wave: number,
) {
  if (wave > 0.05 || isSpeaking || mood === "speaking" || mood === "listening") return;
  if (mood !== "idle" && mood !== "happy" && mood !== "thinking") return;

  const lookY = Math.sin(t * 0.38) * 0.045 + Math.sin(t * 0.17 + 1.2) * 0.025;
  const lookX = Math.sin(t * 0.29 + 0.5) * 0.022;
  head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, lookY, 0.04);
  head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, lookX, 0.04);
  group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, Math.sin(t * 0.22) * 0.018, 0.03);
}

export function applyShepMotion(
  t: number,
  mood: ShepMood,
  isSpeaking: boolean,
  refs: {
    group?: THREE.Group | null;
    body?: THREE.Object3D | null;
    head?: THREE.Object3D | null;
    tail?: THREE.Object3D | null;
    mouth?: THREE.Object3D | null;
    nose?: THREE.Object3D | null;
    earL?: THREE.Object3D | null;
    earR?: THREE.Object3D | null;
    staff?: THREE.Object3D | null;
    wavePaw?: THREE.Object3D | null;
  },
) {
  const { group, body, head, tail, mouth, nose, earL, earR, staff, wavePaw } = refs;
  if (!group) return;

  const wave = getShepWaveBlend(t, mood, isSpeaking);
  const happy = getHappyGreetBlend(mood);

  const breath = 1 + Math.sin(t * 0.85) * 0.024;
  const breathSlow = Math.sin(t * 0.85 + 0.6);
  if (body) {
    body.scale.y = breath + happy * Math.sin(t * 2.2) * 0.012;
    body.scale.x = 0.9 + breathSlow * 0.009;
    body.scale.z = 0.92 + Math.sin(t * 0.85 + 0.4) * 0.007;
    body.rotation.z = THREE.MathUtils.lerp(body.rotation.z, breathSlow * 0.012, 0.06);
  }

  if (tail) {
    const wag = happy > 0 ? 0.28 : 0.18;
    tail.rotation.z = Math.sin(t * (happy > 0 ? 4 : 3)) * wag;
    tail.rotation.x = Math.sin(t * 2.1) * 0.06;
  }

  if (wavePaw) {
    if (wave > 0.01) {
      wavePaw.rotation.x = THREE.MathUtils.lerp(wavePaw.rotation.x, -1.05 - wave * 0.35, 0.18);
      wavePaw.rotation.z = THREE.MathUtils.lerp(
        wavePaw.rotation.z,
        Math.sin(t * 4.5) * 0.55 * wave,
        0.2,
      );
    } else {
      wavePaw.rotation.x = THREE.MathUtils.lerp(wavePaw.rotation.x, -0.15, 0.1);
      wavePaw.rotation.z = THREE.MathUtils.lerp(wavePaw.rotation.z, 0.05, 0.1);
    }
  }

  if (earL && earR) {
    const perky = happy > 0 ? 0.06 : 0;
    const idle = mood === "idle" || mood === "happy" || (!isSpeaking && mood !== "speaking");
    const flutter = Math.sin(t * 3.8) > 0.97 ? 0.08 : 0;
    if (idle) {
      const twitchL = Math.sin(t * 1.65) * Math.sin(t * 0.41 + 0.8) > 0.94 ? 0.14 : 0;
      const twitchR = Math.sin(t * 2.05 + 1.2) * Math.sin(t * 0.37) > 0.94 ? 0.12 : 0;
      earL.rotation.z = THREE.MathUtils.lerp(earL.rotation.z, -0.14 + twitchL + perky + flutter, 0.15);
      earR.rotation.z = THREE.MathUtils.lerp(earR.rotation.z, 0.14 - twitchR + perky, 0.15);
    } else {
      const twitch = Math.sin(t * 2.1) > 0.92 ? 0.18 : 0;
      earL.rotation.z = -0.18 + twitch;
      earR.rotation.z = 0.18 - twitch;
    }
  }

  if (nose) {
    const sniff = mood === "listening" ? Math.sin(t * 6) * 0.015 : Math.sin(t * 2.5) * 0.006;
    nose.position.z = THREE.MathUtils.lerp(nose.position.z, sniff, 0.2);
    nose.scale.setScalar(1 + (happy > 0 ? Math.sin(t * 3.5) * 0.04 : 0));
  }

  if (head) {
    if (wave > 0.05) {
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0.08 * wave, 0.12);
      head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, -0.06 * wave, 0.12);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -0.04 * wave, 0.12);
    } else if (mood === "thinking") {
      head.rotation.z = Math.sin(t * 0.9) * 0.1 - 0.06;
      head.rotation.x = -0.04;
      head.rotation.y = Math.sin(t * 0.5) * 0.03;
    } else if (mood === "listening") {
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, 0.1, 0.08);
      head.rotation.y = Math.sin(t * 1.5) * 0.04;
    } else if (mood === "speaking" || isSpeaking) {
      head.rotation.y = Math.sin(t * 2.8) * 0.04;
      head.rotation.x = Math.sin(t * 3.2) * 0.025;
    } else if (happy > 0) {
      head.rotation.y = Math.sin(t * 1.6) * 0.06;
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -0.03, 0.08);
    } else if (mood === "idle") {
      applyIdleLife(t, head, group, mood, isSpeaking, wave);
    } else {
      head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, 0, 0.05);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, 0, 0.05);
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0, 0.05);
    }
  }

  if (mouth) {
    const lip =
      isSpeaking || mood === "speaking"
        ? 0.6 + Math.abs(Math.sin(t * 14)) * 0.5
        : happy > 0
          ? 0.2 + Math.sin(t * 3) * 0.04
          : wave > 0.3
            ? 0.18 + wave * 0.1
            : 0.12;
    mouth.scale.y = lip;
    mouth.scale.x = 1 + lip * 0.15;
  }

  if (staff) {
    const sway = Math.sin(t * 0.7) * 0.025;
    staff.rotation.z =
      mood === "thinking" ? -0.14 + Math.sin(t) * 0.04 : -0.07 + sway;
    staff.rotation.x = THREE.MathUtils.lerp(staff.rotation.x, sway * 0.5, 0.05);
  }
}

/** Eye pupil offset for gentle gaze. */
export function getShepEyeGaze(t: number, mood: ShepMood): { x: number; y: number } {
  const baseX = Math.sin(t * 0.38) * 0.004 + Math.sin(t * 0.19 + 0.8) * 0.003;
  const baseY = Math.sin(t * 0.31 + 0.4) * 0.003;
  if (mood === "listening") return { x: baseX, y: 0.006 + baseY };
  if (mood === "happy") return { x: baseX, y: 0.004 + baseY };
  return { x: baseX, y: baseY };
}
