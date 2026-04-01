import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "../dashboard/test-react-hooks";
function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  const renderedChildren =
    typeof element.type === "function" ? (element.type as (props: Record<string, unknown>) => ReactNode)(element.props) : element.props?.children;
  return [...(predicate(element) ? [element] : []), ...collectElements(renderedChildren, predicate)];
}

function textContent(node: ReactNode): string {
  if (!node || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  return textContent((node as ReactElement).props?.children);
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
async function flushAsyncWork() {
  for (let index = 0; index < 6; index += 1) await Promise.resolve();
}
function submitForm(tree: ReactNode, data: Record<string, string>) {
  collectElements(tree, (element) => element.type === "form")[0]?.props.onSubmit({
    preventDefault: vi.fn(),
    currentTarget: { __data: data }
  });
}
async function loadAuthForms(options: { loginState?: Record<string, unknown> } = {}) {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const router = { replace: vi.fn(), push: vi.fn(), refresh: vi.fn() };
  const forgotPasswordAction = vi.fn();
  const resendVerificationAction = vi.fn();
  const resetPasswordAction = vi.fn();
  const showToast = vi.fn();
  vi.doMock("next/navigation", () => ({ useRouter: () => router }));
  vi.doMock("react-dom", async () => {
    const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
    return { ...actual, useFormStatus: () => ({ pending: false }) };
  });
  vi.doMock("react", async () => {
    const actual = await reactMocks.moduleFactory();
    return {
      ...actual,
      useActionState: vi.fn(() => [
        {
          error: null,
          ok: false,
          nextPath: null,
          fields: { email: "", password: "", websiteUrl: "", referralCode: "" },
          ...options.loginState
        },
        vi.fn()
      ])
    };
  });
  vi.doMock("./actions", () => ({
    loginAction: vi.fn(),
  }));
  vi.doMock("./password-actions", () => ({
    forgotPasswordAction,
    resendVerificationAction,
    resetPasswordAction
  }));
  vi.doMock("../ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));
  const module = await import("./auth-forms");
  return {
    AuthForms: module.AuthForms,
    reactMocks,
    router,
    forgotPasswordAction,
    resendVerificationAction,
    resetPasswordAction,
    showToast
  };
}
describe("auth forms actions", () => {
  beforeEach(() => vi.stubGlobal("FormData", MockFormData as unknown as typeof FormData));
  afterEach(() => vi.unstubAllGlobals());
  it("redirects successful logins, toasts login errors, and handles forgot-password retries", async () => {
    const { AuthForms, reactMocks, router, showToast } = await loadAuthForms({
      loginState: { ok: true, nextPath: "/dashboard" }
    });

    reactMocks.beginRender();
    AuthForms({});
    await runMockEffects(reactMocks.effects);
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
    expect(showToast).not.toHaveBeenCalled();

    const loginErrorFlow = await loadAuthForms({
      loginState: { error: "Work email is required." }
    });
    const { AuthForms: LoginErrorForms, reactMocks: loginErrorReactMocks, showToast: loginErrorToast } = loginErrorFlow;
    loginErrorReactMocks.beginRender();
    LoginErrorForms({});
    await runMockEffects(loginErrorReactMocks.effects);
    expect(loginErrorToast).toHaveBeenCalledWith("error", "Work email is required.");

    loginErrorReactMocks.beginRender();
    LoginErrorForms({});
    await runMockEffects(loginErrorReactMocks.effects);
    expect(loginErrorToast).toHaveBeenCalledTimes(1);

    const forgotFlow = await loadAuthForms();
    const { AuthForms: ForgotAuthForms, reactMocks: forgotReactMocks, forgotPasswordAction, showToast: forgotToast } = forgotFlow;
    forgotPasswordAction
      .mockResolvedValueOnce({ ok: false, error: "Email missing." })
      .mockResolvedValueOnce({ ok: true, error: null, message: "Reset sent." });
    forgotReactMocks.beginRender();
    let tree = ForgotAuthForms({ initialMode: "forgot" });
    submitForm(tree, { email: "hello@example.com" });
    await flushAsyncWork();

    forgotReactMocks.beginRender();
    tree = ForgotAuthForms({ initialMode: "forgot" });
    expect(renderToStaticMarkup(tree)).not.toContain("Email missing.");
    expect(forgotToast).toHaveBeenCalledWith("error", "Email missing.");
    submitForm(tree, { email: "hello@example.com" });
    await flushAsyncWork();
    forgotReactMocks.beginRender();
    tree = ForgotAuthForms({ initialMode: "forgot" });
    const html = renderToStaticMarkup(tree);
    expect(html).toContain("Reset email sent");
    expect(html).toContain("Reset sent.");
  });

  it("submits password resets with the token and returns to auth actions", async () => {
    const { AuthForms, reactMocks, router, resetPasswordAction } = await loadAuthForms();
    resetPasswordAction.mockResolvedValue({ ok: true, error: null, message: "Password reset complete." });
    reactMocks.beginRender();
    let tree = AuthForms({ initialMode: "reset", resetToken: "token_123" });
    submitForm(tree, { password: "Password123!", confirmPassword: "Password123!" });
    await flushAsyncWork();
    const submittedFormData = resetPasswordAction.mock.calls[0]?.[0] as MockFormData;
    expect(submittedFormData.get("token")).toBe("token_123");
    reactMocks.beginRender();
    tree = AuthForms({ initialMode: "reset", resetToken: "token_123" });
    expect(renderToStaticMarkup(tree)).toContain("Password updated");

    const buttons = collectElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        typeof element.props.onClick === "function" &&
        textContent(element.props.children).length > 0
    );
    buttons.find((element) => textContent(element.props.children).includes("Create account"))?.props.onClick();
    buttons.find((element) => textContent(element.props.children).includes("Back to sign in"))?.props.onClick();
    reactMocks.beginRender();
    tree = AuthForms({ initialMode: "reset", resetToken: "token_123" });
    expect(router.push).toHaveBeenCalledWith("/signup");
    expect(renderToStaticMarkup(tree)).toContain("Sign in");
  });

  it("submits resend-verification requests and shows confirmation copy", async () => {
    const { AuthForms, reactMocks, resendVerificationAction, showToast } = await loadAuthForms();
    resendVerificationAction
      .mockResolvedValueOnce({ ok: false, error: "Email missing." })
      .mockResolvedValueOnce({ ok: true, error: null, message: "Verification sent." });
    reactMocks.beginRender();
    let tree = AuthForms({ initialMode: "verify" });
    submitForm(tree, { email: "hello@example.com" });
    await flushAsyncWork();
    reactMocks.beginRender();
    tree = AuthForms({ initialMode: "verify" });
    expect(showToast).toHaveBeenCalledWith("error", "Email missing.");
    submitForm(tree, { email: "hello@example.com" });
    await flushAsyncWork();
    reactMocks.beginRender();
    tree = AuthForms({ initialMode: "verify" });
    const html = renderToStaticMarkup(tree);
    expect(html).toContain("Verification email sent");
    expect(html).toContain("Verification sent.");
  });
});
