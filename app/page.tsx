import type { Metadata } from "next";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { buildDefaultSocialMetadata, getDefaultOgImageUrl, HOME_PAGE_OG_DESCRIPTION, HOME_PAGE_SEO_DESCRIPTION, SITE_SEO_TITLE } from "@/lib/site-seo";
import { LandingBottomSections } from "./landing-page-bottom";
import { LandingHeader } from "./landing-page-primitives";
import { LandingTopSections } from "./landing-page-top";

const homepageUrl = buildAbsoluteUrl("/");
const homepageSchemaUrl = new URL(homepageUrl).origin;
const homepageSoftwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Chatting",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Live chat software for small teams. Shared inbox, visitor tracking, proactive messages, smart routing. Simple pricing with no per-seat fees.",
  url: homepageSchemaUrl,
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "0",
      priceCurrency: "USD",
      description: "50 conversations/month, 1 team member"
    },
    {
      "@type": "Offer",
      name: "Growth",
      price: "20",
      priceCurrency: "USD",
      priceValidUntil: "2026-12-31",
      description: "Unlimited conversations, 3 team members included"
    }
  ],
  brand: {
    "@type": "Brand",
    name: "Chatting"
  }
};
const homepageOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Chatting",
  url: homepageSchemaUrl,
  logo: buildAbsoluteUrl("/blog/chatting-logo.svg"),
  description:
    "Live chat software for small teams. Shared inbox, visitor tracking, proactive messages, smart routing. Simple pricing with no per-seat fees."
};

export const metadata: Metadata = {
  title: SITE_SEO_TITLE,
  description: HOME_PAGE_SEO_DESCRIPTION,
  keywords:
    "live chat, live chat software, small business live chat, website chat, customer chat, live chat widget, intercom alternative, crisp alternative, cheap live chat",
  authors: [{ name: "Chatting" }],
  robots: "index, follow",
  alternates: {
    canonical: homepageUrl
  },
  ...buildDefaultSocialMetadata({
    title: SITE_SEO_TITLE,
    description: HOME_PAGE_OG_DESCRIPTION,
    url: homepageUrl,
    openGraphType: "website",
    includeSiteName: true
  }),
  twitter: {
    card: "summary_large_image",
    title: SITE_SEO_TITLE,
    description:
      "See who's on your site. Answer their questions. Close the deal. Simple pricing, no per-seat games.",
    images: [
      {
        url: getDefaultOgImageUrl(),
        alt: "Chatting — Live chat for small teams"
      }
    ]
  }
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSoftwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageOrganizationSchema) }}
      />
      <main className="relative overflow-x-hidden bg-white text-slate-900">
        <LandingHeader />
        <LandingTopSections />
        <LandingBottomSections />
      </main>
    </>
  );
}
