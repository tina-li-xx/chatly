import { escapeHtml } from "@/lib/utils";

type Align = "left" | "center" | "right";

export type ChatlyEmailButton = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

export type ChatlyEmailMetric = {
  value: string;
  label: string;
};

const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const SERIF_STACK = "Georgia,'Times New Roman',serif";

function joinStyle(values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(";");
}

export function renderChatlyEmailShell(input: {
  preheader: string;
  rows: string[];
}) {
  const preheader = escapeHtml(input.preheader);

  return [
    `<div style="display:none;overflow:hidden;line-height:1px;max-height:0;max-width:0;opacity:0;color:transparent;">${preheader}</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin:0;padding:0;background:#F1F5F9;">`,
    `<tr><td align="center" style="padding:40px 20px;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);overflow:hidden;">`,
    ...input.rows,
    `</table>`,
    `</td></tr>`,
    `</table>`
  ].join("");
}

export function renderEmailSection(
  content: string,
  options?: {
    align?: Align;
    padding?: string;
    background?: string;
    borderTopColor?: string;
    borderBottomColor?: string;
  }
) {
  return `<tr><td align="${options?.align ?? "left"}" style="${joinStyle([
    `padding:${options?.padding ?? "32px"}`,
    options?.background ? `background:${options.background}` : null,
    options?.borderTopColor ? `border-top:1px solid ${options.borderTopColor}` : null,
    options?.borderBottomColor ? `border-bottom:1px solid ${options.borderBottomColor}` : null
  ])}">${content}</td></tr>`;
}

export function renderBrandLockup(label = "Chatting") {
  const safeLabel = escapeHtml(label);

  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:36px;height:36px;border-radius:12px;background:#2563EB;color:#FFFFFF;font:700 18px ${FONT_STACK};text-align:center;">C</td><td style="padding-left:12px;font:600 15px ${FONT_STACK};color:#0F172A;">${safeLabel}</td></tr></table></td></tr></table>`;
}

export function renderDivider(spacing = "0 32px") {
  return `<tr><td style="padding:${spacing};"><div style="height:1px;background:#E2E8F0;font-size:0;line-height:0;">&nbsp;</div></td></tr>`;
}

export function renderHeadingBlock(input: {
  title: string;
  eyebrow?: string;
  meta?: string;
  description?: string;
  align?: Align;
}) {
  const align = input.align ?? "left";
  const safeTitle = escapeHtml(input.title);
  const eyebrow = input.eyebrow
    ? `<p style="margin:0 0 10px;font:600 12px ${FONT_STACK};letter-spacing:0.12em;text-transform:uppercase;color:#64748B;">${escapeHtml(input.eyebrow)}</p>`
    : "";
  const meta = input.meta
    ? `<p style="margin:6px 0 0;font:400 13px ${FONT_STACK};color:#64748B;">${escapeHtml(input.meta)}</p>`
    : "";
  const description = input.description
    ? `<p style="margin:16px 0 0;font:400 15px/1.7 ${FONT_STACK};color:#475569;">${escapeHtml(input.description)}</p>`
    : "";

  return `<div style="text-align:${align};">${eyebrow}<h1 style="margin:0;font:600 24px/1.25 ${SERIF_STACK};color:#0F172A;">${safeTitle}</h1>${meta}${description}</div>`;
}

export function renderParagraph(html: string, align: Align = "left") {
  return `<div style="text-align:${align};font:400 15px/1.7 ${FONT_STACK};color:#475569;">${html}</div>`;
}

export function renderPanel(
  html: string,
  options?: {
    background?: string;
    borderColor?: string;
    padding?: string;
  }
) {
  return `<div style="${joinStyle([
    `padding:${options?.padding ?? "24px"}`,
    `background:${options?.background ?? "#F8FAFC"}`,
    `border:1px solid ${options?.borderColor ?? "#E2E8F0"}`,
    "border-radius:12px"
  ])}">${html}</div>`;
}

export function renderEmailButton(button: ChatlyEmailButton) {
  const variant = button.variant ?? "primary";
  const safeLabel = escapeHtml(button.label);
  const style =
    variant === "secondary"
      ? joinStyle([
          "display:inline-block",
          `font:500 14px ${FONT_STACK}`,
          "color:#2563EB",
          "text-decoration:none"
        ])
      : joinStyle([
          "display:inline-block",
          "padding:12px 24px",
          "border-radius:6px",
          "background:#2563EB",
          `font:500 14px ${FONT_STACK}`,
          "line-height:1",
          "color:#FFFFFF",
          "text-decoration:none"
        ]);

  return `<a href="${button.href}" style="${style}">${safeLabel}</a>`;
}

export function renderButtonRow(input: {
  primary?: ChatlyEmailButton | null;
  secondary?: ChatlyEmailButton | null;
  secondaryPrefix?: string;
}) {
  const primary = input.primary ? renderEmailButton(input.primary) : "";
  const secondary = input.secondary
    ? `<span style="display:inline-block;padding:12px 10px 0;font:400 14px ${FONT_STACK};color:#475569;">${escapeHtml(
        input.secondaryPrefix ?? "or"
      )}</span>${renderEmailButton({
        ...input.secondary,
        variant: "secondary"
      })}`
    : "";

  return `<div style="text-align:center;">${primary}${secondary}</div>`;
}

export function renderMetricGrid(metrics: ChatlyEmailMetric[]) {
  const width = `${Math.max(25, Math.floor(100 / Math.max(1, metrics.length)))}%`;
  const cells = metrics
    .map(
      (metric) =>
        `<td width="${width}" valign="top" style="padding:0 6px 12px;"><div style="border:1px solid #E2E8F0;border-radius:12px;background:#F8FAFC;padding:16px;text-align:center;"><div style="font:600 20px/1.2 ${SERIF_STACK};color:#0F172A;">${escapeHtml(
          metric.value
        )}</div><div style="margin-top:6px;font:400 12px/1.5 ${FONT_STACK};color:#64748B;">${escapeHtml(
          metric.label
        )}</div></div></td>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
}

export function renderBulletList(items: string[]) {
  return `<div style="font:400 15px/1.7 ${FONT_STACK};color:#475569;">${items
    .map((item) => `<div style="margin-top:10px;">&#8226; ${escapeHtml(item)}</div>`)
    .join("")}</div>`;
}

export function renderFooterBlock(input: {
  text: string;
  links?: Array<{ label: string; href: string }>;
}) {
  const links = (input.links ?? [])
    .map(
      (link) =>
        `<a href="${link.href}" style="font:400 12px/1.6 ${FONT_STACK};color:#64748B;text-decoration:underline;">${escapeHtml(
          link.label
        )}</a>`
    )
    .join(`<span style="font:400 12px/1.6 ${FONT_STACK};color:#94A3B8;"> &bull; </span>`);

  return `<div style="text-align:center;"><div style="font:400 12px/1.6 ${FONT_STACK};color:#94A3B8;">${escapeHtml(
    input.text
  )}</div>${links ? `<div style="margin-top:8px;">${links}</div>` : ""}</div>`;
}

export function joinEmailText(blocks: Array<string | null | undefined>) {
  return blocks.map((block) => block?.trim()).filter(Boolean).join("\n\n");
}
