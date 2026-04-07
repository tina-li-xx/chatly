import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks } from "../dashboard/test-react-hooks";

const routerMocks = vi.hoisted(() => ({ replace: vi.fn() }));

async function loadFlow() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};
  const trackGrometricsEvent = vi.fn();
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({ useRouter: () => routerMocks }));
  vi.doMock("@/lib/grometrics", () => ({ trackGrometricsEvent }));
  vi.doMock("./onboarding-flow-sections", () => ({
    OnboardingLeftPanel: (props: unknown) => ((captures.left = props), <div>left-panel</div>)
  }));
  vi.doMock("./onboarding-flow-ui", () => ({
    PreviewWidget: (props: unknown) => ((captures.preview = props), <div>preview</div>),
    VerifiedInstallPreview: (props: unknown) => ((captures.verified = props), <div>verified</div>)
  }));

  const module = await import("./onboarding-flow");
  return { OnboardingFlow: module.OnboardingFlow, captures, reactMocks, trackGrometricsEvent };
}

describe("onboarding flow actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    vi.stubGlobal("setTimeout", vi.fn());
  });

  afterEach(() => vi.unstubAllGlobals());

  it("updates customize state from left-panel callbacks and copies the install snippet", async () => {
    const { OnboardingFlow, captures, reactMocks, trackGrometricsEvent } = await loadFlow();
    const initialSite = { id: "site_1", name: "Docs", domain: "", brandColor: "#2563EB" } as never;

    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="customize" initialSite={initialSite} />);
    (captures.left as { onDomainChange: (value: string) => void }).onDomainChange("https://docs.example.com");
    (captures.left as { onBrandColorInputChange: (value: string) => void }).onBrandColorInputChange("00FF00");

    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="customize" initialSite={initialSite} />);
    expect((captures.preview as { draft: { domain: string; brandColor: string } }).draft).toMatchObject({
      domain: "https://docs.example.com",
      brandColor: "#00FF00"
    });

    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={{ ...initialSite, domain: "docs.example.com" }} />);
    await (captures.left as { onCopyCode: () => Promise<void> }).onCopyCode();

    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={{ ...initialSite, domain: "docs.example.com" }} />);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(trackGrometricsEvent).toHaveBeenCalledWith("widget_snippet_copied", {
      source: "onboarding_install",
      platform: "code"
    });
    expect((captures.left as { copiedCode: boolean }).copiedCode).toBe(true);
  });

  it("handles install verification failures, successes, finish, and complete-and-go actions", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, detected: false, error: "snippet-not-found" }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, detected: true, checkedUrl: "https://docs.example.com", site: { id: "site_1", name: "Docs", domain: "docs.example.com", widgetInstallVerifiedAt: "2026-03-29T10:00:00.000Z" } }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) } as Response);

    const { OnboardingFlow, captures, reactMocks, trackGrometricsEvent } = await loadFlow();
    const initialSite = { id: "site_1", name: "Docs", domain: "docs.example.com" } as never;

    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={initialSite} />);
    await (captures.left as { onVerifyInstallation: () => Promise<void> }).onVerifyInstallation();
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={initialSite} />);
    expect((captures.left as { verificationState: string; verificationMessage: string }).verificationState).toBe("error");

    await (captures.left as { onVerifyInstallation: () => Promise<void> }).onVerifyInstallation();
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={initialSite} />);
    expect((captures.left as { showInstallSuccess: boolean }).showInstallSuccess).toBe(true);
    expect(trackGrometricsEvent).toHaveBeenCalledWith("widget_installation_verified", {
      source: "onboarding_install"
    });

    await (captures.left as { onSkipInstall: () => Promise<void> }).onSkipInstall();
    await (captures.left as { onCompleteAndGo: (path: string) => Promise<void> }).onCompleteAndGo("/dashboard/inbox");

    expect(trackGrometricsEvent).toHaveBeenNthCalledWith(2, "onboarding_completed", {
      source: "onboarding_install",
      destination: "/dashboard",
      installation_verified: true
    });
    expect(trackGrometricsEvent).toHaveBeenNthCalledWith(3, "onboarding_completed", {
      source: "onboarding_install",
      destination: "/dashboard/inbox",
      installation_verified: true
    });
    expect(routerMocks.replace).toHaveBeenCalledWith("/dashboard");
    expect(routerMocks.replace).toHaveBeenCalledWith("/dashboard/inbox");
    expect(fetch).toHaveBeenCalledWith("/onboarding/complete", expect.any(Object));
  });
});
