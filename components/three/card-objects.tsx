"use client";

import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";
import { isSlotHovered, type ViewSlot } from "@/lib/view-slots";
import { createCodeTexture, createLabelTexture } from "./procedural";

/* ------------------------------------------------------------------ */
/* shared materials (created lazily, one set per overlay canvas)       */
/* ------------------------------------------------------------------ */

function glow(hex: string, k = 2.4) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false });
}

let shared: ReturnType<typeof createShared> | null = null;
function createShared() {
  const radial = document.createElement("canvas");
  radial.width = radial.height = 128;
  const ctx = radial.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.4, "rgba(255,255,255,0.25)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return {
    dark: new THREE.MeshStandardMaterial({ color: "#121821", metalness: 0.85, roughness: 0.34 }),
    darker: new THREE.MeshStandardMaterial({ color: "#0a0f15", metalness: 0.7, roughness: 0.5 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#9aa7b4", metalness: 1, roughness: 0.26 }),
    chromeDark: new THREE.MeshStandardMaterial({ color: "#3a434e", metalness: 1, roughness: 0.3 }),
    radial: new THREE.CanvasTexture(radial),
  };
}
const useShared = () => (shared ??= createShared());

/* ------------------------------------------------------------------ */
/* building blocks                                                     */
/* ------------------------------------------------------------------ */

/** Isometric base plate with glowing edges, shared by every card object. */
function Platform({ color }: { color: string }) {
  const s = useShared();
  const edge = useMemo(() => glow(color, 2.2), [color]);
  const glowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: s.radial,
        color: new THREE.Color(color).multiplyScalar(0.9),
        transparent: true,
        depthWrite: false,
        // additive light that leaves canvas alpha untouched, so the glow
        // brightens the DOM card beneath instead of veiling it
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.ZeroFactor,
        blendDstAlpha: THREE.OneFactor,
        toneMapped: false,
      }),
    [color, s.radial],
  );
  const w = 2.0;
  const t = 0.014;
  return (
    <group>
      <RoundedBox args={[w, 0.07, w]} radius={0.03} smoothness={2} material={s.darker} position-y={-0.035} />
      {[
        [0, 0.004, w / 2, w, t],
        [0, 0.004, -w / 2, w, t],
        [w / 2, 0.004, 0, t, w],
        [-w / 2, 0.004, 0, t, w],
      ].map(([x, y, z, sx, sz], i) => (
        <mesh key={i} position={[x, y, z]} material={edge}>
          <boxGeometry args={[sx, 0.012, sz]} />
        </mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position-y={0.006} material={glowMat}>
        <planeGeometry args={[1.9, 1.9]} />
      </mesh>
    </group>
  );
}

/** False under reduced motion: objects render in their final pose. */
const AnimateContext = createContext(true);

/** Rotates/lifts its children on hover and plays the intro pop-in. */
function Rig({ slot, baseRotation = 0, children }: { slot: ViewSlot; baseRotation?: number; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const hoverT = useRef(0);
  const born = useRef<number | null>(null);
  const animate = useContext(AnimateContext);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    // the overlay mounts when the browser is idle, possibly after the intro:
    // ease in from first frame as well as following the intro timeline
    born.current ??= state.clock.elapsedTime + slot.index * 0.08;
    const local = animate ? THREE.MathUtils.smoothstep(state.clock.elapsedTime - born.current, 0, 0.9) : 1;
    const intro = Math.min(sceneState.intro.cards[slot.index]?.v ?? 1, local);
    hoverT.current += ((isSlotHovered(slot.id) ? 1 : 0) - hoverT.current) * (1 - Math.exp(-delta * 8));
    const h = hoverT.current;
    const t = state.clock.elapsedTime;
    g.rotation.y = baseRotation + Math.sin(t * 0.45 + slot.index) * 0.08 + h * 0.42;
    g.position.y = (1 - intro) * -0.6 + h * 0.14 + Math.sin(t * 0.9 + slot.index * 1.3) * 0.02;
    g.scale.setScalar(0.001 + intro * (1 + h * 0.05));
  });
  return <group ref={group}>{children}</group>;
}

/* ------------------------------------------------------------------ */
/* the six objects                                                     */
/* ------------------------------------------------------------------ */

function cloudCurve() {
  const p = new THREE.Path();
  p.moveTo(-0.34, -0.2);
  p.lineTo(0.3, -0.2);
  p.absarc(0.3, -0.03, 0.17, -Math.PI / 2, Math.PI * 0.35, false);
  p.absarc(0.02, 0.08, 0.25, Math.PI * 0.12, Math.PI * 0.92, false);
  p.absarc(-0.31, -0.05, 0.15, Math.PI * 0.62, Math.PI * 1.5, false);
  const pts = p.getSpacedPoints(90).map((v) => new THREE.Vector3(v.x, v.y, 0));
  return new THREE.CatmullRomCurve3(pts, true, "centripetal");
}

function SecureCICD({ slot }: { slot: ViewSlot }) {
  const s = useShared();
  const cyan = useMemo(() => glow("#20d4ff", 2.8), []);
  const cloud = useMemo(() => new THREE.TubeGeometry(cloudCurve(), 160, 0.026, 8, true), []);
  const size = 0.5;
  const gap = 0.035;
  const cubes: [number, number, number][] = [];
  for (const x of [-1, 1]) for (const y of [0, 1]) for (const z of [-1, 1]) cubes.push([(x * (size + gap)) / 2, size / 2 + y * (size + gap), (z * (size + gap)) / 2]);
  return (
    <Rig slot={slot} baseRotation={0.42}>
      <Platform color="#08d5ff" />
      <group position-y={0.02}>
        {cubes.map((p, i) => (
          <RoundedBox key={i} args={[size, size, size]} radius={0.035} smoothness={2} position={p} material={s.dark} />
        ))}
        {/* status LEDs on the side faces */}
        {[
          [0.555, 0.26, 0.14, 0.18],
          [0.555, 0.8, -0.22, 0.12],
          [0.555, 0.5, 0.3, 0.07],
        ].map(([x, y, z, w], i) => (
          <mesh key={i} position={[x, y, z]} rotation-y={Math.PI / 2} material={cyan}>
            <planeGeometry args={[w, 0.018]} />
          </mesh>
        ))}
        <mesh geometry={cloud} material={cyan} position={[0, 0.56, 0.555]} scale={1.05} />
      </group>
    </Rig>
  );
}

function keyboardTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#06090d";
  ctx.fillRect(0, 0, 256, 128);
  for (let r = 0; r < 5; r++)
    for (let k = 0; k < 14; k++) {
      ctx.fillStyle = "#121a24";
      ctx.fillRect(8 + k * 17.4, 8 + r * 17, 15, 14);
      ctx.fillStyle = "rgba(30,170,255,0.35)";
      ctx.fillRect(8 + k * 17.4, 21 + r * 17, 15, 1);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function WebApplications({ slot }: { slot: ViewSlot }) {
  const s = useShared();
  const { screen, keys, edge } = useMemo(
    () => ({
      screen: new THREE.MeshBasicMaterial({ map: createCodeTexture(4, "#20c8ff", 17), toneMapped: false }),
      keys: new THREE.MeshStandardMaterial({ map: keyboardTexture(), metalness: 0.3, roughness: 0.6 }),
      edge: glow("#00cdff", 2.2),
    }),
    [],
  );
  return (
    <Rig slot={slot} baseRotation={0.3}>
      <Platform color="#00cdff" />
      <group position={[0, 0.05, 0.1]}>
        <RoundedBox args={[1.6, 0.07, 1.04]} radius={0.03} smoothness={2} material={s.dark} position-y={0.035} />
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.072, 0.02]} material={keys}>
          <planeGeometry args={[1.36, 0.6]} />
        </mesh>
        <mesh position={[0, 0.071, 0.5]} material={edge}>
          <boxGeometry args={[1.56, 0.008, 0.008]} />
        </mesh>
        <group position={[0, 0.07, -0.5]} rotation-x={-0.3}>
          <RoundedBox args={[1.6, 1.02, 0.045]} radius={0.025} smoothness={2} material={s.dark} position-y={0.51} />
          <mesh position={[0, 0.51, 0.024]} material={screen}>
            <planeGeometry args={[1.48, 0.9]} />
          </mesh>
        </group>
      </group>
    </Rig>
  );
}

