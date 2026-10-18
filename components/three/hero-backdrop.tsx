"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { downgradeTier, type Tier } from "@/lib/device";
import { sceneState } from "@/lib/scene-state";
import { Portal } from "./portal";
import { useDomAnchor, type Anchor } from "./use-dom-anchor";
import { createMoonMaterial, createParticleMaterial } from "./shaders";
import { createRockGeometry, mulberry32 } from "./procedural";

type Props = { tier: Tier; reducedMotion: boolean; onReady: () => void };

const FLOOR_Y = -2.35;
const RED = new THREE.Color("#ff2949");
const heroRoot = () => document.getElementById("hero");

/** Full hero backdrop: lives behind the DOM portrait, renders only while visible. */
export default function HeroBackdrop({ tier, reducedMotion, onReady }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [degraded, setDegraded] = useState(false);
  const [dpr, setDpr] = useState(tier === "high" ? 1.5 : 1);
  const rich = tier === "high" && !degraded;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={dpr}
        frameloop={!visible ? "never" : reducedMotion ? "demand" : "always"}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 60 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))}
          onFallback={() => {
            setDegraded(true);
            downgradeTier("mid");
          }}
        />
        <color attach="background" args={["#040a10"]} />
        <fog attach="fog" args={["#040a10", 13, 32]} />
        <Scene rich={rich} animate={!reducedMotion} />
        {rich && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={1.15} luminanceThreshold={1} luminanceSmoothing={0.2} radius={0.75} />
            <Vignette offset={0.32} darkness={0.62} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        )}
        <ReadySignal onReady={onReady} />
        {reducedMotion && <LayoutInvalidator />}
      </Canvas>
    </div>
  );
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    if (done.current) return;
    if (++frames.current >= 3) {
      done.current = true;
      onReady();
    } else invalidate();
  });
  return null;
}

/** In demand mode, re-render when layout can have moved the DOM anchors. */
function LayoutInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const ro = new ResizeObserver(() => invalidate());
    const hero = heroRoot();
    if (hero) ro.observe(hero);
    document.fonts?.ready.then(() => invalidate());
    const timers = [300, 1200, 3000].map((ms) => window.setTimeout(() => invalidate(), ms));
    return () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [invalidate]);
  return null;
}

function Scene({ rich, animate }: { rich: boolean; animate: boolean }) {
  const ring = useDomAnchor('[data-anchor="ring"]', -0.6, heroRoot);
  const disc = useDomAnchor('[data-anchor="disc"]', -1.4, heroRoot);

  return (
    <>
      <CameraRig animate={animate} />
      <ambientLight intensity={0.18} color="#9fc8ff" />
      <directionalLight position={[4, 6, 3]} intensity={0.5} color="#6aa8ff" />
      <pointLight position={[-5.2, -1.6, 1.2]} intensity={26} distance={9} decay={1.8} color={RED} />
      <pointLight position={[5.2, 0.6, -1.2]} intensity={14} distance={8} decay={1.8} color={RED} />

      <Moon />
      <BackStructures />
      <Portal ring={ring} disc={disc} bloom={rich} animate={animate} />
      <Rocks ring={ring} animate={animate} />
      <NeonStrips />
      <Particles count={rich ? 900 : 380} animate={animate} />
      <Floor rich={rich} />
    </>
  );
}

/** Very small pointer parallax (≤ ~3°) and a slow drift up as the hero scrolls out. */
function CameraRig({ animate }: { animate: boolean }) {
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, delta) => {
    if (!animate) return;
    const { pointer, heroExit } = sceneState;
    const k = 1 - Math.exp(-delta * 2.5);
    const cam = state.camera;
    cam.position.x += (pointer.x * 0.45 - cam.position.x) * k;
    cam.position.y += (-pointer.y * 0.25 + heroExit * 1.2 - cam.position.y) * k;
    look.set(cam.position.x * 0.35, cam.position.y * 0.5 - heroExit * 0.6, 0);
    cam.lookAt(look);
  });
  return null;
}

