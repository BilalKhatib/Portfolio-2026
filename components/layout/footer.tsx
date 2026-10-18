import { ArrowUp } from "lucide-react";
import { profile } from "@/content/profile";
import { Monogram } from "@/components/ui/monogram";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-[1320px] flex-col items-start gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <div className="flex items-center gap-4">
          <Monogram className="h-8 w-8 text-cyan" />
          <p className="font-mono text-xs text-muted">© {profile.name.full}</p>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">{profile.footerMotto.join(" · ")}</p>
        <a
          href="#hero"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-cyan"
        >
          Back to top <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
