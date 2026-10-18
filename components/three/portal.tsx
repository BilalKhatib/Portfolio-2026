"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";
import type { Anchor } from "./use-dom-anchor";
import { createDashedRingMaterial, createDiscMaterial, createHaloMaterial, createRingMaterial } from "./shaders";
import { mulberry32 } from "./procedural";

const RING_Z = -0.6;
const DISC_Z = -1.4;

/**
 * The portal behind the portrait: a dark backplate disc, the neon ring with
 * dashed orbit rings, a glow halo and sparks. Positioned every frame from
 * DOM anchors so it stays locked behind the head at any viewport size.
 */
export function Portal({
  ring,
  disc,
  bloom,
  animate,
}: {
  ring: React.RefObject<Anchor>;
  disc: React.RefObject<Anchor>;
  bloom: boolean;
  animate: boolean;
}) {
  const ringGroup = useRef<THREE.Group>(null);
  const discMesh = useRef<THREE.Mesh>(null);
  const spin = useRef<THREE.Group>(null);

  const mats = useMemo(
    () => ({
      ring: createRingMaterial(),
      halo: createHaloMaterial("#1aa8ff", 0.385, bloom ? 0.05 : 0.075),
      outerDash: createDashedRingMaterial("#17bffa", 22, 0.42, 0.55),
      innerDash: createDashedRingMaterial("#317aab", 90, 0.18, 0.5),
      disc: createDiscMaterial(),
      sparks: new THREE.PointsMaterial({
        size: 0.035,
        color: new THREE.Color("#7fe6ff").multiplyScalar(2.2),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    }),
    [bloom],
  );

  const sparks = useMemo(() => {
    const rand = mulberry32(7);
    const n = 260;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = 1 + (rand() - 0.5) * 0.35 * Math.pow(rand(), 2);
      arr.set([Math.cos(a) * r, Math.sin(a) * r, (rand() - 0.5) * 0.25], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const intro = sceneState.intro;
    mats.ring.uniforms.uTime.value = animate ? t : 0;
    mats.ring.uniforms.uIntro.value = intro.ring;
    mats.halo.uniforms.uIntro.value = intro.ring;
    mats.disc.uniforms.uIntro.value = intro.scene;
    mats.outerDash.uniforms.uIntro.value = intro.ring;
    mats.innerDash.uniforms.uIntro.value = intro.ring;
    mats.sparks.opacity = 0.9 * intro.ring;
    if (animate) {
      mats.outerDash.uniforms.uTime.value = t * 0.012;
      mats.innerDash.uniforms.uTime.value = -t * 0.008;
      if (spin.current) spin.current.rotation.z -= delta * 0.05;
    }

    const r = ring.current;
    if (ringGroup.current && r.valid) {
      ringGroup.current.position.set(r.x, r.y, RING_Z);
      ringGroup.current.scale.setScalar(r.radius);
      ringGroup.current.visible = true;
    }
    const d = disc.current;
    if (discMesh.current && d.valid) {
      discMesh.current.position.set(d.x, d.y, DISC_Z);
      discMesh.current.scale.setScalar(d.radius);
      discMesh.current.visible = true;
    }
  });

  return (
    <>
      <mesh ref={discMesh} material={mats.disc} visible={false} renderOrder={-1}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <group ref={ringGroup} visible={false}>
        <mesh material={mats.ring}>
          <torusGeometry args={[1, 0.018, 20, 320]} />
        </mesh>
        <mesh material={mats.halo} position-z={-0.02}>
          <planeGeometry args={[2.6, 2.6]} />
        </mesh>
        <group ref={spin}>
          <mesh material={mats.outerDash}>
            <ringGeometry args={[1.18, 1.19, 256]} />
          </mesh>
          <mesh material={mats.innerDash}>
            <ringGeometry args={[0.88, 0.886, 256]} />
          </mesh>
          <points geometry={sparks} material={mats.sparks} />
        </group>
        <pointLight position={[0, 0, 0.6]} color="#2fb8ff" intensity={18} distance={7} decay={1.6} />
      </group>
    </>
  );
}
