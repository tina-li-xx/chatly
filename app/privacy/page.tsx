import { LegalPageShell } from "../legal-page-shell";

export default function PrivacyPage() {
  return (
    <LegalPageShell eyebrow="Legal" title="Privacy Policy">
      <p>
        Chatting stores the account, conversation, and site information needed to run live chat, power the inbox,
        and help teams respond to visitors quickly.
      </p>
      <p>
        We only use personal and visitor data to operate the service, improve reliability, and deliver the
        product features you enable, such as notifications, transcripts, and widget verification.
      </p>
      <p>
        If you need help with data access, removal, or privacy questions, contact your Chatting workspace owner or
        your usual support contact.
      </p>
    </LegalPageShell>
  );
}
