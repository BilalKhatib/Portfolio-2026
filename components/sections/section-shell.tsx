import type { ReactNode } from "react";

export function SectionShell({
  id,
  index,
  eyebrow,
  title,
  lede,
  children,
  className = "",
  innerClassName = "",
}: {
  id: string;
  index: number;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative isolate overflow-clip ${className}`}>
      <div className={`mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32 ${innerClassName}`}>
        <header className="max-w-3xl" data-reveal>
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-cyan">
            <span className="text-muted">{String(index).padStart(2, "0")}</span>
            <span aria-hidden="true" className="h-px w-8 bg-cyan/70 shadow-[0_0_8px_#00d1ff]" />
            {eyebrow}
          </p>
          <h2 id={`${id}-title`} className="mt-5 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {title}
          </h2>
          {lede && <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{lede}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

/**
 * Shown wherever real content hasn't been supplied yet, instead of
 * placeholder claims. In development it also says where to add the data.
 */
export function PendingNote({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div data-reveal className="cyber-glass relative mt-12 overflow-hidden rounded-2xl p-6 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan/10 blur-3xl" />
      <p className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" aria-hidden="true" />
        In progress
      </p>
      <p className="mt-4 font-display text-xl font-semibold text-ink sm:text-2xl">{title}</p>
      {children && <div className="mt-2 max-w-2xl text-muted">{children}</div>}
      {process.env.NODE_ENV !== "production" && (
        <p className="mt-5 font-mono text-xs text-muted/70">
          <span className="text-success">$</span> dev note: add entries in <code className="text-ink">content/profile.ts</code>
        </p>
      )}
    </div>
  );
}
