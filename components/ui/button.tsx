import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

const base =
  "group relative inline-flex items-center justify-center gap-3 rounded-md font-sans font-semibold tracking-wide transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out-expo active:translate-y-px";

const variants: Record<Variant, string> = {
  primary:
    "border border-[#4ad6ff]/70 bg-[linear-gradient(180deg,#169bff_0%,#0a6fe6_100%)] text-white shadow-[0_0_24px_rgb(20_159_255/0.45),inset_0_1px_0_rgb(255_255_255/0.25)] hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgb(20_159_255/0.7),inset_0_1px_0_rgb(255_255_255/0.3)]",
  secondary:
    "cyber-glass border-white/25 text-ink hover:-translate-y-0.5 hover:border-cyan/60 hover:shadow-[0_0_24px_rgb(0_209_255/0.2)]",
};

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </a>
  );
}
