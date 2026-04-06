import type { Metadata } from "next";
import Link from "next/link";
import { parseConversationRating } from "@/lib/conversation-feedback";
import { recordFeedback } from "@/lib/data";
import { NO_INDEX_METADATA } from "@/lib/site-seo";

type FeedbackPageProps = {
  searchParams: Promise<{
    conversationId?: string;
    rating?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Conversation Feedback | Chatting",
  ...NO_INDEX_METADATA
};

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const params = await searchParams;
  const conversationId = params.conversationId?.trim();
  const rating = parseConversationRating(params.rating);

  if (conversationId && rating !== null) {
    await recordFeedback(conversationId, rating);
  }

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-xl">
        <div className="glass-panel rounded-[2rem] p-8 shadow-glow">
          <p className="text-sm uppercase tracking-[0.28em] text-tide">Feedback captured</p>
          <h1 className="display-font mt-3 text-4xl text-ink">Thanks for the signal.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {rating === null
              ? "We couldn't read that feedback link."
              : `You rated this conversation ${rating} out of 5.`}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}
