import * as THREE from "three";

/** Deterministic PRNG so the scene composes the same way on every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Faceted rock: a subdivided icosahedron with layered sine-noise
 * displacement and anisotropic squash. Non-indexed, so normals stay flat.
 */
export function createRockGeometry(seed: number, detail = 1) {
  const rand = mulberry32(seed);
  const geo = new THREE.IcosahedronGeometry(1, detail);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const f = [rand() * 3 + 1.5, rand() * 3 + 1.5, rand() * 3 + 1.5];
  const ph = [rand() * 10, rand() * 10, rand() * 10];
  const squash = new THREE.Vector3(0.8 + rand() * 0.5, 0.6 + rand() * 0.4, 0.75 + rand() * 0.45);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      Math.sin(v.x * f[0] + ph[0]) * Math.sin(v.y * f[1] + ph[1]) * Math.sin(v.z * f[2] + ph[2]) * 0.22 +
      Math.sin(v.x * 7.1 + v.y * 5.3 + ph[0]) * 0.05;
    v.multiplyScalar(1 + n).multiply(squash);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Canvas texture with monospace "code" lines (laptop screens, project panels). */
export function createCodeTexture(seed: number, accent = "#20c8ff", lines = 18) {
  const rand = mulberry32(seed);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#03101b";
  ctx.fillRect(0, 0, 512, 320);
  const palette = [accent, "#7ee0ff", "#3dd9a8", "#ffffff", "#9fb4c8"];
  for (let i = 0; i < lines; i++) {
    let x = 24 + Math.floor(rand() * 4) * 18;
    const y = 22 + i * 16;
    const segments = 1 + Math.floor(rand() * 4);
    for (let s = 0; s < segments && x < 480; s++) {
      const w = 20 + rand() * 90;
      ctx.globalAlpha = 0.55 + rand() * 0.45;
      ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
      ctx.fillRect(x, y, w, 6);
      x += w + 10;
    }
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Canvas texture with a single glowing label, drawn with the page's own font. */
export function createLabelTexture(text: string, color = "#18c6ff") {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#061624";
  ctx.fillRect(0, 0, 256, 256);
  const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains-mono").trim() || "monospace";
  ctx.font = `700 92px ${mono}, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  ctx.fillStyle = color;
  ctx.fillText(text, 128, 136);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, 220, 220);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
