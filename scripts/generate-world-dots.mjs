// Generates the dotted world map used by the hero HUD and the land points used
// by the 3D globe. Output is committed, so this only needs re-running if the
// map density or node list changes:  node scripts/generate-world-dots.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import DottedMap from "dotted-map";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const write = (rel, data) => {
  const file = join(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
  console.log("wrote", rel, `${(data.length / 1024).toFixed(1)} KiB`);
};

const region = { lat: { min: -56, max: 76 }, lng: { min: -170, max: 190 } };

// --- HUD map (flat, decorative) -------------------------------------------
const hud = new DottedMap({ height: 52, grid: "diagonal", region, projection: { name: "mercator" } });

// Decorative network nodes. These are illustrative locations for the
// animation only, not real telemetry.
const nodes = [
  { id: "na-west", lat: 37.7, lng: -122.4, tone: "cyan" },
  { id: "na-east", lat: 40.7, lng: -74.0, tone: "cyan" },
  { id: "sa", lat: -23.5, lng: -46.6, tone: "cyan" },
  { id: "eu", lat: 50.1, lng: 8.7, tone: "red" },
  { id: "af", lat: 6.5, lng: 3.4, tone: "cyan" },
  { id: "me", lat: 25.2, lng: 55.3, tone: "cyan" },
  { id: "in", lat: 19.1, lng: 72.9, tone: "red" },
  { id: "as", lat: 1.35, lng: 103.8, tone: "cyan" },
  { id: "au", lat: -33.9, lng: 151.2, tone: "red" },
].map((n) => {
  const pin = hud.getPin({ lat: n.lat, lng: n.lng });
  return { id: n.id, tone: n.tone, x: +pin.x.toFixed(2), y: +pin.y.toFixed(2) };
});

const { width, height } = hud.image;
const dots = hud.getPoints();
// zero-length round-capped segments render as dots: one tiny <path> for all
const d = dots.map(({ x, y }) => `M${+x.toFixed(1)} ${+y.toFixed(1)}h0`).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(2)} ${height.toFixed(2)}"><path stroke="#2aa9ff" stroke-width=".62" stroke-linecap="round" d="${d}"/></svg>`;
write("public/images/generated/world-dots.svg", svg);
write(
  "lib/generated/hud-map.json",
  JSON.stringify({ width: +width.toFixed(2), height: +height.toFixed(2), nodes }, null, 2),
);

// --- Globe land points (lat/lng pairs, flat array) -------------------------
const globe = new DottedMap({ height: 84, grid: "diagonal", projection: { name: "equirectangular" } });
// equirectangular is linear in lat/lng, so recover the inverse from two pins
const a = globe.getPin({ lat: 40, lng: -100 });
const b = globe.getPin({ lat: -20, lng: 100 });
const lngPerX = (100 - -100) / (b.x - a.x);
const latPerY = (-20 - 40) / (b.y - a.y);
const flat = [];
for (const p of globe.getPoints()) {
  flat.push(+(40 + (p.y - a.y) * latPerY).toFixed(2), +(-100 + (p.x - a.x) * lngPerX).toFixed(2));
}
write("public/data/land-points.json", JSON.stringify(flat));
console.log("hud dots", dots.length, "globe points", flat.length / 2);
