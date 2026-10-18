"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import * as THREE from "three";
import { useViewSlots, type ViewSlot } from "@/lib/view-slots";
import { sceneState } from "@/lib/scene-state";
import { CardObject } from "./card-objects";
import { Globe } from "./globe";
import { createRockGeometry } from "./procedural";
import { useDomAnchor } from "./use-dom-anchor";

/**
 * One fixed, transparent, full-viewport canvas drawn *above* the page. Each
 * registered DOM slot (hero cards, hero foreground, globe) gets a scissored
 * drei <View> that tracks the element's box every frame, so real 3D objects
 * sit inside HTML cards without a canvas per card.
 */
export default function OverlayStage({ reducedMotion }: { reducedMotion: boolean }) {
  const slots = useViewSlots();
  useEffect(() => () => document.documentElement.removeAttribute("data-overlay"), []);

  return (
    <Canvas
      style={{ position: "fixed", inset: 0, zIndex: 40, pointerEvents: "none" }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      frameloop={reducedMotion ? "demand" : "always"}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <ClearEachFrame />
      <SharedEnvironment />
      {slots.map((slot) => (
        <View key={slot.id} track={slot.ref as React.RefObject<HTMLElement>} index={slot.index + 1}>
          <SlotScene slot={slot} animate={!reducedMotion} />
        </View>
      ))}
      <ReadyFlag />
    </Canvas>
  );
}

/** Views render scissored without clearing; wipe the whole canvas first. */
function ClearEachFrame() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, true);
  }, 0);
  return null;
}

let envTexture: THREE.Texture | null = null;
/** Neutral studio lighting for the metal card objects, generated once (no HDR download). */
function ensureEnvTexture(gl: THREE.WebGLRenderer) {
  if (envTexture) return;
  const pmrem = new THREE.PMREMGenerator(gl);
  envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
}

function SharedEnvironment() {
  const gl = useThree((s) => s.gl);
  useMemo(() => ensureEnvTexture(gl), [gl]);
  return null;
}

/** Applies the shared studio environment to a View's own scene. */
function ViewEnvironment({ intensity }: { intensity: number }) {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.environment = envTexture;
    scene.environmentIntensity = intensity;
  }, [scene, intensity]);
  return null;
}

function SlotScene({ slot, animate }: { slot: ViewSlot; animate: boolean }) {
  if (slot.kind === "card")
    return (
      <>
        <ViewEnvironment intensity={0.45} />
        <CardObject slot={slot} animate={animate} />
      </>
    );
  if (slot.kind === "hero-foreground")
    return (
      <>
        <ViewEnvironment intensity={0.3} />
        <HeroForeground slot={slot} />
      </>
    );
  return <Globe animate={animate} />;
}

function ReadyFlag() {
  const frames = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    if (frames.current > 4) return;
    if (++frames.current > 4) document.documentElement.setAttribute("data-overlay", "ready");
    else invalidate(); // keep demand-mode canvases ticking until ready
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* rocks that drift in front of the portrait                           */
/* ------------------------------------------------------------------ */

// positions in ring radii from the ring centre; z = distance in front of it
const FOREGROUND = [
  { rel: [-1.22, -0.62, 2.4], scale: 0.05, seed: 61 },
  { rel: [1.4, -0.78, 2.8], scale: 0.04, seed: 67 },
  { rel: [1.25, 1.12, 1.6], scale: 0.022, seed: 71 },
] as const;

function HeroForeground({ slot }: { slot: ViewSlot }) {
  const frame = () => slot.ref.current?.getBoundingClientRect() ?? null;
  const ring = useDomAnchor('[data-anchor="ring"]', 0, () => slot.ref.current, frame);
  const geos = useMemo(() => FOREGROUND.map((r) => createRockGeometry(r.seed, 2)), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a222d", roughness: 0.6, metalness: 0.55, flatShading: true }), []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const a = ring.current;
    if (!a.valid) return;
    const intro = sceneState.intro.rocks;
    FOREGROUND.forEach((r, i) => {
      const m = refs.current[i];
      if (!m) return;
      const depthScale = 10 / (10 - r.rel[2]);
      m.position.set(
        (a.x + r.rel[0] * a.radius) / depthScale + Math.sin(t * 0.3 + i) * 0.05,
        (a.y + r.rel[1] * a.radius) / depthScale + Math.sin(t * 0.7 + i * 2) * 0.05 - (1 - intro) * 1.5,
        r.rel[2],
      );
      m.scale.setScalar(r.scale * a.radius * 2.2 * (0.3 + 0.7 * intro));
      m.rotation.set(t * 0.2 + i, t * 0.3 + i * 2, 0);
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />
      <ambientLight intensity={0.25} color="#9cc6ff" />
      <pointLight position={[-4, -2, 4]} intensity={30} distance={10} color="#ff2949" />
      <pointLight position={[2, 2, 3]} intensity={20} distance={10} color="#1aa8ff" />
      {FOREGROUND.map((r, i) => (
        <mesh
          key={r.seed}
          ref={(m) => {
            refs.current[i] = m;
          }}
          geometry={geos[i]}
          material={mat}
          scale={0}
        />
      ))}
    </>
  );
}
