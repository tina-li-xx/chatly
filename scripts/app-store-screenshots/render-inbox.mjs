import { circle, multilineText, rect, textLine, palette, withAlpha } from "./shared.mjs";

function conversationRow(screen, row, index) {
  const u = screen.width / 393;
  const top = screen.y + 146 * u + index * 92 * u;
  return [
    index > 0 ? rect({ x: screen.x + 74 * u, y: top - 12 * u, width: screen.width - 92 * u, height: 1.5 * u, rx: 0.75 * u, fill: palette.slate100 }) : "",
    circle({ cx: screen.x + 42 * u, cy: top + 22 * u, r: 22 * u, fill: row.bg }),
    textLine({ x: screen.x + 42 * u, y: top + 29 * u, text: row.initials, size: 15 * u, fill: row.fg, weight: 700, anchor: "middle" }),
    textLine({ x: screen.x + 78 * u, y: top + 16 * u, text: row.name, size: 16 * u, fill: palette.slate900, weight: row.unread ? 700 : 600 }),
    textLine({ x: screen.x + screen.width - 24 * u, y: top + 16 * u, text: row.time, size: 13 * u, fill: palette.slate500, anchor: "end" }),
    textLine({ x: screen.x + 78 * u, y: top + 41 * u, text: row.preview, size: 15 * u, fill: palette.slate700, weight: row.unread ? 600 : 400 }),
    textLine({ x: screen.x + 78 * u, y: top + 64 * u, text: row.meta, size: 13 * u, fill: palette.slate500 }),
    row.unread ? circle({ cx: screen.x + screen.width - 18 * u, cy: top + 38 * u, r: 4.5 * u, fill: palette.blue }) : ""
  ].join("");
}

export function renderInboxScreen(screen, data) {
  const u = screen.width / 393;
  const tabs = [
    { label: "All", selected: true, x: 22 },
    { label: "Open", x: 88 },
    { label: "Mine", x: 169 }
  ];
  return [
    rect({ x: screen.x, y: screen.y, width: screen.width, height: screen.height, rx: screen.radius, fill: palette.white }),
    textLine({ x: screen.x + 24 * u, y: screen.y + 74 * u, text: "Inbox (3)", size: 22 * u, fill: palette.slate900, weight: 700 }),
    circle({ cx: screen.x + 265 * u, cy: screen.y + 67 * u, r: 5 * u, fill: palette.green }),
    textLine({ x: screen.x + 279 * u, y: screen.y + 74 * u, text: "Online", size: 14 * u, fill: palette.slate700, weight: 600 }),
    textLine({ x: screen.x + 337 * u, y: screen.y + 74 * u, text: "▾", size: 15 * u, fill: palette.slate500 }),
    rect({ x: screen.x + 16 * u, y: screen.y + 92 * u, width: screen.width - 32 * u, height: 1.5 * u, rx: 0.75 * u, fill: palette.slate200 }),
    ...tabs.map((tab) => [
      tab.selected ? rect({ x: screen.x + (tab.x - 10) * u, y: screen.y + 104 * u, width: 60 * u, height: 30 * u, rx: 15 * u, fill: palette.blue50 }) : "",
      textLine({ x: screen.x + tab.x * u, y: screen.y + 124 * u, text: tab.label, size: 14 * u, fill: tab.selected ? palette.blueDark : palette.slate500, weight: tab.selected ? 700 : 500 })
    ].join("")),
    rect({ x: screen.x + 16 * u, y: screen.y + 138 * u, width: screen.width - 32 * u, height: screen.height - 184 * u, rx: 26 * u, fill: palette.white }),
    data.map((row, index) => conversationRow(screen, row, index)).join(""),
    rect({ x: screen.x + 16 * u, y: screen.y + 138 * u, width: screen.width - 32 * u, height: screen.height - 184 * u, rx: 26 * u, fill: "none", stroke: withAlpha("#0F172A", 0.08), strokeWidth: 1.2 * u }),
    multilineText({
      x: screen.x + screen.width / 2,
      y: screen.y + screen.height - 78 * u,
      lines: ["Stay on top of high-intent", "conversations from anywhere."],
      lineHeight: 18 * u,
      size: 12.5 * u,
      fill: palette.slate400,
      anchor: "middle"
    })
  ].join("");
}
