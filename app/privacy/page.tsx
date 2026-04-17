import type { Metadata } from "next";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { LegalPageShell } from "../legal-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy | Chatting",
  alternates: {
    canonical: buildAbsoluteUrl("/privacy")
  }
};

export default function PrivacyPage() {
  return (
    <LegalPageShell eyebrow="Legal" title="Privacy Policy">
      <p>
        Chatting collects and stores the information needed to run the service, power the team inbox, deliver
        notifications, and help teams respond to website visitors across web and mobile.
      </p>
      <h2 className="pt-4 text-2xl font-semibold text-slate-900">What we collect</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li><strong>Name and email address</strong> for account setup, sign-in, profile details, and support.</li>
        <li><strong>Conversation and message content</strong> including replies, visitor messages, transcripts, and related thread metadata.</li>
        <li><strong>Attachments and photos</strong> that users upload in conversations or as profile images.</li>
        <li><strong>Account and user identifiers</strong> such as workspace membership records, internal account IDs, and session-linked user IDs.</li>
        <li><strong>Device and notification identifiers</strong> such as push tokens and device registration data used to deliver mobile notifications.</li>
        <li><strong>Product interaction data</strong> needed for functionality, such as conversation status changes, assignment state, notification preferences, and availability.</li>
      </ul>
      <h2 className="pt-4 text-2xl font-semibold text-slate-900">Why we collect it</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>To authenticate users and keep workspaces secure.</li>
        <li>To deliver the core live chat product, including the inbox, threads, assignments, visitor context, and saved conversation history.</li>
        <li>To send service messages such as password resets, account emails, and mobile push notifications.</li>
        <li>To maintain reliability, prevent abuse, troubleshoot issues, and improve core product performance.</li>
      </ul>
      <h2 className="pt-4 text-2xl font-semibold text-slate-900">Sharing and subprocessors</h2>
      <p>
        We do not sell personal information or use collected data for third-party advertising. We may share data
        with service providers that help us operate Chatting, such as hosting and infrastructure providers,
        database and storage providers, email delivery providers, and mobile push notification providers including
        Apple, Google, and Expo where applicable.
      </p>
      <p>
        We may also disclose information when required by law, to enforce our terms, or to protect the security,
        rights, and safety of Chatting, our customers, or end users.
      </p>
      <h2 className="pt-4 text-2xl font-semibold text-slate-900">Retention and deletion</h2>
      <p>
        We keep account, conversation, and notification data for as long as it is needed to operate the workspace,
        provide support, maintain security records, and meet legal obligations. Workspace owners can update or
        remove certain records inside the product, and we may retain limited backup or audit information for a
        reasonable period after deletion.
      </p>
      <h2 className="pt-4 text-2xl font-semibold text-slate-900">Privacy requests</h2>
      <p>
        If you need access, correction, deletion, or have privacy questions, contact your workspace owner or email{" "}
        <a className="font-medium text-blue-600 underline underline-offset-4" href="mailto:hello@usechatting.com">
          hello@usechatting.com
        </a>.
      </p>
    </LegalPageShell>
  );
}
