import type { Metadata } from "next";
import { buildClarityBootstrapScript } from "@/lib/clarity-script";
import { buildDefaultSocialMetadata, getSiteBaseUrl, SITE_SEO_DESCRIPTION, SITE_SEO_TITLE } from "@/lib/site-seo";
import ChattingScript from "./chatting-script";
import GrometricsScript from "./grometrics-script";
import { ToastProvider } from "./ui/toast-provider";
import "./globals.css";

const CLARITY_SCRIPT_ID = "clarity-script";
const CLARITY_PROJECT_ID = "w6jk7x5ywu";

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
      <head>
        <script
          id={CLARITY_SCRIPT_ID}
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: buildClarityBootstrapScript(CLARITY_PROJECT_ID) }}
        />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
        <ChattingScript />
        <GrometricsScript />
      </body>
    </html>
  );
}
