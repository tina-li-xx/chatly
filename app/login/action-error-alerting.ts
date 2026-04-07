import "server-only";

import { withServerActionErrorAlerting } from "@/lib/server-action-error-alerting";
import { formatAuthError, isExpectedAuthError } from "./action-errors";
import type { AuthActionState } from "./action-types";

type AuthActionIntent = "login" | "signup";

function unexpectedAuthActionState(
  intent: AuthActionIntent,
  fields: AuthActionState["fields"]
): AuthActionState {
  return {
    ok: false,
    error: formatAuthError(`Unexpected ${intent} error.`, intent),
    nextPath: null,
    fields
  };
}

export function resolveExpectedAuthActionError(error: unknown, intent: AuthActionIntent) {
  const fallbackMessage = `Unexpected ${intent} error.`;
  const message = error instanceof Error ? error.message : fallbackMessage;
  return isExpectedAuthError(message) ? formatAuthError(message, intent) : null;
}

export function wrapAuthAction(
  actionId: string,
  intent: AuthActionIntent,
  readFields: (formData: FormData) => { fields: AuthActionState["fields"] },
  action: (
    previousState: AuthActionState,
    formData: FormData
  ) => Promise<AuthActionState>
) {
  return withServerActionErrorAlerting(action, {
    actionId,
    onError: (_error, _previousState, formData) =>
      unexpectedAuthActionState(intent, readFields(formData).fields)
  });
}
