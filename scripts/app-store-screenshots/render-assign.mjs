import { icon } from "./icons.mjs";
import { circle, rect, textLine, palette, withAlpha } from "./shared.mjs";

function memberRow(screen, row, y, statusColor) {
  const u = screen.width / 393;
  return [
    rect({ x: screen.x + 18 * u, y: y, width: screen.width - 36 * u, height: 66 * u, rx: 16 * u, fill: palette.white }),
    circle({ cx: screen.x + 46 * u, cy: y + 33 * u, r: 18 * u, fill: palette.slate100 }),
    textLine({ x: screen.x + 46 * u, y: y + 39 * u, text: row.initials, size: 13 * u, fill: palette.slate700, weight: 700, anchor: "middle" }),
    textLine({ x: screen.x + 76 * u, y: y + 28 * u, text: row.name, size: 15 * u, fill: palette.slate900, weight: 600 }),
    textLine({ x: screen.x + 76 * u, y: y + 48 * u, text: row.email, size: 13 * u, fill: palette.slate500 }),
    circle({ cx: screen.x + screen.width - 34 * u, cy: y + 33 * u, r: 5 * u, fill: statusColor })
  ].join("");
}

export function renderAssignScreen(screen, teammates) {
  const u = screen.width / 393;
  const sheetTop = screen.y + 238 * u;
  return [
    rect({ x: screen.x, y: screen.y, width: screen.width, height: screen.height, rx: screen.radius, fill: palette.slate50 }),
    rect({ x: screen.x + 16 * u, y: screen.y + 112 * u, width: screen.width - 32 * u, height: 96 * u, rx: 22 * u, fill: palette.slate100 }),
    rect({ x: screen.x + 16 * u, y: screen.y + 220 * u, width: screen.width - 32 * u, height: 146 * u, rx: 22 * u, fill: palette.slate100 }),
    rect({ x: screen.x, y: screen.y, width: screen.width, height: screen.height, rx: screen.radius, fill: withAlpha("#0F172A", 0.24) }),
    rect({ x: screen.x, y: sheetTop, width: screen.width, height: screen.height - (sheetTop - screen.y), rx: 30 * u, fill: palette.white }),
    rect({ x: screen.x + screen.width / 2 - 18 * u, y: sheetTop + 12 * u, width: 36 * u, height: 4 * u, rx: 2 * u, fill: palette.slate300 }),
    textLine({ x: screen.x + screen.width / 2, y: sheetTop + 44 * u, text: "Assign to", size: 18 * u, fill: palette.slate900, weight: 700, anchor: "middle" }),
    rect({ x: screen.x + 18 * u, y: sheetTop + 58 * u, width: screen.width - 36 * u, height: 46 * u, rx: 14 * u, fill: palette.slate100 }),
    icon("search", { x: screen.x + 30 * u, y: sheetTop + 70 * u, size: 18 * u, stroke: palette.slate400 }),
    textLine({ x: screen.x + 58 * u, y: sheetTop + 88 * u, text: "Search teammates...", size: 14 * u, fill: palette.slate400 }),
    rect({ x: screen.x + 18 * u, y: sheetTop + 118 * u, width: screen.width - 36 * u, height: 52 * u, rx: 16 * u, fill: "#EFF6FF", stroke: palette.blueLight, strokeWidth: 1.2 * u }),
    textLine({ x: screen.x + 34 * u, y: sheetTop + 150 * u, text: "Assign to me", size: 15 * u, fill: palette.blueDark, weight: 700 }),
    icon("chevronRight", { x: screen.x + screen.width - 56 * u, y: sheetTop + 130 * u, size: 20 * u, stroke: palette.blueDark }),
    textLine({ x: screen.x + 18 * u, y: sheetTop + 197 * u, text: "ONLINE", size: 11 * u, fill: palette.slate400, weight: 700, letterSpacing: 0.9 * u }),
    memberRow(screen, teammates.online[0], sheetTop + 208 * u, palette.green),
    memberRow(screen, teammates.online[1], sheetTop + 278 * u, palette.green),
    textLine({ x: screen.x + 18 * u, y: sheetTop + 374 * u, text: "AWAY", size: 11 * u, fill: palette.slate400, weight: 700, letterSpacing: 0.9 * u }),
    memberRow(screen, teammates.away[0], sheetTop + 386 * u, palette.amber)
  ].join("");
}
