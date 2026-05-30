"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ShepMood } from "@/components/shep-avatar";
import {
  applyShepMotion,
  getHappyGreetBlend,
  getShepEyeGaze,
} from "@/lib/shep-motion";
import { SHEP_SCENE } from "@/lib/shep-model-config";
import { SHEP_DESIGN as D } from "@/lib/shep-design";

type ShepProceduralModelProps = {
  mood: ShepMood;
  isSpeaking: boolean;
};

const wool = D.wool;
const woolMid = D.woolMid;
const woolShadow = D.woolShadow;
const face = D.face;
const sage = D.sage;
const eye = D.eye;

type Puff = readonly [number, number, number, number];

function WoolMaterial({ color }: { color: string }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.92}
      metalness={0.01}
      envMapIntensity={0.4}
      emissive={color}
      emissiveIntensity={0.03}
    />
  );
}

function WoolPuff({
  position,
  radius,
  color = wool,
}: {
  position: [number, number, number];
  radius: number;
  color?: string;
}) {
  return (
    <mesh castShadow position={position}>
      <sphereGeometry args={[radius, 20, 20]} />
      <WoolMaterial color={color} />
    </mesh>
  );
}

const BODY_PUFFS: Puff[] = [
  [0, 0.1, 0, 0.38],
  [0, 0.24, -0.02, 0.28],
  [-0.26, 0.12, 0.04, 0.17],
  [0.26, 0.12, 0.04, 0.17],
  [0, 0.06, -0.18, 0.22],
  [-0.14, 0.02, -0.14, 0.16],
  [0.14, 0.02, -0.14, 0.16],
  [0, -0.02, 0.16, 0.19],
];

const HEAD_PUFFS: Puff[] = [
  [0, 0, 0, 0.26],
  [-0.11, -0.02, 0.03, 0.14],
  [0.11, -0.02, 0.03, 0.14],
];

const LEG_POSITIONS: [number, number, number][] = [
  [-0.18, -0.3, 0.1],
  [0.18, -0.3, 0.1],
  [-0.18, -0.3, -0.08],
  [0.18, -0.3, -0.08],
];

const WAVE_PAW_PIVOT: [number, number, number] = [0.32, 0.28, 0.12];

