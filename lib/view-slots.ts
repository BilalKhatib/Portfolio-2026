"use client";

import { useEffect, useSyncExternalStore, type RefObject } from "react";

/**
 * Registry of DOM elements that the fixed overlay canvas draws 3D content
 * into (via drei <View track>). DOM components stay free of three.js; they
 * only register a ref, plus a hover flag the 3D objects can read.
 */
export type ViewSlot = {
  id: string;
  kind: "card" | "hero-foreground" | "globe";
  ref: RefObject<HTMLElement | null>;
  index: number;
};

let slots: ViewSlot[] = [];
const hovered = new Set<string>();

/** Pointer/focus state for a slot, read every frame by its 3D object. */
export function setSlotHover(id: string, hover: boolean) {
  if (hover) hovered.add(id);
  else hovered.delete(id);
}
export const isSlotHovered = (id: string) => hovered.has(id);
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useViewSlot(slot: ViewSlot | null) {
  useEffect(() => {
    if (!slot) return;
    slots = [...slots.filter((s) => s.id !== slot.id), slot];
    emit();
    return () => {
      slots = slots.filter((s) => s.id !== slot.id);
      emit();
    };
  }, [slot]);
}

export function useViewSlots(): ViewSlot[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => slots,
    () => slots,
  );
}
