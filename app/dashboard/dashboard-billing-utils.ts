import type { DashboardBillingSummary, DashboardBillingInvoice } from "@/lib/data";

export type BillingHistorySortKey = "date" | "description" | "amount" | "status";

export function billingPeriodLabel(reference = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function formatResponseTime(seconds: number | null | undefined) {
  if (seconds == null || Number.isNaN(seconds)) {
    return "—";
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = seconds / 60;
  return `${minutes < 10 ? minutes.toFixed(1) : Math.round(minutes)}m`;
}

export function invoiceStatusMeta(status: DashboardBillingInvoice["status"] | "pending" | "failed" | "refunded") {
  switch (status) {
    case "paid":
      return { label: "Paid", className: "bg-green-100 text-green-700" };
    case "failed":
      return { label: "Failed", className: "bg-red-100 text-red-700" };
    case "refunded":
      return { label: "Refunded", className: "bg-slate-100 text-slate-600" };
    case "pending":
    case "open":
    default:
      return { label: "Pending", className: "bg-amber-100 text-amber-700" };
  }
}

export function billingHasPaymentIssue(status: DashboardBillingSummary["subscriptionStatus"]) {
  return status === "past_due" || status === "unpaid" || status === "incomplete";
}

export function billingLostFeatures(billing: DashboardBillingSummary) {
  const features = [];

  if (billing.features.proactiveChat) {
    features.push("Proactive chat on high-intent pages");
  }
  if (billing.features.removeBranding) {
    features.push("White-label widget and transcript branding removal");
  }
  if (billing.planKey === "pro") {
    features.push("Advanced reporting, API access, and priority onboarding");
  }

  return features.length ? features : ["Paid-seat access and unlimited conversations"];
}
