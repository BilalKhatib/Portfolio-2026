import { ArrowRight, Shield } from "lucide-react";
import { profile } from "@/content/profile";
import { ButtonLink } from "@/components/ui/button";
import styles from "./hero.module.css";

export function HeroCopy() {
  const { name, greeting, roles, tagline, stats } = profile;
  return (
    <div className={styles.copy} data-depth="0.12" data-parallax="copy">
      <p className={styles.greeting} data-intro="greeting">
        {greeting}
      </p>
      <h1 className={styles.name} aria-label={name.full}>
        <span className={styles.nameLine} aria-hidden="true">
          <span className={`${styles.nameInner} text-chrome`} data-intro="name">
            {name.first}
          </span>
        </span>
        <span className={styles.nameLine} aria-hidden="true">
          <span className={styles.nameInner} data-intro="name">
            <span className="text-chrome">{name.last}</span>
            <span className={styles.cursor} />
          </span>
        </span>
      </h1>
      <p className={styles.roles}>
        <span className="block text-ink" data-intro="roles">
          {roles.line1}
        </span>
        <span className="text-cyan-gradient block" data-intro="roles">
          {roles.line2}
        </span>
      </p>
      <p className={styles.tagline} data-intro="tagline">
        {tagline}
      </p>
      <div className={styles.ctas}>
        <ButtonLink href="#projects" className={styles.cta} data-intro="cta">
          View Projects
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </ButtonLink>
        <ButtonLink href="#security" variant="secondary" className={styles.cta} data-intro="cta">
          <Shield className="h-[1.15em] w-[1.15em] text-cyan" aria-hidden="true" />
          Explore Security Work
        </ButtonLink>
      </div>
      {stats.length > 0 && (
        <dl className={styles.stats} data-intro="stats">
          {stats.map((s) => (
            <div key={s.label.join(" ")} className="flex items-center gap-3">
              <dt className="sr-only">{s.label.join(" ")}</dt>
              <dd className="font-display text-3xl font-bold text-ink">{s.value}</dd>
              <dd aria-hidden="true" className="font-mono text-xs leading-tight text-muted">
                {s.label[0]}
                <br />
                {s.label[1]}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
