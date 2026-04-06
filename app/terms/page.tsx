import type { Metadata } from "next";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { LegalPageShell } from "../legal-page-shell";

export const metadata: Metadata = {
  title: "Terms of Service | Chatting",
  alternates: {
    canonical: buildAbsoluteUrl("/terms")
  }
};

export default function TermsPage() {
  return (
    <LegalPageShell eyebrow="Legal" title="Terms of Service">
      <p>
        By using Chatting, you agree to use the product responsibly, keep your account secure, and comply with
        applicable laws in the places where you operate.
      </p>
      <p>
        Chatting is provided for teams who want to talk with visitors in real time. We may update these terms as the
        product evolves, and continued use after an update means you accept the revised terms.
      </p>
      <p>
        Questions about these terms can be sent to your Chatting workspace email or your usual support contact.
      </p>
    </LegalPageShell>
  );
}
