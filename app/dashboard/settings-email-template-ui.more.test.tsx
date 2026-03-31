import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardEmailTemplate } from "@/lib/email-templates";
import {
  SettingsEmailTemplateEditor,
  SettingsEmailTemplateList
} from "./settings-email-template-ui";

function collect(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collect(child, predicate));
  const element = node as ReactElement;
  if (typeof element.type === "function") {
    return collect((element.type as (props: unknown) => ReactNode)(element.props), predicate);
  }
  return [...(predicate(element) ? [element] : []), ...collect(element.props?.children, predicate)];
}

function textOf(node: ReactNode): string {
  if (!node || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  return textOf((node as ReactElement).props?.children);
}

const disabledTemplate: DashboardEmailTemplate = {
  key: "follow_up",
  name: "Follow up",
  description: "Sent after a quiet thread",
  trigger: "Manual",
  icon: "follow_up",
  subject: "Checking in",
  body: "Still happy to help.",
  enabled: false,
  updatedAt: "2026-03-29T10:00:00.000Z"
};

describe("settings email template ui extra coverage", () => {
  it("covers the disabled template menu states", () => {
    const handlers = {
      onOpenTemplateEditor: vi.fn(),
      onToggleEnabled: vi.fn(),
      onToggleMenu: vi.fn(),
      onSendTest: vi.fn(),
      onResetTemplate: vi.fn()
    };
    const tree = SettingsEmailTemplateList({
      templates: [disabledTemplate],
      menuTemplateKey: disabledTemplate.key,
      sendingTestKey: null,
      ...handlers
    });

    const html = renderToStaticMarkup(tree);
    expect(html).toContain("Disabled");
    expect(html).toContain("Send test");
    expect(html).toContain("Enable");
    expect(collect(tree, (element) => element.props.role === "switch")[0]?.props["aria-checked"]).toBe(false);

    collect(tree, (element) => element.type === "button" && textOf(element.props.children).includes("Send test"))[0]?.props.onClick();
    collect(tree, (element) => element.type === "button" && textOf(element.props.children).includes("Enable"))[0]?.props.onClick();

    expect(handlers.onSendTest).toHaveBeenCalledWith(disabledTemplate);
    expect(handlers.onToggleEnabled).toHaveBeenCalledWith(disabledTemplate);
  });

  it("covers the remaining editor toolbar, preview, and close branches", () => {
    const handlers = {
      onClose: vi.fn(),
      onUpdateField: vi.fn(),
      onInsertIntoBody: vi.fn(),
      onInsertVariable: vi.fn(),
      onSendTest: vi.fn(),
      onSave: vi.fn()
    };
    const stopPropagation = vi.fn();
    const tree = SettingsEmailTemplateEditor({
      editingTemplate: disabledTemplate,
      textareaRef: { current: null },
      renderedPreview: { subject: "Preview", bodyHtml: "<p>Preview body</p>" },
      replyToEmail: "",
      profileEmail: "team@example.com",
      previewTeamName: "Chatting",
      previewVisitorEmail: "visitor@example.com",
      sendingTestKey: disabledTemplate.key,
      variables: [{ token: "{{visitor_name}}", description: "Visitor name" }],
      ...handlers
    });

    (tree as ReactElement).props.onClick();
    collect(
      tree,
      (element) => element.type === "div" && String(element.props.className).includes("max-h-[90vh]")
    )[0]?.props.onClick({ stopPropagation });
    ["I", "U", "Link", "List", "1.", "Image", "Code", "{{ }}"].forEach((label) => {
      collect(tree, (element) => element.type === "button" && textOf(element.props.children) === label)[0]?.props.onClick();
    });
    collect(tree, (element) => element.props["aria-label"] === "Back")[0]?.props.onClick();
    collect(tree, (element) => element.props["aria-label"] === "Close")[0]?.props.onClick();
    collect(tree, (element) => textOf(element.props.children).includes("Cancel"))[0]?.props.onClick();

    const html = renderToStaticMarkup(tree);
    expect(stopPropagation).toHaveBeenCalled();
    expect(handlers.onClose).toHaveBeenCalledTimes(4);
    expect(handlers.onInsertIntoBody).toHaveBeenCalledTimes(7);
    expect(handlers.onInsertVariable).toHaveBeenCalledWith("{{visitor_name}}");
    expect(html).toContain("Send test email");
    expect(html).toContain("team@example.com");
    expect(html).toContain("lg:grid-cols-2");
    expect(html).toContain("lg:border-l");
    expect(html).toContain("aria-busy=\"true\"");
    expect(html).not.toContain("Desktop preview");
    expect(html).not.toContain("Mobile preview");
  });
});
