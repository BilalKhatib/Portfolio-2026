"use client";

import { profile, sections } from "@/content/profile";
import { useActiveSection } from "@/lib/active-section";
import styles from "./hero.module.css";

const railSections = sections.filter((s) => s.id !== "experience");

export function HeroFooter() {
  const active = useActiveSection();
  const activeIndex = Math.max(
    0,
    railSections.findIndex((s) => s.id === active),
  );

  return (
    <div className={styles.heroFooter} data-intro="footer">
      <a
        href="#about"
        className="group absolute left-[calc(var(--s)*3.9)] top-[calc(var(--s)*1.15)] flex items-center gap-[calc(var(--s)*1.1)]"
      >
        <span className="relative flex h-[calc(var(--s)*2.1)] w-[calc(var(--s)*1.35)] justify-center rounded-full border border-white/45 pt-[calc(var(--s)*0.35)]">
          <span className="h-[calc(var(--s)*0.45)] w-[2px] animate-bounce rounded-full bg-cyan" />
          <span className="absolute -bottom-[calc(var(--s)*0.9)] h-[2px] w-full bg-cyan shadow-[0_0_8px_#00d1ff]" />
        </span>
        <span className="font-mono text-[max(10px,calc(var(--s)*0.7))] uppercase tracking-[0.26em] text-ink/70 transition-colors group-hover:text-ink">
          Scroll to explore
        </span>
      </a>

      <nav
        aria-label="Section progress"
        className="absolute left-[calc(var(--s)*28.6)] right-[calc(var(--s)*28)] top-[calc(var(--s)*1.55)]"
      >
        <span aria-hidden="true" className="absolute left-0 right-0 top-0 h-px bg-white/20" />
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-px bg-cyan shadow-[0_0_8px_#00d1ff] transition-[width] duration-700 ease-out-expo"
          style={{ width: `${(activeIndex / (railSections.length - 1)) * 100}%` }}
        />
        <ol className="relative flex justify-between">
          {railSections.map((s, i) => {
            const isActive = i === activeIndex;
            return (
              <li key={s.id} className="relative">
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`group flex flex-col items-start pt-[calc(var(--s)*0.9)] font-mono text-[max(9.5px,calc(var(--s)*0.64))] uppercase tracking-[0.14em] transition-colors ${
                    isActive ? "text-cyan" : "text-ink/55 hover:text-ink"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute -top-[3px] left-0 h-[7px] w-[7px] rounded-full transition-[background-color,box-shadow,transform] ${
                      isActive ? "scale-125 bg-cyan shadow-[0_0_10px_#00d1ff]" : "bg-white/50 group-hover:bg-white"
                    }`}
                  />
                  {String(i + 1).padStart(2, "0")} {s.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <p
        aria-hidden="true"
        className="absolute right-[calc(var(--s)*3.4)] top-[calc(var(--s)*0.2)] font-mono text-[max(9.5px,calc(var(--s)*0.7))] uppercase leading-[1.3] tracking-[0.14em] text-ink/70"
      >
        {profile.footerMotto.map((w, i) => (
          <span key={w} className="relative block">
            {i === 0 && (
              <span className="absolute -left-[calc(var(--s)*1.6)] top-1/2 h-[2px] w-[calc(var(--s)*1.1)] bg-cyan shadow-[0_0_6px_#00d1ff]" />
            )}
            {w}
          </span>
        ))}
      </p>
    </div>
  );
}
