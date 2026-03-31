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
    showRightPanel: false,
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
    hasSavedDomain: true,
    brandColorInput: "123456",
    customizeError: "Save failed",
    customizeSaving: true,
    installTab: "html" as const,
    copiedCode: false,
    installSnippet: "<script />",
    showVerificationSummary: true,
    verifying: true,
    verificationState: "verified" as const,
    verificationMessage: "Widget verified.",
    verifiedSiteUrl: "https://docs.example.com",
    verifiedSiteHref: "https://docs.example.com",
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

describe("onboarding left panel more", () => {
  it("hides the saved-domain field and shows the photo avatar option when a team photo exists", () => {
    const html = renderToStaticMarkup(
      <OnboardingLeftPanel
        {...baseProps()}
        siteDraft={{ ...baseProps().siteDraft, teamPhotoUrl: "https://cdn.example/team.png" }}
      />
    );

    expect(html).not.toContain("Website URL");
    expect(html).toContain("Photo");
    expect(html).toContain("Save failed");
  });

  it("renders the in-progress install state with back navigation and verification copy", () => {
    const html = renderToStaticMarkup(
      <OnboardingLeftPanel
        {...baseProps()}
        activeStep="install"
        stepIndex={1}
        showInstallSuccess={false}
      />
    );

    expect(html).toContain("Back");
    expect(html).toContain("Add one line of code to your site");
    expect(html).toContain("Widget verified.");
    expect(html).toContain("Checking...");
  });
});
