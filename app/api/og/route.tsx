import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

export const runtime = "nodejs";

const IMAGE_SIZE = {
  width: 1200,
  height: 630
} as const;

const CACHE_HEADERS = {
  "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
};

type TemplateName = "a" | "b" | "c" | "d" | "default";

function readParam(searchParams: URLSearchParams, key: string, fallback: string, maxLength: number) {
  const value = searchParams.get(key)?.trim();
  return value ? value.slice(0, maxLength) : fallback;
}

function Logo({ inverted }: { inverted?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" width="44" height="44">
      <path
        d="M20 4C11.163 4 4 11.163 4 20C4 28.837 11.163 36 20 36C21.85 36 23.619 35.6845 25.253 35.107L32.414 37.495C33.195 37.755 33.955 36.995 33.695 36.214L31.307 29.053C34.258 26.541 36 23.428 36 20C36 11.163 28.837 4 20 4Z"
        fill={inverted ? "white" : "#2563EB"}
      />
      <circle cx="14" cy="20" r="2.5" fill={inverted ? "#1D4ED8" : "white"} />
      <circle cx="20" cy="20" r="2.5" fill={inverted ? "#1D4ED8" : "white"} />
      <circle cx="26" cy="20" r="2.5" fill={inverted ? "#1D4ED8" : "white"} />
    </svg>
  );
}

function BrandLockup({ inverted }: { inverted?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Logo inverted={inverted} />
      <div style={{ fontSize: 34, fontWeight: 700, color: inverted ? "white" : "#0F172A" }}>Chatting</div>
    </div>
  );
}

function TemplateA({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "58px 68px",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
        color: "white",
        textAlign: "center"
      }}
    >
      <div />
      <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", maxWidth: 940 }}>
        <div style={{ fontSize: 74, fontWeight: 800, lineHeight: 1.02 }}>{title}</div>
        <div style={{ fontSize: 30, fontWeight: 500, opacity: 0.9 }}>{subtitle}</div>
      </div>
      <BrandLockup inverted />
    </div>
  );
}

function TemplateB({ title, subtitle, category }: { title: string; subtitle: string; category: string }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "58px 68px",
        justifyContent: "space-between",
        alignItems: "stretch",
        background: "linear-gradient(180deg, #FFFBF5 0%, #FFF7ED 100%)",
        color: "#0F172A"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", maxWidth: 620 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 16, fontWeight: 700, color: "#2563EB", letterSpacing: 2 }}>{category}</div>
          <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
          <div style={{ fontSize: 28, color: "#475569", lineHeight: 1.3 }}>{subtitle}</div>
        </div>
        <BrandLockup />
      </div>
      <div style={{ display: "flex", width: 320, justifyContent: "center", alignItems: "center", position: "relative" }}>
        <div style={{ display: "flex", position: "absolute", top: 80, right: 0, width: 240, height: 92, borderRadius: 20, background: "#2563EB" }} />
        <div style={{ display: "flex", position: "absolute", bottom: 88, right: 60, width: 190, height: 74, borderRadius: 20, background: "#10B981" }} />
        <div style={{ display: "flex", position: "absolute", top: 210, left: 40, width: 54, height: 54, borderRadius: 999, border: "6px solid #F59E0B" }} />
      </div>
    </div>
  );
}

function TemplateC({ title, subtitle, competitor }: { title: string; subtitle: string; competitor: string }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "58px 68px",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
        color: "#0F172A"
      }}
    >
      <div style={{ display: "flex", width: "100%", maxWidth: 980, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", width: 390, height: 220, borderRadius: 24, background: "white", border: "2px solid rgba(37, 99, 235, 0.14)", justifyContent: "center", alignItems: "center" }}>
          <BrandLockup />
        </div>
        <div style={{ display: "flex", width: 84, height: 84, borderRadius: 999, background: "#0F172A", color: "white", justifyContent: "center", alignItems: "center", fontSize: 30, fontWeight: 800 }}>VS</div>
        <div style={{ display: "flex", width: 390, height: 220, borderRadius: 24, background: "white", border: "1px solid #E2E8F0", justifyContent: "center", alignItems: "center", fontSize: 50, fontWeight: 800, letterSpacing: 3 }}>{competitor}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 44, textAlign: "center", maxWidth: 900 }}>
        <div style={{ fontSize: 30, color: "#475569" }}>{subtitle}</div>
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
      </div>
    </div>
  );
}

function TemplateD({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "58px 68px",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        color: "white",
        textAlign: "center"
      }}
    >
      <div />
      <div style={{ display: "flex", flexDirection: "column", gap: 28, alignItems: "center", maxWidth: 900 }}>
        <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.14 }}>{title}</div>
        <div style={{ display: "flex", width: 82, height: 4, borderRadius: 999, background: "#2563EB" }} />
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, opacity: 0.85 }}>usechatting.com</div>
    </div>
  );
}

function renderTemplate(template: TemplateName, title: string, subtitle: string, category: string, competitor: string) {
  switch (template) {
    case "b":
      return <TemplateB title={title} subtitle={subtitle} category={category} />;
    case "c":
      return <TemplateC title={title} subtitle={subtitle} competitor={competitor} />;
    case "d":
      return <TemplateD title={title} />;
    case "a":
    case "default":
    default:
      return <TemplateA title={title} subtitle={subtitle} />;
  }
}

async function handleGET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const template = readParam(searchParams, "template", "default", 12) as TemplateName;
    const title = readParam(searchParams, "title", "Live chat for small teams.", 120);
    const subtitle = readParam(searchParams, "subtitle", "See who's on your site. Answer their questions. Close the deal.", 160);
    const category = readParam(searchParams, "category", "LIVE CHAT", 40);
    const competitor = readParam(searchParams, "competitor", "INTERCOM", 40);

    return new ImageResponse(renderTemplate(template, title, subtitle, category, competitor), {
      ...IMAGE_SIZE,
      headers: CACHE_HEADERS
    });
  } catch (error) {
    console.error("Failed to generate OG image", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}

export const GET = withRouteErrorAlerting(handleGET, "app/api/og/route.tsx:GET");
