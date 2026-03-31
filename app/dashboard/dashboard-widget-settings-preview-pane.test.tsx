import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createSite } from "./use-dashboard-actions.test-helpers";
import { createMockReactHooks } from "./test-react-hooks";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

function textContent(node: ReactNode): string {
  if (!node || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  return textContent((node as ReactElement).props?.children);
}

async function loadPreviewPane() {
  vi.resetModules();
  const captures: Record<string, unknown> = {};
  const reactMocks = createMockReactHooks();

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("./dashboard-widget-settings-preview", () => ({
    WidgetPreviewFrame: (props: unknown) => ((captures.frame = props), <div>frame</div>)
  }));

  const module = await import("./dashboard-widget-settings-preview-pane");
  return { WidgetPreviewPane: module.WidgetPreviewPane, captures, reactMocks };
}

describe("dashboard widget settings preview pane", () => {
  it("switches preview modes locally and forwards device changes", async () => {
    const onSetPreviewDevice = vi.fn();
    const { WidgetPreviewPane, captures, reactMocks } = await loadPreviewPane();

    reactMocks.beginRender();
    let tree = WidgetPreviewPane({ site: createSite(), device: "desktop", onSetPreviewDevice });
    renderToStaticMarkup(tree);
    expect(captures.frame).toMatchObject({ device: "desktop", mode: "online" });

    collectElements(tree, (element) => element.type === "button" && textContent(element.props.children) === "Away")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = WidgetPreviewPane({ site: createSite(), device: "desktop", onSetPreviewDevice });
    renderToStaticMarkup(tree);
    expect(captures.frame).toMatchObject({ mode: "away" });

    collectElements(tree, (element) => element.type === "button" && textContent(element.props.children) === "Offline")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = WidgetPreviewPane({ site: createSite(), device: "desktop", onSetPreviewDevice });
    renderToStaticMarkup(tree);
    expect(captures.frame).toMatchObject({ mode: "offline" });

    collectElements(tree, (element) => element.type === "button" && element.props["aria-label"] === "Mobile")[0]?.props.onClick();
    expect(onSetPreviewDevice).toHaveBeenCalledWith("mobile");
  });
});
