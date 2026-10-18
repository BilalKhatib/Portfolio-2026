import Image from "next/image";
import { ArrowRight, Download, MapPin } from "lucide-react";
import { profile } from "@/content/profile";
import { ButtonLink } from "@/components/ui/button";
import { SectionShell } from "./section-shell";

export function About() {
  const { about, resumeUrl, name, roles } = profile;
  return (
    <SectionShell id="about" index={2} eyebrow="About" title="About me">
      <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div data-reveal>
          <p className="font-display text-2xl leading-snug text-ink sm:text-3xl">{about.intro}</p>
          {about.paragraphs.length > 0 ? (
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
              {about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="mt-6 max-w-xl leading-relaxed text-muted">
              A fuller introduction is on its way. In the meantime, the focus areas above show what I&apos;m building toward.
            </p>
          )}
          {about.location && (
            <p className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-muted">
              <MapPin className="h-4 w-4 text-cyan" aria-hidden="true" />
              {about.location}
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            {resumeUrl && (
              <ButtonLink href={resumeUrl} className="h-12 px-6 text-sm" download>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download résumé
              </ButtonLink>
            )}
            <ButtonLink href="#contact" variant="secondary" className="h-12 px-6 text-sm">
              Get in touch
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>

        <figure data-reveal className="relative mx-auto w-full max-w-[460px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(80%_70%_at_60%_30%,#123049,#06101a_70%)]">
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgb(47_165_224/0.08)_1px,transparent_1px),linear-gradient(90deg,rgb(47_165_224/0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div aria-hidden="true" className="absolute left-1/2 top-[38%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan/60 shadow-[0_0_40px_rgb(0_209_255/0.35),inset_0_0_40px_rgb(0_209_255/0.15)]" />
            <Image
              src="/images/portrait/bilal-cutout.png"
              alt={`${name.full}, ${roles.line1} ${roles.line2}`}
              fill
              sizes="(min-width: 1024px) 460px, 90vw"
              className="object-cover object-top [mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
            />
          </div>
          {/* HUD corner brackets */}
          {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "left-0 bottom-0 border-b-2 border-l-2", "right-0 bottom-0 border-b-2 border-r-2"].map(
            (c) => (
              <span key={c} aria-hidden="true" className={`absolute h-6 w-6 border-cyan/80 ${c} -m-2`} />
            ),
          )}
          <figcaption className="mt-5 flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-muted">
            <span>{name.full}</span>
            <span className="text-cyan">{"// whoami"}</span>
          </figcaption>
        </figure>
      </div>
    </SectionShell>
  );
}
