const mocks = vi.hoisted(() => ({
  getSitePresenceStatus: vi.fn(),
  getSiteWidgetConfig: vi.fn(),
  recordSiteWidgetSeen: vi.fn()
}));

vi.mock("@/lib/data/sites", () => ({
  getSitePresenceStatus: mocks.getSitePresenceStatus,
  getSiteWidgetConfig: mocks.getSiteWidgetConfig,
  recordSiteWidgetSeen: mocks.recordSiteWidgetSeen
}));

import {
  getPublicSitePresenceStatus,
  getPublicSiteWidgetConfig,
  recordPublicSitePresence
} from "./public-sites";

describe("public sites service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for blank site ids on read helpers", async () => {
    await expect(getPublicSiteWidgetConfig("   ")).resolves.toBeNull();
    await expect(getPublicSitePresenceStatus("   ")).resolves.toBeNull();

    expect(mocks.getSiteWidgetConfig).not.toHaveBeenCalled();
    expect(mocks.getSitePresenceStatus).not.toHaveBeenCalled();
  });

  it("trims the site id before delegating reads", async () => {
    mocks.getSiteWidgetConfig.mockResolvedValueOnce({ id: "site_1" });
    mocks.getSitePresenceStatus.mockResolvedValueOnce({ online: true, lastSeenAt: null });

    await expect(getPublicSiteWidgetConfig(" site_1 ")).resolves.toEqual({ id: "site_1" });
    await expect(getPublicSitePresenceStatus(" site_1 ")).resolves.toEqual({ online: true, lastSeenAt: null });

    expect(mocks.getSiteWidgetConfig).toHaveBeenCalledWith("site_1");
    expect(mocks.getSitePresenceStatus).toHaveBeenCalledWith("site_1");
  });

  it("trims and forwards public presence payloads", async () => {
    await recordPublicSitePresence({
      siteId: " site_1 ",
      pageUrl: "https://example.com/pricing",
      sessionId: "session_1"
    });

    expect(mocks.recordSiteWidgetSeen).toHaveBeenCalledWith({
      siteId: "site_1",
      pageUrl: "https://example.com/pricing",
      sessionId: "session_1"
    });
  });
});
