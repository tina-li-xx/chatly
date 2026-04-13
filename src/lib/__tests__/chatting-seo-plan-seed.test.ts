import { chattingSeoProfile } from "@/lib/chatting-seo-profile";
import { buildChattingSeoSeedPlanItems } from "@/lib/chatting-seo-plan-seed";

describe("chatting seo plan seed", () => {
  it("builds a 30-item starter plan from the existing Chatting profile", () => {
    const items = buildChattingSeoSeedPlanItems(chattingSeoProfile);

    expect(items).toHaveLength(30);
    expect(new Set(items.map((item) => item.title)).size).toBe(30);
    expect(items.every((item) => item.status === "planned")).toBe(true);
    expect(items.every((item) => item.ctaId && item.categorySlug && item.themeSlug)).toBe(true);
    expect(items[0]?.position).toBe(1);
    expect(items.at(-1)?.position).toBe(30);
  });

  it("keeps the starter plan aligned to shipped blog categories and ctas", () => {
    const items = buildChattingSeoSeedPlanItems(chattingSeoProfile);
    const categorySlugs = new Set(chattingSeoProfile.contentInventory.blogCategories.map((item) => item.slug));
    const ctaIds = new Set(chattingSeoProfile.ctas.map((item) => item.id));

    expect(items.every((item) => categorySlugs.has(item.categorySlug || ""))).toBe(true);
    expect(items.every((item) => ctaIds.has(item.ctaId || ""))).toBe(true);
  });
});
