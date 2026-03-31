import { renderToStaticMarkup } from "react-dom/server";
import { createDefaultOperatingHours } from "@/lib/widget-settings";
import type { Site } from "@/lib/types";
import {
  ToggleRow,
  WidgetTabIcon,
  getPlatformSnippet,
  installationCheckErrorMessage,
  photoUploadErrorMessage,
  previewStatus,
  responseTimeCopy,
  siteSettingsSignature,
  widgetSaveErrorMessage
} from "./dashboard-widget-settings-shared";
import { PaintbrushIcon } from "./dashboard-ui";

function createSite(overrides: Partial<Site> = {}): Site {
  return {
    id: "site_123",
    userId: "user_123",
    name: "Main site",
    domain: "https://example.com",
    brandColor: "#2563EB",
    widgetTitle: "Talk to support",
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
    operatingHoursEnabled: true,
    operatingHoursTimezone: "UTC",
    operatingHours: createDefaultOperatingHours(),
    widgetInstallVerifiedAt: null,
    widgetInstallVerifiedUrl: null,
    widgetLastSeenAt: null,
    widgetLastSeenUrl: null,
    createdAt: "2026-03-29T10:00:00.000Z",
    conversationCount: 0,
    ...overrides
  };
}

describe("dashboard widget settings shared helpers", () => {
  it("builds stable site signatures and preview status text", () => {
    const site = createSite({ responseTimeMode: "hours" });
    const changedSite = createSite({ widgetTitle: "Chat now" });

    expect(siteSettingsSignature(site)).not.toBe(siteSettingsSignature(changedSite));
    expect(previewStatus(site)).toBe("Online • Typically replies in a few hours");
    expect(previewStatus(createSite({ showOnlineStatus: false }))).toBe("");
    expect(previewStatus(createSite({ responseTimeMode: "hidden" }))).toBe("Online");
  });

  it("maps response-time and error helper copy", () => {
    expect(responseTimeCopy("minutes")).toBe("Typically replies in minutes");
    expect(responseTimeCopy("hours")).toBe("Typically replies in a few hours");
    expect(responseTimeCopy("day")).toBe("Typically replies in a day");
    expect(responseTimeCopy("hidden")).toBe("");
    expect(photoUploadErrorMessage("invalid-image-type")).toBe("Use a PNG, JPG, GIF, or WebP image.");
    expect(photoUploadErrorMessage("image-too-large")).toBe("Use an image smaller than 2MB.");
    expect(photoUploadErrorMessage("storage-not-configured")).toBe("Cloudflare R2 is not configured yet.");
    expect(widgetSaveErrorMessage("site-domain-required")).toBe(
      "Site URL is required before you can save widget setup."
    );
    expect(widgetSaveErrorMessage("proactive_chat_requires_growth")).toBe(
      "Proactive chat is available on Growth."
    );
  });

  it("maps installation-check errors with and without a saved domain", () => {
    expect(installationCheckErrorMessage("missing-domain", false)).toBe(
      "Save a site URL first so Chatting can verify the install."
    );
    expect(installationCheckErrorMessage("site-unreachable", true)).toBe(
      "We couldn't reach the site URL right now. Double-check the domain and try again."
    );
    expect(installationCheckErrorMessage("installation-check-failed", true)).toBe(
      "Unable to check installation right now."
    );
    expect(installationCheckErrorMessage("unknown", false)).toBe(
      "Set and save your site URL first, then check installation again."
    );
  });

  it("returns platform snippets for each supported install path", () => {
    const site = createSite();

    expect(getPlatformSnippet(site, "html")).toContain('data-site-id="site_123"');
    expect(getPlatformSnippet(site, "react")).toContain("export function ChattingWidget()");
    expect(getPlatformSnippet(site, "nextjs")).toContain('strategy="afterInteractive"');
    expect(getPlatformSnippet(site, "wordpress")).toContain("Paste this into your theme footer");
    expect(getPlatformSnippet(site, "shopify")).toContain("theme.liquid");
    expect(getPlatformSnippet(site, "webflow")).toContain("Project Settings");
  });

  it("renders toggle rows and tab icons", () => {
    const toggleHtml = renderToStaticMarkup(
      <ToggleRow
        label="Show online status"
        description="Let visitors know the team is around."
        checked
        onToggle={vi.fn()}
      />
    );
    const iconHtml = renderToStaticMarkup(<WidgetTabIcon icon={PaintbrushIcon} />);

    expect(toggleHtml).toContain("Show online status");
    expect(toggleHtml).toContain("bg-blue-600");
    expect(iconHtml).toContain("class=\"h-4 w-4\"");
  });
});
