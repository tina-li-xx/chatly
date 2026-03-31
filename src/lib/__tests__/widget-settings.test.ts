import type { Site } from "@/lib/types";
import {
  DEFAULT_BRAND_COLOR,
  buildWidgetSettingsPayload,
  createDefaultOperatingHours,
  normalizeAutoOpenPaths,
  normalizeBrandColor,
  normalizeSiteDomain,
  parseOperatingHours,
  serializeOperatingHours
} from "@/lib/widget-settings";

describe("widget settings", () => {
  it("normalizes brand colors safely", () => {
    expect(normalizeBrandColor("#2563eb")).toBe("#2563EB");
    expect(normalizeBrandColor("not-a-color")).toBe(DEFAULT_BRAND_COLOR);
    expect(normalizeBrandColor(null)).toBe(DEFAULT_BRAND_COLOR);
  });

  it("normalizes auto-open paths and limits the list size", () => {
    const paths = normalizeAutoOpenPaths([
      "pricing",
      "/contact",
      " ",
      "checkout",
      ...Array.from({ length: 25 }, (_, index) => `path-${index}`)
    ]);

    expect(paths[0]).toBe("/pricing");
    expect(paths[1]).toBe("/contact");
    expect(paths[2]).toBe("/checkout");
    expect(paths).toHaveLength(20);
  });

  it("normalizes site urls for verification and storage", () => {
    expect(normalizeSiteDomain(" https://example.com/pricing/?q=test ")).toBe("https://example.com/pricing");
    expect(normalizeSiteDomain("example.com/landing/")).toBe("example.com/landing");
    expect(normalizeSiteDomain("localhost:3983/")).toBe("localhost:3983");
    expect(normalizeSiteDomain("   ")).toBeNull();
  });

  it("parses operating hours with fallback defaults", () => {
    const defaults = createDefaultOperatingHours();
    const parsed = parseOperatingHours("{bad json");

    expect(parsed).toEqual(defaults);
    expect(parseOperatingHours(serializeOperatingHours(defaults))).toEqual(defaults);
  });

  it("builds the widget settings payload from a site", () => {
    const site = {
      domain: "https://example.com",
      brandColor: "#2563EB",
      widgetTitle: "Talk to support",
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
      operatingHoursTimezone: "Europe/London",
      operatingHours: createDefaultOperatingHours()
    } as Site;

    expect(buildWidgetSettingsPayload(site)).toEqual({
      domain: "https://example.com",
      brandColor: "#2563EB",
      widgetTitle: "Talk to support",
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
      operatingHoursTimezone: "Europe/London",
      operatingHours: site.operatingHours
    });
  });
});
