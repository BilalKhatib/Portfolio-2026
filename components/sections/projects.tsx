import { ArrowUpRight } from "lucide-react";
import { profile } from "@/content/profile";
import { GitHubIcon } from "@/components/ui/brand-icons";
import { PendingNote, SectionShell } from "./section-shell";

export function Projects() {
  const { projects, contact } = profile;
  const github = contact.socials.find((s) => s.label === "GitHub");
  return (
    <SectionShell
      id="projects"
      index={3}
      eyebrow="Projects"
      title="Featured projects"
      lede={projects.length > 0 ? "Selected work and case studies." : undefined}
    >
      {projects.length > 0 ? (
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p, i) => (
            <li key={p.title} data-reveal className="group cyber-glass relative flex flex-col rounded-2xl p-6 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-cyan/40">
              <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">{p.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-muted">{p.summary}</p>
              {p.stack.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech stack">
                  {p.stack.map((t) => (
                    <li key={t} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-ink/80">
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex gap-4 font-mono text-xs uppercase tracking-[0.14em]">
                {p.links?.caseStudy && (
                  <a href={p.links.caseStudy} className="inline-flex items-center gap-1 text-cyan hover:text-ink">
                    Case study <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
                {p.links?.live && (
                  <a href={p.links.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan hover:text-ink">
                    Live <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
                {p.links?.repo && (
                  <a href={p.links.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan hover:text-ink">
                    Code <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <PendingNote title="Case studies are being written up.">
          <p>
            Each project will document the problem, the approach and the security decisions behind it.
            {github && (
              <>
                {" "}
                Until then, the code lives on{" "}
                <a href={github.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan hover:text-ink">
                  <GitHubIcon className="h-4 w-4" /> GitHub
                </a>
                .
              </>
            )}
          </p>
        </PendingNote>
      )}
    </SectionShell>
  );
}
