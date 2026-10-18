"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";

const R = 1;

function toVec(lat: number, lng: number, r = R) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

// Illustrative nodes (same as the hero HUD); not real telemetry.
const NODES = [
  { lat: 37.7, lng: -122.4, red: false },
  { lat: 40.7, lng: -74.0, red: false },
  { lat: -23.5, lng: -46.6, red: false },
  { lat: 50.1, lng: 8.7, red: true },
  { lat: 6.5, lng: 3.4, red: false },
  { lat: 25.2, lng: 55.3, red: false },
  { lat: 19.1, lng: 72.9, red: true },
  { lat: 1.35, lng: 103.8, red: false },
  { lat: -33.9, lng: 151.2, red: true },
];
const LINKS: [number, number][] = [
  [0, 3],
  [1, 4],
  [2, 4],
  [3, 6],
  [5, 7],
  [6, 8],
  [1, 3],
];

function arcCurve(a: THREE.Vector3, b: THREE.Vector3) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    const p = a.clone().lerp(b, t).normalize();
    pts.push(p.multiplyScalar(R + Math.sin(Math.PI * t) * a.distanceTo(b) * 0.28));
  }
  return new THREE.CatmullRomCurve3(pts);
}

/** Dotted land globe with illustrative arcs, drawn into the Security section's View. */
export function Globe({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pulses = useRef<THREE.Mesh[]>([]);
  const [land, setLand] = useState<Float32Array | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/land-points.json")
      .then((r) => r.json() as Promise<number[]>)
      .then((flat) => {
        if (cancelled) return;
        const out = new Float32Array((flat.length / 2) * 3);
        for (let i = 0; i < flat.length; i += 2) toVec(flat[i], flat[i + 1], R * 1.002).toArray(out, (i / 2) * 3);
        setLand(out);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const dotMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color("#2aa9ff") } },
        vertexShader: /* glsl */ `
          varying float vFacing;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vec3 n = normalize(normalMatrix * normalize(position));
            vFacing = dot(n, normalize(-mv.xyz));
            gl_Position = projectionMatrix * mv;
            gl_PointSize = 3.0;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying float vFacing;
          void main() {
            if (vFacing < 0.0) discard;
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            gl_FragColor = vec4(uColor * (0.35 + 1.4 * vFacing), 1.0);
            #include <colorspace_fragment>
          }
        `,
        toneMapped: false,
      }),
    [],
  );

  const coreMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#050d17" }), []);

  // classic atmosphere: back faces of a slightly larger sphere, brightest at the limb
  const atmosphereMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color("#1e9bff") } },
        vertexShader: /* glsl */ `
          varying vec3 vN;
          void main() {
            vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying vec3 vN;
          void main() {
            float i = pow(clamp(0.62 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 4.0);
            gl_FragColor = vec4(uColor * i * 1.5, 1.0);
            #include <colorspace_fragment>
          }
        `,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.ZeroFactor,
        blendDstAlpha: THREE.OneFactor,
        toneMapped: false,
      }),
    [],
  );

  const { arcs, nodes, cyan, red } = useMemo(() => {
    const pos = NODES.map((n) => toVec(n.lat, n.lng));
    const arcs = LINKS.map(([a, b]) => ({ curve: arcCurve(pos[a], pos[b]), red: NODES[b].red }));
    return {
      arcs: arcs.map((a) => ({ ...a, geo: new THREE.TubeGeometry(a.curve, 64, 0.0045, 4, false) })),
      nodes: NODES.map((n, i) => ({ pos: pos[i], red: n.red })),
      cyan: new THREE.MeshBasicMaterial({ color: new THREE.Color("#2fd0ff").multiplyScalar(2), toneMapped: false }),
      red: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff2949").multiplyScalar(2), toneMapped: false }),
    };
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    if (animate) g.rotation.y += delta * 0.03;
    g.rotation.x = 0.32 + (sceneState.securityProgress - 0.5) * 0.15;
    // rest orientation faces Europe/Africa; scrolling the section turns it east
    const target = -1.9 + sceneState.securityProgress * Math.PI * 0.9;
    g.userData.offset = THREE.MathUtils.damp(g.userData.offset ?? target, target, 3, delta);
    g.children[0].rotation.y = g.userData.offset;
    pulses.current.forEach((m, i) => {
      if (!m) return;
      const p = animate ? (t * 0.22 + i * 0.37) % 1 : 0.5;
      m.position.copy(arcs[i].curve.getPointAt(p));
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.4]} fov={38} />
      <mesh material={atmosphereMat} scale={1.12}>
        <sphereGeometry args={[R, 64, 64]} />
      </mesh>
      <group ref={group}>
        <group>
          <mesh material={coreMat}>
            <sphereGeometry args={[R * 0.995, 64, 64]} />
          </mesh>
          {land && (
            <points material={dotMat}>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[land, 3]} />
              </bufferGeometry>
            </points>
          )}
          {arcs.map((a, i) => (
            <group key={i}>
              <mesh geometry={a.geo} material={a.red ? red : cyan} />
              <mesh
                ref={(m) => {
                  if (m) pulses.current[i] = m;
                }}
                material={a.red ? red : cyan}
              >
                <sphereGeometry args={[0.014, 10, 10]} />
              </mesh>
            </group>
          ))}
          {nodes.map((n, i) => (
            <mesh key={i} position={n.pos} material={n.red ? red : cyan}>
              <sphereGeometry args={[0.02, 12, 12]} />
            </mesh>
          ))}
        </group>
      </group>
    </>
  );
}
