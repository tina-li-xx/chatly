import { buildChattingSeoAnalysisCandidates } from "@/lib/chatting-seo-analysis-candidates";
import { buildFallbackChattingSeoAnalysis } from "@/lib/chatting-seo-analysis-fallback";
import { chattingSeoProfile } from "@/lib/chatting-seo-profile";
import { buildFallbackChattingSeoPlan } from "@/lib/chatting-seo-plan-fallback";
import { generatedBlogPosts } from "@/lib/generated-blog-posts";

describe("chatting seo plan fallback", () => {
  it("builds a 30-day plan led by keyword-analysis opportunities", () => {
    const analysis = buildFallbackChattingSeoAnalysis({
      productName: chattingSeoProfile.productName,
      canonicalUrl: chattingSeoProfile.canonicalUrl,
      siteTitle: chattingSeoProfile.seo.siteTitle,
      siteDescription: chattingSeoProfile.seo.siteDescription,
      pricingAnchor: chattingSeoProfile.seo.pricingAnchor,
      positioning: chattingSeoProfile.messaging.positioning,
      founderApprovedClaims: chattingSeoProfile.messaging.founderApprovedClaims,
      verifiedProductCoverage: chattingSeoProfile.messaging.verifiedProductCoverage,
      bestFit: chattingSeoProfile.messaging.bestFit,
      notFit: chattingSeoProfile.messaging.notFit,
      contentFit: chattingSeoProfile.messaging.contentFit,
      contentMisfit: chattingSeoProfile.messaging.contentMisfit,
      competitors: chattingSeoProfile.messaging.competitiveFraming.map((entry) => ({ ...entry })),
      themes: chattingSeoProfile.contentInventory.blogCategories.map((entry) => ({ ...entry })),
      blogPosts: generatedBlogPosts.map((post) => ({
        slug: post.slug,
        title: post.title,
        seoTitle: post.seoTitle ?? post.title,
        categorySlug: post.categorySlug
      })),
      guides: chattingSeoProfile.contentInventory.guides,
      freeTools: chattingSeoProfile.contentInventory.freeTools,
      candidates: buildChattingSeoAnalysisCandidates(chattingSeoProfile)
    });
    const plan = buildFallbackChattingSeoPlan(chattingSeoProfile, analysis);

    expect(plan.source).toBe("fallback");
    expect(plan.items).toHaveLength(30);
    expect(plan.summary).toContain("30-day plan");
    expect(plan.items[0]?.notes).toContain("keyword analysis");
    expect(new Set(plan.items.map((item) => item.targetKeyword)).size).toBe(30);
  });
});
