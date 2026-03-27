"use client";

import { errorMessageForCode } from "./dashboard-client.utils";

type ActionSuccess<T> = T & { ok: true };
type ActionFailure = { ok: false; error?: string };

export async function postDashboardForm<T>(url: string, formData: FormData) {
  const response = await fetch(url, { method: "POST", body: formData });
  const payload = (await response.json()) as ActionSuccess<T> | ActionFailure;

  if (!response.ok || !payload.ok) {
    const code = "error" in payload ? payload.error || "unknown" : "unknown";
    throw new Error(errorMessageForCode(code));
  }

  return payload;
}
