import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  )
}));

import { OnboardingLeftPanel } from "./onboarding-flow-sections";
import { createWidgetDraft } from "./onboarding-flow-shared";

function baseProps() {
  return {
    activeStep: "customize" as const,
    stepIndex: 0,
    showRightPanel: true,
    showInstallSuccess: false,
    siteDraft: createWidgetDraft({
      id: "site_1",
      name: "Docs",
      domain: "",
      brandColor: "#123456",
      widgetTitle: "Talk to Docs",
      avatarStyle: "initials",
      launcherPosition: "right",
      showOnlineStatus: true,
      responseTimeMode: "minutes",
      conversationCount: 4
    } as never),
    domain: "",
    hasSavedDomain: false,
    brandColorInput: "123456",
    customizeError: null,
    customizeSaving: false,
    installTab: "code" as const,
    copiedCode: false,
    installSnippet: "<script />",
    showVerificationSummary: false,
    verifying: false,
    verificationState: "idle" as const,
    verificationMessage: null,
    verifiedSiteUrl: null,
    verifiedSiteHref: null,
    onBack: () => {},
    onDomainChange: () => {},
    onWidgetTitleChange: () => {},
    onBrandColorInputChange: () => {},
    onBrandColorPickerChange: () => {},
    onBrandColorInputBlur: () => {},
    onAvatarStyleChange: () => {},
    onLauncherPositionChange: () => {},
    onShowOnlineStatusToggle: () => {},
    onResponseTimeModeChange: () => {},
    onCustomizeContinue: () => {},
    onInstallTabChange: () => {},
    onCopyCode: () => {},
    onVerifyInstallation: () => {},
    onSkipInstall: () => {},
    onCompleteAndGo: () => {}
  };
}

describe("onboarding left panel", () => {
  it("renders the customize step controls", () => {
    const html = renderToStaticMarkup(<OnboardingLeftPanel {...baseProps()} />);

    expect(html).toContain("Website URL");
    expect(html).toContain("Widget title");
    expect(html).toContain("Brand color");
    expect(html).toContain("Avatar style");
    expect(html).toContain("Widget position");
    expect(html).toContain("Show online status");
    expect(html).toContain("Continue");
  });

  it("renders the install success state with next actions", () => {
    const html = renderToStaticMarkup(
      <OnboardingLeftPanel
        {...baseProps()}
        activeStep="install"
        stepIndex={1}
        showInstallSuccess
        verifiedSiteUrl="https://docs.usechatting.com"
        verifiedSiteHref="https://docs.usechatting.com"
      />
    );

    expect(html).toContain("Widget detected!");
    expect(html).toContain("https://docs.usechatting.com");
    expect(html).toContain("Customize more");
    expect(html).toContain("Go to Inbox");
  });

  it("renders the install verification state with tabs and retry actions", () => {
    const html = renderToStaticMarkup(
      <OnboardingLeftPanel
        {...baseProps()}
        activeStep="install"
        stepIndex={1}
        installTab="nextjs"
        copiedCode
        showVerificationSummary
        verificationState="error"
        verificationMessage="Widget not detected yet."
      />
    );

    expect(html).toContain("Code snippet");
    expect(html).toContain("Next.js");
    expect(html).toContain("Widget not detected yet.");
    expect(html).toContain("Check again");
    expect(html).toContain("Skip for now");
    expect(html).toContain("Copied!");
  });
});
