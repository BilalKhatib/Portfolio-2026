"use client";

import { useSyncExternalStore } from "react";

/**
 * Rendering tier for the WebGL layers.
 * - high: full hero scene + overlay canvas (3D card objects, foreground rocks, globe)
 * - mid:  simplified hero scene only (no reflections, fewer particles); SVG card art
 * - low:  no WebGL at all; SVG/CSS fallbacks everywhere
 */
export type Tier = "high" | "mid" | "low";

export type DeviceProfile = {
  ready: boolean;
  tier: Tier;
  reducedMotion: boolean;
  finePointer: boolean;
};

const SERVER_PROFILE: DeviceProfile = { ready: false, tier: "low", reducedMotion: false, finePointer: false };

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function detectTier(): Tier {
  const override = new URLSearchParams(window.location.search).get("quality");
  if (override === "high" || override === "mid" || override === "low") return override;

  if (!hasWebGL()) return "low";
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  if (nav.connection?.saveData || memory <= 2 || cores <= 2) return "low";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 1023px)").matches;
  if (coarse || narrow || memory <= 4 || cores <= 4) return "mid";
  return "high";
}

let profile: DeviceProfile = SERVER_PROFILE;
const listeners = new Set<() => void>();

function compute() {
  profile = {
    ready: true,
    tier: detectTier(),
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    finePointer: window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!profile.ready) compute();
  const queries = ["(prefers-reduced-motion: reduce)", "(hover: hover) and (pointer: fine)"].map((q) =>
    window.matchMedia(q),
  );
  queries.forEach((q) => q.addEventListener("change", compute));
  return () => {
    listeners.delete(listener);
    queries.forEach((q) => q.removeEventListener("change", compute));
  };
}

/** Device capabilities; returns a non-ready "low" profile during SSR/hydration. */
export function useDeviceProfile(): DeviceProfile {
  return useSyncExternalStore(
    subscribe,
    () => profile,
    () => SERVER_PROFILE,
  );
}

/** Lets the WebGL layers downgrade the tier at runtime (e.g. sustained low FPS). */
export function downgradeTier(to: Tier) {
  if (profile.tier === "low" || (profile.tier === "mid" && to === "high")) return;
  profile = { ...profile, tier: to };
  listeners.forEach((l) => l());
}
