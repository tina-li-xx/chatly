import { icon } from "./icons.mjs";
import { circle, rect, textLine, palette, withAlpha } from "./shared.mjs";

function settingsRow(screen, y, label, iconName, last = false) {
  const u = screen.width / 393;
  return [
    rect({ x: screen.x + 18 * u, y, width: screen.width - 36 * u, height: 52 * u, rx: 16 * u, fill: palette.white }),
    icon(iconName, { x: screen.x + 30 * u, y: y + 14 * u, size: 20 * u, stroke: palette.slate600 }),
    textLine({ x: screen.x + 62 * u, y: y + 33 * u, text: label, size: 15 * u, fill: palette.slate900, weight: 600 }),
    icon("chevronRight", { x: screen.x + screen.width - 52 * u, y: y + 14 * u, size: 20 * u, stroke: palette.slate400 }),
    last ? "" : rect({ x: screen.x + 62 * u, y: y + 52 * u, width: screen.width - 110 * u, height: 1.2 * u, rx: 0.6 * u, fill: palette.slate100 })
  ].join("");
}

export function renderSettingsScreen(screen) {
  const u = screen.width / 393;
  const switchX = screen.x + screen.width - 92 * u;
  return [
    rect({ x: screen.x, y: screen.y, width: screen.width, height: screen.height, rx: screen.radius, fill: palette.slate50 }),
    textLine({ x: screen.x + 24 * u, y: screen.y + 74 * u, text: "← Settings", size: 19 * u, fill: palette.slate900, weight: 700 }),
    rect({ x: screen.x + 18 * u, y: screen.y + 102 * u, width: screen.width - 36 * u, height: 82 * u, rx: 22 * u, fill: palette.white }),
    circle({ cx: screen.x + 48 * u, cy: screen.y + 143 * u, r: 22 * u, fill: palette.blueLight }),
    textLine({ x: screen.x + 48 * u, y: screen.y + 150 * u, text: "SM", size: 15 * u, fill: palette.blueDark, weight: 700, anchor: "middle" }),
    textLine({ x: screen.x + 82 * u, y: screen.y + 138 * u, text: "Sarah Mitchell", size: 16 * u, fill: palette.slate900, weight: 700 }),
    textLine({ x: screen.x + 82 * u, y: screen.y + 160 * u, text: "sarah@company.com", size: 13 * u, fill: palette.slate500 }),
    icon("chevronRight", { x: screen.x + screen.width - 52 * u, y: screen.y + 130 * u, size: 20 * u, stroke: palette.slate400 }),
    textLine({ x: screen.x + 18 * u, y: screen.y + 212 * u, text: "AVAILABILITY", size: 11 * u, fill: palette.slate400, weight: 700, letterSpacing: 0.9 * u }),
    rect({ x: screen.x + 18 * u, y: screen.y + 224 * u, width: screen.width - 36 * u, height: 88 * u, rx: 22 * u, fill: palette.white }),
    circle({ cx: screen.x + 40 * u, cy: screen.y + 250 * u, r: 5 * u, fill: palette.green }),
    textLine({ x: screen.x + 54 * u, y: screen.y + 256 * u, text: "Online", size: 16 * u, fill: palette.slate900, weight: 700 }),
    textLine({ x: screen.x + 40 * u, y: screen.y + 281 * u, text: "Receiving new chats", size: 13 * u, fill: palette.slate500 }),
    rect({ x: switchX, y: screen.y + 245 * u, width: 52 * u, height: 32 * u, rx: 16 * u, fill: palette.blue }),
    circle({ cx: switchX + 37 * u, cy: screen.y + 261 * u, r: 13 * u, fill: palette.white }),
    textLine({ x: screen.x + 18 * u, y: screen.y + 340 * u, text: "PREFERENCES", size: 11 * u, fill: palette.slate400, weight: 700, letterSpacing: 0.9 * u }),
    settingsRow(screen, screen.y + 352 * u, "Notifications", "bell"),
    settingsRow(screen, screen.y + 404 * u, "Appearance", "moon", true),
    textLine({ x: screen.x + 18 * u, y: screen.y + 492 * u, text: "SUPPORT", size: 11 * u, fill: palette.slate400, weight: 700, letterSpacing: 0.9 * u }),
    settingsRow(screen, screen.y + 504 * u, "Help & Feedback", "chat", true),
    rect({ x: screen.x + 18 * u, y: screen.y + 578 * u, width: screen.width - 36 * u, height: 1.2 * u, rx: 0.6 * u, fill: withAlpha("#0F172A", 0.06) })
  ].join("");
}
