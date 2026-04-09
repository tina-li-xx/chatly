import type { Metadata } from "next";
import { getPublicAppUrl } from "@/lib/env";

export const SITE_SEO_TITLE = "Live Chat Software for Small Teams | Chatting";
export const SITE_SEO_DESCRIPTION =
  "Chatting is live chat software for small teams that want to answer website visitors faster, support customers in real time, and turn more conversations into revenue.";
export const HOME_PAGE_SEO_DESCRIPTION =
  "Live chat that's simple to set up and easy to afford. Shared inbox, visitor tracking, proactive messages. $20/month flat — no per-seat pricing. Free plan available.";
export const HOME_PAGE_OG_DESCRIPTION =
  "See who's on your site. Answer their questions. Close the deal. Simple pricing, no per-seat games. Start free.";
export const DEFAULT_OG_IMAGE_ALT = "Chatting — Live chat for small teams. $20/month. No per-seat pricing.";
export const DEFAULT_OG_IMAGE_VERSION = "2026-04-09";
const DEFAULT_OG_IMAGE_WIDTH = 1200;
const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const NO_INDEX_METADATA: Pick<Metadata, "robots"> = {
  robots: {
    index: false,
    follow: false
  }
};

type SocialMetadataOptions = {
  title: string;
  description: string;
  url?: string;
  openGraphType?: "website" | "article" | "profile";
  includeSiteName?: boolean;
  twitterCard?: "summary" | "summary_large_image";
};

export function getSiteBaseUrl() {
  return getPublicAppUrl().replace(/\/$/, "");
}

export function getDefaultOgImageUrl() {
  return `${getSiteBaseUrl()}/api/og?template=a&v=${DEFAULT_OG_IMAGE_VERSION}`;
}

export function buildDefaultSocialMetadata({
  title,
  description,
  url,
  openGraphType,
  includeSiteName = false,
  twitterCard = "summary_large_image"
}: SocialMetadataOptions): Pick<Metadata, "openGraph" | "twitter"> {
  const imageUrl = getDefaultOgImageUrl();

  return {
    openGraph: {
      title,
      description,
      ...(url ? { url } : {}),
      ...(openGraphType ? { type: openGraphType } : {}),
      ...(includeSiteName ? { siteName: "Chatting" } : {}),
      images: [
        {
          url: imageUrl,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: DEFAULT_OG_IMAGE_ALT
        }
      ]
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: [imageUrl]
    }
  };
}
