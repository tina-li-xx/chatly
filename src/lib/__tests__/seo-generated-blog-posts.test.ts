const mocks = vi.hoisted(() => ({
  hydrateBlogPost: vi.fn((post) => ({
    ...post,
    author: { slug: post.authorSlug, name: "Tina" },
    category: { slug: post.categorySlug, label: "Comparisons" }
  }))
}));

vi.mock("@/lib/blog-data", () => ({
  hydrateBlogPost: mocks.hydrateBlogPost
}));

import {
  isReviewGeneratedDraftRow,
  isPublishedGeneratedDraftRow,
  isQueuedGeneratedDraftRow,
  resolveGeneratedDraftPublicationStatus,
  resolveGeneratedDraftWorkflowStatus,
  toGeneratedBlogPost
} from "@/lib/seo-generated-blog-posts";

function generatedRow(publicationStatus: "draft" | "scheduled" | "published", publishedAt: string) {
  return {
    title: "Generated draft",
    slug: "generated-draft",
    excerpt: "Excerpt",
    subtitle: "Subtitle",
    author_slug: "tina",
    category_slug: "comparisons",
    publication_status: publicationStatus,
    reading_time: 8,
    updated_at: "2026-04-19T09:00:00.000Z",
    draft_payload_json: {
      post: {
        slug: "generated-draft",
        title: "Generated draft",
        excerpt: "Excerpt",
        subtitle: "Subtitle",
        publishedAt,
        updatedAt: "2026-04-19T09:00:00.000Z",
        readingTime: 8,
        authorSlug: "tina",
        categorySlug: "comparisons",
        image: { src: "/blog/chatting-vs-intercom.svg", alt: "Alt" },
        relatedSlugs: [],
        sections: [],
        publicationStatus
      }
    }
  };
}

describe("seo generated blog posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("treats past scheduled drafts as published public posts", () => {
    const row = generatedRow("scheduled", "2026-04-10T09:00:00.000Z");

    expect(resolveGeneratedDraftPublicationStatus(row as never, new Date("2026-04-12T09:00:00.000Z"))).toBe("published");
    expect(isPublishedGeneratedDraftRow(row as never, new Date("2026-04-12T09:00:00.000Z"))).toBe(true);
    expect(isQueuedGeneratedDraftRow(row as never, new Date("2026-04-12T09:00:00.000Z"))).toBe(false);
  });

  it("keeps future scheduled drafts in the queue", () => {
    const row = generatedRow("scheduled", "2026-04-20T09:00:00.000Z");
    const post = toGeneratedBlogPost(row as never, new Date("2026-04-12T09:00:00.000Z"));

    expect(resolveGeneratedDraftPublicationStatus(row as never, new Date("2026-04-12T09:00:00.000Z"))).toBe("scheduled");
    expect(isQueuedGeneratedDraftRow(row as never, new Date("2026-04-12T09:00:00.000Z"))).toBe(true);
    expect(post?.publicationStatus).toBe("scheduled");
  });

  it("treats legacy autopilot scheduled drafts as review drafts until explicitly approved", () => {
    const row = {
      ...generatedRow("scheduled", "2026-04-20T09:00:00.000Z"),
      status: "scheduled",
      metadata_json: { autopilotGenerated: true }
    };
    const post = toGeneratedBlogPost(row as never, new Date("2026-04-12T09:00:00.000Z"));

    expect(resolveGeneratedDraftWorkflowStatus(row as never)).toBe("ready_for_review");
    expect(resolveGeneratedDraftPublicationStatus(row as never, new Date("2026-04-12T09:00:00.000Z"))).toBe("draft");
    expect(isQueuedGeneratedDraftRow(row as never, new Date("2026-04-12T09:00:00.000Z"))).toBe(true);
    expect(isReviewGeneratedDraftRow(row as never, new Date("2026-04-12T09:00:00.000Z"))).toBe(true);
    expect(post?.publicationStatus).toBe("draft");
  });

  it("keeps approved scheduled drafts out of the review drafts list", () => {
    const row = {
      ...generatedRow("scheduled", "2026-04-20T09:00:00.000Z"),
      status: "scheduled",
      metadata_json: { approvedForScheduling: true }
    };

    expect(isQueuedGeneratedDraftRow(row as never, new Date("2026-04-12T09:00:00.000Z"))).toBe(true);
    expect(isReviewGeneratedDraftRow(row as never, new Date("2026-04-12T09:00:00.000Z"))).toBe(false);
  });

  it("normalizes mixed faq blocks on stored generated drafts", () => {
    const row = {
      ...generatedRow("draft", "2026-04-20T09:00:00.000Z"),
      draft_payload_json: {
        post: {
          ...generatedRow("draft", "2026-04-20T09:00:00.000Z").draft_payload_json.post,
          sections: [
            {
              id: "bottom-line",
              title: "Bottom line",
              blocks: [
                { type: "paragraph", text: "Paragraph" },
                { type: "faq", items: [{ question: "Question?", answer: "Answer." }] }
              ]
            }
          ]
        }
      }
    };
    const post = toGeneratedBlogPost(row as never, new Date("2026-04-12T09:00:00.000Z"));

    expect(post?.sections).toEqual([
      {
        id: "bottom-line",
        title: "Bottom line",
        blocks: [{ type: "paragraph", text: "Paragraph" }]
      },
      {
        id: "faq",
        title: "FAQ",
        blocks: [{ type: "faq", items: [{ question: "Question?", answer: "Answer." }] }]
      }
    ]);
  });
});
