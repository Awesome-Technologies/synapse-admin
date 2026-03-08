import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const summaryPath = path.resolve("coverage/coverage-summary.json");
const outputPath = path.resolve("dist/badges/coverage.svg");

const summary = JSON.parse(await readFile(summaryPath, "utf8"));
const percentage = Number(summary.total.lines.pct ?? 0);
const value = `${percentage.toFixed(2)}%`;

const color =
  percentage >= 90 ? "#4c1" :
  percentage >= 75 ? "#97CA00" :
  percentage >= 60 ? "#dfb317" :
  percentage >= 40 ? "#fe7d37" :
  "#e05d44";

const label = "coverage";
const labelWidth = 62;
const valueWidth = Math.max(52, 10 + value.length * 7);
const totalWidth = labelWidth + valueWidth;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
<title>${label}: ${value}</title>
<linearGradient id="smooth" x2="0" y2="100%">
  <stop offset="0" stop-color="#fff" stop-opacity=".7"/>
  <stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>
  <stop offset=".9" stop-color="#000" stop-opacity=".3"/>
  <stop offset="1" stop-color="#000" stop-opacity=".5"/>
</linearGradient>
<clipPath id="round">
  <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
</clipPath>
<g clip-path="url(#round)">
  <rect width="${labelWidth}" height="20" fill="#555"/>
  <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
  <rect width="${totalWidth}" height="20" fill="url(#smooth)"/>
</g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
  <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
  <text x="${labelWidth / 2}" y="14">${label}</text>
  <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
  <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
</g>
</svg>
`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, svg, "utf8");
