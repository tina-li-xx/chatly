import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { outputs, screenshots } from "./app-store-screenshots/data.mjs";
import { getDeviceMetrics, renderDeviceFrame } from "./app-store-screenshots/device-frame.mjs";
import { linearGradient, multilineText, palette, rect, circle, withAlpha, fonts } from "./app-store-screenshots/shared.mjs";

const root = process.cwd();
const outRoot = path.join(root, "digital_marketing/app-store/ios");

function headlineSize(output) {
  const base = (72 * output.width) / 1320;
  return Math.round(output.key === "5.5-inch" ? base * 0.9 : base);
}

function buildLayout(output) {
  const width = output.width * output.deviceWidthRatio;
  const x = (output.width - width) / 2;
  const y = output.height - output.bottomInset - width * (932 / 430);
  return { width, x, y };
}

function imageTag(screen, href) {
  return `<image x="${screen.x}" y="${screen.y}" width="${screen.width}" height="${screen.height}" preserveAspectRatio="xMidYMid slice" href="${href}" />`;
}

function marketingSvg(screenshot, output, captureHref) {
  const layout = buildLayout(output);
  const metrics = getDeviceMetrics(layout);
  const frame = renderDeviceFrame({
    id: `${screenshot.slug}-${output.key}`,
    metrics,
    screenContent: imageTag(metrics.screen, captureHref)
  });
  const size = headlineSize(output);
  const lineHeight = Math.round(size * 1.12);
  const headlineY = output.height * (output.key === "6.9-inch" ? 0.15 : 0.112);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${output.width}" height="${output.height}" viewBox="0 0 ${output.width} ${output.height}">
  <defs>
    ${linearGradient(`bg-${screenshot.slug}-${output.key}`, screenshot.bgStart, screenshot.bgEnd)}
    ${frame.defs}
    <filter id="device-shadow" x="-20%" y="-20%" width="160%" height="160%"><feDropShadow dx="0" dy="40" stdDeviation="40" flood-color="${withAlpha("#000000", 0.35)}" /></filter>
    <filter id="headline-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="10" flood-color="${withAlpha("#000000", 0.22)}" /></filter>
    <filter id="orb-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60" /></filter>
  </defs>
  ${rect({ x: 0, y: 0, width: output.width, height: output.height, fill: `url(#bg-${screenshot.slug}-${output.key})` })}
  ${circle({ cx: output.width * 0.18, cy: output.height * 0.82, r: output.width * 0.2, fill: withAlpha("#FFFFFF", 0.08), opacity: 0.8 })}
  ${circle({ cx: output.width * 0.84, cy: output.height * 0.2, r: output.width * 0.16, fill: withAlpha("#FFFFFF", 0.06), opacity: 0.8 })}
  ${multilineText({ x: output.width / 2, y: headlineY, lines: screenshot.headline, lineHeight, size, fill: palette.white, family: fonts.headline, weight: 700, anchor: "middle", filter: "headline-shadow", letterSpacing: -0.8 })}
  ${frame.markup}
</svg>`;
}

async function loadCaptureMap() {
  const entries = await Promise.all(
    screenshots.map(async (screenshot) => {
      const capturePath = path.join(outRoot, `simulator-${screenshot.slug}-capture.png`);
      const buffer = await fs.readFile(capturePath);
      return [screenshot.slug, `data:image/png;base64,${buffer.toString("base64")}`];
    })
  );
  return Object.fromEntries(entries);
}

async function writeVariant(screenshot, output, captureMap) {
  const captureHref = captureMap[screenshot.slug];
  if (!captureHref) {
    throw new Error(`Missing simulator capture for ${screenshot.slug}`);
  }
  const svg = marketingSvg(screenshot, output, captureHref);
  const pngPath = path.join(outRoot, output.key, screenshot.filename);
  const svgPath = path.join(outRoot, "source-svg", screenshot.filename.replace(".png", `-${output.width}x${output.height}.svg`));
  await fs.writeFile(svgPath, svg, "utf8");
  await sharp(Buffer.from(svg)).png().toFile(pngPath);
  return { pngPath, svgPath };
}

async function main() {
  await Promise.all([
    ...outputs.map((output) => fs.mkdir(path.join(outRoot, output.key), { recursive: true })),
    fs.mkdir(path.join(outRoot, "source-svg"), { recursive: true })
  ]);
  const captureMap = await loadCaptureMap();
  for (const screenshot of screenshots) {
    for (const output of outputs) {
      const result = await writeVariant(screenshot, output, captureMap);
      console.log(`generated ${path.relative(root, result.pngPath)}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
