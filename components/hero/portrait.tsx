import Image from "next/image";
import { profile } from "@/content/profile";
import styles from "./hero.module.css";

/**
 * Layered portrait: rim-light copies of the matte behind the photo, the
 * graded cutout, a light-wrap overlay, and invisible anchor boxes the WebGL
 * scene uses to place the portal behind the head. Tone only — the photo
 * itself is never reshaped.
 */
export function Portrait() {
  return (
    <div className={styles.visual}>
      <div className={styles.portrait} data-depth="0.35" data-parallax="portrait">
        {/* visible from first paint (it's the LCP element); only its position settles in */}
        <div className={styles.portraitInner} data-intro-settle>
          <div className={`${styles.anchor} ${styles.discAnchor}`} data-anchor="disc" aria-hidden="true">
            <div className={styles.fallbackDisc} />
          </div>
          <div className={`${styles.anchor} ${styles.ringAnchor}`} data-anchor="ring" aria-hidden="true">
            <div className={styles.fallbackRing} />
          </div>
          <p className={styles.motto} aria-hidden="true" data-intro="motto">
            Good
            <br />
            Systems
            <br />
            Safer
            <br />
            People
          </p>

          <div className={`${styles.rim} ${styles.rimRed}`} aria-hidden="true" />
          <div className={`${styles.rim} ${styles.rimBlue}`} aria-hidden="true" />
          <div className={styles.photo}>
            <Image
              src="/images/portrait/bilal-cutout-graded.png"
              alt={`Portrait of ${profile.name.full}`}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 42vw, (min-width: 640px) 70vw, 90vw"
              quality={85}
            />
          </div>
          <div className={`${styles.rim} ${styles.lightWrap}`} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.echo} aria-hidden="true" data-depth="-0.25" data-parallax="echo">
        <div className={styles.echoInner} />
      </div>
    </div>
  );
}
