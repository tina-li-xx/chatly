import { renderToStaticMarkup } from "react-dom/server";

import { DashboardAnalyticsPage } from "./dashboard-analytics-page";

describe("dashboard analytics page", () => {
  it("renders the analytics sections for a populated dataset", () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

    const html = renderToStaticMarkup(
      <DashboardAnalyticsPage
        userEmail="tina@chatly.example"
        initialDataset={{
          conversations: [
            {
              id: "conv_1",
              createdAt: twoDaysAgo,
              updatedAt: oneDayAgo,
              status: "resolved",
              pageUrl: "/pricing",
              referrer: "google.com",
              helpful: true,
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
              helpful: false,
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
          ]
        }}
      />
    );

    expect(html).toContain("Conversations over time");
    expect(html).toContain("Response time");
    expect(html).toContain("Busiest hours");
    expect(html).toContain("Team performance");
    expect(html).toContain("Top pages");
    expect(html).toContain("Satisfaction breakdown");
    expect(html).toContain("Conversation tags");
  });

  it("renders the empty state when there is no analytics data", () => {
    const html = renderToStaticMarkup(
      <DashboardAnalyticsPage
        userEmail="tina@chatly.example"
        initialDataset={{
          conversations: [],
          replyEvents: []
        }}
      />
    );

    expect(html).toContain("No data yet");
    expect(html).toContain("Analytics will start filling in as soon as visitors begin conversations on your site.");
  });
});
