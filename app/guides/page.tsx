import type { Metadata } from "next";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { getAllGuides, getFeaturedGuide } from "@/lib/guides-data";
import { GuidesHomePage } from "./guides-home-page";

export const metadata: Metadata = {
  title: "Chatting Guides",
  description:
    "Browse practical Chatting guides for integrations, inbox workflows, AI Assist, shortcuts, and day-to-day team operations.",
  alternates: {
    canonical: buildAbsoluteUrl("/guides")
  }
};

export default function GuidesIndexPage() {
  const guides = getAllGuides();

  return <GuidesHomePage featuredGuide={getFeaturedGuide()} guides={guides} />;
}
