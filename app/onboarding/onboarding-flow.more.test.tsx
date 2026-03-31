import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "../dashboard/test-react-hooks";

const routerMocks = vi.hoisted(() => ({ replace: vi.fn() }));

async function loadFlow() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({ useRouter: () => routerMocks }));
  vi.doMock("./onboarding-done-screen", () => ({ OnboardingDoneScreen: () => <div>done-screen</div> }));
  vi.doMock("./onboarding-flow-sections", () => ({
    OnboardingLeftPanel: (props: unknown) => ((captures.left = props), <div>left-panel</div>)
  }));
  vi.doMock("./onboarding-flow-ui", () => ({
    PreviewWidget: (props: unknown) => ((captures.preview = props), <div>preview</div>),
    VerifiedInstallPreview: (props: unknown) => ((captures.verified = props), <div>verified</div>)
  }));
  const module = await import("./onboarding-flow");
  return { OnboardingFlow: module.OnboardingFlow, captures, reactMocks };
}

describe("onboarding flow more", () => {
  beforeEach(() => vi.clearAllMocks());

  it("surfaces domain-specific customize errors and falls back to the generic save failure", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: "site-domain-required" }) })
      .mockRejectedValueOnce(new Error("network")));
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const first = await loadFlow();
    first.reactMocks.beginRender();
    renderToStaticMarkup(<first.OnboardingFlow initialStep="customize" initialSite={{ id: "site_1", name: "Docs", domain: "" } as never} />);
    await (first.captures.left as { onCustomizeContinue: () => Promise<void> }).onCustomizeContinue();
    first.reactMocks.beginRender();
    renderToStaticMarkup(<first.OnboardingFlow initialStep="customize" initialSite={{ id: "site_1", name: "Docs", domain: "" } as never} />);
    expect((first.captures.left as { customizeError: string }).customizeError).toBe("Add your website URL before continuing.");

    const second = await loadFlow();
    second.reactMocks.beginRender();
    renderToStaticMarkup(<second.OnboardingFlow initialStep="customize" initialSite={{ id: "site_1", name: "Docs", domain: "" } as never} />);
    await (second.captures.left as { onCustomizeContinue: () => Promise<void> }).onCustomizeContinue();
    second.reactMocks.beginRender();
    renderToStaticMarkup(<second.OnboardingFlow initialStep="customize" initialSite={{ id: "site_1", name: "Docs", domain: "" } as never} />);
    expect((second.captures.left as { customizeError: string }).customizeError).toBe("We couldn't save your widget settings right now.");
  });

  it("resets invalid brand colors on blur and swallows clipboard copy failures", async () => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("blocked")) } });
    const { OnboardingFlow, captures, reactMocks } = await loadFlow();
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="customize" initialSite={{ id: "site_1", name: "Docs", domain: "", brandColor: "#112233" } as never} />);
    (captures.left as { onBrandColorInputChange: (value: string) => void }).onBrandColorInputChange("xyz");
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="customize" initialSite={{ id: "site_1", name: "Docs", domain: "", brandColor: "#112233" } as never} />);
    (captures.left as { onBrandColorInputBlur: () => void }).onBrandColorInputBlur();
    await (captures.left as { onCopyCode: () => Promise<void> }).onCopyCode();
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="customize" initialSite={{ id: "site_1", name: "Docs", domain: "", brandColor: "#112233" } as never} />);

    expect((captures.left as { brandColorInput: string }).brandColorInput).toBe("112233");
    expect((captures.left as { copiedCode: boolean }).copiedCode).toBe(false);
  });

  it("applies detected-site payloads on failed verification, handles generic failures, and lets install go back", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, detected: false, error: "site-not-found", site: { id: "site_1", name: "Docs", domain: "docs.usechatting.com" } })
      })
      .mockRejectedValueOnce(new Error("network")));
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const { OnboardingFlow, captures, reactMocks } = await loadFlow();

    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={{ id: "site_1", name: "Docs", domain: "docs.usechatting.com" } as never} />);
    await (captures.left as { onVerifyInstallation: () => Promise<void> }).onVerifyInstallation();
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={{ id: "site_1", name: "Docs", domain: "docs.usechatting.com" } as never} />);
    expect((captures.left as { verificationMessage: string }).verificationMessage).toBe("We couldn't find this site anymore.");

    await (captures.left as { onVerifyInstallation: () => Promise<void> }).onVerifyInstallation();
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={{ id: "site_1", name: "Docs", domain: "docs.usechatting.com" } as never} />);
    expect((captures.left as { verificationMessage: string }).verificationMessage).toBe("We couldn't verify the widget right now. Try again in a moment.");

    (captures.left as { onBack: () => void }).onBack();
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={{ id: "site_1", name: "Docs", domain: "docs.usechatting.com" } as never} />);
    expect((captures.left as { activeStep: string }).activeStep).toBe("customize");
  });

  it("executes the customize callbacks and falls back to the detected site url when verification succeeds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        detected: true,
        site: {
          id: "site_1",
          name: "Docs",
          domain: "docs.usechatting.com",
          widgetLastSeenAt: "2026-03-29T00:00:00.000Z",
          widgetLastSeenUrl: "https://docs.usechatting.com/pricing"
        }
      })
    }));
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const customize = await loadFlow();
    customize.reactMocks.beginRender();
    renderToStaticMarkup(<customize.OnboardingFlow initialStep="customize" initialSite={{ id: "site_1", name: "Docs", domain: "" } as never} />);
    const left = customize.captures.left as {
      onDomainChange: (value: string) => void;
      onWidgetTitleChange: (value: string) => void;
      onBrandColorInputChange: (value: string) => void;
      onBrandColorPickerChange: (value: string) => void;
      onAvatarStyleChange: (value: string) => void;
      onLauncherPositionChange: (value: string) => void;
      onShowOnlineStatusToggle: () => void;
      onResponseTimeModeChange: (value: string) => void;
      onInstallTabChange: (value: string) => void;
    };
    left.onDomainChange("docs.usechatting.com");
    left.onWidgetTitleChange("Need help?");
    left.onBrandColorInputChange("AABBCC");
    left.onBrandColorPickerChange("#010203");
    left.onAvatarStyleChange("photos");
    left.onLauncherPositionChange("left");
    left.onShowOnlineStatusToggle();
    left.onResponseTimeModeChange("hours");
    left.onInstallTabChange("nextjs");
    customize.reactMocks.beginRender();
    renderToStaticMarkup(<customize.OnboardingFlow initialStep="customize" initialSite={{ id: "site_1", name: "Docs", domain: "" } as never} />);

    expect((customize.captures.left as { brandColorInput: string; installSnippet: string }).brandColorInput).toBe("010203");
    expect((customize.captures.left as { installSnippet: string }).installSnippet).toContain("next/script");
    expect((customize.captures.preview as { draft: Record<string, unknown> }).draft).toMatchObject({
      domain: "docs.usechatting.com",
      widgetTitle: "Need help?",
      avatarStyle: "photos",
      launcherPosition: "left",
      showOnlineStatus: false,
      responseTimeMode: "hours"
    });
    const install = await loadFlow();
    install.reactMocks.beginRender();
    renderToStaticMarkup(<install.OnboardingFlow initialStep="install" initialSite={{ id: "site_1", name: "Docs", domain: "docs.usechatting.com" } as never} />);
    await (install.captures.left as { onVerifyInstallation: () => Promise<void> }).onVerifyInstallation();
    install.reactMocks.beginRender();
    renderToStaticMarkup(<install.OnboardingFlow initialStep="install" initialSite={{ id: "site_1", name: "Docs", domain: "docs.usechatting.com" } as never} />);
    expect((install.captures.left as { verificationMessage: string }).verificationMessage).toContain("https://docs.usechatting.com/pricing");
  });

  it("hydrates verified installs from the initial site and preserves valid brand-color blur input", async () => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const { OnboardingFlow, captures, reactMocks } = await loadFlow();
    reactMocks.beginRender();
    renderToStaticMarkup(
      <OnboardingFlow
        initialStep="install"
        initialSite={{ id: "site_1", name: "Docs", domain: "docs.usechatting.com", brandColor: "#AABBCC", widgetLastSeenAt: "2026-03-29T00:00:00.000Z" } as never}
      />
    );
    await runMockEffects(reactMocks.effects);
    (captures.left as { onBrandColorInputChange: (value: string) => void; onBrandColorInputBlur: () => void }).onBrandColorInputChange("DDEEFF");
    (captures.left as { onDomainChange: (value: string) => void }).onDomainChange("docs.usechatting.com/help");
    reactMocks.beginRender();
    renderToStaticMarkup(
      <OnboardingFlow
        initialStep="install"
        initialSite={{ id: "site_1", name: "Docs", domain: "docs.usechatting.com", brandColor: "#AABBCC", widgetLastSeenAt: "2026-03-29T00:00:00.000Z" } as never}
      />
    );
    await runMockEffects(reactMocks.effects);
    (captures.left as { onBrandColorInputBlur: () => void }).onBrandColorInputBlur();
    expect((captures.left as { verificationState: string; brandColorInput: string }).verificationState).toBe("verified");
    expect((captures.left as { brandColorInput: string }).brandColorInput).toBe("DDEEFF");
    expect((captures.left as { verifiedSiteUrl: string }).verifiedSiteUrl).toBe("https://docs.usechatting.com");
  });

  it("covers the generic customize failure and snippet-not-found verification fallback branches", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: "save-failed" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, detected: false }) }));
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const { OnboardingFlow, captures, reactMocks } = await loadFlow();
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={{ id: "site_1", name: "Docs", domain: "docs.usechatting.com" } as never} />);
    await (captures.left as { onCustomizeContinue: () => Promise<void> }).onCustomizeContinue();
    await (captures.left as { onVerifyInstallation: () => Promise<void> }).onVerifyInstallation();
    reactMocks.beginRender();
    renderToStaticMarkup(<OnboardingFlow initialStep="install" initialSite={{ id: "site_1", name: "Docs", domain: "docs.usechatting.com" } as never} />);
    expect((captures.left as { customizeError: string; verificationMessage: string }).customizeError).toBe("We couldn't save your widget settings right now.");
    expect((captures.left as { verificationMessage: string }).verificationMessage).toBe("Widget not detected yet. Add the code, publish your site, and check again.");
  });
});
