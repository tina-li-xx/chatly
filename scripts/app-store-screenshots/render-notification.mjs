import { icon } from "./icons.mjs";
import { multilineText, rect, textLine, circle, linearGradient, palette, withAlpha } from "./shared.mjs";

export function renderNotificationScreen(screen) {
  const u = screen.width / 393;
  const wallpaperId = `lock-${Math.round(screen.x)}-${Math.round(screen.y)}`;
  const cardShadowId = `lock-card-shadow-${Math.round(screen.x)}-${Math.round(screen.y)}`;
  return [
    `<defs>${linearGradient(wallpaperId, "#17274A", "#0A1222")}<filter id="${cardShadowId}" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="${withAlpha("#020617", 0.26)}" /></filter></defs>`,
    rect({ x: screen.x, y: screen.y, width: screen.width, height: screen.height, rx: screen.radius, fill: `url(#${wallpaperId})` }),
    circle({ cx: screen.x + 68 * u, cy: screen.y + 174 * u, r: 102 * u, fill: withAlpha("#5DA8FF", 0.15), filter: "orb-blur" }),
    circle({ cx: screen.x + 304 * u, cy: screen.y + 292 * u, r: 116 * u, fill: withAlpha("#2DD4BF", 0.12), filter: "orb-blur" }),
    circle({ cx: screen.x + 72 * u, cy: screen.y + screen.height - 22 * u, r: 82 * u, fill: withAlpha("#0EA5A4", 0.08), filter: "orb-blur" }),
    circle({ cx: screen.x + 324 * u, cy: screen.y + screen.height - 36 * u, r: 74 * u, fill: withAlpha("#60A5FA", 0.06), filter: "orb-blur" }),
    rect({ x: screen.x, y: screen.y, width: screen.width, height: screen.height, rx: screen.radius, fill: withAlpha("#020617", 0.12) }),
    icon("lock", { x: screen.x + screen.width / 2 - 8 * u, y: screen.y + 72 * u, size: 16 * u, stroke: withAlpha("#FFFFFF", 0.9), strokeWidth: 1.8 * u }),
    textLine({ x: screen.x + screen.width / 2, y: screen.y + 118 * u, text: "Tuesday, April 15", size: 16 * u, fill: withAlpha("#FFFFFF", 0.84), weight: 600, anchor: "middle" }),
    textLine({ x: screen.x + screen.width / 2, y: screen.y + 198 * u, text: "9:41", size: 70 * u, fill: palette.white, weight: 300, anchor: "middle", letterSpacing: -2 * u }),
    rect({ x: screen.x + 16 * u, y: screen.y + 280 * u, width: screen.width - 32 * u, height: 122 * u, rx: 20 * u, fill: withAlpha("#F8FAFC", 0.9), stroke: withAlpha("#FFFFFF", 0.44), strokeWidth: 1 * u, filter: cardShadowId }),
    rect({ x: screen.x + 30 * u, y: screen.y + 296 * u, width: 22 * u, height: 22 * u, rx: 6.5 * u, fill: palette.blue }),
    icon("chat", { x: screen.x + 32.3 * u, y: screen.y + 298.1 * u, size: 17.4 * u, stroke: palette.white, strokeWidth: 1.7 * u }),
    textLine({ x: screen.x + 62 * u, y: screen.y + 312 * u, text: "CHATTING", size: 10.2 * u, fill: palette.slate500, weight: 700, letterSpacing: 0.68 * u }),
    textLine({ x: screen.x + screen.width - 28 * u, y: screen.y + 312 * u, text: "now", size: 10.2 * u, fill: palette.slate400, weight: 600, anchor: "end" }),
    multilineText({ x: screen.x + 30 * u, y: screen.y + 344 * u, lines: ["New message from James Mitchell"], lineHeight: 18 * u, size: 15.5 * u, fill: palette.slate900, weight: 700 }),
    multilineText({ x: screen.x + 30 * u, y: screen.y + 378 * u, lines: ['"Quick question about', 'your pricing plans"'], lineHeight: 16 * u, size: 13.5 * u, fill: palette.slate600 }),
    circle({ cx: screen.x + 52 * u, cy: screen.y + screen.height - 54 * u, r: 24 * u, fill: withAlpha("#0F172A", 0.38), stroke: withAlpha("#FFFFFF", 0.14), strokeWidth: 1 * u }),
    circle({ cx: screen.x + screen.width - 52 * u, cy: screen.y + screen.height - 54 * u, r: 24 * u, fill: withAlpha("#0F172A", 0.38), stroke: withAlpha("#FFFFFF", 0.14), strokeWidth: 1 * u }),
    icon("flashlight", { x: screen.x + 40.5 * u, y: screen.y + screen.height - 66.5 * u, size: 23 * u, stroke: palette.white, strokeWidth: 1.65 * u }),
    icon("camera", { x: screen.x + screen.width - 63.5 * u, y: screen.y + screen.height - 67 * u, size: 23 * u, stroke: palette.white, strokeWidth: 1.65 * u })
  ].join("");
}
