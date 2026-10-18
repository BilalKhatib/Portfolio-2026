"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./panels.module.css";

/**
 * On small screens the hero panels collapse behind a toggle; on the stage
 * layout CSS hides the toggle and always shows the body.
 */
export function PanelDisclosure({
  label,
  icon,
  defaultOpen = false,
  className = "",
  children,
  ...rest
}: {
  label: string;
  icon: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
  [data: `data-${string}`]: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={`${styles.disclosure} ${className}`} data-open={open} {...rest}>
      <button
        type="button"
        className={`${styles.toggle} cyber-glass rounded-[14px]`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {icon}
        {label}
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
      <div id={id} className={styles.body}>
        {children}
      </div>
    </div>
  );
}
