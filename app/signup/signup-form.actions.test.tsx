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

  vi.doMock("next/navigation", () => ({
    useRouter: () => router,
    useSearchParams: () => ({ get: (key: string) => searchParams?.[key] ?? null })
  }));
  vi.doMock("react", async () => ({ ...(await reactMocks.moduleFactory()) }));
  vi.doMock("../login/actions", () => ({ signupAction }));

  const module = await import("./signup-form");
  return { SignupForm: module.SignupForm, reactMocks, router, signupAction };
}

describe("signup form actions", () => {
  beforeEach(() => vi.stubGlobal("FormData", MockFormData as unknown as typeof FormData));
  afterEach(() => vi.unstubAllGlobals());

  it("prefetches onboarding and submits the standalone signup flow", async () => {
    const { SignupForm, reactMocks, router, signupAction } = await loadSignupForm({ ref: "hello" });
    signupAction.mockResolvedValue({
      ok: true,
      error: null,
      nextPath: "/dashboard",
      fields: { email: "hello@example.com", password: "Password123!", websiteUrl: "https://example.com", referralCode: "HELLO" }
    });

    reactMocks.beginRender();
    let tree = SignupForm();
    await runMockEffects(reactMocks.effects);
    expect(router.prefetch).toHaveBeenCalledWith("/onboarding?step=customize");

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
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });
});
