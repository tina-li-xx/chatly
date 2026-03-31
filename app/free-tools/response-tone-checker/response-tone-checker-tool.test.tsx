import type { FormEvent, ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks } from "../../dashboard/test-react-hooks";

function collect(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collect(child, predicate));
  const element = node as ReactElement;
  if (typeof element.type === "function") {
    return collect((element.type as (props: unknown) => ReactNode)(element.props), predicate);
  }
  return [...(predicate(element) ? [element] : []), ...collect(element.props?.children, predicate)];
}

async function loadTool(validation: string | null) {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const showToast = vi.fn();
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("../../ui/form-controls", () => ({
    FormButton: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
    FormSelect: ({ children, ...props }: Record<string, unknown>) => <select {...props}>{children}</select>,
    FormTextarea: (props: Record<string, unknown>) => <textarea {...props} />
  }));
  vi.doMock("../../ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));
  vi.doMock("../free-tool-page-shared", () => ({ FreeToolEmptyResults: () => <div>empty-results</div> }));
  vi.doMock("./response-tone-checker-results", () => ({
    ResponseToneCheckerResults: (props: unknown) => <div data-result={JSON.stringify(props)} />
  }));
  vi.doMock("@/lib/response-tone-checker", () => ({
    responseToneContexts: [{ value: "general", label: "General" }, { value: "refund", label: "Refund" }],
    validateResponseToneMessage: () => validation
  }));
  const module = await import("./response-tone-checker-tool");
  return { ResponseToneCheckerTool: module.ResponseToneCheckerTool, reactMocks, showToast };
}

describe("response tone checker tool", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a toast instead of submitting invalid drafts", async () => {
    const { ResponseToneCheckerTool, reactMocks, showToast } = await loadTool("MESSAGE_TOO_SHORT");
    reactMocks.beginRender();
    const tree = ResponseToneCheckerTool();
    await collect(tree, (element) => element.type === "form")[0]?.props.onSubmit({ preventDefault: vi.fn() } as FormEvent<HTMLFormElement>);

    expect(showToast).toHaveBeenCalledWith("error", "Message is too short.");
    expect(renderToStaticMarkup(tree)).toContain("empty-results");
  });

  it("submits valid drafts and renders the analysis result", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ analysis: { overall_score: 8 } })
    }));
    const { ResponseToneCheckerTool, reactMocks } = await loadTool(null);
    reactMocks.beginRender();
    let tree = ResponseToneCheckerTool();
    await collect(tree, (element) => element.type === "form")[0]?.props.onSubmit({ preventDefault: vi.fn() } as FormEvent<HTMLFormElement>);
    reactMocks.beginRender();
    tree = ResponseToneCheckerTool();

    expect(fetch).toHaveBeenCalledWith("/api/public/response-tone-checker", expect.objectContaining({ method: "POST" }));
    expect(renderToStaticMarkup(tree)).toContain("data-result");
  });
});
