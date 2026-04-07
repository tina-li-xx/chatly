import "server-only";

import { getAdminAlertEmail, getAppDisplayName } from "@/lib/env-server/services";
import { resolvePrimaryBrandNoReplyMailFrom } from "@/lib/mail-from-addresses";
import { sendSesEmail } from "@/lib/ses-email";
import { shouldSendErrorAlert } from "@/lib/error-alerts/dedupe";
import {
  escapeHtmlForAlert,
  stringifyAlertValue
} from "@/lib/error-alerts/redaction";

type ErrorAlertSection = {
  label: string;
  value: unknown;
  include?: boolean;
};

type ErrorAlertMessage = {
  dedupeKey: string;
  subject: string;
  intro: string;
  sections: ErrorAlertSection[];
};

type ErrorAlertRuntimeStore = typeof globalThis & {
  __chattingErrorAlertDispatching?: boolean;
};

function getRuntimeStore() {
  return globalThis as ErrorAlertRuntimeStore;
}

export function isErrorAlertDispatching() {
  return Boolean(getRuntimeStore().__chattingErrorAlertDispatching);
}

function renderSection(section: ErrorAlertSection) {
  return `
    <section style="margin-bottom:24px;">
      <h2 style="font-size:16px;margin-bottom:8px;">${escapeHtmlForAlert(section.label)}</h2>
      <pre style="white-space:pre-wrap;word-break:break-word;background:#F8FAFC;padding:12px;border-radius:8px;font-size:13px;line-height:1.5;">${escapeHtmlForAlert(
        stringifyAlertValue(section.value)
      )}</pre>
    </section>
  `;
}

function buildPlainText(message: ErrorAlertMessage) {
  return [
    message.subject,
    "",
    message.intro,
    ...message.sections
      .filter((section) => section.include !== false)
      .flatMap((section) => [section.label, stringifyAlertValue(section.value), ""])
  ].join("\n");
}

export async function sendErrorAlertEmail(message: ErrorAlertMessage) {
  if (process.env.NODE_ENV === "test" || isErrorAlertDispatching()) {
    return;
  }

  if (!shouldSendErrorAlert(message.dedupeKey)) {
    return;
  }

  const adminEmail = getAdminAlertEmail();
  if (!adminEmail) {
    return;
  }

  const sectionsHtml = message.sections
    .filter((section) => section.include !== false)
    .map(renderSection)
    .join("");
  const appName = getAppDisplayName() || "Chatting";
  const store = getRuntimeStore();

  store.__chattingErrorAlertDispatching = true;

  try {
    await sendSesEmail({
      to: adminEmail,
      from: resolvePrimaryBrandNoReplyMailFrom(),
      subject: `[${appName} Error Alert] ${message.subject}`,
      bodyText: buildPlainText(message),
      bodyHtml: `
        <div style="font-family:Arial,sans-serif;color:#0F172A;">
          <h1 style="font-size:20px;margin-bottom:8px;">${escapeHtmlForAlert(message.subject)}</h1>
          <p style="margin-bottom:24px;">${escapeHtmlForAlert(message.intro)}</p>
          ${sectionsHtml}
        </div>
      `
    });
  } catch {
    return;
  } finally {
    store.__chattingErrorAlertDispatching = false;
  }
}
