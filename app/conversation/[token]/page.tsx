import { ButtonLink } from "../../components/ui/Button";
import { parseConversationPreviewToken } from "@/lib/conversation-preview-link";
import { getPublicConversationMessages, getSiteWidgetConfig } from "@/lib/data";
import { parseConversationResumeToken } from "@/lib/conversation-resume-link";
import { ConversationPreviewClient } from "../preview/conversation-preview-client";
import { buildConversationPreviewContent } from "../preview/conversation-preview-content";
import { ConversationResumeClient } from "./conversation-resume-client";

type ConversationResumePageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

function ConversationResumeUnavailable() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-xl">
        <div className="glass-panel rounded-[2rem] p-8 shadow-glow">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Conversation link</p>
          <h1 className="display-font mt-3 text-4xl text-slate-900">This link is no longer available.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Ask the team to send a fresh email if you still need help with this conversation.
          </p>
          <ButtonLink href="/" className="mt-8">
            Back to Chatting
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}

export default async function ConversationResumePage({ params }: ConversationResumePageProps) {
  const { token } = await params;
  const identity = parseConversationResumeToken(token);

  if (!identity) {
    const previewIdentity = parseConversationPreviewToken(token);
    if (previewIdentity) {
      return <ConversationPreviewClient {...buildConversationPreviewContent(previewIdentity)} />;
    }

    return <ConversationResumeUnavailable />;
  }

  const [site, messages] = await Promise.all([
    getSiteWidgetConfig(identity.siteId),
    getPublicConversationMessages(identity)
  ]);

  if (!site || !messages) {
    return <ConversationResumeUnavailable />;
  }

  return (
    <ConversationResumeClient
      brandingLabel={site.brandingLabel}
      brandingUrl={site.brandingUrl}
      brandColor={site.brandColor}
      identity={identity}
      initialMessages={messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender === "founder" ? "team" : "user",
        attachments: message.attachments
      }))}
      showBranding={site.showBranding}
      teamPhotoUrl={site.teamPhotoUrl}
      widgetTitle={site.widgetTitle}
    />
  );
}
