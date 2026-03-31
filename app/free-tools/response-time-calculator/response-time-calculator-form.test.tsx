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

async function loadForm() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const calculateResponseTimeGrade = vi.fn();
  const captures: Record<string, unknown[]> = { metrics: [] };
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("../../ui/form-controls", () => ({
    FormButton: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
    FormInput: (props: Record<string, unknown>) => <input {...props} />,
    FormSelect: ({ children, ...props }: Record<string, unknown>) => <select {...props}>{children}</select>
  }));
  vi.doMock("@/lib/response-time-tool", () => ({ calculateResponseTimeGrade, ResponseTimeIndustry: {} }));
  vi.doMock("../free-tool-page-shared", () => ({
    FreeToolBenchmarkBar: (props: unknown) => ((captures.bar = props), <div>bar</div>),
    FreeToolEmptyResults: () => <div>empty-results</div>,
    FreeToolGradeCard: (props: unknown) => ((captures.grade = props), <div>grade-card</div>),
    FreeToolMetricCard: (props: unknown) => ((captures.metrics.push(props), <div>metric-card</div>)
    )
  }));
  vi.doMock("../free-tool-export-gate", () => ({
    FreeToolExportGate: (props: unknown) => ((captures.exportGate = props), <div>export-gate</div>)
  }));
  const module = await import("./response-time-calculator-form");
  return { ResponseTimeCalculatorForm: module.ResponseTimeCalculatorForm, calculateResponseTimeGrade, reactMocks, captures };
}

describe("response time calculator form", () => {
  it("renders the empty state before a calculation exists", async () => {
    const { ResponseTimeCalculatorForm, reactMocks } = await loadForm();
    reactMocks.beginRender();
    const html = renderToStaticMarkup(ResponseTimeCalculatorForm());
    expect(html).toContain("empty-results");
  });

  it("calculates a result and passes it into the result panels", async () => {
    const { ResponseTimeCalculatorForm, calculateResponseTimeGrade, reactMocks, captures } = await loadForm();
    calculateResponseTimeGrade.mockReturnValue({
      grade: "B",
      summary: "Strong",
      responseTimeMinutes: 12,
      averageBenchmark: 15,
      topPerformerBenchmark: 5,
      tips: ["Shorten handoffs", "Tighten alerts"]
    });

    reactMocks.beginRender();
    let tree = ResponseTimeCalculatorForm();
    const inputs = collect(tree, (element) => element.type === "input");
    inputs[0]?.props.onChange({ target: { value: "18" } });
    inputs[1]?.props.onChange({ target: { value: "4" } });
    reactMocks.beginRender();
    tree = ResponseTimeCalculatorForm();
    await collect(tree, (element) => element.type === "form")[0]?.props.onSubmit({ preventDefault: vi.fn() } as FormEvent<HTMLFormElement>);
    reactMocks.beginRender();
    tree = ResponseTimeCalculatorForm();

    expect(calculateResponseTimeGrade).toHaveBeenCalledWith("ecommerce", 18, 4);
    expect(renderToStaticMarkup(tree)).toContain("grade-card");
    expect(captures.exportGate).toMatchObject({ toolSlug: "response-time-calculator", source: "free-tools-response-time" });
    expect(captures.bar).toMatchObject({ average: 15, top: 5, current: 12 });
  });
});
