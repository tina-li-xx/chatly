import type { ReactElement, ReactNode } from "react";
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

async function loadResults() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
  vi.stubGlobal("navigator", { clipboard });
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("../../ui/form-controls", () => ({
    FormButton: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>
  }));
  vi.doMock("../free-tool-export-gate", () => ({
    FreeToolExportGate: (props: unknown) => <div data-export={JSON.stringify(props)} />
  }));
  const module = await import("./response-tone-checker-results");
  return { ResponseToneCheckerResults: module.ResponseToneCheckerResults, reactMocks, clipboard };
}

const analysis = {
  overall_score: 8,
  overall_label: "Good",
  dimensions: {
    friendliness: { score: 8, note: "Warm." },
    professionalism: { score: 7, note: "Clear." },
    empathy: { score: 6, note: "Solid." },
    clarity: { score: 9, note: "Sharp." },
    helpfulness: { score: 8, note: "Actionable." }
  },
  issues: [{ text: "Unfortunately", issue: "Negative framing", suggestion: "Lead with what you can do" }],
  strengths: ["Clear next step"],
  rewritten: "Hi there! Here is what I can do next."
};

describe("response tone checker results", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders issues, strengths, and toggles the copy state", async () => {
    const { ResponseToneCheckerResults, reactMocks, clipboard } = await loadResults();
    reactMocks.beginRender();
    let tree = ResponseToneCheckerResults({ analysis, contextLabel: "General", message: "Hello" });
    await collect(tree, (element) => element.type === "button")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = ResponseToneCheckerResults({ analysis, contextLabel: "General", message: "Hello" });

    expect(clipboard.writeText).toHaveBeenCalledWith("Hi there! Here is what I can do next.");
    expect(renderToStaticMarkup(tree)).toContain("Copied");
    expect(renderToStaticMarkup(tree)).toContain("Negative framing");
    expect(renderToStaticMarkup(tree)).toContain("Clear next step");
  });

  it("shows the no-issues copy when nothing is flagged", async () => {
    const { ResponseToneCheckerResults, reactMocks } = await loadResults();
    reactMocks.beginRender();
    const html = renderToStaticMarkup(ResponseToneCheckerResults({
      analysis: { ...analysis, issues: [] },
      contextLabel: "General",
      message: "Hello"
    }));
    expect(html).toContain("No obvious phrasing issues were flagged");
  });
});
