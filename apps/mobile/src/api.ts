import { authorizedFetch, readJson } from "./api-shared";
import type {
  ConversationSummary,
  ConversationThread,
  ReplyAttachmentDraft
} from "./types";

function buildFormData(fields: Record<string, string>) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return formData;
}

async function authorizedJson(
  baseUrl: string,
  token: string,
  path: string,
  init?: RequestInit
) {
  return readJson(await authorizedFetch(baseUrl, token, path, init));
}

function postAuthorizedJson(
  baseUrl: string,
  token: string,
  path: string,
  body: Record<string, unknown>
) {
  return authorizedJson(baseUrl, token, path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

export async function listConversations(baseUrl: string, token: string) {
  const body = await authorizedJson(baseUrl, token, "/dashboard/conversations");
  return Array.isArray(body.conversations) ? (body.conversations as ConversationSummary[]) : [];
}

export async function getConversation(baseUrl: string, token: string, conversationId: string) {
  const body = await authorizedJson(
    baseUrl,
    token,
    `/dashboard/conversation?conversationId=${encodeURIComponent(conversationId)}`
  );
  return body.conversation as ConversationThread;
}

export function markConversationRead(baseUrl: string, token: string, conversationId: string) {
  return postAuthorizedJson(baseUrl, token, "/dashboard/read", { conversationId });
}

export function sendReply(
  baseUrl: string,
  token: string,
  conversationId: string,
  content: string,
  attachments: ReplyAttachmentDraft[] = []
) {
  const formData = new FormData();
  formData.append("conversationId", conversationId);
  formData.append("content", content);
  attachments.forEach((attachment) => {
    formData.append("attachments", {
      uri: attachment.uri,
      name: attachment.fileName,
      type: attachment.contentType
    } as unknown as Blob);
  });

  return authorizedJson(baseUrl, token, "/dashboard/reply", {
    method: "POST",
    body: formData
  });
}

export function setConversationTyping(
  baseUrl: string,
  token: string,
  conversationId: string,
  typing: boolean
) {
  return postAuthorizedJson(baseUrl, token, "/dashboard/typing", { conversationId, typing });
}

export function updateConversationStatus(
  baseUrl: string,
  token: string,
  conversationId: string,
  status: "open" | "resolved"
) {
  return authorizedJson(baseUrl, token, "/dashboard/status", {
    method: "POST",
    body: buildFormData({ conversationId, status })
  });
}

export function assignConversation(
  baseUrl: string,
  token: string,
  conversationId: string,
  assignedUserId: string | null
) {
  return authorizedJson(baseUrl, token, "/dashboard/assignment", {
    method: "POST",
    body: buildFormData({ conversationId, assignedUserId: assignedUserId ?? "" })
  });
}

export function toggleConversationTag(
  baseUrl: string,
  token: string,
  conversationId: string,
  tag: string
) {
  return authorizedJson(baseUrl, token, "/dashboard/tags", {
    method: "POST",
    body: buildFormData({ conversationId, tag })
  });
}

export function registerMobileDevice(
  baseUrl: string,
  token: string,
  input: {
    pushToken: string;
    provider: "expo" | "apns" | "fcm";
    platform: string;
    appId: string | null;
    bundleId?: string | null;
    environment?: "sandbox" | "production" | null;
  }
) {
  return postAuthorizedJson(baseUrl, token, "/api/mobile/device", input);
}

export function unregisterMobileDevice(baseUrl: string, token: string, pushToken: string) {
  return authorizedJson(baseUrl, token, "/api/mobile/device", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pushToken })
  });
}
