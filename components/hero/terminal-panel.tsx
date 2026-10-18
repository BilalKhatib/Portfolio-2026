"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { Monogram } from "@/components/ui/monogram";
import styles from "./panels.module.css";

const { path, command, lines } = profile.terminal;

/**
 * `whoami` terminal. Types the command once the hero intro reaches it
 * (`bk:terminal-start` event) or when scrolled into view on small screens;
 * shows everything immediately under reduced motion.
 */
export function TerminalPanel() {
  const root = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const timers: number[] = [];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timers.push(
        window.setTimeout(() => {
          setTyped(command.length);
          setShown(lines.length);
        }),
      );
      return () => timers.forEach(clearTimeout);
    }

    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      for (let i = 1; i <= command.length; i++) timers.push(window.setTimeout(() => setTyped(i), 90 * i));
      const after = 90 * command.length + 260;
      lines.forEach((_, i) => timers.push(window.setTimeout(() => setShown(i + 1), after + i * 230)));
    };

    window.addEventListener("bk:terminal-start", run);
    const io = new IntersectionObserver(
      ([entry]) => {
        // the stage layout waits for the intro timeline instead
        if (entry.isIntersecting && el.offsetParent && !el.closest("[data-stage-intro]")) run();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      window.removeEventListener("bk:terminal-start", run);
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const done = shown === lines.length;

  return (
    <div ref={root} className={styles.terminal}>
      <div className={styles.termBar}>
        <span className={styles.light} style={{ background: "#ff5d66" }} aria-hidden="true" />
        <span className={styles.light} style={{ background: "#ffd05f" }} aria-hidden="true" />
        <span className={styles.light} style={{ background: "#47d9a9" }} aria-hidden="true" />
        <span className="ml-3">{path}</span>
        <span className="ml-auto hidden h-px w-1/4 bg-white/15 sm:block" aria-hidden="true" />
        <span className="text-white/40" aria-hidden="true">
          ›
        </span>
      </div>
      {/* full text for assistive tech; the animated version is decorative */}
      <p className="sr-only">
        {command}: {lines.join(", ")}
      </p>
      <ul className={styles.termBody} aria-hidden="true">
        <li>
          <span className={styles.prompt}>&gt;</span>
          <span className={styles.cmd}>
            {command.slice(0, typed)}
            {typed < command.length && <span className={styles.block} />}
          </span>
        </li>
        {lines.slice(0, shown).map((line, i) => (
          <li key={line}>
            <span className={styles.prompt}>&gt;</span>
            <span>
              {line}
              {done && i === lines.length - 1 && <span className={styles.block} />}
            </span>
          </li>
        ))}
      </ul>
      <Monogram className={styles.watermark} />
    </div>
  );
}
