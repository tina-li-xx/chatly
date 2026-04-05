import type { Metadata } from "next";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { buildDefaultSocialMetadata, HOME_PAGE_SEO_DESCRIPTION, SITE_SEO_DESCRIPTION, SITE_SEO_TITLE } from "@/lib/site-seo";
import { LandingBottomSections } from "./landing-page-bottom";
import { LandingHeader } from "./landing-page-primitives";
import { LandingTopSections } from "./landing-page-top";

const homepageUrl = buildAbsoluteUrl("/");

export const metadata: Metadata = {
  title: SITE_SEO_TITLE,
  description: SITE_SEO_DESCRIPTION,
  alternates: {
    canonical: homepageUrl
  },
  ...buildDefaultSocialMetadata({
    title: SITE_SEO_TITLE,
    description: HOME_PAGE_SEO_DESCRIPTION,
    url: homepageUrl,
    openGraphType: "website",
    includeSiteName: true
  })
};

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden bg-white text-slate-900">
      <LandingHeader />
      <LandingTopSections />
      <LandingBottomSections />
    </main>
  );
}
