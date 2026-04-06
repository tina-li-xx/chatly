import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "../dashboard/test-react-hooks";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
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

async function loadSignupForm(searchParams?: Record<string, string>) {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const router = { replace: vi.fn(), push: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() };
  const signupAction = vi.fn();
  const showToast = vi.fn();
  const trackGrometricsEvent = vi.fn();

  vi.doMock("next/navigation", () => ({
    useRouter: () => router,
    useSearchParams: () => ({ get: (key: string) => searchParams?.[key] ?? null })
  }));
  vi.doMock("react", async () => ({ ...(await reactMocks.moduleFactory()) }));
  vi.doMock("../login/actions", () => ({ signupAction }));
  vi.doMock("../ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));
  vi.doMock("@/lib/grometrics", () => ({ trackGrometricsEvent }));

  const module = await import("./signup-form");
  return { SignupForm: module.SignupForm, reactMocks, router, signupAction, showToast, trackGrometricsEvent };
}

describe("signup form actions", () => {
  beforeEach(() => vi.stubGlobal("FormData", MockFormData as unknown as typeof FormData));
  afterEach(() => vi.unstubAllGlobals());

  it("lets people reopen the standalone signup form from the verification notice", async () => {
    const { SignupForm, reactMocks, router, signupAction, trackGrometricsEvent } = await loadSignupForm({ ref: "hello" });
    signupAction.mockResolvedValue({
      ok: true,
      error: null,
      nextPath: null,
      fields: { email: "hello@example.com", password: "Password123!", websiteUrl: "https://example.com", referralCode: "HELLO" }
    });

    reactMocks.beginRender();
    let tree = SignupForm();
    await runMockEffects(reactMocks.effects);
    expect(router.prefetch).not.toHaveBeenCalled();

    collectElements(tree, (element) => element.type === "form")[0]?.props.onSubmit({
      preventDefault: vi.fn(),
      currentTarget: {
        __data: {
          email: "hello@example.com",
          password: "Password123!",
          websiteUrl: "https://example.com",
          referralCode: "hello"
        }
      }
    });
    await flushAsyncWork();

    const submittedFormData = signupAction.mock.calls[0]?.[1] as MockFormData;
    expect(submittedFormData.get("referralCode")).toBe("HELLO");
    expect(trackGrometricsEvent).toHaveBeenCalledWith("signup_completed", {
      source: "signup_page",
      flow: "self_serve",
      has_referral_code: true,
      has_website_url: true
    });
    expect(router.replace).not.toHaveBeenCalled();
    reactMocks.beginRender();
    tree = SignupForm();
    let html = renderToStaticMarkup(tree);
    expect(html).toContain("Check your email");
    expect(html).toContain("hello@example.com");
    expect(html).toContain("We sent a verification link to hello@example.com.");
    expect(html).toContain("Wrong email? Edit it and send a new link.");

    collectElements(tree, (element) => typeof element.type === "function" && element.props.children === "Edit email")[0]?.props.onClick();

    reactMocks.beginRender();
    tree = SignupForm();
    html = renderToStaticMarkup(tree);
    expect(html).toContain("Create your account");
    expect(html).toContain("Website URL");
    expect(html).toContain("Referral code");
    expect(html).toContain("hello@example.com");
  });

  it("keeps invite signup routing intact and toasts submit failures", async () => {
    const { SignupForm, reactMocks, router, signupAction, showToast } = await loadSignupForm({
      invite: "invite_123",
      email: "teammate@example.com"
    });
    signupAction.mockRejectedValue(new Error("boom"));

    reactMocks.beginRender();
    let tree = SignupForm();
    collectElements(tree, (element) => typeof element.type === "function" && element.props.actionLabel === "Sign in")[0]?.props.onAction();
    collectElements(tree, (element) => element.type === "form")[0]?.props.onSubmit({
      preventDefault: vi.fn(),
      currentTarget: { __data: { email: "teammate@example.com", password: "Password123!" } }
    });
    await flushAsyncWork();

    reactMocks.beginRender();
    tree = SignupForm();
    const html = renderToStaticMarkup(tree);
    expect(router.push).toHaveBeenCalledWith("/login?invite=invite_123&email=teammate%40example.com");
    expect(html).not.toContain("We couldn&#x27;t create your account right now. Please try again in a moment.");
    expect(showToast).toHaveBeenCalledWith("error", "We couldn't create your account right now. Please try again in a moment.");
    expect(html).toContain("Join workspace");
  });

  it("toasts returned signup errors without rendering them inline", async () => {
    const { SignupForm, reactMocks, signupAction, showToast, trackGrometricsEvent } = await loadSignupForm();
    signupAction.mockResolvedValue({
      ok: false,
      error: "That email already has an account.",
      nextPath: null,
      fields: {
        email: "hello@example.com",
        password: "Password123!",
        websiteUrl: "https://example.com",
        referralCode: ""
      }
    });

    reactMocks.beginRender();
    let tree = SignupForm();
    collectElements(tree, (element) => element.type === "form")[0]?.props.onSubmit({
      preventDefault: vi.fn(),
      currentTarget: {
        __data: {
          email: "hello@example.com",
          password: "Password123!",
          websiteUrl: "https://example.com"
        }
      }
    });
    await flushAsyncWork();

    reactMocks.beginRender();
    tree = SignupForm();
    expect(renderToStaticMarkup(tree)).not.toContain("That email already has an account.");
    expect(showToast).toHaveBeenCalledWith("error", "That email already has an account.");
    expect(trackGrometricsEvent).not.toHaveBeenCalled();
  });
});
