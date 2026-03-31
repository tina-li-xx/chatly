import type { Metadata } from "next";
import Script from "next/script";
import { getPublicAppUrl } from "@/lib/env";
import ChattingScript from "./chatting-script";
import { ToastProvider } from "./ui/toast-provider";
import "./globals.css";

const ANALYTICS_SCRIPT_SRC = "https://grometrics.com/js/script.js";
const ANALYTICS_WEBSITE_ID = "gm_25f962a050796abf194ae4f4";
const FALLBACK_ANALYTICS_DOMAIN = "your-site.com";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

export const metadata: Metadata = {
  title: "Chatting",
  description: "Talk to users before they leave and learn what's blocking revenue.",
  openGraph: {
    type: "website",
    siteName: "Chatting",
    title: "Chatting",
    description: "Talk to users before they leave and learn what's blocking revenue.",
    images: [{
      url: "/api/og?template=a",
      width: 1200,
      height: 630,
      alt: "Chatting — Live chat for small teams who care."
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Chatting",
    description: "Talk to users before they leave and learn what's blocking revenue.",
    images: ["/api/og?template=a"]
  }
};

function getAnalyticsDomain() {
  const appUrl = getPublicAppUrl();

  if (!appUrl) {
    return FALLBACK_ANALYTICS_DOMAIN;
  }

  let hostname = "";

  try {
    hostname = new URL(appUrl).hostname;
  } catch {
    hostname = appUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }

  return hostname && !LOCAL_HOSTNAMES.has(hostname) ? hostname : FALLBACK_ANALYTICS_DOMAIN;
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analyticsDomain = getAnalyticsDomain();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ToastProvider>{children}</ToastProvider>
        <ChattingScript />
        <Script
          defer
          data-website-id={ANALYTICS_WEBSITE_ID}
          data-domain={analyticsDomain}
          src={ANALYTICS_SCRIPT_SRC}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