function Moon() {
  const mat = useMemo(() => createMoonMaterial(), []);
  useFrame(() => {
    mat.uniforms.uIntro.value = sceneState.intro.scene;
  });
  return (
    <mesh material={mat} position={[3.3, 3.7, -6.5]} rotation={[0.3, -0.6, 0]}>
      <sphereGeometry args={[2.5, 64, 64]} />
    </mesh>
  );
}

/** Dark server-rack silhouettes far behind, with a few blue status LEDs. */
function BackStructures() {
  const { boxes, leds } = useMemo(() => {
    const rand = mulberry32(11);
    const boxes: { p: [number, number, number]; s: [number, number, number] }[] = [];
    const leds: [number, number, number][] = [];
    for (let i = 0; i < 16; i++) {
      const x = -13 + i * 1.75 + (rand() - 0.5) * 0.6;
      if (Math.abs(x) < 2.2) continue;
      const h = 4 + rand() * 7;
      const z = -11 - rand() * 4;
      boxes.push({ p: [x, FLOOR_Y + h / 2, z], s: [0.9 + rand() * 0.6, h, 0.8] });
      for (let k = 0; k < 3; k++) if (rand() > 0.45) leds.push([x + (rand() - 0.5) * 0.5, FLOOR_Y + rand() * h, z + 0.42]);
    }
    return { boxes, leds };
  }, []);
  return (
    <group>
      {boxes.map((b, i) => (
        <mesh key={i} position={b.p}>
          <boxGeometry args={b.s} />
          <meshStandardMaterial color="#070c12" roughness={0.8} metalness={0.4} />
        </mesh>
      ))}
      {leds.map((p, i) => (
        <mesh key={`l${i}`} position={p}>
          <planeGeometry args={[0.18, 0.025]} />
          <meshBasicMaterial color={i % 5 === 0 ? new THREE.Color(RED).multiplyScalar(3) : new THREE.Color("#2aa8ff").multiplyScalar(3)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

type RockSpec = {
  /** position relative to the ring centre, in ring radii (null = absolute) */
  rel?: [number, number, number];
  abs?: [number, number, number];
  scale: number;
  seed: number;
  spin: number;
};

const ROCKS: RockSpec[] = [
  // floating fragments around the portrait (concept: beside the cheek and the ring)
  { rel: [-1.42, -0.32, 0.9], scale: 0.2, seed: 3, spin: 0.25 },
  { rel: [1.24, -0.28, 0.4], scale: 0.17, seed: 5, spin: -0.3 },
  { rel: [-1.05, 1.15, -0.6], scale: 0.08, seed: 8, spin: 0.5 },
  { rel: [1.55, 0.95, -1.2], scale: 0.1, seed: 13, spin: -0.4 },
  { rel: [0.35, -1.45, 0.6], scale: 0.07, seed: 17, spin: 0.6 },
  // the dark cliff on the left edge and the boulder bottom-right
  { abs: [-6.0, -0.9, -2.2], scale: 1.6, seed: 21, spin: 0 },
  { abs: [-5.9, 1.9, -3.6], scale: 1.3, seed: 23, spin: 0 },
  { abs: [-4.9, -2.1, -0.4], scale: 0.85, seed: 29, spin: 0 },
  { abs: [5.9, -2.15, -0.8], scale: 1.05, seed: 31, spin: 0 },
  { abs: [4.6, -2.3, 0.6], scale: 0.45, seed: 37, spin: 0 },
  { abs: [-3.4, -2.25, 1.2], scale: 0.35, seed: 41, spin: 0 },
];

function Rocks({ ring, animate }: { ring: React.RefObject<Anchor>; animate: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const geos = useMemo(() => ROCKS.map((r) => createRockGeometry(r.seed, 2)), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#0c1016", roughness: 0.82, metalness: 0.35, flatShading: true }),
    [],
  );

  useFrame((state) => {
    const t = animate ? state.clock.elapsedTime : 0;
    const a = ring.current;
    const intro = sceneState.intro.rocks;
    ROCKS.forEach((spec, i) => {
      const m = refs.current[i];
      if (!m) return;
      if (spec.rel) {
        if (!a.valid) return;
        const bob = Math.sin(t * 0.6 + spec.seed) * 0.06;
        m.position.set(
          a.x + spec.rel[0] * a.radius,
          a.y + spec.rel[1] * a.radius + bob - (1 - intro) * 1.2,
          spec.rel[2],
        );
        m.scale.setScalar(spec.scale * a.radius * 2.2 * (0.4 + 0.6 * intro));
        m.rotation.set(t * spec.spin * 0.6 + spec.seed, t * spec.spin + spec.seed * 2, 0);
      } else if (spec.abs) {
        m.position.set(spec.abs[0], spec.abs[1] - (1 - sceneState.intro.scene) * 0.6, spec.abs[2]);
      }
    });
  });

  return (
    <group>
      {ROCKS.map((spec, i) => (
        <mesh
          key={spec.seed}
          ref={(m) => {
            refs.current[i] = m;
          }}
          geometry={geos[i]}
          material={mat}
          scale={spec.abs ? spec.scale : 0}
          rotation={spec.abs ? [spec.seed, spec.seed * 1.7, 0] : undefined}
        />
      ))}
    </group>
  );
}

/** Red neon light bars from the concept (right column + floating dashes + floor lines). */
function NeonStrips() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: RED.clone().multiplyScalar(4.5), toneMapped: false }), []);
  const dim = useMemo(() => new THREE.MeshBasicMaterial({ color: RED.clone().multiplyScalar(2.2), toneMapped: false }), []);
  return (
    <group>
      <mesh material={mat} position={[5.15, 2.6, -3.5]}>
        <boxGeometry args={[0.035, 5.5, 0.035]} />
      </mesh>
      <mesh material={dim} position={[6.2, 1.6, -5]}>
        <boxGeometry args={[0.025, 4.5, 0.025]} />
      </mesh>
      {(
        [
          [-2.6, 2.3, -2.5, 0.22],
          [3.05, 0.42, -1.2, 0.3],
          [-4.6, 0.6, -3, 0.18],
          [4.2, -0.4, -2.2, 0.26],
          [6.4, 0.2, -2.8, 0.34],
        ] as const
      ).map(([x, y, z, w], i) => (
        <mesh key={i} material={i % 2 ? dim : mat} position={[x, y, z]}>
          <boxGeometry args={[w, 0.022, 0.022]} />
        </mesh>
      ))}
      <mesh material={mat} position={[-5.4, FLOOR_Y + 0.02, 0.4]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[1.8, 0.02, 0.03]} />
      </mesh>
      <mesh material={dim} position={[-4.3, FLOOR_Y + 0.02, 1.0]} rotation={[0, -0.25, 0]}>
        <boxGeometry args={[0.9, 0.02, 0.03]} />
      </mesh>
    </group>
  );
}

function Particles({ count, animate }: { count: number; animate: boolean }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const mat = useMemo(() => createParticleMaterial(dpr), [dpr]);
  const geo = useMemo(() => {
    const rand = mulberry32(99);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const palette = [new THREE.Color("#7fe6ff"), new THREE.Color("#149fff"), new THREE.Color("#ff2949")];
    for (let i = 0; i < count; i++) {
      pos.set([(rand() - 0.5) * 18, (rand() - 0.45) * 10, -8 + rand() * 10], i * 3);
      const c = palette[rand() < 0.68 ? 0 : rand() < 0.75 ? 1 : 2];
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = 0.6 + Math.pow(rand(), 3) * 3.2;
      phase[i] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    return g;
  }, [count]);

  useFrame((state) => {
    mat.uniforms.uTime.value = animate ? state.clock.elapsedTime : 0;
    mat.uniforms.uIntro.value = sceneState.intro.scene;
  });

  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

function Floor({ rich }: { rich: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, -4]}>
      <planeGeometry args={[60, 30]} />
      {rich ? (
        <MeshReflectorMaterial
          resolution={512}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={2.4}
          mixContrast={1}
          roughness={0.85}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#05080c"
          metalness={0.6}
          mirror={0.55}
        />
      ) : (
        <meshStandardMaterial color="#05090e" roughness={0.45} metalness={0.7} />
      )}
    </mesh>
  );
}
