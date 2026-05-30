"use client";

import { memo, Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ShepCharacter } from "@/components/chat/shep-character";
import type { ShepMood } from "@/components/shep-avatar";
import { ShepAvatar } from "@/components/shep-avatar";
import { useCoarsePointer } from "@/hooks/use-coarse-pointer";
import { SHEP_SCENE } from "@/lib/shep-model-config";
import {
  getMeadowTexture,
  getRadialTexture,
  getSkyTexture,
  SKY_HORIZON,
} from "@/lib/shep-scene-textures";
import { cn } from "@/lib/utils";
import { SCENE_GRADIENT } from "@/lib/shep-scene-gradient";

export { SCENE_GRADIENT };

type Shep3DSceneProps = {
  mood: ShepMood;
  isSpeaking: boolean;
  className?: string;
};

const MEADOW = "#dce8d4";

/** Layered radial shadow — soft falloff, no RTT flicker with Float. */
function SoftShadow() {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const innerTex = getRadialTexture(
    "rgba(62,82,58,0.22)",
    "rgba(62,82,58,0.06)",
    "rgba(62,82,58,0)",
  );
  const outerTex = getRadialTexture(
    "rgba(62,82,58,0.1)",
    "rgba(62,82,58,0.03)",
    "rgba(62,82,58,0)",
    160,
  );

  useFrame(({ clock }) => {
    const breathe = 1 + Math.sin(clock.getElapsedTime() * 0.72) * 0.04;
    innerRef.current?.scale.set(breathe, breathe, 1);
    outerRef.current?.scale.set(breathe * 1.12, breathe * 1.12, 1);
  });

  if (!innerTex || !outerTex) return null;

  return (
    <group position={[0, SHEP_SCENE.shadowY, 0]}>
      <mesh ref={outerRef} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-2}>
        <planeGeometry args={[1.35, 1.35]} />
        <meshBasicMaterial map={outerTex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={innerRef} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[0.85, 0.85]} />
        <meshBasicMaterial map={innerTex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Gradient sky dome — full-scene backdrop. */
function PeacefulSky() {
  const texture = getSkyTexture();
  if (!texture) return null;

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[14, 40, 20]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Soft cloud puffs in the upper sky. */
function SoftClouds() {
  const clouds: [number, number, number, number][] = [
    [-2.2, 2.8, -4, 0.55],
    [1.8, 3.2, -5, 0.65],
    [0.3, 3.5, -6, 0.8],
    [-0.8, 2.4, -3.5, 0.4],
  ];

  return (
    <group renderOrder={-5}>
      {clouds.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={[s * 1.6, s * 0.45, s]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial
            color="#faf8f5"
            transparent
            opacity={0.35}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Wide meadow plane fading into the fog — fills the lower horizon. */
function ExtendedMeadow() {
  const texture = getMeadowTexture();
  const y = SHEP_SCENE.groundY - 0.005;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} renderOrder={-8}>
      <circleGeometry args={[5.5, 48]} />
      <meshBasicMaterial
        map={texture ?? undefined}
        color={MEADOW}
        transparent
        opacity={texture ? 1 : 0.85}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function DistantHills() {
  const y = SHEP_SCENE.groundY - 0.02;
  return (
    <group position={[0, y, -3.5]}>
      <mesh position={[-2.2, 0, 0]} scale={[3.5, 0.45, 1.2]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#c5dcc0" roughness={1} />
      </mesh>
      <mesh position={[2, 0.08, 0.3]} scale={[4, 0.5, 1.3]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#b8d4b4" roughness={1} />
      </mesh>
      <mesh position={[0, -0.06, 0.8]} scale={[5, 0.35, 1.5]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#d0e0ca" roughness={1} />
      </mesh>
    </group>
  );
}

/** Soft circular hill platform — sanctuary ground. */
function SanctuaryGround() {
  const y = SHEP_SCENE.groundY;

  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.15, 48]} />
        <meshStandardMaterial color="#dce8d4" roughness={1} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <circleGeometry args={[0.78, 40]} />
        <meshStandardMaterial
          color="#eef6ea"
          roughness={1}
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[0.88, 1.12, 48]} />
        <meshStandardMaterial
          color="#cddcc6"
          roughness={1}
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function WarmLighting() {
  return (
    <>
      <color attach="background" args={[SKY_HORIZON]} />
      <fog attach="fog" args={[SKY_HORIZON, 5, 13]} />
      <ambientLight intensity={0.6} color="#fff6ed" />
      <hemisphereLight args={["#fff8f2", "#dce8f4", 0.55]} />
      <directionalLight
        castShadow
        intensity={0.75}
        position={[3, 6, 4]}
        color="#ffe4c4"
        shadow-mapSize={[512, 512]}
      />
      <directionalLight intensity={0.35} position={[-2, 4, -2]} color="#c8dff8" />
      <pointLight intensity={0.5} position={[5, 8, 5]} color="#ffd8a8" distance={10} />
    </>
  );
}

function SceneControls({ coarsePointer }: { coarsePointer: boolean }) {
  const { orbit } = SHEP_SCENE;

  return (
    <OrbitControls
      makeDefault
      target={orbit.target}
      enablePan={false}
      enableZoom
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={coarsePointer ? 0.55 : 0.85}
      zoomSpeed={coarsePointer ? 0.7 : 1}
      minDistance={orbit.minDistance}
      maxDistance={orbit.maxDistance}
      minPolarAngle={orbit.minPolarAngle}
      maxPolarAngle={orbit.maxPolarAngle}
      autoRotate={!coarsePointer}
      autoRotateSpeed={orbit.autoRotateSpeed}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}

function SceneContent({
  mood,
  isSpeaking,
  coarsePointer,
}: Omit<Shep3DSceneProps, "className"> & { coarsePointer: boolean }) {
  const { modelScale, modelPosition, float } = SHEP_SCENE;

  return (
    <>
      <PeacefulSky />
      <SoftClouds />
      <WarmLighting />
      <ExtendedMeadow />
      <DistantHills />
      <SanctuaryGround />
      <SoftShadow />
      <Float
        speed={float.speed}
        rotationIntensity={float.rotationIntensity}
        floatIntensity={float.floatIntensity}
      >
        <group scale={modelScale} position={modelPosition}>
          <ShepCharacter mood={mood} isSpeaking={isSpeaking} />
        </group>
      </Float>
      <SceneControls coarsePointer={coarsePointer} />
    </>
  );
}

export const Shep3DScene = memo(function Shep3DScene({
  mood,
  isSpeaking,
  className,
}: Shep3DSceneProps) {
  const { camera } = SHEP_SCENE;
  const coarsePointer = useCoarsePointer();

  return (
    <div
      className={cn("relative overflow-hidden touch-none", className)}
      style={{ background: SCENE_GRADIENT, touchAction: "none" }}
    >
      <Canvas
        dpr={coarsePointer ? [1, 1.25] : [1, 1.5]}
        camera={{ position: camera.position, fov: camera.fov }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(SKY_HORIZON, 1);
          scene.background = new THREE.Color(SKY_HORIZON);
        }}
        className="block cursor-grab active:cursor-grabbing"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      >
        <Suspense fallback={null}>
          <SceneContent
            mood={mood}
            isSpeaking={isSpeaking}
            coarsePointer={coarsePointer}
          />
        </Suspense>
      </Canvas>
    </div>
  );
});

export function ShepSceneFallback({
  mood,
  className,
}: {
  mood: ShepMood;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center overflow-hidden", className)}
      style={{ background: SCENE_GRADIENT }}
    >
      <ShepAvatar size="xl" mood={mood} animated entrance />
    </div>
  );
}
