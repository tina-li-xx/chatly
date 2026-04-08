import { renderAlignedBlock, renderEmailButton } from "@/lib/chatting-email-foundation";
import { normalizeDashboardEmailTemplateContent } from "@/lib/email-template-content";
import { VARIABLE_TOKEN_MAP } from "@/lib/email-template-variables";
import {
  renderStyledEmailLayout,
  renderStyledEmailTextLayout
} from "@/lib/email-layout";
import type {
  DashboardEmailTemplate,
  DashboardEmailTemplatePreviewContext,
  DashboardEmailTemplateSection
} from "@/lib/email-template-types";
import { escapeHtml } from "@/lib/utils";

function replaceTemplateVariables(
  value: string,
  context: DashboardEmailTemplatePreviewContext,
  highlight = false
) {
  let output = value;

  for (const variable of VARIABLE_TOKEN_MAP) {
    const replacement = String(context[variable.tokenKey]);
    output = output.split(variable.placeholder).join(
      highlight
        ? `<mark style="background:#fef3c7;color:#92400e;padding:0 2px;border-radius:4px;">${escapeHtml(replacement)}</mark>`
        : escapeHtml(replacement)
    );
  }

  return output;
}

export function resolveDashboardEmailTemplateValue(
  value: string,
  context: DashboardEmailTemplatePreviewContext
) {
  const normalizedValue = normalizeDashboardEmailTemplateContent(value);

  return VARIABLE_TOKEN_MAP.reduce((text, variable) => {
    return text.split(variable.placeholder).join(String(context[variable.tokenKey]));
  }, normalizedValue);
}

export function renderDashboardEmailTemplateFragment(
  value: string,
  context: DashboardEmailTemplatePreviewContext,
  options?: {
    highlightVariables?: boolean;
  }
) {
  return {
    text: resolveDashboardEmailTemplateValue(value, context),
    html: renderBodyHtml(value, context, options?.highlightVariables ?? false)
  };
}

function replaceConversationLinkButtons(
  value: string,
  context: DashboardEmailTemplatePreviewContext
) {
  const buttons: Array<{ token: string; html: string }> = [];

  const nextValue = value.replace(
    /Continue the conversation here:\s*\n\s*(\{\{conversation_link\}\}|https?:\/\/\S+)/g,
    (_match, url) => {
      const token = `__CHATTING_TEMPLATE_BUTTON_${buttons.length}__`;
      buttons.push({
        token,
        html: renderAlignedBlock(renderEmailButton({
          href: replaceTemplateVariables(String(url), context, false),
          label: "Continue the conversation"
        }), "center")
      });
      return token;
    }
  );

  return { nextValue, buttons };
}

function renderBodyHtml(
  value: string,
  context: DashboardEmailTemplatePreviewContext,
  highlightVariables: boolean
) {
  const { nextValue, buttons } = replaceConversationLinkButtons(
    normalizeDashboardEmailTemplateContent(value),
    context
  );
  const normalizedValue = nextValue
    .replace(
      /If you ever want to continue the conversation, you can jump back in here:\s*\n\s*(\{\{conversation_link\}\}|https?:\/\/\S+)/g,
      "If you ever want to continue the conversation, you can [jump back in here]($1)."
    )
    .replace(
      /If anything else comes up, you can continue the conversation here:\s*\n\s*(\{\{conversation_link\}\}|https?:\/\/\S+)/g,
      "If anything else comes up, you can [continue the conversation here]($1)."
    )
    .replace(
      /If you'd like to continue the conversation:\s*\n\s*(\{\{conversation_link\}\}|https?:\/\/\S+)/g,
      "If you'd like to [continue the conversation]($1)."
    );
  const codeBlocks: string[] = [];
  let html = escapeHtml(normalizedValue);

  html = html.replace(/```([\s\S]*?)```/g, (_match, code) => {
    const token = `__CHATTING_CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(
      `<pre style="margin:16px 0;overflow:auto;border-radius:8px;background:#0f172a;padding:16px;color:#e2e8f0;"><code>${String(
        code
      ).trim()}</code></pre>`
    );
    return token;
  });
  html = html.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,
    (_match, alt, url) =>
      `<figure style="margin:16px 0;"><img src="${url}" alt="${alt}" style="max-width:100%;border-radius:8px;border:1px solid #e2e8f0;" />${
        alt
          ? `<figcaption style="margin-top:6px;font-size:12px;color:#64748b;">${alt}</figcaption>`
          : ""
      }</figure>`
  );
  html = html.replace(
    /\[([^\]]+)\]\(((?:https?:\/\/[^)\s]+)|(?:\{\{[a-z_]+\}\}))\)/g,
    (_match, label, url) =>
      `<a href="${replaceTemplateVariables(String(url), context, false)}" style="color:#2563eb;text-decoration:none;">${label}</a>`
  );
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<u>$1</u>");
  html = html.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
  html = replaceTemplateVariables(html, context, highlightVariables);
  html = html.replace(/\n/g, "<br />");

  for (const [index, block] of codeBlocks.entries()) {
    html = html.replace(`__CHATTING_CODE_BLOCK_${index}__`, block);
  }
  for (const button of buttons) {
    html = html.replace(button.token, button.html);
  }

  return html;
}

export function renderDashboardEmailTemplate(
  template: Pick<DashboardEmailTemplate, "subject" | "body">,
  context: DashboardEmailTemplatePreviewContext,
  options?: {
    highlightVariables?: boolean;
    includeShell?: boolean;
    sections?: DashboardEmailTemplateSection[];
  }
) {
  const highlightVariables = options?.highlightVariables ?? false;
  const sections = options?.sections ?? [];
  const bodyText = resolveDashboardEmailTemplateValue(template.body, context);

  return {
    subject: resolveDashboardEmailTemplateValue(template.subject, context),
    bodyText: renderStyledEmailTextLayout({ contentText: bodyText, sections }),
    bodyHtml: renderStyledEmailLayout({
      contentHtml: renderBodyHtml(template.body, context, highlightVariables),
      sections,
      includeShell: options?.includeShell ?? false
    })
  };
}
