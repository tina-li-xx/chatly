import { renderToStaticMarkup } from "react-dom/server";
import { SettingsAiAssistSection } from "./dashboard-settings-ai-assist-section";

describe("settings ai assist section", () => {
  it("renders workspace usage summary and recent activity", () => {
    const html = renderToStaticMarkup(
      <SettingsAiAssistSection
        title="AI Assist"
        subtitle="Control summaries, reply suggestions, rewrites, and suggested tags"
        aiAssist={{
          replySuggestionsEnabled: true,
          conversationSummariesEnabled: true,
          rewriteAssistanceEnabled: true,
          suggestedTagsEnabled: true
        }}
        planKey="growth"
        usage={{
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
              actorEmail: "alex@example.com",
              actorLabel: "Alex",
              actorUserId: "user_1",
              requests: 120,
              used: 78,
              acceptanceRate: 65,
              summaries: 21,
              isViewer: true
            }
          ],
          viewer: {
            requests: 120,
            used: 78,
            acceptanceRate: 65,
            teamSharePercent: 14
          },
          activity: [
            {
              id: "event_1",
              actorEmail: "alex@example.com",
              actorLabel: "Alex",
              actorUserId: "user_1",
              feature: "reply",
              action: "used",
              conversationId: "conv_1",
              conversationPreview: "/pricing",
              createdAt: "2026-04-06T11:00:00.000Z",
              tone: null,
              tag: null,
              edited: false,
              editLevel: null
            }
          ]
        }}
        onUpdateAiAssist={vi.fn()}
      />
    );

    expect(html).toContain("Usage &amp; Activity");
    expect(html).toContain("847 / 2000 requests");
    expect(html).toContain("Team requests");
    expect(html).toContain("Your share");
    expect(html).toContain("Alex");
    expect(html).toContain("Reply suggestion");
  });

  it("hides team usage details for members", () => {
    const html = renderToStaticMarkup(
      <SettingsAiAssistSection
        title="AI Assist"
        subtitle="Control summaries, reply suggestions, rewrites, and suggested tags"
        aiAssist={{
          replySuggestionsEnabled: true,
          conversationSummariesEnabled: true,
          rewriteAssistanceEnabled: true,
          suggestedTagsEnabled: true
        }}
        planKey="growth"
        usage={{
          monthLabel: "April 2026",
          viewerCanSeeTeamUsage: false,
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
          teamMembers: [],
          viewer: {
            requests: 12,
            used: 8,
            acceptanceRate: 67,
            teamSharePercent: null
          },
          activity: []
        }}
        onUpdateAiAssist={vi.fn()}
      />
    );

    expect(html).not.toContain("847 / 2000 requests");
    expect(html).not.toContain("Team requests");
    expect(html).not.toContain("Your share");
    expect(html).toContain("Your requests");
    expect(html).toContain("Acceptance");
  });
});
