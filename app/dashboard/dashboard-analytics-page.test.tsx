import { renderToStaticMarkup } from "react-dom/server";

import { DashboardAnalyticsPage } from "./dashboard-analytics-page";

describe("dashboard analytics page", () => {
  const dataset = (() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

    return {
      conversations: [
        {
          id: "conv_1",
          createdAt: twoDaysAgo,
          updatedAt: oneDayAgo,
          status: "resolved",
          pageUrl: "/pricing",
          referrer: "google.com",
          rating: 5,
          firstResponseSeconds: 45,
          resolutionSeconds: 420,
          tags: ["pricing", "lead"]
        },
        {
          id: "conv_2",
          createdAt: oneDayAgo,
          updatedAt: oneDayAgo,
          status: "open",
          pageUrl: "/docs",
          referrer: "direct",
          rating: 2,
          firstResponseSeconds: 90,
          resolutionSeconds: null,
          tags: ["support"]
        }
      ],
      replyEvents: [
        {
          createdAt: oneDayAgo,
          responseSeconds: 45
        },
        {
          createdAt: oneDayAgo,
          responseSeconds: 90
        }
      ],
      aiAssist: {
        monthLabel: "April 2026",
        viewerCanSeeTeamUsage: true,
        meter: {
          planKey: "growth",
          limit: 2000,
          used: 847,
          remaining: 1153,
          percentUsed: 42,
          resetsAt: "2026-05-01T00:00:00.000Z",
          state: "normal"
        },
        overview: {
          requests: 847,
          used: 523,
          acceptanceRate: 62,
          summaries: 234,
          requestedByFeature: {
            summary: 234,
            reply: 487,
            rewrite: 89,
            tags: 37
          }
        },
        trend: {
          requests: 12,
          used: 18,
          acceptanceRate: 5,
          summaries: 8
        },
        teamMembers: [
          {
            actorEmail: "sarah@example.com",
            actorLabel: "Sarah",
            actorUserId: "user_1",
            requests: 312,
            used: 213,
            acceptanceRate: 68,
            summaries: 45,
            isViewer: false
          }
        ],
        viewer: {
          requests: 47,
          used: 32,
          acceptanceRate: 68,
          teamSharePercent: 6
        },
        activity: [
          {
            id: "event_1",
            actorEmail: "sarah@example.com",
            actorLabel: "Sarah",
            actorUserId: "user_1",
            feature: "reply",
            action: "used",
            conversationId: "conv_1",
            conversationPreview: "/pricing",
            createdAt: oneDayAgo,
            tone: null,
            tag: null,
            edited: false,
            editLevel: null
          }
        ]
      }
    };
  })();

  it("renders overview by default with the analytics sidebar", () => {
    const html = renderToStaticMarkup(
      <DashboardAnalyticsPage
        userEmail="tina@chatly.example"
        initialDataset={dataset}
      />
    );

    expect(html).toContain("Overview");
    expect(html).toContain("Conversations");
    expect(html).toContain("Team Performance");
    expect(html).toContain("AI Assist");
    expect(html).toContain("Conversations over time");
    expect(html).not.toContain("Response time");
    expect(html).not.toContain("Team AI usage");
  });

  it("renders the conversations section when selected", () => {
    const html = renderToStaticMarkup(
      <DashboardAnalyticsPage
        userEmail="tina@chatly.example"
        initialDataset={dataset}
        activeSection="conversations"
      />
    );

    expect(html).toContain("Response time");
    expect(html).toContain("Busiest hours");
    expect(html).toContain("Top pages");
    expect(html).toContain("Satisfaction breakdown");
    expect(html).toContain("Conversation tags");
    expect(html).not.toContain("Team performance");
  });

  it("renders the team performance and ai assist sections when selected", () => {
    const teamHtml = renderToStaticMarkup(
      <DashboardAnalyticsPage
        userEmail="tina@chatly.example"
        initialDataset={dataset}
        activeSection="teamPerformance"
      />
    );
    const aiHtml = renderToStaticMarkup(
      <DashboardAnalyticsPage
        userEmail="tina@chatly.example"
        initialDataset={dataset}
        activeSection="aiAssist"
      />
    );

    expect(teamHtml).toContain("Team performance");
    expect(teamHtml).not.toContain("Team AI usage");
    expect(aiHtml).toContain("Team AI usage");
    expect(aiHtml).toContain("Usage by type");
    expect(aiHtml).toContain("By team member");
  });

  it("renders personal-only ai assist analytics for members", () => {
    const html = renderToStaticMarkup(
      <DashboardAnalyticsPage
        userEmail="tina@chatly.example"
        initialDataset={{
          ...dataset,
          aiAssist: {
            ...dataset.aiAssist,
            viewerCanSeeTeamUsage: false,
            teamMembers: [],
            viewer: {
              requests: 12,
              used: 8,
              acceptanceRate: 67,
              teamSharePercent: null
            },
            activity: [
              {
                ...dataset.aiAssist.activity[0],
                actorLabel: "Tina",
                actorUserId: "viewer_1"
              }
            ]
          }
        }}
        activeSection="aiAssist"
      />
    );

    expect(html).toContain("Your AI usage");
    expect(html).not.toContain("Team AI usage");
    expect(html).not.toContain("Usage by type");
    expect(html).not.toContain("By team member");
    expect(html).not.toContain("847 / 2000 requests");
  });

  it("renders the dedicated ai assist activity page when requested", () => {
    const html = renderToStaticMarkup(
      <DashboardAnalyticsPage
        userEmail="tina@chatly.example"
        initialDataset={{
          ...dataset,
          aiAssistActivityPage: {
            activity: dataset.aiAssist.activity,
            members: [{ id: "user_1", label: "Sarah" }],
            filters: {
              type: "all",
              memberId: "all",
              date: "7d",
              customStart: "2026-04-01",
              customEnd: "2026-04-06"
            },
            hasAnyActivity: true,
            hasMore: false,
            nextCursor: null
          }
        }}
        activeSection="aiAssist"
        showAllAiActivity
      />
    );

    expect(html).toContain("AI Assist Activity");
    expect(html).toContain("Back to AI Assist");
    expect(html).toContain("All types");
    expect(html).not.toContain("Team AI usage");
  });

  it("renders the date-range empty state inside a section scaffold", () => {
    const oldDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    const html = renderToStaticMarkup(
      <DashboardAnalyticsPage
        userEmail="tina@chatly.example"
        initialDataset={{
          ...dataset,
          conversations: [
            {
              ...dataset.conversations[0],
              createdAt: oldDate,
              updatedAt: oldDate
            }
          ],
          replyEvents: []
        }}
        activeSection="conversations"
      />
    );

    expect(html).toContain("Conversations");
    expect(html).toContain("No data for this period");
    expect(html).toContain("Try switching the date range to see how conversations and response times are moving.");
  });

  it("renders the global empty state when there is no analytics data", () => {
    const html = renderToStaticMarkup(
      <DashboardAnalyticsPage
        userEmail="tina@chatly.example"
        initialDataset={{
          conversations: [],
          replyEvents: [],
          aiAssist: undefined
        }}
      />
    );

    expect(html).toContain("No data yet");
    expect(html).toContain("Analytics will start filling in as soon as visitors begin conversations on your site.");
  });
});
