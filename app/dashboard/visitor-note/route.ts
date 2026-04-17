import {
  getConversationVisitorNote,
  getSiteVisitorNote,
  updateConversationVisitorNote,
  updateSiteVisitorNote
} from "@/lib/services";
import {
  listMentionableTeammates,
  resolveVisitorNoteMentionResolution,
  sendConversationMentionNotifications
} from "@/lib/mention-notifications";
import { readRouteFormData } from "@/lib/route-form-data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function readIdentity(request: Request) {
  const { searchParams } = new URL(request.url);

  return {
    conversationId: String(searchParams.get("conversationId") ?? "").trim(),
    siteId: String(searchParams.get("siteId") ?? "").trim(),
    sessionId: String(searchParams.get("sessionId") ?? "").trim(),
    email: String(searchParams.get("email") ?? "").trim()
  };
}

async function handleGET(request: Request) {
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

    let mentionableUsers: Awaited<ReturnType<typeof listMentionableTeammates>> = [];
    try {
      mentionableUsers = await listMentionableTeammates({
        workspaceOwnerId: auth.user.workspaceOwnerId,
        mentionerUserId: auth.user.id
      });
    } catch (error) {
      console.error("visitor note mentionable teammates failed", error);
    }

    return jsonOk({ ...note, mentionableUsers });
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

  return jsonOk({ ...note, mentionableUsers: [] });
}

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const formData = await readRouteFormData(request);
  const conversationId = String(formData.get("conversationId") ?? "").trim();
  const siteId = String(formData.get("siteId") ?? "").trim();
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const note = String(formData.get("note") ?? "");
  const mentionResolution = await resolveNoteMentions(
    note,
    auth.user.workspaceOwnerId,
    auth.user.id
  );

  if (conversationId) {
    const saved = await updateConversationVisitorNote(
      conversationId,
      note,
      mentionResolution.mentions,
      auth.user.id
    );
    if (!saved) {
      return jsonError("not-found", 404);
    }

    const mentionResult = pickMentionResult(mentionResolution);
    if (saved.note) {
      try {
        await sendConversationMentionNotifications({
          conversationId,
          note: saved.note,
          updatedAt: saved.updatedAt,
          mentionerUserId: auth.user.id,
          mentionerEmail: auth.user.email,
          workspaceOwnerId: auth.user.workspaceOwnerId,
          mentionResolution
        });
      } catch (error) {
        console.error("conversation mention notification failed", error);
      }
    }

    return jsonOk({ ...saved, ...mentionResult });
  }

  if (!siteId || (!email && !sessionId)) {
    return jsonError("missing-fields", 400);
  }

  const saved = await updateSiteVisitorNote({
    siteId,
    sessionId: sessionId || null,
    email: email || null,
    note,
    mentions: mentionResolution.mentions,
    userId: auth.user.id
  });

  if (!saved) {
    return jsonError("site-not-found", 404);
  }

  return jsonOk({ ...saved, ...pickMentionResult(mentionResolution) });
}

function emptyMentionResult() {
  return { sent: [], ambiguous: [], unresolved: [], disabled: [] };
}

function pickMentionResult(result: {
  sent: string[];
  ambiguous: string[];
  unresolved: string[];
  disabled: string[];
}) {
  return {
    sent: result.sent,
    ambiguous: result.ambiguous,
    unresolved: result.unresolved,
    disabled: result.disabled
  };
}

async function resolveNoteMentions(
  note: string,
  workspaceOwnerId: string,
  mentionerUserId: string
) {
  try {
    return await resolveVisitorNoteMentionResolution({
      note,
      workspaceOwnerId,
      mentionerUserId
    });
  } catch (error) {
    console.error("visitor note mention resolution failed", error);
    return { mentions: [], recipients: [], ...emptyMentionResult() };
  }
}

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/visitor-note/route.ts:GET");
export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/visitor-note/route.ts:POST");
