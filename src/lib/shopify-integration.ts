import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { getPublicAppUrl, isProductionRuntime } from "@/lib/env";
import { getRequiredServerEnv } from "@/lib/env.server";

export const SHOPIFY_API_VERSION = "2026-04";
export const SHOPIFY_OAUTH_STATE_COOKIE = "chatting_shopify_oauth_state";
export const SHOPIFY_SCOPES = ["read_customers", "read_orders"] as const;

export type ShopifyOAuthSuccess = {
  accessToken: string;
  scopes: string[];
};

type ShopifyTokenResponse = {
  access_token?: string;
  scope?: string;
};

type ShopifyOAuthStateCookie = {
  state: string;
  ownerUserId: string;
  shop: string;
};

export function normalizeShopifyShopDomain(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(normalized)
    ? normalized
    : null;
}

export function getShopifyOAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProductionRuntime(),
    path: "/",
    maxAge: 60 * 10
  };
}

export function getShopifyOAuthRedirectUri() {
  return new URL(
    "/api/integrations/shopify/callback",
    getPublicAppUrl()
  ).toString();
}

export function buildShopifyAuthorizeUrl(shop: string, state: string) {
  const url = new URL(`https://${shop}/admin/oauth/authorize`);
  url.searchParams.set("client_id", getRequiredServerEnv("SHOPIFY_CLIENT_ID"));
  url.searchParams.set("scope", SHOPIFY_SCOPES.join(","));
  url.searchParams.set("redirect_uri", getShopifyOAuthRedirectUri());
  url.searchParams.set("state", state);
  return url.toString();
}

export function serializeShopifyOAuthStateCookie(
  value: ShopifyOAuthStateCookie
) {
  return JSON.stringify(value);
}

export function parseShopifyOAuthStateCookie(raw: string | undefined) {
  if (!raw) {
    return null;
  }

  try {
    const value = JSON.parse(raw) as Partial<ShopifyOAuthStateCookie>;
    if (!value.state || !value.ownerUserId) {
      return null;
    }

    const shop = normalizeShopifyShopDomain(value.shop);
    if (!shop) {
      return null;
    }

    return {
      state: value.state,
      ownerUserId: value.ownerUserId,
      shop
    };
  } catch {
    return null;
  }
}

function buildShopifyHmacMessage(url: URL) {
  return Array.from(url.searchParams.entries())
    .filter(([key]) => key !== "hmac" && key !== "signature")
    .sort(([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey === rightKey
        ? leftValue.localeCompare(rightValue)
        : leftKey.localeCompare(rightKey)
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
}

export function verifyShopifyOAuthQuery(url: URL) {
  const provided = url.searchParams.get("hmac")?.trim().toLowerCase();
  if (!provided) {
    return false;
  }

  const digest = createHmac(
    "sha256",
    getRequiredServerEnv("SHOPIFY_CLIENT_SECRET")
  )
    .update(buildShopifyHmacMessage(url))
    .digest("hex");

  const expected = Buffer.from(digest, "utf8");
  const actual = Buffer.from(provided, "utf8");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function exchangeShopifyOAuthCode(
  shop: string,
  code: string
): Promise<ShopifyOAuthSuccess> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: getRequiredServerEnv("SHOPIFY_CLIENT_ID"),
      client_secret: getRequiredServerEnv("SHOPIFY_CLIENT_SECRET"),
      code
    })
  });

  if (!response.ok) {
    throw new Error("SHOPIFY_OAUTH_EXCHANGE_FAILED");
  }

  const payload = (await response.json()) as ShopifyTokenResponse;
  if (!payload.access_token) {
    throw new Error("SHOPIFY_OAUTH_EXCHANGE_FAILED");
  }

  return {
    accessToken: payload.access_token,
    scopes: (payload.scope ?? "")
      .split(",")
      .map((scope) => scope.trim())
      .filter(Boolean)
  };
}
