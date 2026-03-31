const mocks = vi.hoisted(() => ({
  clearSiteTeamPhotoRecord: vi.fn(),
  deleteR2Object: vi.fn(),
  findBillingAccountRow: vi.fn(),
  findCreatedSiteRow: vi.fn(),
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
  updateSiteOnboardingSetupRecord: vi.fn(),
  updateSiteTeamPhotoRecord: vi.fn(),
  updateSiteWidgetSettingsRecord: vi.fn(),
  updateSiteWidgetTitleRecord: vi.fn()
}));

vi.mock("node:crypto", () => ({ randomUUID: () => "site_123" }));
vi.mock("@/lib/billing-plans", () => ({
  getBillingPlanFeatures: mocks.getBillingPlanFeatures,
  normalizeBillingPlanKey: mocks.normalizeBillingPlanKey,
  shouldShowWidgetBranding: mocks.shouldShowWidgetBranding
}));
vi.mock("@/lib/repositories/billing-repository", () => ({ findBillingAccountRow: mocks.findBillingAccountRow }));
vi.mock("@/lib/repositories/sites-repository", () => ({
  clearSiteTeamPhotoRecord: mocks.clearSiteTeamPhotoRecord,
  findCreatedSiteRow: mocks.findCreatedSiteRow,
  findSitePresenceRow: vi.fn(),
  findSiteTeamPhotoRecord: mocks.findSiteTeamPhotoRecord,
  insertSiteRecord: vi.fn(),
  markSiteWidgetInstallVerifiedRecord: mocks.markSiteWidgetInstallVerifiedRecord,
  touchSiteWidgetSeenRecord: mocks.touchSiteWidgetSeenRecord,
  updateSiteOnboardingSetupRecord: mocks.updateSiteOnboardingSetupRecord,
  updateSiteTeamPhotoRecord: mocks.updateSiteTeamPhotoRecord,
  updateSiteWidgetSettingsRecord: mocks.updateSiteWidgetSettingsRecord,
  updateSiteWidgetTitleRecord: mocks.updateSiteWidgetTitleRecord
}));
vi.mock("@/lib/r2", () => ({ deleteR2Object: mocks.deleteR2Object, uploadSiteTeamPhotoToR2: vi.fn() }));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: () => "https://app.example" }));
vi.mock("@/lib/data/visitors", () => ({ recordVisitorPresence: mocks.recordVisitorPresence }));
vi.mock("@/lib/widget-branding-attribution", () => ({
  getWidgetBrandingAttributionUrl: mocks.getWidgetBrandingAttributionUrl
}));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/data/shared", () => ({ mapSite: mocks.mapSite, querySites: mocks.querySites }));

import {
  createSiteForUser,
  recordSiteWidgetSeen,
  updateSiteOnboardingSetup,
  updateSiteWidgetSettings,
  updateSiteWidgetTitle
} from "@/lib/data/sites";

describe("sites data hotspots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.mapSite.mockImplementation((row: Record<string, unknown>) => row);
    mocks.querySites.mockResolvedValue({ rows: [{ id: "site_123", userId: "owner_1", widgetTitle: "Talk to us" }] });
  });

  it("creates sites with defaults and falls back when widget titles are blank", async () => {
    mocks.findCreatedSiteRow.mockResolvedValueOnce({ id: "site_123", user_id: "user_1", widget_title: "Talk to the team" });

    await createSiteForUser("user_1", { name: "   ", domain: "", widgetTitle: "", greetingText: "" });
    await updateSiteWidgetTitle("site_123", "   ", "user_1");

    expect(mocks.updateSiteWidgetTitleRecord).toHaveBeenCalledWith("site_123", "owner_1", "Talk to the team");
  });

  it("returns null when onboarding or widget settings updates do not reload a site row", async () => {
    mocks.updateSiteOnboardingSetupRecord.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "site_123" });
    mocks.updateSiteWidgetSettingsRecord.mockResolvedValueOnce({ id: "site_123" });
    mocks.querySites.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] });

    await expect(updateSiteOnboardingSetup("site_123", "user_1", { name: "Docs", domain: "example.com" })).resolves.toBeNull();
    await expect(
      updateSiteWidgetSettings("site_123", "user_1", {
        domain: null,
        brandColor: "",
        widgetTitle: "",
        greetingText: "",
        launcherPosition: "left",
        avatarStyle: "initials",
        showOnlineStatus: true,
        requireEmailOffline: false,
        offlineTitle: "",
        offlineMessage: "",
        awayTitle: "",
        awayMessage: "",
        soundNotifications: false,
        autoOpenPaths: ["/pricing", "/pricing"],
        responseTimeMode: "minutes",
        operatingHoursEnabled: false,
        operatingHoursTimezone: "",
        operatingHours: {} as never
      })
    ).resolves.toBeNull();
  });

  it("normalizes widget seen payloads for both string and object inputs", async () => {
    await recordSiteWidgetSeen("site_123", "  https://example.com/pricing  ");
    await recordSiteWidgetSeen({
      siteId: "site_123",
      pageUrl: "https://example.com/docs",
      sessionId: "session_1",
      conversationId: "conv_1",
      email: "alex@example.com"
    });

    expect(mocks.touchSiteWidgetSeenRecord).toHaveBeenNthCalledWith(1, "site_123", "https://example.com/pricing");
    expect(mocks.touchSiteWidgetSeenRecord).toHaveBeenNthCalledWith(2, "site_123", "https://example.com/docs");
    expect(mocks.recordVisitorPresence).toHaveBeenCalledWith(
      expect.objectContaining({
        siteId: "site_123",
        sessionId: "session_1",
        conversationId: "conv_1",
        email: "alex@example.com"
      })
    );
  });
});
