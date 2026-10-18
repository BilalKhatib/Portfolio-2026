import { profile } from "@/content/profile";
import { PendingNote, SectionShell } from "./section-shell";

export function Experience() {
  const { experience } = profile;
  return (
    <SectionShell id="experience" index={6} eyebrow="Experience" title="Experience">
      {experience.length > 0 ? (
        <ol className="relative mt-14 space-y-10 border-l border-white/10 pl-8">
          {experience.map((item) => (
            <li key={`${item.organization}-${item.period}`} data-reveal className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[37px] top-1.5 h-[9px] w-[9px] rounded-full bg-cyan shadow-[0_0_12px_#00d1ff]"
              />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{item.period}</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                {item.role} <span className="text-cyan">· {item.organization}</span>
              </h3>
              <p className="mt-3 max-w-2xl leading-relaxed text-muted">{item.summary}</p>
            </li>
          ))}
        </ol>
      ) : (
        <PendingNote title="Experience timeline coming soon.">
          <p>Roles, studies and milestones will appear here once they&apos;re written up.</p>
        </PendingNote>
      )}
    </SectionShell>
  );
}
