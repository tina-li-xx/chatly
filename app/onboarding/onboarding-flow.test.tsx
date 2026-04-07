import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks } from "../dashboard/test-react-hooks";

const routerMocks = vi.hoisted(() => ({
  replace: vi.fn()
}));

async function loadFlow() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};
  const trackGrometricsEvent = vi.fn();
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({
    useRouter: () => routerMocks
  }));
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

describe("onboarding flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it("surfaces a missing workspace error before customize submit", async () => {
    const { OnboardingFlow, captures, reactMocks } = await loadFlow();
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="customize" initialSite={null} />);
    await (captures.left as { onCustomizeContinue: () => Promise<void> }).onCustomizeContinue();
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="customize" initialSite={null} />);

    expect((captures.left as { customizeError: string }).customizeError).toContain("couldn't find your workspace");
  });

  it("saves customize settings and advances to install", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, site: { id: "site_1", name: "Docs", domain: "docs.usechatting.com" } })
      } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) } as Response);
    const { OnboardingFlow, captures, reactMocks, trackGrometricsEvent } = await loadFlow();
    reactMocks.beginRender();
    renderToStaticMarkup(
      <OnboardingFlow initialStep="customize" initialSite={{ id: "site_1", name: "Docs", domain: "" } as never} />
    );
    await (captures.left as { onCustomizeContinue: () => Promise<void> }).onCustomizeContinue();
    reactMocks.beginRender();
    renderToStaticMarkup(
      <OnboardingFlow initialStep="customize" initialSite={{ id: "site_1", name: "Docs", domain: "" } as never} />
    );

    expect(fetch).toHaveBeenCalledWith("/dashboard/sites/update", expect.any(Object));
    expect(trackGrometricsEvent).toHaveBeenCalledWith(
      "widget_settings_saved",
      expect.objectContaining({ source: "onboarding_customize" })
    );
    expect(routerMocks.replace).toHaveBeenCalledWith("/onboarding?step=install");
    expect((captures.left as { activeStep: string }).activeStep).toBe("install");
  });

  it("shows verification errors for missing workspaces and failed install checks", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ ok: false, error: "snippet-not-found" })
    } as Response);
    const { OnboardingFlow, captures, reactMocks } = await loadFlow();

    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={null} />);
    await (captures.left as { onVerifyInstallation: () => Promise<void> }).onVerifyInstallation();
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={null} />);
    expect((captures.left as { verificationState: string }).verificationState).toBe("error");
    expect((captures.left as { verificationMessage: string }).verificationMessage).toContain("couldn't find your workspace");

    const secondFlow = await loadFlow();
    secondFlow.reactMocks.beginRender();
    renderToStaticMarkup(
      <secondFlow.OnboardingFlow
        initialStep="install"
        initialSite={{ id: "site_1", name: "Docs", domain: "" } as never}
      />
    );
    await (secondFlow.captures.left as { onVerifyInstallation: () => Promise<void> }).onVerifyInstallation();
    secondFlow.reactMocks.beginRender();
    renderToStaticMarkup(
      <secondFlow.OnboardingFlow
        initialStep="install"
        initialSite={{ id: "site_1", name: "Docs", domain: "" } as never}
      />
    );

    expect((secondFlow.captures.left as { verificationState: string }).verificationState).toBe("error");
    expect((secondFlow.captures.left as { verificationMessage: string }).verificationMessage).toContain("Save your website URL first");
  });

  it("verifies installs and completes onboarding for both skip and redirect flows", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          detected: true,
          checkedUrl: "https://docs.usechatting.com/pricing",
          site: { id: "site_1", name: "Docs", domain: "docs.usechatting.com", widgetInstallVerifiedAt: "2026-03-29T00:00:00.000Z" }
        })
      } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) } as Response)
      .mockRejectedValueOnce(new Error("network"));
    const { OnboardingFlow, captures, reactMocks } = await loadFlow();

    reactMocks.beginRender();
    renderToStaticMarkup(
      <OnboardingFlow initialStep="install" initialSite={{ id: "site_1", name: "Docs", domain: "docs.usechatting.com" } as never} />
    );
    await (captures.left as { onVerifyInstallation: () => Promise<void> }).onVerifyInstallation();
    reactMocks.beginRender();
    renderToStaticMarkup(
      <OnboardingFlow initialStep="install" initialSite={{ id: "site_1", name: "Docs", domain: "docs.usechatting.com" } as never} />
    );

    expect((captures.left as { verificationState: string }).verificationState).toBe("verified");
    expect((captures.left as { verificationMessage: string }).verificationMessage).toContain("https://docs.usechatting.com/pricing");

    await (captures.left as { onSkipInstall: () => Promise<void> }).onSkipInstall();
    expect(routerMocks.replace).toHaveBeenCalledWith("/dashboard");

    await (captures.left as { onCompleteAndGo: (path: string) => Promise<void> }).onCompleteAndGo("/dashboard/widget");
    expect(routerMocks.replace).toHaveBeenCalledWith("/dashboard/widget");
  });
});
