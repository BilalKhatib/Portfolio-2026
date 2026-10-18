import { Globe } from "lucide-react";
import hudMap from "@/lib/generated/hud-map.json";
import { profile } from "@/content/profile";
import styles from "./panels.module.css";

type Node = (typeof hudMap.nodes)[number];

const byId = Object.fromEntries(hudMap.nodes.map((n) => [n.id, n])) as Record<string, Node>;

// Decorative links between illustrative nodes (not real traffic data).
const links: [string, string, "cyan" | "red"][] = [
  ["na-west", "eu", "cyan"],
  ["na-east", "af", "cyan"],
  ["sa", "af", "cyan"],
  ["eu", "in", "red"],
  ["me", "as", "cyan"],
  ["in", "au", "red"],
];

function arcPath(a: Node, b: Node) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const lift = Math.hypot(b.x - a.x, b.y - a.y) * 0.32;
  return `M${a.x} ${a.y}Q${mx} ${my - lift} ${b.x} ${b.y}`;
}

const tone = { cyan: "#16cdff", red: "#ff3359" };

export function SecurityHud() {
  const stages = profile.security.stages;
  return (
    <div className={styles.hud}>
      <div className={styles.hudFrame} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

      <div className={styles.hudHeader}>
        <Globe className={`${styles.hudIcon} h-7 w-7 shrink-0 text-blue`} strokeWidth={1.4} aria-hidden="true" />
        <h2 className={styles.hudTitle}>
          Security
          <br />
          Everywhere
        </h2>
        <p className={styles.hudNote}>
          <span>Real threats</span>
          <span>Real solutions</span>
        </p>
      </div>

      <div className={styles.hudBody}>
        <div className={styles.map} style={{ aspectRatio: `${hudMap.width} / ${hudMap.height}` }} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative static SVG, no optimisation needed */}
          <img src="/images/generated/world-dots.svg" alt="" width={hudMap.width} height={hudMap.height} />
          <div className={styles.scan} />
          <svg viewBox={`0 0 ${hudMap.width} ${hudMap.height}`} preserveAspectRatio="none">
            {links.map(([from, to, t]) => (
              <path key={`${from}-${to}`} d={arcPath(byId[from], byId[to])} stroke={tone[t]} className={styles.arc} />
            ))}
            {hudMap.nodes.map((n, i) => (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={0.9}
                  fill={tone[n.tone as "cyan" | "red"]}
                  className={styles.pulse}
                  style={{ animationDelay: `${(i * 0.37) % 2.4}s` }}
                />
                <circle cx={n.x} cy={n.y} r={0.75} fill={tone[n.tone as "cyan" | "red"]} className={styles.node} />
              </g>
            ))}
          </svg>
        </div>
        <ul className={styles.legend}>
          {stages.map((s) => (
            <li key={s.title}>
              <span className={`${styles.dot} ${s.tone === "red" ? styles.dotRed : ""}`} aria-hidden="true" />
              {s.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
