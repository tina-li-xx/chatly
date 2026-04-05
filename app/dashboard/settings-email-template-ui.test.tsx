import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardEmailTemplate } from "@/lib/email-templates";
import {
  SettingsEmailTemplateEditor,
  SettingsEmailTemplateList,
  replaceTemplate
} from "./settings-email-template-ui";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  const renderedChildren =
    typeof element.type === "function" ? collectElements(element.type(element.props), predicate) : [];
  return [...(predicate(element) ? [element] : []), ...renderedChildren, ...collectElements(element.props?.children, predicate)];
}

function textContent(node: ReactNode): string {
  if (!node || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  return textContent((node as ReactElement).props?.children);
}

const template: DashboardEmailTemplate = {
  key: "offline_reply",
  name: "Offline reply",
  description: "Sent when the visitor is offline",
  trigger: "Automatic",
  icon: "mail",
  subject: "Hello {{visitor_name}}",
  body: "Thanks for reaching out.",
  enabled: true,
  updatedAt: "2026-03-29T10:00:00.000Z"
};

describe("settings email template ui", () => {
  it("replaces templates and wires list actions", () => {
    expect(replaceTemplate([template], { ...template, subject: "Updated" })[0]?.subject).toBe("Updated");

    const handlers = {
      onOpenTemplateEditor: vi.fn(),
      onToggleEnabled: vi.fn(),
      onToggleMenu: vi.fn(),
      onSendTest: vi.fn(),
      onResetTemplate: vi.fn()
    };
    const tree = SettingsEmailTemplateList({
      templates: [template],
      menuTemplateKey: template.key,
      sendingTestKey: template.key,
      ...handlers
    });

    expect(renderToStaticMarkup(tree)).toContain("Offline reply");
    expect(renderToStaticMarkup(tree)).toContain("rounded-xl border border-slate-200 bg-white p-6");
    expect(renderToStaticMarkup(tree)).toContain("-mx-6 border-t border-slate-200");
    const buttons = collectElements(tree, (element) => element.type === "button");
    buttons.find((element) => textContent(element.props.children).includes("Offline reply"))?.props.onClick();
    buttons.find((element) => element.props.role === "switch")?.props.onClick({ stopPropagation: vi.fn() });
    buttons.find((element) => element.props["aria-label"] === "Open Offline reply actions")?.props.onClick({
      stopPropagation: vi.fn()
    });
    buttons.find((element) => textContent(element.props.children).includes("Send test"))?.props.onClick();
    buttons.find((element) => textContent(element.props.children).includes("Reset to default"))?.props.onClick();

    expect(handlers.onOpenTemplateEditor).toHaveBeenCalledWith(template);
    expect(handlers.onToggleEnabled).toHaveBeenCalledWith(template);
    expect(handlers.onToggleMenu).toHaveBeenCalledWith("offline_reply");
    expect(handlers.onSendTest).toHaveBeenCalledWith(template);
    expect(handlers.onResetTemplate).toHaveBeenCalledWith("offline_reply");
  });

  it("renders the editor and forwards toolbar, variable, preview, and footer actions", () => {
    const handlers = {
      onClose: vi.fn(),
      onUpdateField: vi.fn(),
      onInsertIntoBody: vi.fn(),
      onInsertVariable: vi.fn(),
      onSendTest: vi.fn(),
      onSave: vi.fn()
    };
    const tree = SettingsEmailTemplateEditor({
      editingTemplate: template,
      textareaRef: { current: null },
      renderedPreview: { subject: "Preview subject", bodyHtml: "<p>Preview body</p>" },
      replyToEmail: "reply@example.com",
      profileEmail: "team@example.com",
      previewTeamName: "Chatting",
      previewVisitorEmail: "visitor@example.com",
      sendingTestKey: null,
      variables: [{ token: "{{visitor_name}}", description: "Visitor name" }],
      ...handlers
    });

    const html = renderToStaticMarkup(tree);
    expect(html).toContain("Preview subject");
    expect(html).toContain("max-w-[1180px]");
    expect(html).toContain("lg:grid-cols-2");
    expect((tree as ReactElement).props.onClick).toBe(handlers.onClose);

    const buttons = collectElements(tree, (element) => element.type === "button");
    const toolbarButtons = collectElements(
      tree,
      (element) => typeof element.type === "function" && typeof element.props.onClick === "function"
    );
    collectElements(tree, (element) => element.type === "input")[0]?.props.onChange({ target: { value: "Updated" } });
    collectElements(tree, (element) => element.type === "textarea")[0]?.props.onChange({ target: { value: "Updated body" } });
    toolbarButtons.find((element) => element.props.label === "B")?.props.onClick();
    buttons.find((element) => textContent(element.props.children) === "{{visitor_name}}")?.props.onClick();
    buttons.find((element) => textContent(element.props.children).includes("Send test email"))?.props.onClick();
    buttons.find((element) => textContent(element.props.children).includes("Save template"))?.props.onClick();

    expect(handlers.onUpdateField).toHaveBeenCalledWith("subject", "Updated");
    expect(handlers.onUpdateField).toHaveBeenCalledWith("body", "Updated body");
    expect(handlers.onInsertIntoBody).toHaveBeenCalled();
    expect(handlers.onInsertVariable).toHaveBeenCalledWith("{{visitor_name}}");
    expect(handlers.onSendTest).toHaveBeenCalledWith(template);
    expect(handlers.onSave).toHaveBeenCalled();
    expect(html).toContain("Send test email");
    expect(html).not.toContain("Desktop preview");
    expect(html).not.toContain("Mobile preview");
  });
});
