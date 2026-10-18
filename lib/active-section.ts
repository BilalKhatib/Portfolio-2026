"use client";

import { useSyncExternalStore } from "react";
import { sections, type SectionId } from "@/content/profile";

/** Tracks which page section sits in the middle band of the viewport. */
let active: SectionId = "hero";
const listeners = new Set<() => void>();
let observer: IntersectionObserver | null = null;

function start() {
  const visible = new Map<string, number>();
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
      // first section (in page order) that intersects the middle band wins
      const next = sections.find((s) => (visible.get(s.id) ?? 0) > 0)?.id;
      if (next && next !== active) {
        active = next;
        listeners.forEach((l) => l());
      }
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.01] },
  );
  for (const s of sections) {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!observer) start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = null;
    }
  };
}

export function useActiveSection(): SectionId {
  return useSyncExternalStore(
    subscribe,
    () => active,
    () => "hero" as SectionId,
  );
}
