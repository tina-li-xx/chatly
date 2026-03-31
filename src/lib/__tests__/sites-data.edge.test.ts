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
  shouldShowWidgetBranding: vi.fn(),
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
  clearSiteTeamPhotoRecord: mocks.clearSiteTeamPhotoRecord,
  findCreatedSiteRow: mocks.findCreatedSiteRow,
  findSitePresenceRow: vi.fn(),
  findSiteTeamPhotoRecord: mocks.findSiteTeamPhotoRecord,
  insertSiteRecord: vi.fn(),
  markSiteWidgetInstallVerifiedRecord: mocks.markSiteWidgetInstallVerifiedRecord,
  touchSiteWidgetSeenRecord: vi.fn(),
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
vi.mock("@/lib/widget-branding-attribution", () => ({
  getWidgetBrandingAttributionUrl: mocks.getWidgetBrandingAttributionUrl
}));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/data/shared", () => ({ mapSite: mocks.mapSite, querySites: mocks.querySites }));
vi.mock("@/lib/data/visitors", () => ({ recordVisitorPresence: vi.fn() }));

import {
  createSiteForUser,
  getSiteWidgetConfig,
  markSiteWidgetInstallVerified,
  removeSiteTeamPhoto,
  updateSiteTeamPhoto,
  updateSiteWidgetSettings
} from "@/lib/data/sites";

describe("site data edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.mapSite.mockImplementation((row: Record<string, unknown>) => row);
    mocks.deleteR2Object.mockResolvedValue(undefined);
    mocks.normalizeBillingPlanKey.mockReturnValue("growth");
    mocks.getBillingPlanFeatures.mockReturnValue({ proactiveChat: true });
  });

  it("surfaces missing site rows during create and widget settings writes", async () => {
    mocks.findCreatedSiteRow.mockResolvedValueOnce(null);
    mocks.updateSiteWidgetSettingsRecord.mockResolvedValueOnce(null);

    await expect(createSiteForUser("user_1", { name: "Docs" })).rejects.toThrow("SITE_NOT_FOUND");
    await expect(
      updateSiteWidgetSettings("site_1", "user_1", {
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
        responseTimeMode: "minutes",
        operatingHoursEnabled: false,
        operatingHoursTimezone: "UTC",
        operatingHours: {} as never
      })
    ).resolves.toBeNull();
  });

  it("returns null or fallback widget config when site or billing lookups fail", async () => {
    mocks.querySites.mockResolvedValueOnce({ rows: [] });
    await expect(getSiteWidgetConfig("missing")).resolves.toBeNull();

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
    mocks.findBillingAccountRow.mockRejectedValueOnce(new Error("billing down"));
    mocks.shouldShowWidgetBranding.mockReturnValue(false);
    mocks.getWidgetBrandingAttributionUrl.mockRejectedValueOnce(new Error("no attribution"));

    await expect(getSiteWidgetConfig("site_1")).resolves.toMatchObject({
      autoOpenPaths: ["/pricing"],
      showBranding: false,
      brandingUrl: "https://app.example/signup"
    });
  });

  it("handles team-photo and install-verification edge cases without deleting unchanged keys", async () => {
    mocks.findSiteTeamPhotoRecord.mockResolvedValueOnce(null);
    await expect(
      updateSiteTeamPhoto("site_1", "user_1", {
        fileName: "team.png",
        contentType: "image/png",
        content: Buffer.from("x")
      })
    ).resolves.toBeNull();

    mocks.findSiteTeamPhotoRecord.mockResolvedValueOnce({ team_photo_key: "same-key" });
    mocks.uploadSiteTeamPhotoToR2.mockResolvedValueOnce({ url: "https://cdn.example/team.png", key: "same-key" });
    mocks.updateSiteTeamPhotoRecord.mockResolvedValueOnce({ id: "site_1" });
    mocks.querySites.mockResolvedValueOnce({ rows: [{ id: "site_1", userId: "owner_1" }] });
    await expect(
      updateSiteTeamPhoto("site_1", "user_1", {
        fileName: "team.png",
        contentType: "image/png",
        content: Buffer.from("x")
      })
    ).resolves.toEqual({ id: "site_1", userId: "owner_1" });
    expect(mocks.deleteR2Object).not.toHaveBeenCalled();

    mocks.findSiteTeamPhotoRecord.mockResolvedValueOnce({ team_photo_key: null });
    mocks.clearSiteTeamPhotoRecord.mockResolvedValueOnce(null);
    await expect(removeSiteTeamPhoto("site_1", "user_1")).resolves.toBeNull();

    mocks.markSiteWidgetInstallVerifiedRecord.mockResolvedValueOnce(null);
    await expect(markSiteWidgetInstallVerified("site_1", "user_1")).resolves.toBeNull();
  });
});
