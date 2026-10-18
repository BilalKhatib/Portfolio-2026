"use client";

import { useMemo, useRef, useState } from "react";
import { Radar, ScanSearch, ShieldCheck, Workflow } from "lucide-react";
import { profile } from "@/content/profile";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useDeviceProfile } from "@/lib/device";
import { sceneState } from "@/lib/scene-state";
import { useViewSlot } from "@/lib/view-slots";

const icons = [Radar, ScanSearch, Workflow, ShieldCheck];
const STAGE = "(min-width: 1024px) and (min-aspect-ratio: 5/4)";

export function Security() {
  const { security } = profile;
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const globe = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const device = useDeviceProfile();
  const threeD = device.tier === "high";

  const slot = useMemo(
    () => (threeD ? { id: "globe", kind: "globe" as const, ref: globe, index: 8 } : null),
    [threeD],
  );
  useViewSlot(slot);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ stage: STAGE, reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { stage, reduce } = ctx.conditions as Record<string, boolean>;
        const update = (p: number) => {
          sceneState.securityProgress = p;
          setActive(Math.min(security.stages.length - 1, Math.floor(p * security.stages.length)));
        };
        if (stage && !reduce) {
          // pinned walkthrough of the four stages on large screens
          ScrollTrigger.create({
            trigger: pin.current,
            start: "top top",
            end: "+=160%",
            pin: true,
            scrub: true,
            onUpdate: (self) => update(self.progress),
          });
        } else {
          ScrollTrigger.create({
            trigger: root.current,
            start: "top 55%",
            end: "bottom 60%",
            onUpdate: (self) => update(self.progress),
          });
        }
      });
    },
    { scope: root },
  );

  return (
    <section id="security" ref={root} aria-labelledby="security-title" className="relative isolate">
      <div
        ref={pin}
        className="relative overflow-clip bg-[radial-gradient(60%_60%_at_75%_50%,rgb(19_48_73/0.45),transparent_70%)] stage:flex stage:h-svh stage:items-center"
      >
        <div className="mx-auto grid w-full max-w-[1320px] items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1fr] lg:px-12 stage:py-0">
          <div>
            <header data-reveal>
              <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-cyan">
                <span className="text-muted">04</span>
                <span aria-hidden="true" className="h-px w-8 bg-cyan/70 shadow-[0_0_8px_#00d1ff]" />
                Cybersecurity
              </p>
              <h2 id="security-title" className="mt-5 font-display text-4xl font-semibold capitalize tracking-tight text-ink sm:text-5xl lg:text-6xl">
                {security.heading}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{security.lede}</p>
            </header>

            <ol className="mt-10 grid gap-3 sm:grid-cols-2">
              {security.stages.map((s, i) => {
                const Icon = icons[i];
                const on = i <= active;
                const current = i === active;
                const red = s.tone === "red";
                return (
                  <li
                    key={s.title}
                    data-reveal
                    aria-current={current ? "step" : undefined}
                    className={`relative overflow-hidden rounded-xl border p-5 transition-[border-color,background-color,box-shadow] duration-500 ${
                      current
                        ? red
                          ? "border-red/60 bg-red/[0.07] shadow-[0_0_30px_rgb(255_41_73/0.18)]"
                          : "border-cyan/60 bg-cyan/[0.06] shadow-[0_0_30px_rgb(0_209_255/0.16)]"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${red ? "text-red" : "text-cyan"} ${on ? "" : "opacity-50"}`} aria-hidden="true" />
                      <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="font-mono text-sm font-bold uppercase tracking-[0.14em] text-ink">{s.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{s.text}</p>
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 bottom-0 h-0.5 origin-left transition-transform duration-700 ${red ? "bg-red" : "bg-cyan"} ${
                        on ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </li>
                );
              })}
            </ol>
          </div>

          <div data-reveal className="relative mx-auto aspect-square w-full max-w-[560px]">
            {/* static fallback; the overlay canvas draws the 3D globe on top when available */}
            <div aria-hidden="true" className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_40%_35%,#0f2a40,#050b12_70%)] shadow-[inset_-12px_-8px_40px_rgb(0_0_0/0.6),0_0_80px_rgb(20_159_255/0.18)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- decorative static SVG */}
              <img
                src="/images/generated/world-dots.svg"
                alt=""
                className="absolute inset-[18%] h-[64%] w-[64%] object-contain opacity-70 [mask-image:radial-gradient(circle,black_55%,transparent_72%)]"
                data-poster={threeD ? "3d" : "static"}
              />
            </div>
            <div aria-hidden="true" className="absolute inset-0 animate-[spin_60s_linear_infinite] rounded-full border border-dashed border-cyan/25" />
            <div ref={globe} aria-hidden="true" className="absolute inset-0" />
            <p className="sr-only">Decorative globe showing illustrative security connections.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
