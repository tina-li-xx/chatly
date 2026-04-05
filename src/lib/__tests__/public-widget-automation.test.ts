import { createDefaultDashboardAutomationSettings } from "@/lib/data/settings-automation";
import {
  getWidgetProactivePrompt,
  getWidgetFaqSuggestions,
  isOutsideWidgetOperatingHours,
  matchesWidgetProactivePagePath,
  isWidgetTeamOnline,
  shouldSendWidgetAutoReply
} from "@/lib/public-widget-automation";

const site = {
  operatingHoursEnabled: true,
  operatingHoursTimezone: "Europe/London",
  operatingHours: {
    monday: { enabled: true, from: "09:00", to: "17:00" },
    tuesday: { enabled: true, from: "09:00", to: "17:00" },
    wednesday: { enabled: true, from: "09:00", to: "17:00" },
    thursday: { enabled: true, from: "09:00", to: "17:00" },
    friday: { enabled: true, from: "09:00", to: "17:00" },
    saturday: { enabled: false, from: "10:00", to: "16:00" },
    sunday: { enabled: false, from: "10:00", to: "16:00" }
  }
};

describe("public widget automation", () => {
  it("treats recent presence as online", () => {
    expect(isWidgetTeamOnline("2026-04-04T09:55:00.000Z", new Date("2026-04-04T09:59:00.000Z"))).toBe(true);
    expect(isWidgetTeamOnline("2026-04-04T09:50:00.000Z", new Date("2026-04-04T09:59:00.000Z"))).toBe(false);
  });

  it("detects when the current time is outside operating hours", () => {
    expect(isOutsideWidgetOperatingHours(site, new Date("2026-04-06T07:00:00.000Z"))).toBe(true);
    expect(isOutsideWidgetOperatingHours(site, new Date("2026-04-06T10:00:00.000Z"))).toBe(false);
  });

  it("fires the away reply only for new conversations that match the configured trigger", () => {
    const automation = createDefaultDashboardAutomationSettings();
    automation.offline.autoReplyEnabled = true;
    automation.offline.autoReplyWhen = "either";

    expect(shouldSendWidgetAutoReply({
      site,
      automation,
      isNewConversation: true,
      lastSeenAt: "2026-04-06T09:55:00.000Z",
      now: new Date("2026-04-06T18:00:00.000Z")
    })).toBe(true);

    expect(shouldSendWidgetAutoReply({
      site,
      automation,
      isNewConversation: false,
      lastSeenAt: null,
      now: new Date("2026-04-06T18:00:00.000Z")
    })).toBe(false);
  });

  it("returns matching manual FAQ suggestions only for the first message of a conversation", () => {
    const automation = createDefaultDashboardAutomationSettings();
    automation.speed.faqSuggestionsEnabled = true;
    automation.speed.manualFaqs = [
      {
        id: "faq_1",
        question: "What are your pricing plans?",
        keywords: ["pricing", "plans", "cost"],
        answer: "We offer Free, Growth, and Business plans.",
        link: "https://example.com/pricing"
      }
    ];

    expect(
      getWidgetFaqSuggestions({
        automation,
        content: "Need pricing help",
        isNewConversation: true
      })
    ).toEqual({
      fallbackMessage: "None of these help? A team member will be with you shortly.",
      items: [
        {
          id: "faq_1",
          question: "What are your pricing plans?",
          answer: "We offer Free, Growth, and Business plans.",
          link: "https://example.com/pricing"
        }
      ]
    });

    expect(
      getWidgetFaqSuggestions({
        automation,
        content: "Need pricing help",
        isNewConversation: false
      })
    ).toBeNull();
  });

  it("matches proactive rules with wildcard page paths using first match wins", () => {
    const automation = createDefaultDashboardAutomationSettings();
    automation.proactive.pagePrompts = [
      {
        id: "prompt_1",
        pagePath: "/products/*",
        message: "Need help choosing?",
        delaySeconds: 30,
        autoOpenWidget: false
      },
      {
        id: "prompt_2",
        pagePath: "/products/shoes",
        message: "Need sizing help?",
        delaySeconds: 10,
        autoOpenWidget: true
      }
    ];

    expect(matchesWidgetProactivePagePath("/checkout*", "https://example.com/checkout/step-2")).toBe(true);
    expect(matchesWidgetProactivePagePath("/products/*", "/products/shoes")).toBe(true);
    expect(matchesWidgetProactivePagePath("/pricing", "/docs")).toBe(false);
    expect(
      getWidgetProactivePrompt({
        automation,
        pageUrl: "https://example.com/products/shoes"
      })
    ).toEqual(
      expect.objectContaining({
        id: "prompt_1",
        message: "Need help choosing?",
        autoOpenWidget: false
      })
    );
  });
});
