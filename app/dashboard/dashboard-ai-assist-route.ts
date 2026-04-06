"use client";

export type DashboardAiAssistRouteError = {
  code: string;
  resetsAt: string | null;
};

export async function readDashboardAiAssistRoutePayload<T>(
  response: Response
): Promise<{
  payload: { ok?: boolean; result?: T; error?: string; resetsAt?: string };
  error: DashboardAiAssistRouteError | null;
}> {
  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    result?: T;
    error?: string;
    resetsAt?: string;
  };

  if (response.ok && payload.ok) {
    return { payload, error: null };
  }

  return {
    payload,
    error: {
      code: payload.error ?? "ai-assist-failed",
      resetsAt: typeof payload.resetsAt === "string" ? payload.resetsAt : null
    }
  };
}
