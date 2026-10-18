/**
 * Mutable, non-reactive state shared between the DOM (GSAP timelines, pointer
 * listeners) and the WebGL frame loops. Writing here never re-renders React;
 * the R3F scenes read it every frame and ease toward it.
 */
export const sceneState = {
  /** Pointer in normalized device coords, -1..1 (0,0 = viewport centre). */
  pointer: { x: 0, y: 0 },
  /** 0..1 intro progress values driven by the hero GSAP timeline. */
  intro: {
    scene: 0,
    ring: 0,
    rocks: 0,
    /** one tween target per hero card (GSAP treats bare arrays as target lists) */
    cards: Array.from({ length: 6 }, () => ({ v: 0 })),
  },
  /** 0..1 as the hero scrolls out of view. */
  heroExit: 0,
  /** 0..1 progress through the pinned security section. */
  securityProgress: 0,
};

export type SceneState = typeof sceneState;
