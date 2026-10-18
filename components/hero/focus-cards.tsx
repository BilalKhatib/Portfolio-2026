"use client";

import { useMemo, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { profile, type FocusArea } from "@/content/profile";
import { setSlotHover, useViewSlot } from "@/lib/view-slots";
import styles from "./hero.module.css";

function FocusCard({ area, index, threeD }: { area: FocusArea; index: number; threeD: boolean }) {
  const visual = useRef<HTMLDivElement>(null);
  const slot = useMemo(
    () => (threeD ? { id: `card-${area.id}`, kind: "card" as const, ref: visual, index } : null),
    [threeD, area.id, index],
  );
  useViewSlot(slot);
  const setHover = (hover: boolean) => setSlotHover(`card-${area.id}`, hover);

  return (
    <a
      href={area.href}
      aria-label={`${area.title}: ${area.blurb}`}
      data-intro="card"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group relative flex min-h-[200px] flex-col overflow-hidden rounded-[14px] border border-white/[0.13] bg-[linear-gradient(160deg,rgb(22_36_52/0.72),rgb(7_14_22/0.82))] p-[clamp(12px,1.35vw,22px)] shadow-[0_18px_40px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-md transition-[transform,border-color,box-shadow] duration-[220ms] ease-out-expo hover:-translate-y-1.5 hover:border-cyan/45 hover:shadow-[0_24px_50px_rgb(0_0_0/0.5),0_0_30px_rgb(0_209_255/0.16),inset_0_1px_0_rgb(255_255_255/0.08)] focus-visible:-translate-y-1.5 stage:min-h-0"
    >
      <span className="relative z-10 font-mono text-[clamp(11px,0.82vw,14px)] text-ink/80">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div
        ref={visual}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[12%] top-[1%] h-[50%] transition-transform duration-300 ease-out-expo group-hover:-translate-y-1"
      >
        {/* poster from the asset package; fades out once the 3D object is live */}
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG illustration */}
        <img
          src={area.poster}
          alt=""
          data-poster={threeD ? "3d" : "static"}
          className="h-full w-full scale-[1.14] object-contain opacity-90 mix-blend-lighten transition-opacity duration-700"
        />
      </div>

      <div className="relative z-10 mt-auto pt-[52%] stage:pt-0">
        <h3 className="font-mono text-[clamp(12px,0.9vw,15.5px)] font-bold uppercase leading-tight tracking-[0.03em] text-ink">
          {area.title}
        </h3>
        <div className="mt-1.5 flex items-end justify-between gap-2">
          <p className="min-w-0 font-mono text-[clamp(10px,0.68vw,12px)] leading-snug text-muted stage:max-[1199px]:sr-only">
            {area.blurb}
          </p>
          <span
          aria-hidden="true"
          className="flex aspect-square w-[clamp(30px,2.3vw,40px)] shrink-0 items-center justify-center rounded-full border border-white/35 text-ink transition-[background-color,border-color,color,transform] duration-[220ms] group-hover:translate-x-0.5 group-hover:border-cyan group-hover:bg-cyan/10 group-hover:text-cyan"
        >
            <ArrowRight className="h-[45%] w-[45%]" />
          </span>
        </div>
      </div>
    </a>
  );
}

export function FocusCards({ threeD }: { threeD: boolean }) {
  return (
    <nav aria-label="Focus areas" className={styles.cards}>
      {profile.focusAreas.map((area, i) => (
        <FocusCard key={area.id} area={area} index={i} threeD={threeD} />
      ))}
    </nav>
  );
}
