import type { DashboardEmailTemplateKey } from "@/lib/email-templates";

// Canonical sender spec for Chatting outbound email.
// Keep this file aligned with the production subdomain plan.
export const CHATTING_EMAIL_ADDRESSES_BY_SUBDOMAIN = {
  "usechatting.com": {
    // Primary brand sender:
    // welcome email, trial ending reminder, trial expired, newsletter, free tool exports
    hello: "hello@usechatting.com",
    // Account/system sender:
    // email verification, password reset, team invitation
    noreply: "noreply@usechatting.com",
    // Product update / changelog sender
    updates: "updates@usechatting.com"
  },
  "mail.usechatting.com": {
    // High-volume visitor-facing sender:
    // conversation transcript, offline reply, missed chat follow-up, satisfaction survey
    noreply: "noreply@mail.usechatting.com"
  },
  "notifications.usechatting.com": {
    // Immediate team notifications and mentions
    noreply: "noreply@notifications.usechatting.com",
    // Daily digest sender
    digest: "digest@notifications.usechatting.com",
    // Weekly performance report sender
    reports: "reports@notifications.usechatting.com"
  }
} as const;

type ChattingEmailSubdomain = keyof typeof CHATTING_EMAIL_ADDRESSES_BY_SUBDOMAIN;
type ChattingEmailMailbox<TSubdomain extends ChattingEmailSubdomain> =
  keyof (typeof CHATTING_EMAIL_ADDRESSES_BY_SUBDOMAIN)[TSubdomain];

const CHATTING_BRAND_NAME = "Chatting";
const PRIMARY_BRAND_SUBDOMAIN = "usechatting.com";
const VISITOR_EMAIL_SUBDOMAIN = "mail.usechatting.com";
const TEAM_NOTIFICATION_SUBDOMAIN = "notifications.usechatting.com";

function sanitizeDisplayName(value: string | null | undefined, fallback: string) {
  const normalized = String(value || "").replace(/[\r\n]+/g, " ").replace(/[<>"]/g, "").trim();
  return normalized || fallback;
}

function formatMailFrom(displayName: string, emailAddress: string) {
  return `${displayName} <${emailAddress}>`;
}

function getSubdomainMailboxAddress<TSubdomain extends ChattingEmailSubdomain>(
  subdomain: TSubdomain,
  mailbox: ChattingEmailMailbox<TSubdomain>
) {
  return CHATTING_EMAIL_ADDRESSES_BY_SUBDOMAIN[subdomain][mailbox];
}

function resolveChattingMailFrom<TSubdomain extends ChattingEmailSubdomain>(
  subdomain: TSubdomain,
  mailbox: ChattingEmailMailbox<TSubdomain>
) {
  return formatMailFrom(CHATTING_BRAND_NAME, getSubdomainMailboxAddress(subdomain, mailbox));
}

function resolveViaChattingMailFrom<TSubdomain extends ChattingEmailSubdomain>(
  displayName: string | null | undefined,
  fallbackName: string,
  subdomain: TSubdomain,
  mailbox: ChattingEmailMailbox<TSubdomain>
) {
  return formatMailFrom(
    `${sanitizeDisplayName(displayName, fallbackName)} via ${CHATTING_BRAND_NAME}`,
    getSubdomainMailboxAddress(subdomain, mailbox)
  );
}

export function resolvePrimaryBrandHelloMailFrom() {
  return resolveChattingMailFrom(PRIMARY_BRAND_SUBDOMAIN, "hello");
}

export function resolvePrimaryBrandNoReplyMailFrom() {
  return resolveChattingMailFrom(PRIMARY_BRAND_SUBDOMAIN, "noreply");
}

export function resolveProductUpdatesMailFrom() {
  return resolveChattingMailFrom(PRIMARY_BRAND_SUBDOMAIN, "updates");
}

export function resolveTeamInvitationMailFrom(inviterName: string) {
  return resolveViaChattingMailFrom(inviterName, "Someone", PRIMARY_BRAND_SUBDOMAIN, "noreply");
}

export function resolveConversationTemplateMailFrom(
  templateKey: DashboardEmailTemplateKey,
  teamName: string
) {
  // Welcome email is intentionally brand-forward rather than team-branded.
  if (templateKey === "welcome_email") {
    return resolvePrimaryBrandHelloMailFrom();
  }

  return resolveViaChattingMailFrom(teamName, "Support", VISITOR_EMAIL_SUBDOMAIN, "noreply");
}

export function resolveImmediateTeamNotificationMailFrom() {
  return resolveChattingMailFrom(TEAM_NOTIFICATION_SUBDOMAIN, "noreply");
}

export function resolveDailyDigestMailFrom() {
  return resolveChattingMailFrom(TEAM_NOTIFICATION_SUBDOMAIN, "digest");
}

export function resolveWeeklyPerformanceReportMailFrom() {
  return resolveChattingMailFrom(TEAM_NOTIFICATION_SUBDOMAIN, "reports");
}
