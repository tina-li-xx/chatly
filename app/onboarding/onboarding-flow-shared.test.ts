vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "https://usechatting.com/"
}));

import {
  buildNextJsSnippet,
  buildSnippet,
  copyButtonLabel,
  createWidgetDraft,
  getDetectedInstallUrl,
  normalizeHexColor,
  normalizeSiteHref,
  previewAvatarInitials,
  previewGreeting,
  previewStatus,
  previewWidgetTitle,
  responseTimeCopy,
  sanitizeHexInput,
  siteDisplayUrl,
  verifyErrorMessage
} from "./onboarding-flow-shared";

describe("onboarding flow shared helpers", () => {
  it("builds widget drafts and picks detected install urls", () => {
    const draft = createWidgetDraft({
      id: "site_1",
      name: "Docs",
      domain: "docs.usechatting.com",
      conversationCount: 3,
      brandColor: "#123456",
      widgetTitle: "Talk to us",
      greetingText: "Hi there",
      launcherPosition: "left",
      avatarStyle: "photos",
      teamPhotoUrl: "https://example.com/team.png",
      showOnlineStatus: false,
      requireEmailOffline: true,
      soundNotifications: true,
      autoOpenPaths: ["/pricing"],
      responseTimeMode: "hours",
      operatingHoursEnabled: true,
      operatingHoursTimezone: "Europe/London",
      operatingHours: {},
      widgetInstallVerifiedAt: "2026-03-29T10:00:00.000Z",
      widgetInstallVerifiedUrl: "https://verified.example",
      widgetLastSeenAt: "2026-03-29T10:05:00.000Z",
      widgetLastSeenUrl: "https://seen.example"
    } as never);

    expect(draft.brandColor).toBe("#123456");
    expect(draft.launcherPosition).toBe("left");
    expect(getDetectedInstallUrl(draft)).toBe("https://seen.example");
    expect(createWidgetDraft(null).brandColor).toBe("#2563EB");
  });

  it("formats copy, snippets, and site urls", () => {
    expect(copyButtonLabel(true)).toBe("Copied!");
    expect(buildSnippet("site_1")).toContain('src="https://usechatting.com/widget.js"');
    expect(buildNextJsSnippet("site_1")).toContain('data-site-id="site_1"');
    expect(normalizeSiteHref("docs.usechatting.com")).toBe("https://docs.usechatting.com");
    expect(normalizeSiteHref("")).toBeNull();
    expect(siteDisplayUrl("https://docs.usechatting.com/")).toBe("https://docs.usechatting.com");
  });

  it("builds preview labels and error states", () => {
    const draft = createWidgetDraft({
      name: "Docs",
      widgetTitle: " ",
      greetingText: " ",
      showOnlineStatus: true,
      responseTimeMode: "hidden"
    } as never);

    expect(previewWidgetTitle(draft, "Chatting")).toBe("Chatting");
    expect(previewGreeting(draft)).toContain("help");
    expect(responseTimeCopy("hours")).toBe("Replies in a few hours");
    expect(previewStatus(draft)).toBe("Online");
    expect(previewAvatarInitials(draft, "Chatting Team")).toBe("CT");
    expect(verifyErrorMessage("missing-domain", false)).toContain("website URL");
    expect(verifyErrorMessage("snippet-not-found", true)).toContain("Widget not detected yet");
    expect(verifyErrorMessage("anything-else", true)).toContain("couldn't verify");
  });

  it("sanitizes and normalizes hex colors", () => {
    expect(sanitizeHexInput("#ab-cd12zzz")).toBe("ABCD12");
    expect(normalizeHexColor("ff9900")).toBe("#FF9900");
    expect(normalizeHexColor("123")).toBeNull();
  });
});
