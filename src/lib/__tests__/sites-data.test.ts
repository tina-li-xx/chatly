const mocks = vi.hoisted(() => ({
  deleteR2Object: vi.fn(),
  findBillingAccountRow: vi.fn(),
  findSiteTeamPhotoRecord: vi.fn(),
  getBillingPlanFeatures: vi.fn(),
  getWidgetBrandingAttributionUrl: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  mapSite: vi.fn(),
  markSiteWidgetInstallVerifiedRecord: vi.fn(),
  normalizeBillingPlanKey: vi.fn(),
  querySites: vi.fn(),
  recordVisitorPresence: vi.fn(),
  shouldShowWidgetBranding: vi.fn(),
  touchSiteWidgetSeenRecord: vi.fn(),
  updateSiteTeamPhotoRecord: vi.fn(),
  updateSiteWidgetSettingsRecord: vi.fn(),
  uploadSiteTeamPhotoToR2: vi.fn()
}));

vi.mock("@/lib/billing-plans", () => ({
  getBillingPlanFeatures: mocks.getBillingPlanFeatures,
  normalizeBillingPlanKey: mocks.normalizeBillingPlanKey,
  shouldShowWidgetBranding: mocks.shouldShowWidgetBranding
}));
vi.mock("@/lib/repositories/billing-repository", () => ({ findBillingAccountRow: mocks.findBillingAccountRow }));
vi.mock("@/lib/repositories/sites-repository", () => ({
  clearSiteTeamPhotoRecord: vi.fn(),
  findCreatedSiteRow: vi.fn(),
  findSitePresenceRow: vi.fn(),
  findSiteTeamPhotoRecord: mocks.findSiteTeamPhotoRecord,
  insertSiteRecord: vi.fn(),
  markSiteWidgetInstallVerifiedRecord: mocks.markSiteWidgetInstallVerifiedRecord,
  touchSiteWidgetSeenRecord: mocks.touchSiteWidgetSeenRecord,
  updateSiteOnboardingSetupRecord: vi.fn(),
  updateSiteTeamPhotoRecord: mocks.updateSiteTeamPhotoRecord,
  updateSiteWidgetSettingsRecord: mocks.updateSiteWidgetSettingsRecord,
  updateSiteWidgetTitleRecord: vi.fn()
}));
vi.mock("@/lib/r2", () => ({
  deleteR2Object: mocks.deleteR2Object,
  uploadSiteTeamPhotoToR2: mocks.uploadSiteTeamPhotoToR2
}));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: () => "https://app.example" }));
vi.mock("@/lib/data/visitors", () => ({ recordVisitorPresence: mocks.recordVisitorPresence }));
vi.mock("@/lib/widget-branding-attribution", () => ({
  getWidgetBrandingAttributionUrl: mocks.getWidgetBrandingAttributionUrl
}));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/data/shared", () => ({
  mapSite: mocks.mapSite,
  querySites: mocks.querySites
}));

import {
  getSiteWidgetConfig,
  markSiteWidgetInstallVerified,
  recordSiteWidgetSeen,
  updateSiteTeamPhoto,
  updateSiteWidgetSettings
} from "@/lib/data/sites";

