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

function textOf(node: ReactNode): string {
  if (!node || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  return textOf((node as ReactElement).props?.children);
}

async function loadForm() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const generateWelcomeMessageVariants = vi.fn();
  vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("../../ui/form-controls", () => ({
    FormButton: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
    FormSelect: ({ children, ...props }: Record<string, unknown>) => <select {...props}>{children}</select>
  }));
  vi.doMock("../free-tool-page-shared", () => ({ FreeToolEmptyResults: () => <div>empty-results</div> }));
  vi.doMock("../free-tool-export-gate", () => ({
    FreeToolExportGate: (props: unknown) => <div data-export={JSON.stringify(props)} />
  }));
  vi.doMock("@/lib/welcome-message-generator", () => ({ generateWelcomeMessageVariants }));
  const module = await import("./welcome-message-generator-form");
  return { WelcomeMessageGeneratorForm: module.WelcomeMessageGeneratorForm, generateWelcomeMessageVariants, reactMocks };
}

describe("welcome message generator form", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the empty state before any generation happens", async () => {
    const { WelcomeMessageGeneratorForm, reactMocks } = await loadForm();
    reactMocks.beginRender();
    const html = renderToStaticMarkup(WelcomeMessageGeneratorForm());
    expect(html).toContain("empty-results");
  });

  it("generates variants, supports copy, and wires the export gate", async () => {
    const { WelcomeMessageGeneratorForm, generateWelcomeMessageVariants, reactMocks } = await loadForm();
    generateWelcomeMessageVariants.mockReturnValue([
      { id: "one", label: "Primary", message: "Hello there" },
      { id: "two", label: "Alternate", message: "Need a hand?" },
      { id: "three", label: "Short", message: "Questions?" }
    ]);

    reactMocks.beginRender();
    let tree = WelcomeMessageGeneratorForm();
    await collect(tree, (element) => element.type === "form")[0]?.props.onSubmit({ preventDefault: vi.fn() } as FormEvent<HTMLFormElement>);
    reactMocks.beginRender();
    tree = WelcomeMessageGeneratorForm();
    await collect(tree, (element) => element.type === "button" && textOf(element.props.children).includes("Copy"))[0]?.props.onClick();
    reactMocks.beginRender();
    tree = WelcomeMessageGeneratorForm();

    expect(generateWelcomeMessageVariants).toHaveBeenCalledWith("pricing", "friendly", 0);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Hello there");
    expect(renderToStaticMarkup(tree)).toContain("Copied");
    expect(renderToStaticMarkup(tree)).toContain("data-export");
  });
});
