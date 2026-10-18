import { Mail } from "lucide-react";
import { profile, type Social } from "@/content/profile";
import { ButtonLink } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/brand-icons";
import { PendingNote, SectionShell } from "./section-shell";
import { ContactForm } from "./contact-form";

const socialIcon: Record<Social["label"], React.ComponentType<{ className?: string }>> = {
  GitHub: GitHubIcon,
  LinkedIn: LinkedInIcon,
  Email: Mail,
  Website: Mail,
};

export function Contact() {
  const { contact, availability } = profile;
  const hasContact = Boolean(contact.email) || contact.socials.length > 0;
  return (
    <SectionShell
      id="contact"
      index={7}
      eyebrow="Contact"
      title={
        <>
          {contact.heading.replace(/\.$/, "")}
          <span className="text-cyan">.</span>
        </>
      }
      lede={hasContact ? "Have a project, a role or a security question in mind? Get in touch." : undefined}
      className="bg-[radial-gradient(50%_60%_at_85%_40%,rgb(19_48_73/0.45),transparent_70%)]"
    >
      {hasContact ? (
        <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div data-reveal className="space-y-6">
            {availability.show && (
              <p className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-ink/80">
                <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_#22e5af]" aria-hidden="true" />
                {availability.label}
              </p>
            )}
            {contact.email && (
              <ButtonLink href={`mailto:${contact.email}`} className="h-12 px-6 text-sm">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {contact.email}
              </ButtonLink>
            )}
            {contact.socials.length > 0 && (
              <ul className="flex flex-wrap gap-3">
                {contact.socials.map((s) => {
                  const Icon = socialIcon[s.label];
                  return (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="cyber-glass inline-flex h-11 items-center gap-2 rounded-lg px-4 font-mono text-xs uppercase tracking-[0.14em] text-ink/90 transition-colors hover:border-cyan/50 hover:text-cyan"
                      >
                        <Icon className="h-4 w-4" />
                        {s.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {contact.email && <ContactForm email={contact.email} />}
        </div>
      ) : (
        <PendingNote title="Contact details are on the way.">
          <p>An email address and profile links will be added here shortly.</p>
        </PendingNote>
      )}
    </SectionShell>
  );
}
