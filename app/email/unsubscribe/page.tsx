import type { Metadata } from "next";
import { ButtonLink } from "../../components/ui/Button";
import { getEmailUnsubscribePreferencesByToken } from "@/lib/email-unsubscribe";
import { NO_INDEX_METADATA } from "@/lib/site-seo";
import { EmailUnsubscribePanel } from "../email-unsubscribe-panel";

type EmailUnsubscribePageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Email Preferences | Chatting",
  ...NO_INDEX_METADATA
};

function InvalidUnsubscribeLink() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-tide">Email preferences</p>
        <h1 className="display-font mt-3 text-4xl text-ink">That link didn&apos;t work.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          This unsubscribe link is invalid or expired.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/" variant="secondary">Back to Chatting</ButtonLink>
      </div>
    </div>
  );
}

export default async function EmailUnsubscribePage({
  searchParams
}: EmailUnsubscribePageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const preferences = token ? await getEmailUnsubscribePreferencesByToken(token) : null;

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-xl">
        <div className="glass-panel rounded-[2rem] p-8 shadow-glow">
          {preferences ? (
            <EmailUnsubscribePanel
              email={preferences.email}
              initialSubscribed={preferences.subscribed}
              token={token}
            />
          ) : (
            <InvalidUnsubscribeLink />
          )}
        </div>
      </div>
    </main>
  );
}
