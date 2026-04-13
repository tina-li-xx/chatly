import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardPublishingPage } from "./dashboard-publishing-page";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => <a href={href} {...props}>{children}</a>
}));

vi.mock("./dashboard-publishing-regenerate-button", () => ({
  DashboardPublishingRegenerateButton: ({ kind }: { kind: "draft" | "plan-item" }) => (
    <button type="button">{kind === "draft" ? "Regenerate draft" : "Regenerate topic"}</button>
  )
}));

vi.mock("./dashboard-publishing-generate-draft-button", () => ({
  DashboardPublishingGenerateDraftButton: () => <button type="button">Generate draft</button>
}));

describe("dashboard publishing page", () => {
  const seoSnapshot = {
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
  };

  it("renders queued posts with status, dates, author, and category in the queue section", () => {
    const html = renderToStaticMarkup(
      <DashboardPublishingPage
        activeSection="queue"
        seoSnapshot={seoSnapshot}
        queuedPosts={[
          {
            slug: "zendesk-alternatives-small-teams",
            title: "Zendesk alternatives for small teams",
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
          }
        ]}
      />
    );

    expect(html).toContain("Queued blog posts");
    expect(html).toContain("Zendesk alternatives for small teams");
    expect(html).toContain('href="/dashboard/publishing/zendesk-alternatives-small-teams"');
    expect(html).toContain("/zendesk-alternatives-small-teams");
    expect(html).toContain("draft");
    expect(html).toContain("14 Apr 2026");
    expect(html).toContain("Tina");
    expect(html).toContain("Comparisons");
  });

  it("renders the overview section by default", () => {
    const html = renderToStaticMarkup(<DashboardPublishingPage queuedPosts={[]} seoSnapshot={seoSnapshot} />);

    expect(html).toContain("SEO Autopilot");
    expect(html).not.toContain("Current strategy snapshot");
    expect(html).not.toContain("Queued blog posts");
  });

  it("renders empty state copy for the plans section", () => {
    const html = renderToStaticMarkup(<DashboardPublishingPage activeSection="plans" queuedPosts={[]} seoSnapshot={seoSnapshot} />);

    expect(html).toContain("Plan runs");
    expect(html).toContain("No plan runs yet.");
  });

  it("renders draft preview links in the drafts section", () => {
    const html = renderToStaticMarkup(
      <DashboardPublishingPage
        activeSection="drafts"
        queuedPosts={[]}
        seoSnapshot={{
          ...seoSnapshot,
          drafts: [
            {
              id: "draft_1",
              title: "Best website chat widget for small teams in 2025",
              slug: "best-website-chat-widget-for-small-teams-in-2025",
              status: "ready_for_review",
              publicationStatus: "draft",
              updatedAt: "2026-04-13T09:00:00.000Z",
              categorySlug: "small-teams"
            }
          ]
        }}
      />
    );

    expect(html).toContain("Preview draft");
    expect(html).toContain('href="/dashboard/publishing/best-website-chat-widget-for-small-teams-in-2025"');
    expect(html).toContain("Regenerate draft");
  });

  it("hides scheduled posts from the drafts section", () => {
    const html = renderToStaticMarkup(
      <DashboardPublishingPage
        activeSection="drafts"
        queuedPosts={[]}
        seoSnapshot={{
          ...seoSnapshot,
          drafts: [
            {
              id: "draft_1",
              title: "Needs review",
              slug: "needs-review",
              status: "ready_for_review",
              publicationStatus: "draft",
              updatedAt: "2026-04-13T09:00:00.000Z",
              categorySlug: "small-teams"
            },
            {
              id: "draft_2",
              title: "Already scheduled",
              slug: "already-scheduled",
              status: "scheduled",
              publicationStatus: "scheduled",
              updatedAt: "2026-04-13T09:00:00.000Z",
              categorySlug: "product"
            }
          ]
        }}
      />
    );

    expect(html).toContain("Needs review");
    expect(html).not.toContain("Already scheduled");
  });

  it("labels plan priorities instead of showing a bare score", () => {
    const html = renderToStaticMarkup(
      <DashboardPublishingPage
        activeSection="plans"
        queuedPosts={[]}
        seoSnapshot={{
          ...seoSnapshot,
          planRuns: [
            {
              id: "run_1",
              role: "current",
              status: "ready",
              generatedAt: "2026-04-12T09:00:00.000Z",
              updatedAt: "2026-04-12T09:00:00.000Z",
              itemCount: 1,
              remainingItemCount: 1,
              summary: "Plan summary",
              analysisSource: "ai",
              researchSource: "live",
              items: [
                {
                  id: "item_1",
                  position: 1,
                  title: "Best website chat widget for small teams",
                  targetKeyword: "website chat widget for small teams",
                  status: "planned",
                  searchIntent: "commercial",
                  categorySlug: "small-teams",
                  ctaId: "start-free",
                  priorityScore: 100,
                  rationale: "Matches Chatting's core positioning.",
                  targetPublishAt: null
                }
              ]
            }
          ]
        }}
      />
    );

    expect(html).toContain("Priority 100");
    expect(html).toContain("Generate draft");
    expect(html).toContain("Regenerate topic");
  });
});
