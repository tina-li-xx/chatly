import "server-only";

import { sendErrorAlertEmail } from "@/lib/error-alerts/delivery";
import {
  type ErrorAlertRequestContext,
  resolveErrorAlertRequestContext
} from "@/lib/error-alerts/request-context";
import { stringifyAlertValue } from "@/lib/error-alerts/redaction";

const LOW_SIGNAL_404_PATH_PATTERNS = [
  /\/wp-(admin|content|includes)\b/i,
  /\/wlwmanifest\.xml$/i,
  /\/xmlrpc\.php$/i,
  /\/phpmyadmin\b/i,
  /\/boaform\b/i,
  /\/vendor\/phpunit\b/i,
  /\/cgi-bin\b/i,
  /\/\.env\b/i,
  /\/\.git\b/i
] as const;

function summarizeUnknown(value: unknown) {
  if (value instanceof Error) {
    return value.message;
  }

  if (typeof value === "string") {
    return value;
  }

  return stringifyAlertValue(value);
}

function buildContextSection(context: ErrorAlertRequestContext | null) {
  return {
    method: context?.method || "unknown",
    path: context?.path || "unknown",
    host: context?.host || "unknown",
    userAgent: context?.userAgent || null,
    forwardedFor: context?.forwardedFor || null,
    referer: context?.referer || null
  };
}

function isLowSignalHttpAlert(status: number, context: ErrorAlertRequestContext | null) {
  if (status !== 404) {
    return false;
  }

  const method = (context?.method || "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    return false;
  }

  const path = context?.path || "";
  return LOW_SIGNAL_404_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

export async function notifyHttpErrorResponse(input: {
  status: number;
  responseBody?: unknown;
  error?: unknown;
  request?: Request | null;
  source?: string;
}) {
  if (input.status < 400) {
    return;
  }

  const context = await resolveErrorAlertRequestContext(input.request);
  if (isLowSignalHttpAlert(input.status, context)) {
    return;
  }

  const method = (context?.method || "UNKNOWN").toUpperCase();
  const path = context?.path || "unknown";
  const errorSummary = input.error ? summarizeUnknown(input.error) : null;

  await sendErrorAlertEmail({
    dedupeKey: ["http", input.status, method, path, errorSummary || ""].join("|"),
    subject: `HTTP ${input.status} ${method} ${path}`,
    intro: "A Chatting request finished with an error status.",
    sections: [
      { label: "Summary", value: { status: input.status, source: input.source || "route", error: errorSummary } },
      { label: "Request", value: buildContextSection(context) },
      { label: "Response Body", value: input.responseBody },
      { label: "Error", value: input.error, include: Boolean(input.error) }
    ]
  });
}

export async function notifyServerLogAlert(args: unknown[], source: string) {
  if (!args.length) {
    return;
  }

  const [first] = args;
  const summary = summarizeUnknown(first) || source;

  await sendErrorAlertEmail({
    dedupeKey: ["server-log", source, summary].join("|"),
    subject: `Server error log: ${summary.slice(0, 120)}`,
    intro: "Chatting logged a server-side error.",
    sections: [
      { label: "Summary", value: { source, timestamp: new Date().toISOString() } },
      { label: "Arguments", value: args }
    ]
  });
}

export async function notifyProcessErrorAlert(type: "uncaughtException" | "unhandledRejection", error: unknown) {
  await sendErrorAlertEmail({
    dedupeKey: ["process", type, summarizeUnknown(error)].join("|"),
    subject: `Process ${type}`,
    intro: "Chatting hit a process-level runtime failure.",
    sections: [
      { label: "Summary", value: { type, timestamp: new Date().toISOString() } },
      { label: "Error", value: error }
    ]
  });
}

export async function notifyServerActionErrorAlert(input: {
  actionId: string;
  error: unknown;
}) {
  await sendErrorAlertEmail({
    dedupeKey: ["server-action", input.actionId, summarizeUnknown(input.error)].join("|"),
    subject: `Server action failed: ${input.actionId}`,
    intro: "Chatting hit an unhandled server-action failure.",
    sections: [
      {
        label: "Summary",
        value: {
          actionId: input.actionId,
          timestamp: new Date().toISOString()
        }
      },
      { label: "Error", value: input.error }
    ]
  });
}

export async function notifyClientErrorAlert(input: {
  kind: string;
  message: string;
  pageUrl?: string | null;
  stack?: string | null;
  userAgent?: string | null;
  timestamp?: string | null;
}) {
  await sendErrorAlertEmail({
    dedupeKey: ["client", input.kind, input.message, input.pageUrl || ""].join("|"),
    subject: `Client exception: ${input.message.slice(0, 120)}`,
    intro: "Chatting captured an uncaught browser-side exception.",
    sections: [
      {
        label: "Summary",
        value: {
          kind: input.kind,
          message: input.message,
          pageUrl: input.pageUrl || null,
          timestamp: input.timestamp || new Date().toISOString()
        }
      },
      {
        label: "Browser Context",
        value: {
          userAgent: input.userAgent || null
        }
      },
      { label: "Stack", value: input.stack || null, include: Boolean(input.stack) }
    ]
  });
}