describe("site data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.mapSite.mockImplementation((row: Record<string, unknown>) => row);
    mocks.querySites.mockResolvedValue({ rows: [{ id: "site_1", userId: "owner_1", autoOpenPaths: ["/pricing"], brandColor: "#2563EB", widgetTitle: "Talk to us" }] });
    mocks.getBillingPlanFeatures.mockReturnValue({ proactiveChat: false });
    mocks.normalizeBillingPlanKey.mockReturnValue("starter");
    mocks.shouldShowWidgetBranding.mockReturnValue(true);
    mocks.getWidgetBrandingAttributionUrl.mockResolvedValue("https://chatting.example/ref/site_1");
    mocks.deleteR2Object.mockResolvedValue(undefined);
  });

  it("updates site widget settings and reloads the mapped site", async () => {
    mocks.updateSiteWidgetSettingsRecord.mockResolvedValueOnce({ id: "site_1" });

    const result = await updateSiteWidgetSettings("site_1", "user_1", {
      domain: "https://example.com",
      brandColor: "#2563EB",
      widgetTitle: "Talk to us",
      greetingText: "Hi there",
      launcherPosition: "left",
      avatarStyle: "photos",
      showOnlineStatus: true,
      requireEmailOffline: false,
      offlineTitle: "We're not online right now",
      offlineMessage: "Leave a message and we'll get back to you via email.",
      awayTitle: "We're away right now",
      awayMessage: "Leave a message and we'll get back to you via email.",
      soundNotifications: true,
      autoOpenPaths: ["/pricing"],
      responseTimeMode: "hours",
      operatingHoursEnabled: true,
      operatingHoursTimezone: "UTC",
      operatingHours: {} as never
    });

    expect(mocks.updateSiteWidgetSettingsRecord).toHaveBeenCalled();
    expect(result).toEqual({ id: "site_1", userId: "owner_1", autoOpenPaths: ["/pricing"], brandColor: "#2563EB", widgetTitle: "Talk to us" });
  });

  it("builds the public widget config with plan-aware branding and auto-open paths", async () => {
    mocks.querySites.mockResolvedValueOnce({
      rows: [{
        id: "site_1",
        userId: "owner_1",
        brandColor: "#2563EB",
        widgetTitle: "Talk to us",
        greetingText: "Hi there",
        launcherPosition: "right",
        avatarStyle: "initials",
        teamPhotoUrl: null,
        showOnlineStatus: true,
        requireEmailOffline: false,
        offlineTitle: "We're not online right now",
        offlineMessage: "Leave a message and we'll get back to you via email.",
        awayTitle: "We're away right now",
        awayMessage: "Leave a message and we'll get back to you via email.",
        soundNotifications: true,
        autoOpenPaths: ["/pricing"],
        responseTimeMode: "minutes",
        operatingHoursEnabled: false,
        operatingHoursTimezone: "UTC",
        operatingHours: {},
        widgetInstallVerifiedAt: null,
        widgetInstallVerifiedUrl: null,
        widgetLastSeenAt: null,
        widgetLastSeenUrl: null
      }]
    });
    mocks.findBillingAccountRow.mockResolvedValueOnce({ plan_key: "starter" });

    const config = await getSiteWidgetConfig("site_1");

    expect(config).toMatchObject({
      id: "site_1",
      autoOpenPaths: [],
      showBranding: true,
      brandingLabel: "Powered by Chatting",
      brandingUrl: "https://chatting.example/ref/site_1"
    });
  });

  it("records widget activity and visitor presence when a session id is present", async () => {
    await recordSiteWidgetSeen({ siteId: "site_1", sessionId: "session_1", pageUrl: "https://example.com/pricing", email: "alex@example.com" });

    expect(mocks.touchSiteWidgetSeenRecord).toHaveBeenCalledWith("site_1", "https://example.com/pricing");
    expect(mocks.recordVisitorPresence).toHaveBeenCalledWith(expect.objectContaining({ siteId: "site_1", sessionId: "session_1", email: "alex@example.com" }));
  });

  it("updates team photos and marks installation verification", async () => {
    mocks.findSiteTeamPhotoRecord.mockResolvedValueOnce({ team_photo_key: "old-key" });
    mocks.uploadSiteTeamPhotoToR2.mockResolvedValueOnce({ url: "https://cdn.example/team.png", key: "new-key" });
    mocks.updateSiteTeamPhotoRecord.mockResolvedValueOnce({ id: "site_1" });
    mocks.markSiteWidgetInstallVerifiedRecord.mockResolvedValueOnce({ id: "site_1" });

    await expect(updateSiteTeamPhoto("site_1", "user_1", { fileName: "team.png", contentType: "image/png", content: Buffer.from("x") })).resolves.toEqual({ id: "site_1", userId: "owner_1", autoOpenPaths: ["/pricing"], brandColor: "#2563EB", widgetTitle: "Talk to us" });
    await expect(markSiteWidgetInstallVerified("site_1", "user_1", "https://example.com")).resolves.toEqual({ id: "site_1", userId: "owner_1", autoOpenPaths: ["/pricing"], brandColor: "#2563EB", widgetTitle: "Talk to us" });

    expect(mocks.deleteR2Object).toHaveBeenCalledWith("old-key");
  });
});
