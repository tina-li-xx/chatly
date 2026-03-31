import { renderToStaticMarkup } from "react-dom/server";
import {
  InstallSnippetBlock,
  PreviewWidget,
  StepProgress,
  SuccessActionCard,
  SuccessConfetti,
  VerifiedInstallPreview
} from "./onboarding-flow-ui";
import { createWidgetDraft } from "./onboarding-flow-shared";

function draft(overrides: Record<string, unknown> = {}) {
  return {
    ...createWidgetDraft({
      id: "site_1",
      name: "Docs Team",
      brandColor: "#123456",
      widgetTitle: "Talk to Docs",
      greetingText: "Hi there, how can we help?",
      launcherPosition: "left",
      avatarStyle: "initials",
      showOnlineStatus: true,
      responseTimeMode: "minutes",
      conversationCount: 4
    } as never),
    ...overrides
  };
}

describe("onboarding flow ui", () => {
  it("renders snippet blocks, action cards, and progress states", () => {
    const html = renderToStaticMarkup(
      <>
        <InstallSnippetBlock snippet="<script />" copied={false} onCopy={() => {}} />
        <SuccessActionCard
          title="Test it yourself"
          description="Open your site and try the widget"
          href="https://example.com"
          icon={<span>icon</span>}
          iconClassName="bg-blue-50"
        />
        <StepProgress activeStep="install" />
      </>
    );

    expect(html).toContain("Copy code");
    expect(html).toContain("&lt;script /&gt;");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("Test it yourself");
    expect(html).toContain("Customize");
    expect(html).toContain("Install");
    expect(html).toContain("Done");
  });

  it("renders preview widgets across avatar and verification states", () => {
    const previewHtml = renderToStaticMarkup(
      <PreviewWidget draft={draft({ avatarStyle: "photos", teamPhotoUrl: "https://example.com/team.png" })} fallbackTeamName="Docs Team" />
    );
    const iconPreviewHtml = renderToStaticMarkup(
      <PreviewWidget draft={draft({ avatarStyle: "icon", launcherPosition: "right", showOnlineStatus: false })} fallbackTeamName="Docs Team" />
    );
    const verifiedHtml = renderToStaticMarkup(<VerifiedInstallPreview draft={draft()} />);
    const confettiHtml = renderToStaticMarkup(<SuccessConfetti />);

    expect(previewHtml).toContain("Talk to Docs");
    expect(previewHtml).toContain("https://example.com/team.png");
    expect(iconPreviewHtml).toContain("Happy to help. What would you like to know?");
    expect(iconPreviewHtml).not.toContain("Online •");
    expect(verifiedHtml).toContain("Widget is live!");
    expect(verifiedHtml).toContain("Visitors can now start chatting with you");
    expect(confettiHtml).toContain("confetti-piece");
  });
});
