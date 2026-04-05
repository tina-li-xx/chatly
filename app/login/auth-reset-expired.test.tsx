import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks } from "../dashboard/test-react-hooks";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  const renderedChildren =
    typeof element.type === "function"
      ? (element.type as (props: Record<string, unknown>) => ReactNode)(element.props)
      : element.props?.children;
  return [...(predicate(element) ? [element] : []), ...collectElements(renderedChildren, predicate)];
}

class MockFormData {
  private values: Map<string, string>;
  constructor(target?: { __data?: Record<string, string> }) {
    this.values = new Map(Object.entries(target?.__data ?? {}));
  }
  get(key: string) {
    return this.values.get(key) ?? null;
  }
  set(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("auth reset expired state", () => {
  beforeEach(() => vi.stubGlobal("FormData", MockFormData as unknown as typeof FormData));
  afterEach(() => vi.unstubAllGlobals());

  it("falls back to the forgot-password form when the reset token is invalid", async () => {
    vi.resetModules();
    const reactMocks = createMockReactHooks();
    const resetPasswordAction = vi.fn().mockResolvedValue({
      ok: false,
      error: "That reset link is invalid or has expired.",
      message: null,
      nextPath: null
    });
    const showToast = vi.fn();

    vi.doMock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }) }));
    vi.doMock("react-dom", async () => ({ ...(await vi.importActual<typeof import("react-dom")>("react-dom")), useFormStatus: () => ({ pending: false }) }));
    vi.doMock("react", async () => ({ ...(await reactMocks.moduleFactory()), useActionState: vi.fn(() => [{ error: null, ok: false, nextPath: null, fields: { email: "", password: "", websiteUrl: "", referralCode: "" } }, vi.fn()]) }));
    vi.doMock("./actions", () => ({ loginAction: vi.fn() }));
    vi.doMock("./password-actions", () => ({ forgotPasswordAction: vi.fn(), resendVerificationAction: vi.fn(), resetPasswordAction }));
    vi.doMock("../ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));

    const module = await import("./auth-forms");
    reactMocks.beginRender();
    let tree = module.AuthForms({ initialMode: "reset", resetToken: "expired_token" });
    collectElements(tree, (element) => element.type === "form")[0]?.props.onSubmit({
      preventDefault: vi.fn(),
      currentTarget: { __data: { password: "Password123!", confirmPassword: "Password123!" } }
    });
    await Promise.resolve();
    await Promise.resolve();

    reactMocks.beginRender();
    tree = module.AuthForms({ initialMode: "reset", resetToken: "expired_token" });
    const html = renderToStaticMarkup(tree);

    expect(showToast).toHaveBeenCalledWith("error", "That reset link is invalid or has expired.");
    expect(html).toContain("Forgot password");
    expect(html).toContain("Send reset link");
  });
});
