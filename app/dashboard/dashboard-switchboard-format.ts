import type { FounderWorkspace } from "@/lib/data/founder-switchboard";

export function safePageLabel(value: string | null) {
  if (!value) return null;

  try {
    return new URL(value).pathname || "/";
  } catch {
    return value;
  }
}

export function workspaceStatusLabel(workspace: FounderWorkspace) {
  if (workspace.trialEndsAt && new Date(workspace.trialEndsAt).getTime() > Date.now()) return "Trial";
  if (workspace.subscriptionStatus) {
    return workspace.subscriptionStatus.replace(/_/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
  }
  return workspace.planKey === "growth" ? "Paid" : "Free";
}

export function workspaceStatusTone(workspace: FounderWorkspace) {
  if (workspace.trialEndsAt && new Date(workspace.trialEndsAt).getTime() > Date.now()) return "bg-amber-100 text-amber-800";
  if (workspace.planKey === "growth") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-600";
}

export function attentionLabel(flag: string) {
  switch (flag) {
    case "widget":
      return "widget install";
    case "email":
      return "email verify";
    case "trial":
      return "trial ending";
    case "quiet":
      return "quiet paid";
    default:
      return flag;
  }
}

export function workspaceLastTouch(workspace: FounderWorkspace) {
  return workspace.lastConversationAt || workspace.lastLoginAt || workspace.ownerCreatedAt;
}

export function siteHref(domain: string) {
  return domain.startsWith("http://") || domain.startsWith("https://") ? domain : `https://${domain}`;
}
