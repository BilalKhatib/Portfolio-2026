import type { SVGProps } from "react";

/**
 * BK monogram, drawn in the stroke style of the package's bk-monogram.svg
 * (whose paths actually spell "KK").
 */
export const MONOGRAM_PATH =
  "M20 20V108M20 20H46L58 32V50L46 62H20M46 62L60 74V96L48 108H20M76 20V108M76 66L108 20M88 49L112 108";

export function Monogram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 128 128" fill="none" aria-hidden="true" {...props}>
      <path d={MONOGRAM_PATH} stroke="currentColor" strokeWidth="9" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}
