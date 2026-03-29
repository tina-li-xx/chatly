import {
  renderAccountWelcomeEmail,
  renderEmailVerificationEmail,
  renderTeamInvitationEmail
} from "@/lib/chatly-transactional-emails";
import {
  renderDailyDigestEmail,
  renderNewMessageNotificationEmail,
  renderWeeklyPerformanceEmail
} from "@/lib/chatly-notification-emails";
import {
  renderProductUpdateEmail,
  renderTrialExpiredEmail,
  renderTrialEndingReminderEmail,
  renderTrialExtensionOutreachEmail
} from "@/lib/chatly-marketing-emails";

describe("chatly email design system", () => {
  it("renders transactional emails with the shared shell", () => {
    const welcome = renderAccountWelcomeEmail({
      firstName: "Alex",
      dashboardUrl: "https://chatly.example/dashboard"
    });
    const verification = renderEmailVerificationEmail({
      verifyUrl: "https://chatly.example/verify?token=abc"
    });
    const invite = renderTeamInvitationEmail({
      inviterName: "Sarah Chen",
      teamName: "Acme Support",
      teamWebsite: "acme.example",
      memberCount: 3,
      inviteUrl: "https://chatly.example/signup?invite=123"
    });

    expect(welcome.subject).toBe("Welcome to Chatting — let's get you set up");
    expect(welcome.bodyHtml).toContain("max-width:600px");
    expect(verification.bodyText).toContain("This link expires in 24 hours.");
    expect(invite.bodyHtml).toContain("Accept Invitation");
  });

  it("renders notification emails with metrics, quotes, and action buttons", () => {
    const message = renderNewMessageNotificationEmail({
      visitorName: "Alex",
      visitorEmail: "alex@example.com",
      currentPage: "/pricing",
      messagePreview: "Do you support annual billing?",
      replyNowUrl: "mailto:reply@chatly.example",
      inboxUrl: "https://chatly.example/dashboard?id=conv_1"
    });
    const digest = renderDailyDigestEmail({
      date: "March 29, 2026",
      metrics: [
        { value: "12", label: "new" },
        { value: "8", label: "resolved" },
        { value: "1.2m", label: "avg resp" },
        { value: "94%", label: "CSAT" }
      ],
      openConversations: [
        { title: "Visitor on /pricing", preview: "Does the Growth plan include...", meta: "2h ago" }
      ],
      inboxUrl: "https://chatly.example/dashboard"
    });
    const weekly = renderWeeklyPerformanceEmail({
      dateRange: "Mar 22 – Mar 28, 2026",
      highlights: ["47 conversations (↑12% from last week)", "1.4 min average response time"],
      busiestHours: "Peak: Tuesday 2-3pm (12 conversations)",
      topPages: ["/pricing — 18 conversations", "/features — 11 conversations"],
      reportUrl: "https://chatly.example/dashboard/analytics"
    });

    expect(message.subject).toBe("New message from Alex");
    expect(message.bodyHtml).toContain("Reply Now");
    expect(digest.bodyHtml).toContain("Open conversations");
    expect(weekly.bodyText).toContain("View Full Report → https://chatly.example/dashboard/analytics");
  });

  it("renders marketing and lifecycle emails with the shared foundation", () => {
    const trialEnding = renderTrialEndingReminderEmail({
      firstName: "Alex",
      endDate: "April 1, 2026",
      metrics: [
        { value: "23", label: "convos" },
        { value: "1.8m", label: "avg resp" },
        { value: "89%", label: "resolved" }
      ],
      upgradeUrl: "https://chatly.example/dashboard/settings?section=billing",
      plansUrl: "https://chatly.example/pricing"
    });
    const productUpdate = renderProductUpdateEmail({
      featureName: "Smarter visitor routing",
      featureDescription: "Send high-intent conversations to the right teammate faster.",
      monthLabel: "March 2026",
      tryItUrl: "https://chatly.example/dashboard",
      changelogUrl: "https://chatly.example/changelog",
      additionalUpdates: ["Refined inbox filters", "Faster transcript exports"]
    });
    const extension = renderTrialExtensionOutreachEmail({
      planName: "Growth",
      formattedEndDate: "April 8, 2026"
    });
    const expired = renderTrialExpiredEmail({
      firstName: "Alex",
      reactivateUrl: "https://chatly.example/dashboard/settings?section=billing"
    });

    expect(trialEnding.subject).toBe("Your trial ends in 3 days");
    expect(trialEnding.bodyHtml).toContain("Upgrade Now");
    expect(productUpdate.subject).toBe("New in Chatting: Smarter visitor routing");
    expect(productUpdate.bodyHtml).toContain("Read Full Changelog");
    expect(extension.bodyText).toContain("Your updated trial end date: April 8, 2026");
    expect(expired.bodyText).toContain("Growth - $20/seat/month");
    expect(expired.bodyHtml).toContain("Per-seat pricing as your team grows");
  });
});
