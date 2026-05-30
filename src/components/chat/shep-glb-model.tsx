"use client";

import { useMemo, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import type { ShepMood } from "@/components/shep-avatar";
import { SHEP_GLB_PATH, SHEP_SCENE } from "@/lib/shep-model-config";
import { applyShepMotion, getHappyGreetBlend } from "@/lib/shep-motion";

type ShepGlbModelProps = {
  mood: ShepMood;
  isSpeaking: boolean;
};

const MOUTH_MORPH_NAMES = [
  "mouthOpen",
  "MouthOpen",
  "jawOpen",
  "JawOpen",
  "viseme_aa",
  "A",
  "aa",
];

function fitModelToScene(root: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const targetHeight = SHEP_SCENE.glbTargetHeight;
  const scale = maxDim > 0 ? targetHeight / maxDim : 1;

  root.position.sub(center);
  root.position.y += size.y * scale * 0.5 - 0.15;
  root.scale.setScalar(scale);
}

function findMouthMorph(mesh: THREE.Mesh): THREE.Mesh | null {
  if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return null;
  const hasMouth = MOUTH_MORPH_NAMES.some((n) => n in mesh.morphTargetDictionary!);
  return hasMouth ? mesh : null;
}

export function ShepGlbModel({ mood, isSpeaking }: ShepGlbModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mouthMorphRef = useRef<THREE.Mesh | null>(null);
  const { scene, animations } = useGLTF(SHEP_GLB_PATH);
  const { actions, mixer } = useAnimations(animations, groupRef);

  const clone = useMemo(() => {
    const c = scene.clone(true);
    fitModelToScene(c);
    return c;
  }, [scene]);

  useEffect(() => {
    mouthMorphRef.current = null;
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (!mouthMorphRef.current) {
          mouthMorphRef.current = findMouthMorph(child);
        }
      }
    });
  }, [clone]);

  useEffect(() => {
    if (!actions) return;
    const names = Object.keys(actions);
    const idle =
      actions.Idle ??
      actions.idle ??
      actions["Idle.001"] ??
      actions.Walk ??
      actions[names.find((n) => /idle/i.test(n)) ?? ""] ??
      actions[names[0]];
    idle?.reset().fadeIn(0.3).play();
    return () => {
      idle?.fadeOut(0.3);
    };
  }, [actions]);

  useEffect(() => {
    if (!actions || !isSpeaking) return;
    const talk =
      actions.Talk ??
      actions.talk ??
      actions.Eat ??
      actions.Jump ??
      actions[Object.keys(actions).find((n) => /talk|speak|eat/i.test(n)) ?? ""];
    if (talk && talk !== actions.Idle && talk !== actions.idle) {
      talk.reset().fadeIn(0.2).play();
    }
    return () => {
      talk?.fadeOut(0.2);
    };
  }, [actions, isSpeaking]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const root = groupRef.current;
    if (!root) return;

    const head =
      root.getObjectByName("Head") ??
      root.getObjectByName("head") ??
      root.getObjectByName("BoneHead");
    const wavePaw =
      root.getObjectByName("FrontLeg_L") ??
      root.getObjectByName("Leg_L") ??
      root.getObjectByName("Arm_L") ??
      root.getObjectByName("LeftArm") ??
      root.getObjectByName("left_arm") ??
      root.getObjectByName("RightArm") ??
      root.getObjectByName("Arm_R");
    const nose =
      root.getObjectByName("Nose") ??
      root.getObjectByName("nose");
    const mouth =
      root.getObjectByName("Mouth") ??
      root.getObjectByName("Jaw") ??
      root.getObjectByName("mouth") ??
      root.getObjectByName("jaw");

    applyShepMotion(t, mood, isSpeaking, { group: root, head, mouth, nose, wavePaw });

    if (getHappyGreetBlend(mood) > 0) {
      root.position.y = THREE.MathUtils.lerp(root.position.y, -0.3 + Math.sin(t * 2) * 0.025, 0.12);
    }

    const morphMesh = mouthMorphRef.current;
    if (morphMesh?.morphTargetDictionary && morphMesh.morphTargetInfluences) {
      const key = MOUTH_MORPH_NAMES.find((n) => n in morphMesh.morphTargetDictionary!);
      if (key) {
        const idx = morphMesh.morphTargetDictionary[key];
        const open =
          isSpeaking || mood === "speaking"
            ? 0.35 + Math.abs(Math.sin(t * 14)) * 0.55
            : 0.05;
        morphMesh.morphTargetInfluences[idx] = THREE.MathUtils.lerp(
          morphMesh.morphTargetInfluences[idx],
          open,
          0.25,
        );
      }
    }

    mixer?.update(clock.getDelta());
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      <primitive object={clone} />
      <group
        position={[0.36, 0.32, 0.18]}
        rotation={[0, 0, -0.12]}
        scale={SHEP_SCENE.staffScale}
      >
        <mesh castShadow position={[0, 0.19, 0]}>
          <cylinderGeometry args={[0.017, 0.022, 0.46, 10]} />
          <meshStandardMaterial color="#9a7420" roughness={0.48} />
        </mesh>
        <mesh castShadow position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.052, 0.013, 8, 16, Math.PI * 1.1]} />
          <meshStandardMaterial color="#c49a2a" roughness={0.4} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
}
