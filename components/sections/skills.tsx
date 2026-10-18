import { profile } from "@/content/profile";
import { PendingNote, SectionShell } from "./section-shell";

export function Skills() {
  const { skills } = profile;
  return (
    <SectionShell id="skills" index={5} eyebrow="Skills" title="Tech stack">
      {skills.length > 0 ? (
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {skills.map((group) => (
            <div key={group.title} data-reveal className="cyber-glass rounded-2xl p-6">
              <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cyan">{group.title}</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-ink/90 transition-colors hover:border-cyan/40 hover:text-ink"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <PendingNote title="The full tool list is being put together.">
          <p>Languages, frameworks and security tooling will be listed here.</p>
        </PendingNote>
      )}
    </SectionShell>
  );
}
