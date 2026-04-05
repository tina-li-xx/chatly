import type { Metadata } from "next";
import { getPublicAppUrl } from "@/lib/env";

export const SITE_SEO_TITLE = "Live Chat Software for Small Teams | Chatting";
export const SITE_SEO_DESCRIPTION =
  "Chatting is live chat software for small teams that want to answer website visitors faster, support customers in real time, and turn more conversations into revenue.";
export const HOME_PAGE_SEO_DESCRIPTION =
  "Answer website visitors in real time with a lightweight live chat widget, shared inbox, and proactive visitor insights for small teams.";
export const DEFAULT_OG_IMAGE_ALT = "Chatting — Live chat for small teams who care.";
const DEFAULT_OG_IMAGE_WIDTH = 1200;
const DEFAULT_OG_IMAGE_HEIGHT = 630;

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
  return `${getSiteBaseUrl()}/api/og?template=a`;
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
