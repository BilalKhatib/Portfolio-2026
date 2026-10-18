"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** Fades/slides [data-reveal] blocks in as they enter the viewport (outside the hero). */
export function RevealController() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const items = gsap.utils.toArray<HTMLElement>("main [data-reveal]");
      gsap.set(items, { opacity: 0, y: 36 });
      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: "power3.out", clearProps: "transform" }),
      });
      // pinned sections change page height after load; recompute trigger positions
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener("load", refresh, { once: true });
    });
  });
  return null;
}
