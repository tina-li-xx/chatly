import { optionalText } from "@/lib/utils";

function isLocalHostLike(value: string) {
  return (
    value.startsWith("localhost") ||
    value.startsWith("127.0.0.1") ||
    value.startsWith("[::1]") ||
    value.startsWith("0.0.0.0")
  );
}

function buildVerificationUrls(domain: string | null) {
  const normalized = optionalText(domain);
  if (!normalized) {
    return [];
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return [normalized];
  }

  if (isLocalHostLike(normalized)) {
    return [`http://${normalized}`, `https://${normalized}`];
  }

  return [`https://${normalized}`, `http://${normalized}`];
}

function hasWidgetSnippet(html: string, siteId: string) {
  const normalized = html.toLowerCase();
  const hasWidgetAsset = normalized.includes("/widget.js") || normalized.includes("widget.js");
  const hasSiteId =
    html.includes(`data-site-id="${siteId}"`) ||
    html.includes(`data-site-id='${siteId}'`) ||
    html.includes(`"data-site-id":"${siteId}"`) ||
    html.includes(`'data-site-id':'${siteId}'`) ||
    html.includes(`siteId":"${siteId}"`) ||
    html.includes(`siteId:'${siteId}'`) ||
    html.includes(`siteId":"${siteId.replace(/"/g, '\\"')}`);

  return hasWidgetAsset && hasSiteId;
}

export async function verifySiteWidgetSnippet(input: { domain: string | null; siteId: string }) {
  const urls = buildVerificationUrls(input.domain);

  if (!urls.length) {
    return {
      ok: false as const,
      error: "missing-domain"
    };
  }

  let lastError = "verification-failed";

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
        headers: {
          "user-agent": "Chatting-Install-Check/1.0"
        }
      });

      if (!response.ok) {
        lastError = "site-unreachable";
        continue;
      }

      const html = await response.text();
      if (hasWidgetSnippet(html, input.siteId)) {
        return {
          ok: true as const,
          url: response.url || url
        };
      }
    } catch (error) {
      lastError = "site-unreachable";
    }
  }

  return {
    ok: false as const,
    error: lastError
  };
}
