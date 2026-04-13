import { requireUser } from "@/lib/auth";
import { canAccessDashboardPublishing } from "@/lib/dashboard-publishing-access";
import { withServerActionErrorAlerting } from "@/lib/server-action-error-alerting";

export type DashboardPublishingActionResult = {
  ok: boolean;
  tone: "success" | "warning" | "error";
  title: string;
  message?: string;
  redirectPath?: string;
};

export function readPublishingRecord(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export function publishingErrorResult(title: string, message?: string): DashboardPublishingActionResult {
  return { ok: false, tone: "error", title, message };
}

function isPublishingForbiddenError(error: unknown) {
  return error instanceof Error && error.message === "DASHBOARD_PUBLISHING_FORBIDDEN";
}

export function wrapDashboardPublishingAction<TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<DashboardPublishingActionResult>,
  input: { actionId: string; fallbackTitle: string; fallbackMessage: string }
) {
  return withServerActionErrorAlerting(action, {
    actionId: input.actionId,
    onError: () => publishingErrorResult(input.fallbackTitle, input.fallbackMessage),
    shouldReport: (error) => !isPublishingForbiddenError(error)
  });
}

export async function requirePublishingUser() {
  const user = await requireUser();
  if (!canAccessDashboardPublishing(user.email)) {
    throw new Error("DASHBOARD_PUBLISHING_FORBIDDEN");
  }
  return user;
}