function shieldShape(scale = 1) {
  const s = new THREE.Shape();
  const k = scale;
  s.moveTo(0, 0.62 * k);
  s.bezierCurveTo(0.2 * k, 0.53 * k, 0.4 * k, 0.5 * k, 0.5 * k, 0.48 * k);
  s.lineTo(0.5 * k, 0.02 * k);
  s.bezierCurveTo(0.5 * k, -0.36 * k, 0.24 * k, -0.58 * k, 0, -0.7 * k);
  s.bezierCurveTo(-0.24 * k, -0.58 * k, -0.5 * k, -0.36 * k, -0.5 * k, 0.02 * k);
  s.lineTo(-0.5 * k, 0.48 * k);
  s.bezierCurveTo(-0.4 * k, 0.5 * k, -0.2 * k, 0.53 * k, 0, 0.62 * k);
  return s;
}

function VulnerabilityAnalysis({ slot }: { slot: ViewSlot }) {
  const s = useShared();
  const { body, rim, outline, emblem, red } = useMemo(() => {
    const bevel = { bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 };
    const body = new THREE.ExtrudeGeometry(shieldShape(1), { depth: 0.16, ...bevel });
    body.center();
    const rim = new THREE.ExtrudeGeometry(shieldShape(1.07), { depth: 0.08, bevelEnabled: false });
    rim.center();
    const emblemCurve = new THREE.CatmullRomCurve3(
      shieldShape(0.32)
        .getSpacedPoints(60)
        .map((v) => new THREE.Vector3(v.x, v.y, 0)),
      true,
    );
    const outlineCurve = new THREE.CatmullRomCurve3(
      shieldShape(1.035)
        .getSpacedPoints(140)
        .map((v) => new THREE.Vector3(v.x, v.y, 0)),
      true,
    );
    return {
      body,
      rim,
      outline: new THREE.TubeGeometry(outlineCurve, 200, 0.022, 6, true),
      emblem: new THREE.TubeGeometry(emblemCurve, 80, 0.018, 6, true),
      red: glow("#ff3659", 2.6),
    };
  }, []);
  const nodes: [number, number][] = [
    [-0.85, 0.35],
    [0.8, 0.4],
    [-0.6, -0.65],
    [0.7, -0.55],
    [0.05, 0.85],
  ];
  return (
    <Rig slot={slot} baseRotation={0.5}>
      <Platform color="#ff3659" />
      <group position-y={0.68} scale={0.86}>
        <mesh geometry={rim} material={red} position-z={-0.06} />
        <mesh geometry={body} material={s.chromeDark} />
        <mesh geometry={outline} material={red} position-z={0.115} />
        <mesh geometry={emblem} material={red} position-z={0.13} />
      </group>
      {/* circuit traces out to nodes on the plate */}
      {nodes.map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x / 2, 0.012, z / 2]} rotation-y={-Math.atan2(z, x)} material={red}>
            <boxGeometry args={[Math.hypot(x, z), 0.008, 0.012]} />
          </mesh>
          <mesh position={[x, 0.05, z]} material={red}>
            <sphereGeometry args={[0.045, 12, 12]} />
          </mesh>
        </group>
      ))}
    </Rig>
  );
}

