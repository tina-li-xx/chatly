import { deliverConversationTeamReply } from "@/lib/conversation-team-reply-delivery";
import { extractUploadedAttachments } from "@/lib/conversation-io";
import { asRouteFormData } from "@/lib/route-form-data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }
  const { user } = auth;

  const rawFormData = await request.formData();
  const formData = asRouteFormData(rawFormData)!;
  const conversationId = String(formData.get("conversationId") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const attachments = await extractUploadedAttachments(rawFormData);

  if (!content && !attachments.length) {
    return jsonError("empty-reply", 400);
  }

  try {
    const result = await deliverConversationTeamReply({
      conversationId,
      actorUserId: user.id,
      workspaceOwnerId: user.workspaceOwnerId,
      content,
      attachments,
      authorUserId: user.id,
      markReadUserId: user.id
    });

    if (!result) {
      return jsonError("not-found", 404);
    }

    return jsonOk(result);
  } catch (error) {
    console.error("reply post failed", error);
    if (error instanceof Error && error.message === "ATTACHMENT_LIMIT") {
      return jsonError("attachment-limit", 400);
    }
    if (error instanceof Error && error.message === "ATTACHMENT_TOO_LARGE") {
      return jsonError("attachment-too-large", 400);
    }
    return jsonError("reply-failed", 500);
  }
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/reply/route.ts:POST");
