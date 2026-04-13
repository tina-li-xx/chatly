import "server-only";

import { blogCategories } from "@/lib/blog-data";
import { chattingMarketingContext } from "@/lib/chatting-marketing-context";
import { getAllFreeTools } from "@/lib/free-tools-data";
import { getAllGuides } from "@/lib/guides-data";
import { getChattingPaidStartingPriceCopy } from "@/lib/pricing";
import {
  HOME_PAGE_OG_DESCRIPTION,
  HOME_PAGE_SEO_DESCRIPTION,
  SITE_SEO_DESCRIPTION,
  SITE_SEO_TITLE
} from "@/lib/site-seo";

export type ChattingSeoProfile = {
  productName: string;
  canonicalUrl: string;
  sourceOfTruth: {
    marketingContextPath: string;
    marketingAuditPath: string;
    siteSeoModule: string;
    pricingModule: string;
    blogDataModule: string;
    guidesDataModule: string;
    freeToolsDataModule: string;
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    homePageDescription: string;
    homePageOgDescription: string;
    pricingAnchor: string;
  };
  messaging: Omit<ChattingSeoProfileSource, "sourcePath" | "auditPath">;
  contentInventory: {
    blogCategories: Array<{ slug: string; label: string; description: string }>;
    guides: Array<{ slug: string; title: string; excerpt: string; seoTitle: string }>;
    freeTools: Array<{ slug: string; title: string; category: string; href: string; seoTitle: string }>;
  };
  ctas: Array<{ id: string; label: string; href: string }>;
};

type ChattingSeoProfileSource = typeof chattingMarketingContext;

export const chattingSeoProfile: ChattingSeoProfile = {
  productName: "Chatting",
  canonicalUrl: "https://usechatting.com",
  sourceOfTruth: {
    marketingContextPath: chattingMarketingContext.sourcePath,
    marketingAuditPath: chattingMarketingContext.auditPath,
    siteSeoModule: "@/lib/site-seo",
    pricingModule: "@/lib/pricing",
    blogDataModule: "@/lib/blog-data",
    guidesDataModule: "@/lib/guides-data",
    freeToolsDataModule: "@/lib/free-tools-data"
  },
  seo: {
    siteTitle: SITE_SEO_TITLE,
    siteDescription: SITE_SEO_DESCRIPTION,
    homePageDescription: HOME_PAGE_SEO_DESCRIPTION,
    homePageOgDescription: HOME_PAGE_OG_DESCRIPTION,
    pricingAnchor: getChattingPaidStartingPriceCopy()
  },
  messaging: {
    positioning: chattingMarketingContext.positioning,
    coreStory: chattingMarketingContext.coreStory,
    founderApprovedClaims: chattingMarketingContext.founderApprovedClaims,
    verifiedProductCoverage: chattingMarketingContext.verifiedProductCoverage,
    bestFit: chattingMarketingContext.bestFit,
    notFit: chattingMarketingContext.notFit,
    competitiveFraming: chattingMarketingContext.competitiveFraming,
    tone: chattingMarketingContext.tone,
    prefer: chattingMarketingContext.prefer,
    avoid: chattingMarketingContext.avoid,
    contentFit: chattingMarketingContext.contentFit,
    contentMisfit: chattingMarketingContext.contentMisfit,
    claimsDiscipline: chattingMarketingContext.claimsDiscipline
  },
  contentInventory: {
    blogCategories: blogCategories.map(({ slug, label, description }) => ({ slug, label, description })),
    guides: getAllGuides().map(({ slug, title, excerpt, seoTitle }) => ({ slug, title, excerpt, seoTitle })),
    freeTools: getAllFreeTools().map(({ slug, title, category, href, seoTitle }) => ({ slug, title, category, href, seoTitle }))
  },
  ctas: [
    { id: "start-free", label: "Start chatting free", href: "/signup" },
    { id: "see-pricing", label: "See pricing", href: "/#pricing" },
    { id: "read-guides", label: "Read the guides", href: "/guides" }
  ]
};

export function getChattingSeoCompetitor(slug: string) {
  return chattingSeoProfile.messaging.competitiveFraming.find((competitor) => competitor.slug === slug) || null;
}

export function getChattingSeoTheme(slug: string) {
  return chattingSeoProfile.contentInventory.blogCategories.find((theme) => theme.slug === slug) || null;
}
