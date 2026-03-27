import { isSiteWidgetInstalled } from "@/lib/site-installation";

describe("site installation", () => {
  it("treats verified installs as installed", () => {
    expect(
      isSiteWidgetInstalled({
        widgetInstallVerifiedAt: "2026-03-27T00:00:00.000Z",
        widgetLastSeenAt: null,
        conversationCount: 0
      })
    ).toBe(true);
  });

  it("treats live widget activity as installed", () => {
    expect(
      isSiteWidgetInstalled({
        widgetInstallVerifiedAt: null,
        widgetLastSeenAt: "2026-03-27T00:00:00.000Z",
        conversationCount: 0
      })
    ).toBe(true);
  });

  it("falls back to conversation history", () => {
    expect(
      isSiteWidgetInstalled({
        widgetInstallVerifiedAt: null,
        widgetLastSeenAt: null,
        conversationCount: 3
      })
    ).toBe(true);
  });

  it("returns false when there is no install signal", () => {
    expect(
      isSiteWidgetInstalled({
        widgetInstallVerifiedAt: null,
        widgetLastSeenAt: null,
        conversationCount: 0
      })
    ).toBe(false);
  });
});