function gearGeometry(teeth: number, outer: number, inner: number, hole: number, depth: number) {
  const s = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: [number, number][] = [
      [inner, a],
      [outer, a + step * 0.18],
      [outer, a + step * 0.42],
      [inner, a + step * 0.6],
    ];
    pts.forEach(([r, ang], j) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (i === 0 && j === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
  }
  const h = new THREE.Path();
  h.absarc(0, 0, hole, 0, Math.PI * 2, true);
  s.holes.push(h);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 2, curveSegments: 24 });
  g.center();
  return g;
}

function Automation({ slot }: { slot: ViewSlot }) {
  const s = useShared();
  const big = useRef<THREE.Mesh>(null);
  const small = useRef<THREE.Mesh>(null);
  const geos = useMemo(() => ({ big: gearGeometry(12, 0.62, 0.5, 0.2, 0.24), small: gearGeometry(9, 0.4, 0.31, 0.12, 0.2) }), []);
  useFrame((_, delta) => {
    const speed = isSlotHovered(slot.id) ? 1.4 : 0.35;
    if (big.current) big.current.rotation.z += delta * speed;
    if (small.current) small.current.rotation.z -= delta * speed * (12 / 9);
  });
  return (
    <Rig slot={slot} baseRotation={0.2}>
      <Platform color="#4fb6ff" />
      <group rotation-y={0.45}>
        <mesh ref={big} geometry={geos.big} material={s.chrome} position={[-0.3, 0.68, 0]} />
        <mesh ref={small} geometry={geos.small} material={s.chrome} position={[0.62, 0.44, 0.12]} rotation-z={0.2} />
      </group>
    </Rig>
  );
}

