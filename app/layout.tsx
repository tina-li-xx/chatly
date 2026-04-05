import type { Metadata } from "next";
import ClarityScript from "./clarity-script";
import { buildDefaultSocialMetadata, getSiteBaseUrl, SITE_SEO_DESCRIPTION, SITE_SEO_TITLE } from "@/lib/site-seo";
import ChattingScript from "./chatting-script";
import GrometricsScript from "./grometrics-script";
import { ToastProvider } from "./ui/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_SEO_TITLE,
  description: SITE_SEO_DESCRIPTION,
  metadataBase: new URL(getSiteBaseUrl()),
  ...buildDefaultSocialMetadata({
    title: SITE_SEO_TITLE,
    description: SITE_SEO_DESCRIPTION,
    openGraphType: "website",
    includeSiteName: true
  })
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ToastProvider>{children}</ToastProvider>
        <ChattingScript />
        <ClarityScript />
        <GrometricsScript />
      </body>
    </html>
  );
}
