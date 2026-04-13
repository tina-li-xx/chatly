import { circle, group, path, rect, textLine, withAlpha, palette, fonts } from "./shared.mjs";

export function getDeviceMetrics({ x, y, width }) {
  const scale = width / 430;
  const height = width * (932 / 430);
  const bezel = 14 * scale;
  const screen = {
    x: x + bezel,
    y: y + bezel,
    width: width - bezel * 2,
    height: height - bezel * 2,
    radius: 52 * scale
  };
  return {
    scale,
    outer: { x, y, width, height, radius: 58 * scale },
    screen,
    island: {
      width: 126 * scale,
      height: 34 * scale,
      x: x + width / 2 - 63 * scale,
      y: y + 18 * scale,
      radius: 18 * scale
    }
  };
}

export function renderDeviceFrame({ id, metrics, screenContent }) {
  const { outer, screen, island, scale } = metrics;
  return {
    defs: `<clipPath id="${id}-screen">${rect({ x: screen.x, y: screen.y, width: screen.width, height: screen.height, rx: screen.radius, fill: "#fff" })}</clipPath>`,
    markup: [
      rect({ x: outer.x, y: outer.y, width: outer.width, height: outer.height, rx: outer.radius, fill: "#0B1220", filter: "device-shadow" }),
      rect({ x: outer.x + 2 * scale, y: outer.y + 2 * scale, width: outer.width - 4 * scale, height: outer.height - 4 * scale, rx: outer.radius - 2 * scale, fill: "#202838", opacity: 0.72 }),
      group(screenContent, { clipPath: `${id}-screen` }),
      rect({ x: screen.x, y: screen.y, width: screen.width, height: screen.height, rx: screen.radius, fill: "none", stroke: withAlpha("#FFFFFF", 0.12), strokeWidth: 1.6 * scale }),
      rect({ x: island.x, y: island.y, width: island.width, height: island.height, rx: island.radius, fill: "#000000" })
    ].join("")
  };
}

export function renderStatusBar(screen, { light = false, lock = false } = {}) {
  const u = screen.width / 393;
  const color = light ? palette.white : palette.slate900;
  const timeX = screen.x + (lock ? screen.width / 2 : 24 * u);
  const timeAnchor = lock ? "middle" : "start";
  const iconY = screen.y + 22.6 * u;
  const right = screen.x + screen.width - 20.5 * u;
  return [
    textLine({
      x: timeX,
      y: screen.y + 26 * u,
      text: "9:41",
      size: 15 * u,
      fill: color,
      family: fonts.ui,
      weight: 600,
      anchor: timeAnchor
    }),
    rect({ x: right - 63.5 * u, y: iconY + 4.9 * u, width: 2.55 * u, height: 3.5 * u, rx: 1.2 * u, fill: color }),
    rect({ x: right - 59.1 * u, y: iconY + 3 * u, width: 2.55 * u, height: 5.4 * u, rx: 1.2 * u, fill: color }),
    rect({ x: right - 54.7 * u, y: iconY + 0.9 * u, width: 2.55 * u, height: 7.5 * u, rx: 1.2 * u, fill: color }),
    rect({ x: right - 50.3 * u, y: iconY - 1.5 * u, width: 2.55 * u, height: 9.9 * u, rx: 1.2 * u, fill: color }),
    path({ d: `M${right - 41.8 * u} ${iconY + 7.3 * u}Q${right - 34.6 * u} ${iconY - 1.2 * u} ${right - 27.4 * u} ${iconY + 7.3 * u}`, stroke: color, strokeWidth: 1.5 * u }),
    path({ d: `M${right - 39.1 * u} ${iconY + 7.2 * u}Q${right - 34.6 * u} ${iconY + 1.8 * u} ${right - 30.1 * u} ${iconY + 7.2 * u}`, stroke: color, strokeWidth: 1.5 * u }),
    path({ d: `M${right - 36.7 * u} ${iconY + 7.1 * u}Q${right - 34.6 * u} ${iconY + 4.5 * u} ${right - 32.5 * u} ${iconY + 7.1 * u}`, stroke: color, strokeWidth: 1.5 * u }),
    circle({ cx: right - 34.6 * u, cy: iconY + 7.35 * u, r: 1.05 * u, fill: color }),
    rect({ x: right - 23.8 * u, y: iconY - 0.9 * u, width: 19.8 * u, height: 10.1 * u, rx: 3 * u, fill: "none", stroke: color, strokeWidth: 1.35 * u }),
    rect({ x: right - 21.9 * u, y: iconY + 1 * u, width: 14.7 * u, height: 6.3 * u, rx: 1.9 * u, fill: color }),
    rect({ x: right - 3.3 * u, y: iconY + 2.35 * u, width: 2 * u, height: 3.9 * u, rx: 0.95 * u, fill: color })
  ].join("");
}

export function renderHomeIndicator(screen, { light = false } = {}) {
  const u = screen.width / 393;
  return rect({
    x: screen.x + screen.width / 2 - 67 * u,
    y: screen.y + screen.height - 16 * u,
    width: 134 * u,
    height: 5 * u,
    rx: 2.5 * u,
    fill: light ? withAlpha("#FFFFFF", 0.88) : withAlpha("#0F172A", 0.84)
  });
}
