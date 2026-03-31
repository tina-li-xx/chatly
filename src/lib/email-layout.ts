import {
  renderBrandLockup,
  renderButtonRow,
  renderChattingEmailShell,
  renderDivider,
  renderEmailSection
} from "@/lib/chatly-email-foundation";
import { renderPanel } from "@/lib/chatly-email-content";

export type StyledEmailSection =
  | { type: "plain"; html: string; text?: string; tone?: "default" | "soft" }
  | { type: "actions"; title?: string; textTitle?: string; links: Array<{ label: string; href: string }>; tone?: "default" | "soft" };

function renderSectionHtml(section: StyledEmailSection) {
  if (section.type === "plain") {
    return renderPanel(`<div style="font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${section.html}</div>`, {
      background: section.tone === "soft" ? "#F8FBFF" : "#FFFFFF",
      borderColor: section.tone === "soft" ? "#DBEAFE" : "#E2E8F0",
      padding: "18px 20px"
    });
  }

  return renderPanel(
    `${section.title ? `<div style="font:600 13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0F172A;">${section.title}</div>` : ""}<div style="margin-top:14px;">${renderButtonRow({
      primary: section.links[0] ? { href: section.links[0].href, label: section.links[0].label } : null,
      secondary: section.links[1] ? { href: section.links[1].href, label: section.links[1].label } : null
    })}</div>`,
    {
      background: section.tone === "default" ? "#FFFFFF" : "#F8FBFF",
      borderColor: section.tone === "default" ? "#E2E8F0" : "#DBEAFE",
      padding: "18px 20px"
    }
  );
}

function renderSectionText(section: StyledEmailSection) {
  if (section.type === "plain") {
    return section.text?.trim() || "";
  }

  const heading = section.textTitle?.trim() || section.title?.trim() || "";
  const links = section.links.map((link) => `${link.label}: ${link.href}`).join("\n");
  return [heading, links].filter(Boolean).join("\n");
}

export function renderStyledEmailLayout(input: {
  contentHtml: string;
  sections?: StyledEmailSection[];
  includeShell?: boolean;
}) {
  const inner = `<div style="font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#334155;">${input.contentHtml}</div>${(input.sections ?? [])
    .map((section) => `<div style="margin-top:20px;">${renderSectionHtml(section)}</div>`)
    .join("")}`;

  if (input.includeShell === false) {
    return inner;
  }

  return renderChattingEmailShell({
    preheader: "Email preview",
    rows: [renderEmailSection(renderBrandLockup()), renderDivider(), renderEmailSection(inner)]
  });
}

export function renderStyledEmailTextLayout(input: { contentText: string; sections?: StyledEmailSection[] }) {
  return [input.contentText.trim(), ...(input.sections ?? []).map((section) => renderSectionText(section))]
    .filter(Boolean)
    .join("\n\n");
}
