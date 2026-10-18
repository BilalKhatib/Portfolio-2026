"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { Globe, TerminalSquare } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useDeviceProfile } from "@/lib/device";
import { sceneState } from "@/lib/scene-state";
import { useViewSlot } from "@/lib/view-slots";
import { Portrait } from "./portrait";
import { HeroCopy } from "./hero-copy";
import { PanelDisclosure } from "./panel-disclosure";
import { SecurityHud } from "./security-hud";
import { TerminalPanel } from "./terminal-panel";
import { FocusCards } from "./focus-cards";
import { HeroFooter } from "./hero-footer";
import styles from "./hero.module.css";
import panelStyles from "./panels.module.css";

const HeroBackdrop = dynamic(() => import("@/components/three/hero-backdrop"), { ssr: false });

const STAGE = "(min-width: 1024px) and (min-aspect-ratio: 5/4)";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const device = useDeviceProfile();
  const [webglReady, setWebglReady] = useState(false);
  const webgl = device.ready && device.tier !== "low";
  const threeD = device.tier === "high";

  // rocks drifting in front of the portrait are drawn by the overlay canvas
  const foreground = useMemo(
    () => (threeD ? { id: "hero-foreground", kind: "hero-foreground" as const, ref: root, index: 6 } : null),
    [threeD],
  );
  useViewSlot(foreground);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      document.documentElement.classList.add("intro-started");

      mm.add(
        { stage: STAGE, reduce: "(prefers-reduced-motion: reduce)", fine: "(hover: hover) and (pointer: fine)" },
        (ctx) => {
          const { stage, reduce, fine } = ctx.conditions as Record<string, boolean>;
          // the header lives outside the scoped hero, so query the document directly
          const header = Array.from(document.querySelectorAll<HTMLElement>('[data-intro="header"]'));
          const intro = q("[data-intro]");
          const startTerminal = () => window.dispatchEvent(new Event("bk:terminal-start"));
          if (stage) el.setAttribute("data-stage-intro", "");

          if (reduce) {
            gsap.to([...header, ...intro], { opacity: 1, duration: 0.3 });
            gsap.set(q("[data-intro-settle]"), { clearProps: "transform" });
            gsap.set(sceneState.intro, { scene: 1, ring: 1, rocks: 1 });
            gsap.set(sceneState.intro.cards, { v: 1 });
            startTerminal();
            return;
          }

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          tl.fromTo(header, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.05 }, 0)
            .to(sceneState.intro, { scene: 1, duration: 1.8, ease: "power2.inOut" }, 0)
            .fromTo(
              q("[data-intro-settle]"),
              { y: 28, scale: 1.035 },
              { y: 0, scale: 1, duration: 1.3, ease: "power2.out", clearProps: "transform" },
              0.05,
            )
            .to(sceneState.intro, { ring: 1, duration: 1.4, ease: "power2.out" }, 0.35)
            .to(sceneState.intro, { rocks: 1, duration: 1.6 }, 0.4)
            .fromTo(q('[data-intro="greeting"]'), { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.8 }, 0.15)
            .fromTo(
              q('[data-intro="name"]'),
              { opacity: 1, yPercent: 108 },
              { yPercent: 0, duration: 1.05, stagger: 0.12, ease: "power4.out" },
              0.22,
            )
            .fromTo(
              q('[data-intro="roles"]'),
              { opacity: 0, y: 22 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 },
              0.5,
            )
            .fromTo(q('[data-intro="tagline"]'), { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.65)
            .fromTo(
              q('[data-intro="cta"]'),
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 0.75, stagger: 0.08, clearProps: "transform" },
              0.72,
            )
            .fromTo(q('[data-intro="motto"]'), { opacity: 0 }, { opacity: 1, duration: 1 }, 1.0)
            .fromTo(q('[data-intro="stats"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0.85);

          const panels = q('[data-intro="panel"]');
          const cards = q('[data-intro="card"]');
          if (stage) {
            tl.fromTo(
              panels,
              { opacity: 0, x: 70, z: -140 },
              { opacity: 1, x: 0, z: 0, duration: 1.05, stagger: 0.22, ease: "power3.out" },
              0.6,
            )
              .add(startTerminal, 1.45)
              .fromTo(
                cards,
                { opacity: 0, y: 70 },
                { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, clearProps: "transform" },
                0.8,
              )
              .add(() => {
                sceneState.intro.cards.forEach((c, i) =>
                  gsap.to(c, { v: 1, duration: 1.1, delay: i * 0.08, ease: "power3.out" }),
                );
              }, 0.85)
              .fromTo(q('[data-intro="footer"]'), { opacity: 0 }, { opacity: 1, duration: 1 }, 1.2);
          } else {
            // stacked layout: panels and cards are below the fold, reveal on scroll.
            // Reveal the disclosure wrappers (a collapsed panel body has no box).
            gsap.set(sceneState.intro.cards, { v: 1 });
            gsap.set(panels, { opacity: 1 });
            const reveal = [...q(`.${panelStyles.disclosure}`), ...cards];
            gsap.set(reveal, { opacity: 0, y: 40 });
            ScrollTrigger.batch(reveal, {
              start: "top 92%",
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, clearProps: "transform" }),
            });
            gsap.set(q('[data-intro="footer"]'), { opacity: 1 });
          }

          // Safety net: GSAP's lag smoothing slows timelines on very slow
          // frames; never keep content hidden longer than this (wall clock).
          const deadline = window.setTimeout(() => {
            if (tl.progress() < 1) tl.progress(1);
            sceneState.intro.cards.forEach((c) => gsap.set(c, { v: 1 }));
          }, 4000);

          // subtle cursor parallax: each layer drifts by its data-depth
          let onMove: ((e: PointerEvent) => void) | undefined;
          if (fine) {
            const layers = q("[data-depth]").map((node) => {
              const depth = parseFloat(node.dataset.depth ?? "0");
              return {
                depth,
                x: gsap.quickTo(node, "x", { duration: 1.1, ease: "power3" }),
                y: gsap.quickTo(node, "y", { duration: 1.1, ease: "power3" }),
              };
            });
            onMove = (e: PointerEvent) => {
              const nx = (e.clientX / window.innerWidth) * 2 - 1;
              const ny = (e.clientY / window.innerHeight) * 2 - 1;
              sceneState.pointer.x = nx;
              sceneState.pointer.y = ny;
              for (const l of layers) {
                l.x(nx * l.depth * 22);
                l.y(ny * l.depth * 12);
              }
            };
            window.addEventListener("pointermove", onMove, { passive: true });
          }

          // scroll-out: layers leave at different rates (stage layout only)
          if (stage) {
            const exit = gsap.timeline({
              scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
            });
            exit
              .to(q('[data-parallax="copy"]'), { yPercent: -28, opacity: 0, ease: "none" }, 0)
              .to(q(`.${styles.visual}`), { yPercent: 14, ease: "none" }, 0)
              .to(q(`.${styles.panels}`), { yPercent: -22, opacity: 0, ease: "none" }, 0)
              .to(sceneState, { heroExit: 1, ease: "none" }, 0);
          }

          return () => {
            window.clearTimeout(deadline);
            el.removeAttribute("data-stage-intro");
            if (onMove) window.removeEventListener("pointermove", onMove);
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      id="hero"
      ref={root}
      aria-label="Introduction"
      className={styles.hero}
      data-webgl={webglReady ? "on" : "off"}
    >
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.base}>
          <div className={styles.baseFloor} />
          <div className={styles.particles} />
        </div>
        {webgl && (
          <div className={styles.canvas} data-ready={webglReady}>
            <HeroBackdrop tier={device.tier} reducedMotion={device.reducedMotion} onReady={() => setWebglReady(true)} />
          </div>
        )}
      </div>
      <div className={styles.grid} aria-hidden="true" />

      <Portrait />
      <div className={styles.vignette} aria-hidden="true" />

      <HeroCopy />

      <div className={styles.panels} data-depth="0.55">
        <PanelDisclosure
          label="Security everywhere"
          icon={<Globe className="h-4 w-4 text-blue" aria-hidden="true" />}
          className={panelStyles.hudPanel}
        >
          <div data-intro="panel" className="h-full">
            <SecurityHud />
          </div>
        </PanelDisclosure>
        <PanelDisclosure
          label="~/portfolio — whoami"
          icon={<TerminalSquare className="h-4 w-4 text-success" aria-hidden="true" />}
          defaultOpen
          className={panelStyles.termPanel}
        >
          <div data-intro="panel" className="h-full">
            <TerminalPanel />
          </div>
        </PanelDisclosure>
      </div>

      <FocusCards threeD={threeD} />
      <HeroFooter />
      <div className={styles.grain} aria-hidden="true" />
    </section>
  );
}
