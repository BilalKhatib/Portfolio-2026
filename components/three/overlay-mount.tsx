"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useDeviceProfile } from "@/lib/device";

const OverlayStage = dynamic(() => import("./overlay-stage"), { ssr: false });

/**
 * Loads the 3D overlay canvas only on capable devices, and only once the
 * browser is idle so its shader compilation doesn't stutter the hero intro.
 * Everything else keeps the SVG art from the asset package.
 */
export function OverlayMount() {
  const { ready, tier, reducedMotion } = useDeviceProfile();
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!ready || tier !== "high") return;
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout: 1800 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setIdle(true), 900);
    return () => clearTimeout(id);
  }, [ready, tier]);

  if (!ready || tier !== "high" || !idle) return null;
  return <OverlayStage reducedMotion={reducedMotion} />;
}
