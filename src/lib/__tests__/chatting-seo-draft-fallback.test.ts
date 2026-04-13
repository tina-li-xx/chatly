import { chattingSeoProfile } from "@/lib/chatting-seo-profile";
import { buildFallbackChattingSeoDraft } from "@/lib/chatting-seo-draft-fallback";

describe("chatting seo draft fallback", () => {
  it("builds a valid Chatting blog draft from a plan item", () => {
    const post = buildFallbackChattingSeoDraft({
      profile: chattingSeoProfile,
      planItem: {
        title: "HubSpot chat alternative for small teams",
        target_keyword: "hubspot chat alternative",
        persona_slug: "founders",
        category_slug: "comparisons",
        cta_id: "see-pricing",
        rationale: "High-intent buyer keyword for small teams.",
        target_publish_at: "2026-04-20T09:00:00.000Z"
      } as never
    });

    expect(post.slug).toContain("hubspot-chat-alternative");
    expect(post.sections.length).toBeGreaterThan(3);
    expect(post.publicationStatus).toBe("draft");
    expect(post.categorySlug).toBe("comparisons");
    expect(post.sections.at(-1)).toMatchObject({
      title: "FAQ",
      blocks: [{ type: "faq" }]
    });
  });
});
