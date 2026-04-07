import { getCurrentUser } from "@/lib/auth";
import { getAttachmentForPublic, getAttachmentForUser } from "@/lib/data";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET(
  request: Request,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  const { attachmentId } = await params;
  const { searchParams } = new URL(request.url);
  const conversationId = String(searchParams.get("conversationId") ?? "").trim();

  if (!attachmentId || !conversationId) {
    return new Response("Attachment not found.", { status: 404 });
  }

  const user = await getCurrentUser();
  const attachment = user
    ? await getAttachmentForUser({
        attachmentId,
        conversationId,
        userId: user.id
      })
    : await getAttachmentForPublic({
        attachmentId,
        conversationId,
        siteId: String(searchParams.get("siteId") ?? "").trim(),
        sessionId: String(searchParams.get("sessionId") ?? "").trim()
      });

  if (!attachment) {
    return new Response("Attachment not found.", { status: 404 });
  }

  const disposition = attachment.content_type.startsWith("image/") ? "inline" : "attachment";

  return new Response(new Uint8Array(attachment.content), {
    status: 200,
    headers: {
      "Content-Type": attachment.content_type,
      "Content-Length": String(attachment.size_bytes),
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(attachment.file_name)}"`,
      "Cache-Control": "private, max-age=3600"
    }
  });
}

export const GET = withRouteErrorAlerting(handleGET, "app/api/files/[attachmentId]/route.ts:GET");
