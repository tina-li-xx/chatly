"use client";

import { useEffect, useState } from "react";
import type { ShopifyCustomerContext } from "@/lib/dashboard-integrations";

type ShopifyCustomerPayload =
  | { ok: true; customer: ShopifyCustomerContext | null }
  | { ok: false; error: string };

type ShopifyCustomerLoadState =
  | { status: "loading"; customer: null }
  | { status: "empty"; customer: null }
  | { status: "ready"; customer: ShopifyCustomerContext }
  | { status: "error"; customer: null };

export function useDashboardShopifyCustomerContext(conversationId: string) {
  const [state, setState] = useState<ShopifyCustomerLoadState>({
    status: "loading",
    customer: null
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", customer: null });

    fetch(
      `/dashboard/integrations/shopify/customer?conversationId=${encodeURIComponent(conversationId)}`,
      {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
        signal: controller.signal
      }
    )
      .then(async (response) => {
        const payload = (await response.json()) as ShopifyCustomerPayload;
        if (!response.ok || !payload.ok) {
          throw new Error(payload.ok ? "shopify-customer-failed" : payload.error);
        }
        setState(
          payload.customer
            ? { status: "ready", customer: payload.customer }
            : { status: "empty", customer: null }
        );
      })
      .catch((error: unknown) => {
        if ((error as { name?: string } | null)?.name === "AbortError") {
          return;
        }
        setState({ status: "error", customer: null });
      });

    return () => controller.abort();
  }, [conversationId]);

  return state;
}
