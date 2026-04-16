import { FONT_STACK, SERIF_STACK } from "@/lib/chatting-email-tokens";
import type { Align, ChattingEmailMetric } from "@/lib/chatting-email-core";
import { escapeHtml } from "@/lib/utils";

function joinStyle(values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(";");
}

function textStyle(input: {
  align?: Align;
  color: string;
  fontFamily?: string;
  fontSize: number;
  lineHeight: string;
  fontWeight?: number;
  letterSpacing?: string;
  textTransform?: string;
}) {
  return joinStyle([
    `text-align:${input.align ?? "left"}`,
    `color:${input.color}`,
    `font-family:${input.fontFamily ?? FONT_STACK}`,
    `font-size:${input.fontSize}px`,
    `line-height:${input.lineHeight}`,
    input.fontWeight ? `font-weight:${input.fontWeight}` : null,
    input.letterSpacing ? `letter-spacing:${input.letterSpacing}` : null,
    input.textTransform ? `text-transform:${input.textTransform}` : null,
    "word-break:normal",
    "word-wrap:normal",
    "overflow-wrap:normal",
    "hyphens:none"
  ]);
}

export function renderAlignedBlock(html: string, align: Align = "left") {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;"><tr><td align="${align}">${html}</td></tr></table>`;
}

export function renderStack(items: Array<string | null | undefined>, options?: { gap?: string; align?: Align }) {
  const rows = items
    .filter(Boolean)
    .map((item, index) => `<tr><td align="${options?.align ?? "left"}" style="${index > 0 ? `padding-top:${options?.gap ?? "12px"};` : ""}">${item}</td></tr>`)
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;">${rows}</table>`;
}

export function renderTextBlock(input: {
  html: string;
  align?: Align;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: string;
  fontWeight?: number;
  letterSpacing?: string;
  textTransform?: string;
}) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;"><tr><td align="${input.align ?? "left"}" style="${textStyle({
    align: input.align,
    color: input.color ?? "#475569",
    fontFamily: input.fontFamily,
    fontSize: input.fontSize ?? 15,
    lineHeight: input.lineHeight ?? "1.7",
    fontWeight: input.fontWeight,
    letterSpacing: input.letterSpacing,
    textTransform: input.textTransform
  })}">${input.html}</td></tr></table>`;
}

export function renderHeadingBlock(input: {
  title: string;
  eyebrow?: string;
  meta?: string;
  metaHtml?: string;
  description?: string;
  align?: Align;
}) {
  return renderStack(
    [
      input.eyebrow
        ? renderTextBlock({
            html: escapeHtml(input.eyebrow),
            align: input.align,
            color: "#64748B",
            fontSize: 12,
            lineHeight: "1.4",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase"
          })
        : null,
      renderTextBlock({
        html: escapeHtml(input.title),
        align: input.align,
        color: "#0F172A",
        fontFamily: SERIF_STACK,
        fontSize: 24,
        lineHeight: "1.25",
        fontWeight: 600
      }),
      input.metaHtml
        ? renderTextBlock({
            html: input.metaHtml,
            align: input.align,
            color: "#64748B",
            fontSize: 13,
            lineHeight: "1.5"
          })
        : input.meta
        ? renderTextBlock({
            html: escapeHtml(input.meta),
            align: input.align,
            color: "#64748B",
            fontSize: 13,
            lineHeight: "1.5"
          })
        : null,
      input.description ? renderParagraph(escapeHtml(input.description), input.align) : null
    ],
    { gap: "16px", align: input.align }
  );
}

export const renderParagraph = (html: string, align: Align = "left") => renderTextBlock({ html, align });

export const renderSmallText = (html: string, align: Align = "left", color = "#64748B") =>
  renderTextBlock({ html, align, color, fontSize: 13, lineHeight: "1.6" });

export const renderLabelText = (html: string, align: Align = "left") =>
  renderTextBlock({
    html,
    align,
    color: "#64748B",
    fontSize: 13,
    lineHeight: "1.5",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  });

export const renderTitleText = (html: string, align: Align = "left") =>
  renderTextBlock({ html, align, color: "#0F172A", fontFamily: SERIF_STACK, fontSize: 18, lineHeight: "1.4", fontWeight: 600 });

export function renderPanel(html: string, options?: { background?: string; borderColor?: string; padding?: string }) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid ${options?.borderColor ?? "#E2E8F0"};border-radius:12px;background:${options?.background ?? "#F8FAFC"};"><tr><td style="padding:${options?.padding ?? "24px"};">${html}</td></tr></table>`;
}

export function renderMetricGrid(metrics: ChattingEmailMetric[]) {
  const width = `${Math.max(25, Math.floor(100 / Math.max(1, metrics.length)))}%`;
  const cells = metrics
    .map(
      (metric) =>
        `<td width="${width}" valign="top" style="padding:0 6px 12px;"><table role="presentation" width="100%" height="108" cellpadding="0" cellspacing="0" style="width:100%;height:108px;border:1px solid #E2E8F0;border-radius:12px;background:#F8FAFC;"><tr><td align="center" valign="middle" style="padding:16px;">${renderStack(
          [
            renderTextBlock({
              html: escapeHtml(metric.value),
              align: "center",
              color: "#0F172A",
              fontFamily: SERIF_STACK,
              fontSize: 20,
              lineHeight: "1.2",
              fontWeight: 600
            }),
            renderSmallText(escapeHtml(metric.label), "center")
          ],
          { gap: "6px", align: "center" }
        )}</td></tr></table></td>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;"><tr>${cells}</tr></table>`;
}

export function renderBulletList(items: string[]) {
  return renderStack(
    items.map(
      (item) =>
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;"><tr><td width="18" valign="top" style="width:18px;font:${textStyle({
          color: "#475569",
          fontSize: 15,
          lineHeight: "1.7"
        })}">&#8226;</td><td valign="top">${renderParagraph(escapeHtml(item))}</td></tr></table>`
    ),
    { gap: "8px" }
  );
}
