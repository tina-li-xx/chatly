import {
  type Align,
  type ChattingEmailButton,
  type ChattingEmailMetric,
  renderBrandLockup,
  renderButtonRow,
  renderChattingEmailShell,
  renderDivider,
  renderEmailSection,
  renderFooterBlock
} from "@/lib/chatly-email-core";
import { renderHeadingBlock, renderMetricGrid, renderPanel } from "@/lib/chatly-email-content";
import { FONT_STACK } from "@/lib/chatly-email-tokens";
import { initialsFromLabel } from "@/lib/user-display";
import { escapeHtml } from "@/lib/utils";

type ChattingEmailHero = {
  label: string;
  avatarUrl?: string | null;
  badgeLabel?: string;
  size?: 48 | 64;
  shape?: "circle" | "tile";
};
type ChattingEmailPageSection =
  | { kind: "copy" | "html"; html: string; align?: Align; padding?: string; background?: string; borderTopColor?: string; borderBottomColor?: string }
  | { kind: "panel"; html: string; padding?: string; align?: Align; background?: string; borderTopColor?: string; borderBottomColor?: string; panelPadding?: string; panelBackground?: string; panelBorderColor?: string }
  | { kind: "metrics"; metrics: ChattingEmailMetric[]; padding?: string };

export function renderEmailAvatar(input: ChattingEmailHero) {
  const size = input.size ?? 48;
  const shape = input.shape ?? "circle";
  const radius = shape === "circle" ? "50%" : "18px";

  if (input.avatarUrl && /^(data:|cid:)/i.test(input.avatarUrl)) {
    return `<img src="${input.avatarUrl}" alt="${escapeHtml(input.label)} avatar" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;border-radius:${radius};object-fit:cover;border:0;" />`;
  }

  const fontSize = size === 64 ? 32 : 18;
  const lineHeight = `${size}px`;
  const fallback = input.badgeLabel ?? initialsFromLabel(input.label);

  return `<div style="width:${size}px;height:${size}px;border-radius:${radius};background:#DBEAFE;color:#1D4ED8;font:${shape === "tile" ? 600 : 600} ${fontSize}px/${lineHeight} ${FONT_STACK};text-align:center;">${escapeHtml(fallback)}</div>`;
}

function renderPageSection(section: ChattingEmailPageSection) {
  if (section.kind === "metrics") {
    return renderEmailSection(renderMetricGrid(section.metrics), { padding: section.padding ?? "0 26px 24px" });
  }

  const content =
    section.kind === "panel"
      ? renderPanel(section.html, {
          padding: section.panelPadding,
          background: section.panelBackground,
          borderColor: section.panelBorderColor
        })
      : section.html;

  return renderEmailSection(content, {
    align: section.align,
    padding: section.padding,
    background: section.background,
    borderTopColor: section.borderTopColor,
    borderBottomColor: section.borderBottomColor
  });
}

export function renderChattingEmailPage(input: {
  preheader: string;
  brandLabel?: string;
  title: string;
  eyebrow?: string;
  meta?: string;
  description?: string;
  align?: Align;
  hero?: ChattingEmailHero | null;
  sections?: ChattingEmailPageSection[];
  actions?: { message?: string; primary?: ChattingEmailButton | null; secondary?: ChattingEmailButton | null; customHtml?: string; padding?: string; borderTopColor?: string } | null;
  footer?: { text: string; links?: Array<{ label: string; href: string }>; padding?: string; align?: Align; background?: string; borderTopColor?: string } | null;
}) {
  const align = input.align ?? "left";
  const hero = input.hero
    ? `${align === "center" ? `<div style="text-align:center;">${renderEmailAvatar(input.hero)}</div>` : renderEmailAvatar(input.hero)}<div style="margin-top:16px;">`
    : "";
  const heroClose = input.hero ? "</div>" : "";
  const actionBody = input.actions?.customHtml ?? renderButtonRow({ primary: input.actions?.primary, secondary: input.actions?.secondary });
  const actionHtml =
    input.actions && (input.actions.message || actionBody.trim())
      ? renderEmailSection(
          `${input.actions.message ? `<div style="text-align:center;font:400 15px/1.7 ${FONT_STACK};color:#475569;">${escapeHtml(input.actions.message)}</div>` : ""}${actionBody ? `<div style="margin-top:${input.actions.message ? "20px" : "0"};">${actionBody}</div>` : ""}`,
          { align: "center", padding: input.actions.padding ?? "32px", borderTopColor: input.actions.borderTopColor }
        )
      : "";

  return renderChattingEmailShell({
    preheader: input.preheader,
    rows: [
      renderEmailSection(renderBrandLockup(input.brandLabel)),
      renderDivider(),
      renderEmailSection(`${hero}${renderHeadingBlock({ title: input.title, eyebrow: input.eyebrow, meta: input.meta, description: input.description, align })}${heroClose}`, { align, padding: "32px 32px 24px" }),
      ...(input.sections ?? []).map(renderPageSection),
      actionHtml,
      input.footer
        ? renderEmailSection(renderFooterBlock({ text: input.footer.text, links: input.footer.links }), {
            align: input.footer.align ?? "center",
            padding: input.footer.padding ?? "24px 32px",
            background: input.footer.background,
            borderTopColor: input.footer.borderTopColor
          })
        : ""
    ].filter(Boolean)
  });
}
