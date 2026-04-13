export const palette = {
  blue: "#2563EB",
  blueDark: "#1D4ED8",
  blueLight: "#DBEAFE",
  blue50: "#EFF6FF",
  green: "#10B981",
  greenDark: "#047857",
  amber: "#F59E0B",
  amberDark: "#D97706",
  purple: "#8B5CF6",
  purpleDark: "#6D28D9",
  slate900: "#0F172A",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate300: "#CBD5E1",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  slate50: "#F8FAFC",
  white: "#FFFFFF",
  pink50: "#FCE7F3",
  pink700: "#BE185D",
  yellow50: "#FEF3C7",
  yellow700: "#B45309",
  emerald50: "#D1FAE5"
};

export const fonts = {
  headline: "SF Pro Display, SF Pro Text, Helvetica Neue, Arial, sans-serif",
  ui: "SF Pro Text, SF Pro Display, Helvetica Neue, Arial, sans-serif"
};

export function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function rect({ x, y, width, height, rx = 0, fill = "none", stroke, strokeWidth, opacity, filter }) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ""}${strokeWidth ? ` stroke-width="${strokeWidth}"` : ""}${opacity ? ` opacity="${opacity}"` : ""}${filter ? ` filter="url(#${filter})"` : ""} />`;
}

export function circle({ cx, cy, r, fill = "none", stroke, strokeWidth, opacity }) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ""}${strokeWidth ? ` stroke-width="${strokeWidth}"` : ""}${opacity ? ` opacity="${opacity}"` : ""} />`;
}

export function path({ d, fill = "none", stroke, strokeWidth, opacity, linecap = "round", linejoin = "round" }) {
  return `<path d="${d}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ""}${strokeWidth ? ` stroke-width="${strokeWidth}"` : ""}${opacity ? ` opacity="${opacity}"` : ""} stroke-linecap="${linecap}" stroke-linejoin="${linejoin}" />`;
}

export function group(content, options = {}) {
  const transform = options.transform ? ` transform="${options.transform}"` : "";
  const clipPath = options.clipPath ? ` clip-path="url(#${options.clipPath})"` : "";
  const opacity = options.opacity ? ` opacity="${options.opacity}"` : "";
  return `<g${transform}${clipPath}${opacity}>${content}</g>`;
}

export function textLine({
  x,
  y,
  text,
  size,
  fill,
  family = fonts.ui,
  weight = 400,
  anchor = "start",
  opacity,
  letterSpacing,
  filter
}) {
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${opacity ? ` opacity="${opacity}"` : ""}${letterSpacing ? ` letter-spacing="${letterSpacing}"` : ""}${filter ? ` filter="url(#${filter})"` : ""}>${escapeXml(text)}</text>`;
}

export function multilineText(options) {
  const { x, y, lines, lineHeight, size, fill, family, weight, anchor, opacity, letterSpacing, filter } = options;
  const first = lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");
  return `<text x="${x}" y="${y}" font-family="${family || fonts.ui}" font-size="${size}" font-weight="${weight || 400}" fill="${fill}" text-anchor="${anchor || "start"}"${opacity ? ` opacity="${opacity}"` : ""}${letterSpacing ? ` letter-spacing="${letterSpacing}"` : ""}${filter ? ` filter="url(#${filter})"` : ""}>${first}</text>`;
}

export function linearGradient(id, start, end) {
  return `<linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${start}" /><stop offset="100%" stop-color="${end}" /></linearGradient>`;
}

export function withAlpha(hex, alpha) {
  const value = hex.replace("#", "");
  const channel = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return `#${value}${channel}`;
}

export function formatTimeLabel(value) {
  return textLine({
    x: value.x,
    y: value.y,
    text: value.text,
    size: value.size,
    fill: value.fill || palette.slate400,
    family: fonts.ui,
    weight: value.weight || 400,
    anchor: value.anchor || "start"
  });
}