export function ShepProceduralModel({ mood, isSpeaking }: ShepProceduralModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const earLRef = useRef<THREE.Mesh>(null);
  const earRRef = useRef<THREE.Mesh>(null);
  const eyeLRef = useRef<THREE.Group>(null);
  const eyeRRef = useRef<THREE.Group>(null);
  const pupilLRef = useRef<THREE.Mesh>(null);
  const pupilRRef = useRef<THREE.Mesh>(null);
  const noseRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const staffRef = useRef<THREE.Group>(null);
  const wavePawRef = useRef<THREE.Group>(null);

  const blinkPhase = useRef(0.6).current;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const blinkWave = Math.sin(t * 1.1 + blinkPhase);
    const blinkScale = blinkWave > 0.96 ? 0.06 : 1;
    if (eyeLRef.current) eyeLRef.current.scale.y = blinkScale;
    if (eyeRRef.current) eyeRRef.current.scale.y = blinkScale;

    const gaze = getShepEyeGaze(t, mood);
    if (pupilLRef.current) {
      pupilLRef.current.position.set(0.012 + gaze.x, 0.016 + gaze.y, 0.03);
    }
    if (pupilRRef.current) {
      pupilRRef.current.position.set(0.012 + gaze.x, 0.016 + gaze.y, 0.03);
    }

    applyShepMotion(t, mood, isSpeaking, {
      group: groupRef.current,
      body: bodyRef.current,
      head: headRef.current,
      tail: tailRef.current,
      mouth: mouthRef.current,
      nose: noseRef.current,
      earL: earLRef.current,
      earR: earRRef.current,
      staff: staffRef.current,
      wavePaw: wavePawRef.current,
    });

    const happy = getHappyGreetBlend(mood);
    if (groupRef.current && happy > 0) {
      groupRef.current.position.y = Math.sin(t * 2) * 0.025;
    } else if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.08);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.22, 0]}>
      <group ref={bodyRef}>
        {BODY_PUFFS.map(([x, y, z, r], i) => (
          <WoolPuff
            key={`body-${i}`}
            position={[x, y, z]}
            radius={r}
            color={i % 3 === 0 ? wool : i % 3 === 1 ? woolMid : woolShadow}
          />
        ))}

        {LEG_POSITIONS.map(([x, y, z], i) => (
          <mesh key={`leg-${i}`} castShadow position={[x, y, z]} rotation={[0.06, 0, 0]}>
            <capsuleGeometry args={[0.042, 0.16, 6, 10]} />
            <WoolMaterial color={woolShadow} />
          </mesh>
        ))}

        <group ref={wavePawRef} position={WAVE_PAW_PIVOT}>
          <mesh castShadow position={[0, 0.06, 0]} rotation={[0.2, 0, 0]}>
            <capsuleGeometry args={[0.038, 0.08, 6, 8]} />
            <WoolMaterial color={woolMid} />
          </mesh>
          <mesh castShadow position={[0, 0.13, 0.02]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <WoolMaterial color={wool} />
          </mesh>
        </group>

        <group ref={tailRef} position={[0, 0.06, -0.42]}>
          <WoolPuff position={[0, 0, 0]} radius={0.08} color={woolMid} />
          <WoolPuff position={[0, 0.03, -0.06]} radius={0.055} color={wool} />
        </group>
      </group>

      <group ref={headRef} position={[0, 0.48, 0.12]}>
        {HEAD_PUFFS.map(([x, y, z, r], i) => (
          <WoolPuff
            key={`head-${i}`}
            position={[x, y, z]}
            radius={r}
            color={i === 0 ? woolMid : wool}
          />
        ))}

        <mesh ref={earLRef} castShadow position={[-0.24, 0.08, -0.02]} scale={[0.5, 1, 0.32]}>
          <sphereGeometry args={[0.085, 14, 14]} />
          <WoolMaterial color={woolShadow} />
        </mesh>
        <mesh position={[-0.22, 0.06, 0.02]} scale={[0.35, 0.5, 0.25]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={D.innerEar} roughness={0.85} />
        </mesh>
        <mesh ref={earRRef} castShadow position={[0.24, 0.08, -0.02]} scale={[0.5, 1, 0.32]}>
          <sphereGeometry args={[0.085, 14, 14]} />
          <WoolMaterial color={woolShadow} />
        </mesh>
        <mesh position={[0.22, 0.06, 0.02]} scale={[0.35, 0.5, 0.25]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={D.innerEar} roughness={0.85} />
        </mesh>

        <group ref={eyeLRef} position={[-0.1, 0.02, 0.24]}>
          <mesh>
            <sphereGeometry args={[0.038, 14, 14]} />
            <meshStandardMaterial color={eye} roughness={0.35} />
          </mesh>
          <mesh ref={pupilLRef} position={[0.012, 0.016, 0.03]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshStandardMaterial color={D.eyeHighlight} emissive={D.eyeHighlight} emissiveIntensity={0.15} />
          </mesh>
        </group>
        <group ref={eyeRRef} position={[0.1, 0.02, 0.24]}>
          <mesh>
            <sphereGeometry args={[0.038, 14, 14]} />
            <meshStandardMaterial color={eye} roughness={0.35} />
          </mesh>
          <mesh ref={pupilRRef} position={[0.012, 0.016, 0.03]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshStandardMaterial color={D.eyeHighlight} emissive={D.eyeHighlight} emissiveIntensity={0.15} />
          </mesh>
        </group>

        <mesh position={[-0.07, -0.08, 0.22]} scale={[0.5, 0.35, 0.4]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={D.blush} transparent opacity={0.35} roughness={1} />
        </mesh>
        <mesh position={[0.07, -0.08, 0.22]} scale={[0.5, 0.35, 0.4]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={D.blush} transparent opacity={0.35} roughness={1} />
        </mesh>

        <mesh ref={noseRef} position={[0, -0.05, 0.26]}>
          <sphereGeometry args={[0.034, 10, 10]} />
          <meshStandardMaterial color={D.nose} roughness={0.55} />
        </mesh>

        <mesh ref={mouthRef} position={[0, -0.1, 0.24]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color={D.mouth} roughness={0.7} />
        </mesh>

        <mesh position={[0, -0.16, 0.08]} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[0.17, 0.028, 10, 20]} />
          <meshStandardMaterial
            color={sage}
            roughness={0.55}
            transparent
            opacity={D.collarOpacity}
            emissive={sage}
            emissiveIntensity={0.08}
          />
        </mesh>

        <mesh position={[0, -0.12, 0.2]} scale={[1, 0.82, 0.88]}>
          <sphereGeometry args={[0.12, 18, 18]} />
          <meshStandardMaterial color={face} roughness={0.78} />
        </mesh>
      </group>

      <group
        ref={staffRef}
        position={[0.34, 0, 0.16]}
        rotation={[0, 0, -0.1]}
        scale={SHEP_SCENE.staffScale}
      >
        <mesh castShadow position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.015, 0.02, 0.5, 10]} />
          <meshStandardMaterial color={D.staffWood} roughness={0.48} />
        </mesh>
        <mesh castShadow position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.048, 0.012, 8, 16, Math.PI * 1.1]} />
          <meshStandardMaterial color={D.staffGold} roughness={0.4} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

/** @deprecated use ShepProceduralModel */
export const Shep3DModel = ShepProceduralModel;
