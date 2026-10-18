"use client";

import { sections } from "@/content/profile";
import { useActiveSection } from "@/lib/active-section";

/** Vertical section progress, shown once the hero's own rail has scrolled away. */
export function SideRail() {
  const active = useActiveSection();
  const index = sections.findIndex((s) => s.id === active);
  const visible = active !== "hero";
  return (
    <nav
      aria-label="Section progress"
      aria-hidden={!visible}
      className={`fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-500 lg:block ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ol className="relative flex flex-col gap-5">
        <span aria-hidden="true" className="absolute bottom-1 right-[3px] top-1 w-px bg-white/15" />
        <span
          aria-hidden="true"
          className="absolute right-[3px] top-1 w-px bg-cyan shadow-[0_0_8px_#00d1ff] transition-[height] duration-700 ease-out-expo"
          style={{ height: `calc(${(Math.max(index, 0) / (sections.length - 1)) * 100}% - 0.5rem)` }}
        />
        {sections.map((s, i) => {
          const on = s.id === active;
          return (
            <li key={s.id} className="relative flex justify-end">
              <a
                href={`#${s.id}`}
                tabIndex={visible ? undefined : -1}
                aria-current={on ? "true" : undefined}
                className="group flex items-center gap-3"
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.18em] transition-[opacity,color] duration-300 ${
                    on ? "text-cyan opacity-100" : "text-ink/60 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")} {s.label}
                </span>
                <span
                  aria-hidden="true"
                  className={`h-[7px] w-[7px] rounded-full transition-[background-color,box-shadow,transform] duration-300 ${
                    on ? "scale-125 bg-cyan shadow-[0_0_10px_#00d1ff]" : "bg-white/40 group-hover:bg-white"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
