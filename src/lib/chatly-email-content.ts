import { FONT_STACK, SERIF_STACK } from "@/lib/chatly-email-tokens";
import type { Align, ChattingEmailMetric } from "@/lib/chatly-email-core";
import { escapeHtml } from "@/lib/utils";

function joinStyle(values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(";");
}

export function renderHeadingBlock(input: {
  title: string;
  eyebrow?: string;
  meta?: string;
  description?: string;
  align?: Align;
}) {
  const align = input.align ?? "left";
  const eyebrow = input.eyebrow
    ? `<p style="margin:0 0 10px;font:600 12px ${FONT_STACK};letter-spacing:0.12em;text-transform:uppercase;color:#64748B;">${escapeHtml(input.eyebrow)}</p>`
    : "";
  const meta = input.meta ? `<p style="margin:6px 0 0;font:400 13px ${FONT_STACK};color:#64748B;">${escapeHtml(input.meta)}</p>` : "";
  const description = input.description
    ? `<p style="margin:16px 0 0;font:400 15px/1.7 ${FONT_STACK};color:#475569;word-break:normal;word-wrap:normal;overflow-wrap:normal;hyphens:none;">${escapeHtml(input.description)}</p>`
    : "";

  return `<div style="text-align:${align};">${eyebrow}<h1 style="margin:0;font:600 24px/1.25 ${SERIF_STACK};color:#0F172A;">${escapeHtml(input.title)}</h1>${meta}${description}</div>`;
}

export const renderParagraph = (html: string, align: Align = "left") =>
  `<div style="text-align:${align};font:400 15px/1.7 ${FONT_STACK};color:#475569;word-break:normal;word-wrap:normal;overflow-wrap:normal;hyphens:none;">${html}</div>`;

export function renderPanel(
  html: string,
  options?: { background?: string; borderColor?: string; padding?: string }
) {
  return `<div style="${joinStyle([
    `padding:${options?.padding ?? "24px"}`,
    `background:${options?.background ?? "#F8FAFC"}`,
    `border:1px solid ${options?.borderColor ?? "#E2E8F0"}`,
    "border-radius:12px"
  ])}">${html}</div>`;
}

export function renderMetricGrid(metrics: ChattingEmailMetric[]) {
  const width = `${Math.max(25, Math.floor(100 / Math.max(1, metrics.length)))}%`;
  const cells = metrics
    .map(
      (metric) =>
        `<td width="${width}" valign="top" style="padding:0 6px 12px;"><div style="border:1px solid #E2E8F0;border-radius:12px;background:#F8FAFC;padding:16px;text-align:center;"><div style="font:600 20px/1.2 ${SERIF_STACK};color:#0F172A;">${escapeHtml(metric.value)}</div><div style="margin-top:6px;font:400 12px/1.5 ${FONT_STACK};color:#64748B;">${escapeHtml(metric.label)}</div></div></td>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
}

export const renderBulletList = (items: string[]) =>
  `<div style="font:400 15px/1.7 ${FONT_STACK};color:#475569;">${items.map((item) => `<div style="margin-top:10px;">&#8226; ${escapeHtml(item)}</div>`).join("")}</div>`;
