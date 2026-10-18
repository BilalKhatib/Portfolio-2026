"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type Anchor = { x: number; y: number; radius: number; valid: boolean };

/**
 * Projects a DOM element's box onto the z = `planeZ` world plane of the
 * default (unrotated) camera, so 3D objects can sit exactly behind HTML.
 * Re-measured every frame: cheap, and it follows scroll-driven transforms.
 * `frame` overrides the reference rect (inside a drei <View>, the tracked
 * element rather than the whole canvas).
 */
export function useDomAnchor(
  selector: string,
  planeZ: number,
  root: () => HTMLElement | null,
  frame?: () => DOMRect | null,
) {
  const anchor = useRef<Anchor>({ x: 0, y: 0, radius: 1, valid: false });
  const el = useRef<HTMLElement | null>(null);
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  useFrame(() => {
    if (!el.current || !el.current.isConnected) el.current = root()?.querySelector<HTMLElement>(selector) ?? null;
    const target = el.current;
    if (!target) return;
    const canvas = frame?.() ?? gl.domElement.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    if (canvas.width === 0 || r.width === 0) return;
    const ndcX = ((r.left + r.width / 2 - canvas.left) / canvas.width) * 2 - 1;
    const ndcY = -(((r.top + r.height / 2 - canvas.top) / canvas.height) * 2 - 1);
    const dist = camera.position.z - planeZ;
    const visibleH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visibleW = visibleH * (canvas.width / canvas.height);
    anchor.current.x = (ndcX * visibleW) / 2;
    anchor.current.y = (ndcY * visibleH) / 2;
    anchor.current.radius = (r.width / 2 / canvas.height) * visibleH;
    anchor.current.valid = true;
  }, -1);

  return anchor;
}
