"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ShepMood } from "@/components/shep-avatar";
import {
  applyShepMotion,
  getHappyGreetBlend,
} from "@/lib/shep-motion";
import { SHEP_DESIGN as D } from "@/lib/shep-design";

type ShepProceduralModelProps = {
  mood: ShepMood;
  isSpeaking: boolean;
};

function createHeartCurve(): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(a), 3);
    const y =
      13 * Math.cos(a) -
      5 * Math.cos(2 * a) -
      2 * Math.cos(3 * a) -
      Math.cos(4 * a);
    pts.push(new THREE.Vector3(x * 0.002, (y + 6) * 0.002, 0));
  }
  return new THREE.CatmullRomCurve3(pts, true);
}

const sharedHeartCurve = createHeartCurve();

function GlassCapsule({
  color,
  power,
  intensityRef,
}: {
  color: string;
  power: number;
  intensityRef: MutableRefObject<number>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      color: { value: new THREE.Color("#ffffff") },
      power: { value: 2.5 },
      intensity: { value: 0.6 },
    }),
    [],
  );

  useFrame(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.color.value.set(color);
    materialRef.current.uniforms.power.value = power;
    materialRef.current.uniforms.intensity.value = intensityRef.current;
  });

  return (
    <mesh>
      <sphereGeometry args={[0.30, 64, 64, 0, Math.PI * 2, 0, Math.PI]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          uniform float power;
          uniform float intensity;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
            fresnel = pow(fresnel, power);
            gl_FragColor = vec4(color, fresnel * intensity);
          }
        `}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

const earBaseMat = new THREE.MeshStandardMaterial({ color: "#f0f0f0", roughness: 0.5 });
const earRingMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3 });
const earCenterMat = new THREE.MeshStandardMaterial({ color: "#cccccc", roughness: 0.8 });
const antennaBaseMat = new THREE.MeshStandardMaterial({
  color: "#999999",
  roughness: 0.4,
  metalness: 0.5,
});
const antennaStickMat = new THREE.MeshStandardMaterial({
  color: D.staffWood,
  roughness: 0.4,
  metalness: 0.2,
});
const antennaTipMat = new THREE.MeshStandardMaterial({
  color: D.antennaTip,
  roughness: 0.2,
  toneMapped: false,
  emissive: D.antennaTip,
  emissiveIntensity: 0.35,
});

function RobotEar({
  position,
  scale = 1,
  isLeft = false,
  tipRef,
}: {
  position: [number, number, number];
  scale?: number;
  isLeft?: boolean;
  tipRef?: RefObject<THREE.Group | null>;
}) {
  const dir = isLeft ? -1 : 1;

  return (
    <group position={position} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={earBaseMat}>
        <cylinderGeometry args={[0.04, 0.04, 0.025, 32]} />
      </mesh>
      <mesh
        position={[dir * 0.012, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
        material={earRingMat}
      >
        <torusGeometry args={[0.032, 0.008, 16, 32]} />
      </mesh>
      <mesh
        position={[dir * 0.012, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
        material={earCenterMat}
      >
        <cylinderGeometry args={[0.03, 0.03, 0.005, 32]} />
      </mesh>
      <group ref={tipRef} position={[dir * 0.015, 0.035, 0]} rotation={[-0.4, 0, 0]}>
        <mesh position={[0, 0.01, 0]} castShadow receiveShadow material={antennaBaseMat}>
          <cylinderGeometry args={[0.006, 0.008, 0.02, 16]} />
        </mesh>
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow material={antennaStickMat}>
          <cylinderGeometry args={[0.003, 0.003, 0.1, 8]} />
        </mesh>
        <mesh position={[0, 0.11, 0]} castShadow receiveShadow material={antennaTipMat}>
          <sphereGeometry args={[0.006, 16, 16]} />
        </mesh>
      </group>
    </group>
  );
}

const eyeMat = new THREE.MeshBasicMaterial({
  color: new THREE.Color(2, 2, 2),
  toneMapped: false,
  transparent: true,
});
const heartMat = new THREE.MeshBasicMaterial({ color: D.antennaTip, toneMapped: false });

function RobotEye({
  position,
  rotation,
  scale = 1,
  blinkDuration = 0.15,
  blinkCycle = 3.0,
  showHeart,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  blinkDuration?: number;
  blinkCycle?: number;
  showHeart: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const normalEyesRef = useRef<THREE.Group>(null);
  const heartEyeRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !normalEyesRef.current || !heartEyeRef.current) return;

    normalEyesRef.current.visible = !showHeart;
    heartEyeRef.current.visible = showHeart;

    const cycle = clock.getElapsedTime() % blinkCycle;
    let targetScaleY = 1;

    if (cycle < blinkDuration && !showHeart) {
      const progress = cycle / blinkDuration;
      const blinkClose = Math.sin(progress * Math.PI);
      targetScaleY = Math.max(0.05, 1.0 - blinkClose);
    }

    groupRef.current.scale.set(scale, scale * targetScaleY, scale);
  });

  const { topPath, bottomPath } = useMemo(() => {
    const w = 0.025;
    const h = 0.035;
    const r = 0.02;
    const g = 0.005;

    const tPath = new THREE.CurvePath<THREE.Vector3>();
    tPath.add(new THREE.LineCurve3(new THREE.Vector3(-w, g, 0), new THREE.Vector3(-w, h - r, 0)));
    tPath.add(
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-w, h - r, 0),
        new THREE.Vector3(-w, h, 0),
        new THREE.Vector3(-w + r, h, 0),
      ),
    );
    tPath.add(new THREE.LineCurve3(new THREE.Vector3(-w + r, h, 0), new THREE.Vector3(w - r, h, 0)));
    tPath.add(
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(w - r, h, 0),
        new THREE.Vector3(w, h, 0),
        new THREE.Vector3(w, h - r, 0),
      ),
    );
    tPath.add(new THREE.LineCurve3(new THREE.Vector3(w, h - r, 0), new THREE.Vector3(w, g, 0)));

    const bPath = new THREE.CurvePath<THREE.Vector3>();
    bPath.add(new THREE.LineCurve3(new THREE.Vector3(-w, -g, 0), new THREE.Vector3(-w, -(h - r), 0)));
    bPath.add(
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-w, -(h - r), 0),
        new THREE.Vector3(-w, -h, 0),
        new THREE.Vector3(-w + r, -h, 0),
      ),
    );
    bPath.add(new THREE.LineCurve3(new THREE.Vector3(-w + r, -h, 0), new THREE.Vector3(w - r, -h, 0)));
    bPath.add(
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(w - r, -h, 0),
        new THREE.Vector3(w, -h, 0),
        new THREE.Vector3(w, -(h - r), 0),
      ),
    );
    bPath.add(new THREE.LineCurve3(new THREE.Vector3(w, -(h - r), 0), new THREE.Vector3(w, -g, 0)));

    return { topPath: tPath, bottomPath: bPath };
  }, []);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={heartEyeRef} visible={false} material={heartMat}>
        <tubeGeometry args={[sharedHeartCurve, 64, 0.0035, 8, true]} />
      </mesh>
      <group ref={normalEyesRef}>
        <mesh material={eyeMat}>
          <tubeGeometry args={[topPath, 20, 0.0035, 8, false]} />
        </mesh>
        <mesh material={eyeMat}>
          <tubeGeometry args={[bottomPath, 20, 0.0035, 8, false]} />
        </mesh>
      </group>
    </group>
  );
}

function generatePbrTexturesAsync(): Promise<{
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const size = 512;
      const canvasC = document.createElement("canvas");
      const canvasB = document.createElement("canvas");
      canvasC.width = canvasB.width = size;
      canvasC.height = canvasB.height = size;
      const ctxC = canvasC.getContext("2d");
      const ctxB = canvasB.getContext("2d");

      if (ctxC && ctxB) {
        ctxC.fillStyle = "#dcdcdc";
        ctxC.fillRect(0, 0, size, size);
        ctxB.fillStyle = "#808080";
        ctxB.fillRect(0, 0, size, size);

        for (let i = 0; i < 10000; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const r = 0.5 + Math.random() * 1.5;
          const isDark = Math.random() > 0.15;

          ctxC.beginPath();
          ctxC.arc(x, y, r, 0, Math.PI * 2);
          ctxC.fillStyle = isDark ? "#222222" : "#dddddd";
          ctxC.fill();

          ctxB.beginPath();
          ctxB.arc(x, y, r, 0, Math.PI * 2);
          ctxB.fillStyle = isDark ? "#000000" : "#ffffff";
          ctxB.fill();
        }
      }

      const texC = new THREE.CanvasTexture(canvasC);
      const texB = new THREE.CanvasTexture(canvasB);
      texC.wrapS = texB.wrapS = THREE.RepeatWrapping;
      texC.wrapT = texB.wrapT = THREE.RepeatWrapping;
      texC.repeat.set(6, 3);
      texB.repeat.set(6, 3);
      texC.needsUpdate = true;
      texB.needsUpdate = true;

      resolve({ colorMap: texC, bumpMap: texB });
    }, 0);
  });
}

const NECK_PARAMS = {
  baseR: 0.215,
  baseH: -0.05,
  midR: 0.28,
  midH: 0.02,
  lipBottomR: 0.295,
  lipBottomH: 0.045,
  lipTopR: 0.27,
  lipTopH: 0.055,
  innerR: 0.1,
  innerDropH: 0,
};

const BODY_PARAMS = {
  bodyBevelR: 0.235,
  bodyBevelY: 0.34,
  bodyBevelT: 0.025,
};

export function ShepProceduralModel({ mood, isSpeaking }: ShepProceduralModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const earLRef = useRef<THREE.Group>(null);
  const earRRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const mouthMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const visorIntensityRef = useRef(1.2);

  const [textures, setTextures] = useState<{
    colorMap: THREE.CanvasTexture | null;
    bumpMap: THREE.CanvasTexture | null;
  }>({ colorMap: null, bumpMap: null });

  const showHeart = mood === "happy";
  const speaking = isSpeaking || mood === "speaking";

  useEffect(() => {
    let mounted = true;
    let generatedMaps: { colorMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null =
      null;

    generatePbrTexturesAsync().then((res) => {
      if (mounted) {
        generatedMaps = res;
        setTextures(res);
      } else {
        res.colorMap.dispose();
        res.bumpMap.dispose();
      }
    });

    return () => {
      mounted = false;
      if (generatedMaps) {
        generatedMaps.colorMap.dispose();
        generatedMaps.bumpMap.dispose();
      }
    };
  }, []);

  const neckProfile = useMemo(() => {
    const p = NECK_PARAMS;
    return [
      new THREE.Vector2(p.innerR, p.baseH),
      new THREE.Vector2(p.baseR, p.baseH),
      new THREE.Vector2(p.midR, p.midH),
      new THREE.Vector2(p.lipBottomR, p.lipBottomH),
      new THREE.Vector2(p.lipTopR, p.lipTopH),
      new THREE.Vector2(p.innerR, p.lipTopH),
      new THREE.Vector2(p.innerR, p.lipTopH - p.innerDropH),
    ];
  }, []);

  const headMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: D.headDome,
        roughness: 1.0,
        metalness: 0.0,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    applyShepMotion(t, mood, isSpeaking, {
      group: groupRef.current,
      body: bodyRef.current,
      head: headRef.current,
      mouth: mouthRef.current,
      earL: earLRef.current,
      earR: earRRef.current,
    });

    // Visor glow pulses while speaking; soft idle otherwise
    const base = speaking ? 1.55 + Math.abs(Math.sin(t * 14)) * 0.55 : 1.15;
    const thinkingBoost = mood === "thinking" ? 0.25 + Math.sin(t * 2.2) * 0.1 : 0;
    const listenBoost = mood === "listening" ? 0.15 : 0;
    visorIntensityRef.current = base + thinkingBoost + listenBoost;

    if (mouthMatRef.current) {
      mouthMatRef.current.emissiveIntensity = speaking
        ? 0.85 + Math.abs(Math.sin(t * 14)) * 0.55
        : mood === "happy"
          ? 0.45
          : 0.25;
    }

    if (antennaTipMat) {
      antennaTipMat.emissiveIntensity =
        mood === "thinking" ? 0.7 + Math.sin(t * 3) * 0.25 : 0.35;
    }

    const happy = getHappyGreetBlend(mood);
    if (groupRef.current && happy > 0) {
      groupRef.current.position.y = Math.sin(t * 2) * 0.025;
    } else if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.08);
    }
  });

  if (!textures.colorMap) return null;

  const chassisMatProps = {
    color: D.chassis,
    map: textures.colorMap,
    bumpMap: textures.bumpMap ?? undefined,
    bumpScale: 0.005,
    roughness: 0.85,
    metalness: 0.35,
    envMapIntensity: 0.6,
  };

  return (
    <group ref={groupRef} position={[0, -0.35, 0]}>
      <group ref={bodyRef}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.43, 64, 64, 0, Math.PI * 2, Math.PI * 0.15, Math.PI * 0.85]} />
          <meshStandardMaterial {...chassisMatProps} />
        </mesh>

        {BODY_PARAMS.bodyBevelT > 0 && (
          <mesh
            position={[0, BODY_PARAMS.bodyBevelY, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
            receiveShadow
          >
            <torusGeometry args={[BODY_PARAMS.bodyBevelR, BODY_PARAMS.bodyBevelT, 32, 64]} />
            <meshStandardMaterial {...chassisMatProps} />
          </mesh>
        )}

        <mesh position={[0, 0.38, 0]} receiveShadow castShadow>
          <latheGeometry args={[neckProfile, 64]} />
          <meshStandardMaterial {...chassisMatProps} />
        </mesh>
      </group>

      <group ref={headRef} position={[0, 0.6, 0]}>
        <mesh material={headMat} castShadow receiveShadow>
          <sphereGeometry args={[0.28, 64, 64, 0, Math.PI * 2, 0, Math.PI]} />
        </mesh>

        <GlassCapsule color={D.visor} power={3.8} intensityRef={visorIntensityRef} />

        <group position={[0, -0.02, 0.29]}>
          <RobotEye
            position={[-0.07, 0, 0]}
            rotation={[0, -0.2, 0]}
            scale={1.1}
            blinkDuration={0.45}
            blinkCycle={3.0}
            showHeart={showHeart}
          />
          <RobotEye
            position={[0.07, 0, 0]}
            rotation={[0, 0.2, 0]}
            scale={1.1}
            blinkDuration={0.45}
            blinkCycle={3.0}
            showHeart={showHeart}
          />
        </group>

        {/* LED mouth — scale.y driven by applyShepMotion while speaking */}
        <mesh ref={mouthRef} position={[0, -0.09, 0.265]} castShadow>
          <boxGeometry args={[0.08, 0.028, 0.012]} />
          <meshStandardMaterial
            ref={mouthMatRef}
            color={D.visor}
            emissive={D.visor}
            emissiveIntensity={0.25}
            roughness={0.35}
            metalness={0.1}
            toneMapped={false}
          />
        </mesh>

        <RobotEar position={[-0.29, 0, 0]} isLeft tipRef={earLRef} scale={1.3} />
        <RobotEar position={[0.29, 0, 0]} tipRef={earRRef} scale={1.3} />
      </group>
    </group>
  );
}

/** @deprecated use ShepProceduralModel */
export const Shep3DModel = ShepProceduralModel;
