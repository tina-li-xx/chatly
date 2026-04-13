import { renderToStaticMarkup } from "react-dom/server";
import { DashboardSwitchboardPage } from "./dashboard-switchboard-page";

const DATA = {
  summary: {
    totalWorkspaces: 12,
    activeWorkspaces7d: 7,
    payingWorkspaces: 4,
    trialingWorkspaces: 2,
    conversations30d: 143,
    verifiedWidgets: 9,
    attentionItems: 2
  },
  attentionItems: [{
    ownerUserId: "owner_1",
    ownerEmail: "owner@example.com",
    teamName: "Acme",
    reason: "Widget still not verified",
    detail: "acme.com has not reported a verified install yet."
  }],
  recentActivity: [{
    conversationId: "conv_1",
    ownerUserId: "owner_1",
    ownerEmail: "owner@example.com",
    teamName: "Acme",
    siteName: "Main site",
    visitorEmail: "visitor@example.com",
    createdAt: "2026-04-13T10:00:00.000Z",
    status: "open" as const,
    pageUrl: "https://acme.com/pricing",
    preview: "Do you support shared inboxes?"
  }],
  workspaces: [{
    ownerUserId: "owner_1",
    ownerEmail: "owner@example.com",
    ownerCreatedAt: "2026-03-20T10:00:00.000Z",
    emailVerifiedAt: "2026-03-20T10:05:00.000Z",
    teamName: "Acme",
    primaryDomain: "acme.com",
    siteCount: 2,
    siteDomains: ["acme.com", "docs.acme.com"],
    verifiedWidgetCount: 1,
    hasWidgetInstalled: true,
    planKey: "growth" as const,
    planName: "Growth",
    billingInterval: "monthly" as const,
    subscriptionStatus: "active",
    seatQuantity: 3,
    teamMemberCount: 3,
    trialEndsAt: null,
    conversationsLast30Days: 34,
    conversationsLast7Days: 9,
    openConversations: 4,
    lastConversationAt: "2026-04-13T10:30:00.000Z",
    lastLoginAt: "2026-04-13T09:30:00.000Z",
    attentionFlags: []
  }, {
    ownerUserId: "owner_2",
    ownerEmail: "quiet@example.com",
    ownerCreatedAt: "2026-03-10T10:00:00.000Z",
    emailVerifiedAt: "2026-03-10T10:05:00.000Z",
    teamName: "Quiet Co",
    primaryDomain: "quiet.example",
    siteCount: 1,
    siteDomains: ["quiet.example"],
    verifiedWidgetCount: 0,
    hasWidgetInstalled: false,
    planKey: "starter" as const,
    planName: "Starter",
    billingInterval: null,
    subscriptionStatus: null,
    seatQuantity: 1,
    teamMemberCount: 1,
    trialEndsAt: null,
    conversationsLast30Days: 0,
    conversationsLast7Days: 0,
    openConversations: 0,
    lastConversationAt: null,
    lastLoginAt: "2026-03-20T09:30:00.000Z",
    attentionFlags: ["widget"]
  }]
};

describe("dashboard switchboard page", () => {
  it("renders the overview section with switchboard navigation", () => {
    const html = renderToStaticMarkup(
      <DashboardSwitchboardPage data={DATA} activeSection="overview" activeCustomerFilter="all" />
    );

    expect(html).toContain("Customers");
    expect(html).toContain("Recent activity");
    expect(html).toContain("Analysis");
    expect(html).toContain("Queue");
    expect(html).toContain("143");
    expect(html).toContain("/dashboard/switchboard?section=attention");
    expect(html).toContain("/dashboard/switchboard?section=activity");
    expect(html).toContain("/dashboard/switchboard?section=customers");
    expect(html).toContain("/dashboard/switchboard?section=publishing-overview");
    expect(html).toContain("/dashboard/switchboard?section=publishing-queue");
    expect(html).toContain("/dashboard/switchboard?section=customers&amp;customerFilter=active");
  });

  it("filters the customer section when a customer filter is active", () => {
    const html = renderToStaticMarkup(
      <DashboardSwitchboardPage data={DATA} activeSection="customers" activeCustomerFilter="active" />
    );

    expect(html).toContain("Workspace rollup");
    expect(html).toContain("Acme");
    expect(html).toContain("owner@example.com");
    expect(html).not.toContain("Quiet Co");
    expect(html).toContain("Showing only workspaces with conversation or teammate activity in the last 7 days.");
    expect(html).not.toContain("docs.acme.com");
    expect(html).not.toContain("open now");
  });

  it("renders a publishing subsection inside the switchboard scaffold", () => {
    const html = renderToStaticMarkup(
      <DashboardSwitchboardPage
        data={null}
        publishingData={{
          queuedPosts: [{
            slug: "traffic-low-conversion",
            title: "Getting traffic but not enough sales or leads?",
            excerpt: "Excerpt",
            subtitle: "Subtitle",
            publicationStatus: "draft",
            publishedAt: "2026-04-14T09:00:00.000Z",
            updatedAt: "2026-04-14T09:00:00.000Z",
            readingTime: 10,
            authorSlug: "tina",
            categorySlug: "comparisons",
            image: { src: "/blog/test.svg", alt: "Test" },
            relatedSlugs: [],
            sections: [],
            author: { slug: "tina", name: "Tina", role: "Role", bio: "Bio", initials: "T", links: [] },
            category: { slug: "comparisons", label: "Comparisons", description: "Desc", badgeClassName: "bg-slate-100 text-slate-700" }
          }],
          seoSnapshot: {
            profile: {
              productName: "Chatting",
              canonicalUrl: "https://usechatting.com",
              seoTitle: "Chatting",
              seoDescription: "Internal SEO profile.",
              pricingAnchor: "Starts at $24/month",
              positioning: ["Live chat for small teams"],
              bestFit: ["Founders"],
              contentFit: ["Use-case pages"],
              claimsDiscipline: ["No invented claims"],
              competitors: [{ slug: "intercom", name: "Intercom", summary: "Well-known incumbent" }],
              themes: [{ slug: "comparisons", label: "Comparisons" }],
              inventoryCounts: { guides: 2, freeTools: 3, categories: 1, ctas: 1 },
              ctas: [{ id: "start-free", label: "Start chatting free", href: "/signup" }]
            },
            database: { status: "ready" as const, message: "Saved SEO planning data is available." },
            analysis: null,
            planRuns: [],
            drafts: []
          }
        }}
        activeSection="publishing-queue"
        activeCustomerFilter="all"
      />
    );

    expect(html).toContain("Queued blog posts");
    expect(html).toContain("Getting traffic but not enough sales or leads?");
    expect(html).toContain('href="/dashboard/publishing/traffic-low-conversion"');
  });
});
