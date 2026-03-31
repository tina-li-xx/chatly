import { redirect } from "next/navigation";
import { buildConversationPreviewToken } from "@/lib/conversation-preview-link";
import { buildConversationPreviewIdentityFromSearchParams } from "./conversation-preview-content";

type ConversationPreviewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function ConversationPreviewPage({
  searchParams
}: ConversationPreviewPageProps) {
  const params = await searchParams;
  const identity = buildConversationPreviewIdentityFromSearchParams(params);
  redirect(`/conversation/${buildConversationPreviewToken(identity)}`);
}
