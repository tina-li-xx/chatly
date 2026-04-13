import "server-only";

import { buildChattingSeoAnalysisCandidates } from "@/lib/chatting-seo-analysis-candidates";
import { chattingSeoProfile } from "@/lib/chatting-seo-profile";
import { generatedBlogPosts } from "@/lib/generated-blog-posts";
import type { ChattingSeoAnalysisInput, ChattingSeoKeywordCandidate } from "@/lib/chatting-seo-analysis-types";
import type { ChattingSeoLiveResearch } from "@/lib/chatting-seo-live-research-types";

export function buildChattingSeoBaseAnalysisInput(input?: {
  candidates?: ChattingSeoKeywordCandidate[];
  liveResearch?: ChattingSeoLiveResearch | null;
}): ChattingSeoAnalysisInput {
  return {
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
    competitors: chattingSeoProfile.messaging.competitiveFraming.map((entry) => ({
      slug: entry.slug,
      name: entry.name,
      summary: entry.summary,
      points: entry.points
    })),
    themes: chattingSeoProfile.contentInventory.blogCategories.map(({ slug, label, description }) => ({ slug, label, description })),
    blogPosts: generatedBlogPosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      seoTitle: post.seoTitle ?? post.title,
      categorySlug: post.categorySlug
    })),
    guides: chattingSeoProfile.contentInventory.guides,
    freeTools: chattingSeoProfile.contentInventory.freeTools,
    candidates: input?.candidates ?? buildChattingSeoAnalysisCandidates(chattingSeoProfile),
    liveResearch: input?.liveResearch ?? null
  };
}
