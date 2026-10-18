"use client";

import { useId, type FormEvent } from "react";
import { Send } from "lucide-react";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-ink placeholder:text-muted/60 transition-colors focus:border-cyan/60 focus:outline-none focus-visible:outline-none";

/** No backend: composes a pre-filled email in the visitor's mail client. */
export function ContactForm({ email }: { email: string }) {
  const id = useId();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `Portfolio enquiry from ${data.get("name")}`;
    const body = `${data.get("message")}\n\n— ${data.get("name")} (${data.get("from")})`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return (
    <form data-reveal onSubmit={onSubmit} className="cyber-glass space-y-4 rounded-2xl p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block" htmlFor={`${id}-name`}>
          <span className="mb-2 block font-mono text-xs uppercase tracking-[0.16em] text-muted">Name</span>
          <input id={`${id}-name`} name="name" required autoComplete="name" className={field} />
        </label>
        <label className="block" htmlFor={`${id}-from`}>
          <span className="mb-2 block font-mono text-xs uppercase tracking-[0.16em] text-muted">Email</span>
          <input id={`${id}-from`} name="from" type="email" required autoComplete="email" className={field} />
        </label>
      </div>
      <label className="block" htmlFor={`${id}-message`}>
        <span className="mb-2 block font-mono text-xs uppercase tracking-[0.16em] text-muted">Message</span>
        <textarea id={`${id}-message`} name="message" required rows={5} className={`${field} resize-y`} />
      </label>
      <button
        type="submit"
        className="inline-flex h-12 items-center gap-2 rounded-md border border-[#4ad6ff]/70 bg-[linear-gradient(180deg,#169bff,#0a6fe6)] px-6 text-sm font-semibold text-white shadow-[0_0_24px_rgb(20_159_255/0.45)] transition-transform hover:-translate-y-0.5"
      >
        Send message
        <Send className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
