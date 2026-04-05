"use client";

import { useEffect, useRef, useState } from "react";
import type { BillingInterval, BillingPlanKey, DashboardBillingSummary } from "@/lib/data/billing-types";
import type { DashboardNoticeState } from "./dashboard-controls";
import { billingErrorMessage, type SettingsSection } from "./dashboard-settings-shared";

export function useDashboardSettingsBilling(input: {
  activeSection: SettingsSection;
  initialBilling: DashboardBillingSummary;
  searchParams: Pick<URLSearchParams, "get">;
  onNotice: (notice: Exclude<DashboardNoticeState, null>) => void;
}) {
  const [billing, setBilling] = useState<DashboardBillingSummary>(input.initialBilling);
  const [billingPlanPending, setBillingPlanPending] = useState<string | null>(null);
  const [selectedBillingInterval, setSelectedBillingInterval] = useState<BillingInterval>(
    input.initialBilling.billingInterval ?? "monthly"
  );
  const [billingPortalPending, setBillingPortalPending] = useState(false);
  const [billingSyncPending, setBillingSyncPending] = useState(false);
  const billingSyncedRef = useRef(false);

  async function syncBillingFromStripe() {
    if (billingSyncPending) {
      return;
    }

    setBillingSyncPending(true);

    try {
      const response = await fetch("/dashboard/settings/billing/sync", {
        method: "POST"
      });
      const payload = (await response.json()) as
        | { ok: true; billing: DashboardBillingSummary }
        | { ok: false; error: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "billing-sync-failed" : payload.error);
      }

      setBilling(payload.billing);
      if (payload.billing.billingInterval) {
        setSelectedBillingInterval(payload.billing.billingInterval);
      }
    } catch (error) {
      input.onNotice({
        tone: "error",
        message: billingErrorMessage(error instanceof Error ? error.message : "billing-sync-failed")
      });
    } finally {
      setBillingSyncPending(false);
    }
  }

  async function handleBillingPlanChange(
    planKey: BillingPlanKey,
    billingInterval: BillingInterval,
    seatQuantity?: number
  ) {
    const pendingKey = `${planKey}:${billingInterval}`;

    if (
      billingPlanPending ||
      (billing.planKey === planKey && (billing.planKey === "starter" || billing.billingInterval === billingInterval))
    ) {
      return;
    }

    setBillingPlanPending(pendingKey);

    try {
      const body: Record<string, unknown> = { plan: planKey, interval: billingInterval };
      if (typeof seatQuantity === "number" && Number.isFinite(seatQuantity)) {
        body.seatQuantity = Math.max(1, Math.floor(seatQuantity));
      }

      const response = await fetch("/dashboard/settings/billing/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = (await response.json()) as
        | { ok: true; redirectUrl: string }
        | { ok: false; error: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "billing-plan-update-failed" : payload.error);
      }

      window.location.assign(payload.redirectUrl);
    } catch (error) {
      input.onNotice({
        tone: "error",
        message: billingErrorMessage(error instanceof Error ? error.message : "billing-plan-update-failed")
      });
    } finally {
      setBillingPlanPending(null);
    }
  }

  async function openBillingPortal() {
    if (billingPortalPending) {
      return;
    }

    setBillingPortalPending(true);

    try {
      const response = await fetch("/dashboard/settings/billing/payment-method", {
        method: "POST"
      });
      const payload = (await response.json()) as
        | { ok: true; redirectUrl: string }
        | { ok: false; error: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "billing-portal-session-failed" : payload.error);
      }

      window.location.assign(payload.redirectUrl);
    } catch (error) {
      input.onNotice({
        tone: "error",
        message: billingErrorMessage(error instanceof Error ? error.message : "billing-portal-session-failed")
      });
    } finally {
      setBillingPortalPending(false);
    }
  }

  useEffect(() => {
    const billingState = input.searchParams.get("billing");

    if (billingState === "checkout-success") {
      billingSyncedRef.current = true;
      input.onNotice({ tone: "success", message: "Stripe checkout completed" });
      void syncBillingFromStripe();
    } else if (billingState === "checkout-cancelled") {
      billingSyncedRef.current = true;
      input.onNotice({ tone: "error", message: "Stripe checkout was cancelled" });
    } else if (billingState === "portal-return") {
      billingSyncedRef.current = true;
      input.onNotice({ tone: "success", message: "Billing details refreshed from Stripe" });
      void syncBillingFromStripe();
    }
  }, [input.searchParams]);

  useEffect(() => {
    if (input.activeSection !== "billing" || billingSyncedRef.current) {
      return;
    }

    billingSyncedRef.current = true;
    void syncBillingFromStripe();
  }, [input.activeSection]);

  useEffect(() => {
    if (billing.billingInterval) {
      setSelectedBillingInterval(billing.billingInterval);
    }
  }, [billing.billingInterval, billing.planKey]);

  return {
    billing,
    billingPlanPending,
    billingPortalPending,
    billingSyncPending,
    handleBillingPlanChange,
    openBillingPortal,
    selectedBillingInterval,
    setSelectedBillingInterval,
    syncBillingFromStripe
  };
}
