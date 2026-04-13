import { icon } from "./icons.mjs";
import { circle, multilineText, rect, textLine, palette } from "./shared.mjs";

function bubble(screen, options) {
  const u = screen.width / 393;
  const width = options.width * u;
  return [
    rect({
      x: screen.x + options.x * u,
      y: screen.y + options.y * u,
      width,
      height: options.height * u,
      rx: 16 * u,
      fill: options.fill
    }),
    rect({
      x: screen.x + options.x * u,
      y: screen.y + options.y * u + options.tailY * u,
      width: options.tailW * u,
      height: options.tailH * u,
      rx: 4 * u,
      fill: options.fill
    }),
    multilineText({
      x: screen.x + (options.x + 16) * u,
      y: screen.y + (options.y + 26) * u,
      lines: options.lines,
      lineHeight: 20 * u,
      size: 15 * u,
      fill: options.textFill,
      weight: 500
    })
  ].join("");
}

export function renderChatScreen(screen) {
  const u = screen.width / 393;
  return [
    rect({ x: screen.x, y: screen.y, width: screen.width, height: screen.height, rx: screen.radius, fill: palette.slate50 }),
    icon("back", { x: screen.x + 18 * u, y: screen.y + 54 * u, size: 22 * u, stroke: palette.slate700 }),
    textLine({ x: screen.x + 60 * u, y: screen.y + 70 * u, text: "James Mitchell", size: 18 * u, fill: palette.slate900, weight: 700 }),
    textLine({ x: screen.x + 60 * u, y: screen.y + 92 * u, text: "/pricing · London", size: 13 * u, fill: palette.slate500 }),
    icon("info", { x: screen.x + screen.width - 42 * u, y: screen.y + 52 * u, size: 22 * u, stroke: palette.slate600 }),
    rect({ x: screen.x + 16 * u, y: screen.y + 106 * u, width: screen.width - 32 * u, height: 1.5 * u, rx: 0.75 * u, fill: palette.slate200 }),
    bubble(screen, { x: 20, y: 132, width: 168, height: 66, tailY: 46, tailW: 24, tailH: 18, fill: palette.slate100, textFill: palette.slate900, lines: ["Quick question", "about pricing"] }),
    textLine({ x: screen.x + 244 * u, y: screen.y + 211 * u, text: "10:42a", size: 12 * u, fill: palette.slate400 }),
    bubble(screen, { x: 150, y: 242, width: 188, height: 104, tailY: 74, tailW: 24, tailH: 18, fill: palette.blue, textFill: palette.white, lines: ["Hey! Happy to", "help. What", "would you like", "to know?"] }),
    textLine({ x: screen.x + 158 * u, y: screen.y + 362 * u, text: "10:42a  ✓✓", size: 12 * u, fill: "#BFDBFE", weight: 600 }),
    bubble(screen, { x: 20, y: 396, width: 188, height: 88, tailY: 58, tailW: 24, tailH: 18, fill: palette.slate100, textFill: palette.slate900, lines: ["Do you have", "monthly billing", "or just annual?"] }),
    textLine({ x: screen.x + 244 * u, y: screen.y + 499 * u, text: "10:43a", size: 12 * u, fill: palette.slate400 }),
    rect({ x: screen.x + 20 * u, y: screen.y + 542 * u, width: 96 * u, height: 44 * u, rx: 18 * u, fill: palette.slate100 }),
    circle({ cx: screen.x + 48 * u, cy: screen.y + 565 * u, r: 4 * u, fill: palette.slate400 }),
    circle({ cx: screen.x + 64 * u, cy: screen.y + 565 * u, r: 4 * u, fill: palette.slate400 }),
    circle({ cx: screen.x + 80 * u, cy: screen.y + 565 * u, r: 4 * u, fill: palette.slate400 }),
    textLine({ x: screen.x + 130 * u, y: screen.y + 569 * u, text: "typing...", size: 12 * u, fill: palette.slate400, weight: 500 }),
    rect({ x: screen.x + 16 * u, y: screen.y + screen.height - 88 * u, width: screen.width - 32 * u, height: 58 * u, rx: 20 * u, fill: palette.white, stroke: palette.slate200, strokeWidth: 1.2 * u }),
    icon("paperclip", { x: screen.x + 28 * u, y: screen.y + screen.height - 74 * u, size: 20 * u, stroke: palette.slate500 }),
    textLine({ x: screen.x + 64 * u, y: screen.y + screen.height - 50 * u, text: "Type a message", size: 15 * u, fill: palette.slate400 }),
    icon("send", { x: screen.x + screen.width - 48 * u, y: screen.y + screen.height - 74 * u, size: 20 * u, stroke: palette.blue, strokeWidth: 2.1 * u })
  ].join("");
}