function ApiSecurity({ slot }: { slot: ViewSlot }) {
  const s = useShared();
  const { label, blue, red } = useMemo(
    () => ({
      label: new THREE.MeshBasicMaterial({ map: createLabelTexture("API"), toneMapped: false }),
      blue: glow("#00b2ff", 2.4),
      red: glow("#ff3659", 2.4),
    }),
    [],
  );
  const cube = (size: number, pos: [number, number, number], withLabel: boolean, key: string) => (
    <group key={key} position={pos}>
      <RoundedBox args={[size, size, size]} radius={0.05} smoothness={2} material={s.dark} />
      {withLabel && (
        <mesh position-z={size / 2 + 0.002} material={label}>
          <planeGeometry args={[size * 0.82, size * 0.82]} />
        </mesh>
      )}
    </group>
  );
  return (
    <Rig slot={slot} baseRotation={0.45}>
      <Platform color="#00b2ff" />
      {cube(0.64, [-0.3, 0.32, 0.32], true, "a")}
      {cube(0.54, [0.42, 0.27, -0.32], false, "b")}
      {cube(0.54, [0.42, 0.83, -0.32], true, "c")}
      <mesh position={[-0.75, 0.015, 0.75]} material={red}>
        <boxGeometry args={[0.5, 0.01, 0.02]} />
      </mesh>
      <mesh position={[0.65, 0.015, 0.55]} material={blue}>
        <boxGeometry args={[0.02, 0.01, 0.6]} />
      </mesh>
    </Rig>
  );
}

function PortfolioProjects({ slot }: { slot: ViewSlot }) {
  const s = useShared();
  const mats = useMemo(
    () =>
      [11, 12, 13, 14].map(
        (seed) => new THREE.MeshBasicMaterial({ map: createCodeTexture(seed, "#279eff", 15), toneMapped: false, color: new THREE.Color(0.85, 0.85, 0.85) }),
      ),
    [],
  );
  const edge = useMemo(() => glow("#279eff", 2.6), []);
  return (
    <Rig slot={slot} baseRotation={0.15}>
      <Platform color="#279eff" />
      {[-0.42, -0.14, 0.14, 0.42].map((z, i) => (
        <group key={z} position={[-0.25 + i * 0.16, 0.5 + i * 0.03, z]} rotation-y={0.25}>
          <RoundedBox args={[1.2, 0.82, 0.035]} radius={0.02} smoothness={2} material={s.dark} />
          <mesh position-z={0.019} material={mats[i]}>
            <planeGeometry args={[1.1, 0.72]} />
          </mesh>
          {i === 3 && (
            <mesh position={[-0.38, 0.43, 0]} material={edge}>
              <boxGeometry args={[0.36, 0.035, 0.04]} />
            </mesh>
          )}
        </group>
      ))}
    </Rig>
  );
}

const OBJECTS: Record<string, (p: { slot: ViewSlot }) => ReactNode> = {
  "card-cicd": SecureCICD,
  "card-web": WebApplications,
  "card-vuln": VulnerabilityAnalysis,
  "card-automation": Automation,
  "card-api": ApiSecurity,
  "card-portfolio": PortfolioProjects,
};

/** Scene contents for one card <View>: camera, lights and the object. */
export function CardObject({ slot, animate }: { slot: ViewSlot; animate: boolean }) {
  const Obj = OBJECTS[slot.id];
  if (!Obj) return null;
  return (
    <AnimateContext.Provider value={animate}>
      <PerspectiveCamera makeDefault position={[3.1, 2.25, 3.9]} fov={18.5} onUpdate={(c) => c.lookAt(0, 0.5, 0)} />
      <ambientLight intensity={0.35} color="#9cc6ff" />
      <directionalLight position={[2, 4, 3]} intensity={1.1} color="#dbeaff" />
      <pointLight position={[-1.5, 0.6, 1.5]} intensity={6} distance={5} color="#1aa8ff" />
      <pointLight position={[1.6, 0.3, -1.2]} intensity={3} distance={4} color="#ff2949" />
      <Obj slot={slot} />
    </AnimateContext.Provider>
  );
}
