import {
  getConversationVisitorNote,
  getSiteVisitorNote,
  updateConversationVisitorNote,
  updateSiteVisitorNote
} from "@/lib/data";
import { sendConversationMentionNotifications } from "@/lib/mention-notifications";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

function readIdentity(request: Request) {
  const { searchParams } = new URL(request.url);

  return {
    conversationId: String(searchParams.get("conversationId") ?? "").trim(),
    siteId: String(searchParams.get("siteId") ?? "").trim(),
    sessionId: String(searchParams.get("sessionId") ?? "").trim(),
    email: String(searchParams.get("email") ?? "").trim()
  };
}

export async function GET(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const { conversationId, siteId, sessionId, email } = readIdentity(request);

  if (conversationId) {
    const note = await getConversationVisitorNote(conversationId, auth.user.id);
    if (!note) {
      return jsonError("not-found", 404);
    }

    return jsonOk(note);
  }

  if (!siteId || (!email && !sessionId)) {
    return jsonError("missing-fields", 400);
  }

  const note = await getSiteVisitorNote({
    siteId,
    sessionId: sessionId || null,
    email: email || null,
    userId: auth.user.id
  });

  if (!note) {
    return jsonError("site-not-found", 404);
  }

  return jsonOk(note);
}

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const formData = await request.formData();
  const conversationId = String(formData.get("conversationId") ?? "").trim();
  const siteId = String(formData.get("siteId") ?? "").trim();
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const note = String(formData.get("note") ?? "");

  if (conversationId) {
    const saved = await updateConversationVisitorNote(conversationId, note, auth.user.id);
    if (!saved) {
      return jsonError("not-found", 404);
    }

    if (saved.note) {
      try {
        await sendConversationMentionNotifications({
          conversationId,
          note: saved.note,
          updatedAt: saved.updatedAt,
          mentionerUserId: auth.user.id,
          mentionerEmail: auth.user.email,
          workspaceOwnerId: auth.user.workspaceOwnerId
        });
      } catch (error) {
        console.error("conversation mention notification failed", error);
      }
    }

    return jsonOk(saved);
  }

  if (!siteId || (!email && !sessionId)) {
    return jsonError("missing-fields", 400);
  }

  const saved = await updateSiteVisitorNote({
    siteId,
    sessionId: sessionId || null,
    email: email || null,
    note,
    userId: auth.user.id
  });

  if (!saved) {
    return jsonError("site-not-found", 404);
  }

  return jsonOk(saved);
}
