import { renderAccountWelcomeEmail, renderEmailVerificationEmail, renderTeamInvitationEmail } from "@/lib/chatting-transactional-emails";
import {
  renderDailyDigestEmail,
  renderMentionNotificationEmail,
  renderNewMessageNotificationEmail,
  renderWeeklyPerformanceEmail
} from "@/lib/chatting-notification-emails";
import { renderProductUpdateEmail, renderTrialExpiredEmail, renderTrialEndingReminderEmail } from "@/lib/chatting-marketing-emails";

describe("chatting email design system", () => {
  function expectTableFirstSharedLayout(html: string) {
    expect(html).toContain('role="presentation" width="100%"');
    expect(html.match(/<div style=/g)?.length ?? 0).toBe(1);
  }

  it("renders transactional emails with the shared shell", () => {
    const welcome = renderAccountWelcomeEmail({
      firstName: "Alex",
      dashboardUrl: "https://chatting.example/dashboard"
    });
    const verification = renderEmailVerificationEmail({
      verifyUrl: "https://chatting.example/verify?token=abc"
    });
    const invite = renderTeamInvitationEmail({
      inviterName: "Sarah Chen",
      teamName: "Acme Support",
      teamWebsite: "acme.example",
      memberCount: 3,
      inviteUrl: "https://chatting.example/signup?invite=123"
    });

    expect(welcome.subject).toBe("Welcome to Chatting — let's get you set up");
    expect(welcome.bodyHtml).toContain("max-width:600px");
    expectTableFirstSharedLayout(welcome.bodyHtml);
    expect(verification.bodyText).toContain("This link expires in 24 hours.");
    expect(verification.bodyHtml).not.toContain("✉");
    expectTableFirstSharedLayout(verification.bodyHtml);
    expect(invite.bodyHtml).toContain("Continue to Invitation");
    expectTableFirstSharedLayout(invite.bodyHtml);
    expect(invite.bodyText).toContain("Continue to Invitation:");
  });

  it("avoids repeated Chatting branding in team invites", () => {
    const invite = renderTeamInvitationEmail({
      inviterName: "Tina Bauer",
      teamName: "Chatting",
      teamWebsite: "https://usechatting.com",
      memberCount: 3,
      inviteUrl: "https://chatting.example/signup?invite=123"
    });

    expect(invite.subject).toBe("Tina Bauer invited you to join the Chatting team");
    expect(invite.bodyText).toContain("Tina Bauer has invited you to join the Chatting team.");
    expect(invite.bodyText).not.toContain("Chatting on Chatting");
    expect(invite.bodyText).not.toContain("team members");
  });

  it("renders notification emails with metrics, quotes, and action buttons", () => {
    const message = renderNewMessageNotificationEmail({
      visitorName: "Alex",
      visitorEmail: "alex@example.com",
      currentPage: "/pricing",
      messagePreview: "Do you support annual billing?",
      replyNowUrl: "mailto:reply@chatting.example",
      inboxUrl: "https://chatting.example/dashboard?id=conv_1"
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
      inboxUrl: "https://chatting.example/dashboard"
    });
    const weekly = renderWeeklyPerformanceEmail({
      teamName: "Acme Support",
      dateRange: "Mar 22 to Mar 28",
      previewText: "47 conversations, 1.4 min avg response time",
      reportUrl: "https://chatting.example/dashboard/analytics?range=last_week",
      settingsUrl: "https://chatting.example/dashboard/settings?section=reports",
      widgetUrl: "https://chatting.example/dashboard/widget",
      quietWeek: false,
      metrics: [
        { label: "Conversations", value: "47", trendLabel: "↑ 12% vs last week", trendTone: "positive", trendDirection: "up" },
        { label: "Avg response", value: "1.4 min", trendLabel: "↓ 18% vs last week", trendTone: "positive", trendDirection: "down" },
        { label: "Resolution rate", value: "92%", trendLabel: "↑ 3% vs last week", trendTone: "positive", trendDirection: "up" },
        { label: "Satisfaction", value: "4.8 / 5", trendLabel: "↑ 0.2 vs last week", trendTone: "positive", trendDirection: "up" }
      ],
      heatmapHours: ["8am", "9", "10", "11", "12", "1pm", "2", "3", "4", "5", "6", "7"],
      heatmapRows: [
        { label: "Mon", cells: Array.from({ length: 12 }, (_, index) => ({ count: index === 0 ? 2 : 0, intensity: index === 0 ? "medium" : "empty" })) },
        { label: "Tue", cells: Array.from({ length: 12 }, (_, index) => ({ count: index === 6 ? 12 : 0, intensity: index === 6 ? "peak" : "empty" })) },
        { label: "Wed", cells: Array.from({ length: 12 }, () => ({ count: 0, intensity: "empty" })) },
        { label: "Thu", cells: Array.from({ length: 12 }, () => ({ count: 0, intensity: "empty" })) },
        { label: "Fri", cells: Array.from({ length: 12 }, () => ({ count: 0, intensity: "empty" })) },
        { label: "Sat", cells: Array.from({ length: 12 }, () => ({ count: 0, intensity: "empty" })) },
        { label: "Sun", cells: Array.from({ length: 12 }, () => ({ count: 0, intensity: "empty" })) }
      ],
      peakLabel: "Tue 2pm-3pm (12 conversations)",
      topPages: [{ label: "/pricing", count: 18, widthPercent: 100 }, { label: "/features", count: 11, widthPercent: 61 }],
      insight: "Response time improved 18% week over week, which usually shows up fastest in visitor confidence.",
      tip: { text: "Save a few quick replies for common questions to keep first-response time down.", href: "https://chatting.example/dashboard/settings?section=savedReplies", label: "Create saved replies" },
      teamPerformance: [
        {
          userId: "user_1",
          name: "Sarah Chen",
          initials: "SC",
          conversationsLabel: "38 conversations",
          avgResponseLabel: "52s avg",
          resolutionLabel: "96% resolved",
          satisfactionLabel: "⭐ 4.9",
          conversationCount: 38
        }
      ],
      personalPerformanceByUserId: {},
      recipientUserId: "user_1",
      personalPerformance: {
        userId: "user_1",
        name: "Sarah Chen",
        conversationsLabel: "38 conversations",
        avgResponseLabel: "52s avg",
        resolutionLabel: "96% resolved",
        satisfactionLabel: "⭐ 4.9",
        teamAverageLabel: "1.1m avg · 91% resolved · ⭐ 4.7"
      }
    });
    const mention = renderMentionNotificationEmail({
      mentionerName: "Sarah",
      visitorName: "Alex",
      note: "@Tina can you confirm whether this customer qualifies for annual billing?",
      noteMeta: "Pricing conversation • 3 minutes ago",
      conversationUrl: "https://chatting.example/dashboard/inbox?id=conv_1"
    });

    expect(message.subject).toBe("New message from Alex");
    expect(message.bodyHtml).toContain("Reply Now");
    expectTableFirstSharedLayout(message.bodyHtml);
    expect(digest.bodyHtml).toContain("Open conversations");
    expect(digest.bodyHtml).toContain('height="108"');
    expectTableFirstSharedLayout(digest.bodyHtml);
    expect(weekly.bodyText).toContain("View Full Analytics → https://chatting.example/dashboard/analytics?range=last_week");
    expect(weekly.bodyText).toContain("Team performance:");
    expect(weekly.bodyHtml).toContain("Your stats");
    expect(weekly.bodyHtml).toContain("Team performance");
    expectTableFirstSharedLayout(weekly.bodyHtml);
    expect(mention.subject).toBe("Sarah mentioned you in a conversation");
    expect(mention.bodyHtml).toContain("View Conversation");
    expectTableFirstSharedLayout(mention.bodyHtml);
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
      upgradeUrl: "https://chatting.example/dashboard/settings?section=billing",
      plansUrl: "https://chatting.example/pricing"
    });
    const productUpdate = renderProductUpdateEmail({
      featureName: "Smarter visitor routing",
      featureDescription: "Send high-intent conversations to the right teammate faster.",
      monthLabel: "March 2026",
      tryItUrl: "https://chatting.example/dashboard",
      changelogUrl: "https://chatting.example/changelog",
      additionalUpdates: ["Refined inbox filters", "Faster transcript exports"]
    });
    const expired = renderTrialExpiredEmail({
      firstName: "Alex",
      reactivateUrl: "https://chatting.example/dashboard/settings?section=billing"
    });

    expect(trialEnding.subject).toBe("Your trial ends in 3 days");
    expect(trialEnding.bodyHtml).toContain("Upgrade Now");
    expectTableFirstSharedLayout(trialEnding.bodyHtml);
    expect(productUpdate.subject).toBe("New in Chatting: Smarter visitor routing");
    expect(productUpdate.bodyHtml).toContain("Read Full Changelog");
    expectTableFirstSharedLayout(productUpdate.bodyHtml);
    expect(expired.bodyText).toContain("Your workspace has moved to Starter");
    expect(expired.bodyText).toContain("Growth pricing");
    expect(expired.bodyText).toContain("Starts at $20/month for up to 3 members");
    expect(expired.bodyText).toContain("$6/member for 4-9 members");
    expect(expired.bodyHtml).toContain("Your workspace has moved to Starter");
    expect(expired.bodyHtml).toContain("Growth pricing");
    expect(expired.bodyHtml).toContain("$5/member");
    expect(expired.bodyHtml).toContain("25-49 members");
    expect(expired.bodyHtml).toContain("Proactive chat");
    expect(expired.bodyHtml).toContain("1-3 team members included");
    expectTableFirstSharedLayout(expired.bodyHtml);
  });
});
