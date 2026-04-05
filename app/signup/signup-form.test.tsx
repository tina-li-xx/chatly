import { renderToStaticMarkup } from "react-dom/server";

async function renderSignupForm(searchParams?: Record<string, string>) {
  vi.resetModules();

  vi.doMock("next/navigation", () => ({
    useRouter: () => ({
      replace: vi.fn(),
      push: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn()
    }),
    useSearchParams: () => ({
      get: (key: string) => searchParams?.[key] ?? null
    })
  }));

  vi.doMock("react-dom", async () => {
    const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
    return {
      ...actual,
      useFormStatus: () => ({ pending: false })
    };
  });

  vi.doMock("../login/actions", () => ({
    signupAction: vi.fn()
  }));
  vi.doMock("../ui/toast-provider", () => ({ useToast: () => ({ showToast: vi.fn() }) }));

  vi.doMock("react", async () => {
    const actual = await vi.importActual<typeof import("react")>("react");

    return {
      ...actual,
      useEffect: vi.fn(),
      useActionState: vi.fn((_: unknown, initialState: unknown) => [initialState, vi.fn()]),
      useMemo: (factory: () => unknown) => factory(),
      useState: vi.fn((initialValue: unknown) => [initialValue, vi.fn()])
    };
  });

  const module = await import("./signup-form");
  return renderToStaticMarkup(<module.SignupForm />);
}

describe("signup form", () => {
  it("renders the standalone signup screen copy", async () => {
    const html = await renderSignupForm();

    expect(html).toContain("Start chatting in minutes");
    expect(html).toContain("Create your account");
    expect(html).toContain("Website URL");
    expect(html).toContain("Referral code");
    expect(html).toContain("Free");
    expect(html).toContain("3 min");
    expect(html).toContain("No CC");
    expect(html).toContain("Sign in");
  });

  it("renders invite signup without workspace setup fields", async () => {
    const html = await renderSignupForm({
      invite: "invite_123",
      email: "teammate@chatly.example"
    });

    expect(html).toContain("Join the workspace");
    expect(html).toContain("Create your teammate account");
    expect(html).toContain("Join workspace");
    expect(html).not.toContain("Website URL");
    expect(html).not.toContain("Referral code");
  });
});
