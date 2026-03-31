import type { FormEvent, ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks } from "../dashboard/test-react-hooks";

function collect(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collect(child, predicate));
  const element = node as ReactElement;
  if (typeof element.type === "function") {
    return collect((element.type as (props: unknown) => ReactNode)(element.props), predicate);
  }
  return [...(predicate(element) ? [element] : []), ...collect(element.props?.children, predicate)];
}

async function loadGate() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const showToast = vi.fn();
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("../ui/form-controls", () => ({
    FormButton: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
    FormInput: (props: Record<string, unknown>) => <input {...props} />
  }));
  vi.doMock("../ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));
  const module = await import("./free-tool-export-gate");
  return { FreeToolExportGate: module.FreeToolExportGate, reactMocks, showToast };
}

describe("free tool export gate actions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects invalid emails before submitting", async () => {
    const { FreeToolExportGate, reactMocks, showToast } = await loadGate();
    reactMocks.beginRender();
    let tree = FreeToolExportGate({ toolSlug: "roi", source: "free-tools", resultPayload: {} });
    collect(tree, (element) => element.type === "input")[0]?.props.onChange({ target: { value: "bad-email" } });
    reactMocks.beginRender();
    tree = FreeToolExportGate({ toolSlug: "roi", source: "free-tools", resultPayload: {} });
    await collect(tree, (element) => element.type === "form")[0]?.props.onSubmit({ preventDefault: vi.fn() } as FormEvent<HTMLFormElement>);
    reactMocks.beginRender();
    tree = FreeToolExportGate({ toolSlug: "roi", source: "free-tools", resultPayload: {} });

    expect(showToast).toHaveBeenCalledWith("error", "Enter a valid email address.");
    expect(renderToStaticMarkup(tree)).toContain("Please enter a real email address.");
  });

  it("submits valid exports and shows the success state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));
    const { FreeToolExportGate, reactMocks, showToast } = await loadGate();
    reactMocks.beginRender();
    let tree = FreeToolExportGate({ toolSlug: "roi", source: "free-tools", resultPayload: { score: 10 } });
    collect(tree, (element) => element.type === "input")[0]?.props.onChange({ target: { value: " Tina@Example.com " } });
    reactMocks.beginRender();
    tree = FreeToolExportGate({ toolSlug: "roi", source: "free-tools", resultPayload: { score: 10 } });
    await collect(tree, (element) => element.type === "form")[0]?.props.onSubmit({ preventDefault: vi.fn() } as FormEvent<HTMLFormElement>);
    reactMocks.beginRender();
    tree = FreeToolExportGate({ toolSlug: "roi", source: "free-tools", resultPayload: { score: 10 } });

    expect(fetch).toHaveBeenCalledWith("/api/public/free-tool-export", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ email: "tina@example.com", toolSlug: "roi", source: "free-tools", resultPayload: { score: 10 } })
    }));
    expect(showToast).toHaveBeenCalledWith("success", "Report sent.", "Check your inbox for the exported report.");
    expect(renderToStaticMarkup(tree)).toContain("Your report is on the way.");
  });
});
