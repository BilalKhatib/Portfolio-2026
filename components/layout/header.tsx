"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Menu, X } from "lucide-react";
import { profile, sections } from "@/content/profile";
import { useActiveSection } from "@/lib/active-section";
import { Monogram } from "@/components/ui/monogram";

const navItems = sections.filter((s) => s.nav !== null);

export function Header() {
  const active = useActiveSection();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const button = menuButton.current;
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [open]);

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? "border-b border-white/[0.06] bg-bg/70 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="flex h-16 items-center px-4 sm:px-6 lg:h-[clamp(64px,4.6vw,84px)] lg:px-[4.4vw]">
        <a
          href="#hero"
          data-intro="header"
          className="group -m-1 flex items-center p-1 text-ink transition-colors hover:text-cyan"
          aria-label={`${profile.name.full} — back to top`}
        >
          <Monogram className="h-8 w-8 drop-shadow-[0_0_10px_rgb(0_209_255/0.35)] lg:h-[clamp(30px,2.1vw,40px)] lg:w-[clamp(30px,2.1vw,40px)]" />
        </a>

        <nav aria-label="Primary" className="relative ml-[clamp(28px,4.6vw,88px)] hidden flex-1 lg:block">
          <ul className="flex gap-[clamp(22px,3.6vw,64px)]">
            {navItems.map((s) => {
              const isActive = active === s.id;
              return (
                <li key={s.id} data-intro="header">
                  <a
                    href={`#${s.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative block py-3 font-mono text-[clamp(11px,0.8vw,13.5px)] font-medium uppercase tracking-[0.14em] transition-colors duration-200 ${
                      isActive ? "text-cyan" : "text-ink/80 hover:text-ink"
                    }`}
                  >
                    {s.nav}
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-px left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_10px_#00d1ff] transition-[opacity,transform] duration-300 ${
                        isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-white/10 via-white/10 to-transparent" />
        </nav>

        {profile.availability.show && (
          <a
            href={profile.availability.href}
            data-intro="header"
            className="cyber-glass ml-auto hidden items-center gap-3 rounded-lg px-4 py-2.5 font-mono text-[clamp(10.5px,0.72vw,12.5px)] uppercase tracking-[0.14em] text-ink/90 transition-colors hover:border-cyan/50 hover:text-ink sm:flex lg:ml-6"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success shadow-[0_0_8px_#22e5af]" />
            </span>
            {profile.availability.label}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}

        <button
          ref={menuButton}
          type="button"
          className="cyber-glass ml-3 flex h-10 w-10 items-center justify-center rounded-lg text-ink sm:ml-4 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          data-intro="header"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </header>

      {/* sibling of <header>: its backdrop-filter would otherwise trap position:fixed */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 z-[60] overflow-y-auto bg-bg/95 backdrop-blur-xl lg:hidden"
      >
        <nav aria-label="Mobile" className="flex min-h-full flex-col px-6 pb-10 pt-8">
          <ul className="space-y-1">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  ref={i === 0 ? firstLink : undefined}
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-baseline gap-4 border-b border-white/[0.06] py-4 font-display text-3xl font-semibold transition-colors ${
                    active === s.id ? "text-cyan" : "text-ink hover:text-cyan"
                  }`}
                >
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                  {s.nav ?? s.label}
                </a>
              </li>
            ))}
          </ul>
          {profile.availability.show && (
            <a
              href={profile.availability.href}
              onClick={() => setOpen(false)}
              className="mt-auto flex items-center gap-3 pt-10 font-mono text-xs uppercase tracking-[0.16em] text-ink/80"
            >
              <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_#22e5af]" aria-hidden="true" />
              {profile.availability.label}
            </a>
          )}
        </nav>
      </div>
    </>
  );
}
