import { path, rect, circle, group } from "./shared.mjs";

function translate(x, y, size, content) {
  const scale = size / 24;
  return group(content, { transform: `translate(${x} ${y}) scale(${scale})` });
}

export function icon(name, { x, y, size = 24, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) {
  const icons = {
    back: [
      path({ d: "M15 5L8 12L15 19", stroke, strokeWidth }),
      path({ d: "M9 12H20", stroke, strokeWidth })
    ],
    info: [
      circle({ cx: 12, cy: 12, r: 9, stroke, strokeWidth }),
      path({ d: "M12 10V16", stroke, strokeWidth }),
      circle({ cx: 12, cy: 7.2, r: 1.1, fill: stroke })
    ],
    search: [
      circle({ cx: 10.5, cy: 10.5, r: 5.8, stroke, strokeWidth }),
      path({ d: "M15.5 15.5L20 20", stroke, strokeWidth })
    ],
    close: [
      path({ d: "M7 7L17 17", stroke, strokeWidth }),
      path({ d: "M17 7L7 17", stroke, strokeWidth })
    ],
    send: [
      path({ d: "M4 12L20 4L16 20L11.2 13.7L4 12Z", stroke, strokeWidth, fill: "none" }),
      path({ d: "M11 13L20 4", stroke, strokeWidth })
    ],
    paperclip: [
      path({ d: "M9 12.5L14.8 6.7A3.2 3.2 0 1119.3 11.2L10.4 20.1A5.1 5.1 0 113.2 12.9L12.1 4", stroke, strokeWidth })
    ],
    bell: [
      path({ d: "M7 10.5A5 5 0 0117 10.5V14L19 17H5L7 14V10.5", stroke, strokeWidth }),
      path({ d: "M10 19A2 2 0 0014 19", stroke, strokeWidth })
    ],
    moon: [
      path({ d: "M16.5 4.8A7.5 7.5 0 1110 19.3A6.5 6.5 0 0016.5 4.8Z", stroke, strokeWidth })
    ],
    chat: [
      path({ d: "M5 7.5A2.5 2.5 0 017.5 5H16.5A2.5 2.5 0 0119 7.5V13.5A2.5 2.5 0 0116.5 16H10L6 19V16H7.5A2.5 2.5 0 015 13.5V7.5Z", stroke, strokeWidth })
    ],
    camera: [
      rect({ x: 4, y: 8, width: 16, height: 10, rx: 2.4, stroke, strokeWidth, fill }),
      circle({ cx: 12, cy: 13, r: 3.2, stroke, strokeWidth }),
      path({ d: "M8 8L9.5 5.8H14.5L16 8", stroke, strokeWidth })
    ],
    flashlight: [
      path({ d: "M10 4H14L13 9H16L9 20L10.4 13H8L10 4Z", stroke, strokeWidth })
    ],
    lock: [
      rect({ x: 7.2, y: 11, width: 9.6, height: 8, rx: 2.2, stroke, strokeWidth, fill }),
      path({ d: "M9.2 11V8.7A2.8 2.8 0 0112 6A2.8 2.8 0 0114.8 8.7V11", stroke, strokeWidth })
    ],
    chevronRight: [
      path({ d: "M9 6L15 12L9 18", stroke, strokeWidth })
    ],
    check: [
      path({ d: "M5 12L10 17L19 8", stroke, strokeWidth })
    ]
  };
  return translate(x, y, size, icons[name].join(""));
}
