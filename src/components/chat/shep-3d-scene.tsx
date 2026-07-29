"use client";

import { memo, Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, OrbitControls } from "@react-three/drei";
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

const GROUND = "#bebebe";

/** Layered radial shadow — soft falloff, no RTT flicker with Float. */
function SoftShadow() {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const innerTex = getRadialTexture(
    "rgba(20,20,20,0.35)",
    "rgba(20,20,20,0.1)",
    "rgba(20,20,20,0)",
  );
  const outerTex = getRadialTexture(
    "rgba(20,20,20,0.14)",
    "rgba(20,20,20,0.04)",
    "rgba(20,20,20,0)",
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
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial map={outerTex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={innerRef} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshBasicMaterial map={innerTex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function StudioSky() {
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

function StudioFloor() {
  const texture = getMeadowTexture();
  const y = SHEP_SCENE.groundY;

  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.35, 48]} />
        <meshStandardMaterial color={GROUND} roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <circleGeometry args={[5.5, 48]} />
        <meshBasicMaterial
          map={texture ?? undefined}
          color={GROUND}
          transparent
          opacity={texture ? 0.7 : 0.5}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function CoolLighting() {
  return (
    <>
      <color attach="background" args={[SKY_HORIZON]} />
      <fog attach="fog" args={[SKY_HORIZON, 6, 14]} />
      <ambientLight intensity={0.75} color="#ffffff" />
      <hemisphereLight args={["#f0f0f0", "#a0a0a0", 0.45]} />
      <directionalLight
        castShadow
        intensity={0.55}
        position={[2, 6, 3]}
        color="#e8ffff"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <directionalLight intensity={0.25} position={[-4, 3, -3]} color="#d0d0d0" />
      <pointLight intensity={0.35} position={[0, 4, 2]} color="#00ffe2" distance={12} />
      <Environment preset="studio" blur={0.5} />
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
      <StudioSky />
      <CoolLighting />
      <StudioFloor />
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
        shadows
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
