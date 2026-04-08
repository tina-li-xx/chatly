import {
  renderAccountWelcomeEmail,
  renderEmailVerificationEmail,
  renderPasswordResetEmail,
  renderTeamInvitationEmail
} from "@/lib/chatting-transactional-emails";
import {
  resolvePrimaryBrandHelloMailFrom,
  resolvePrimaryBrandNoReplyMailFrom,
  resolveTeamInvitationMailFrom
} from "@/lib/mail-from-addresses";
import { sendRenderedEmail } from "@/lib/rendered-email-delivery";

export async function sendAccountWelcomeEmail(input: {
  to: string;
  firstName: string;
  dashboardUrl: string;
}) {
  return sendRenderedEmail({
    from: resolvePrimaryBrandHelloMailFrom(),
    to: input.to,
    emailCategory: "optional",
    footerTeamName: "Chatting",
    rendered: renderAccountWelcomeEmail(input)
  });
}

export async function sendEmailVerificationEmail(input: {
  to: string;
  verifyUrl: string;
}) {
  return sendRenderedEmail({
    from: resolvePrimaryBrandNoReplyMailFrom(),
    to: input.to,
    emailCategory: "critical",
    footerTeamName: "Chatting",
    rendered: renderEmailVerificationEmail(input)
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}) {
  return sendRenderedEmail({
    from: resolvePrimaryBrandNoReplyMailFrom(),
    to: input.to,
    emailCategory: "critical",
    footerTeamName: "Chatting",
    rendered: renderPasswordResetEmail(input)
  });
}

export async function sendTeamInvitationEmail(input: {
  to: string;
  inviterName: string;
  teamName: string;
  teamWebsite: string | null;
  memberCount: number;
  inviteUrl: string;
}) {
  return sendRenderedEmail({
    from: resolveTeamInvitationMailFrom(input.inviterName),
    to: input.to,
    emailCategory: "critical",
    footerTeamName: input.teamName,
    rendered: renderTeamInvitationEmail(input)
  });
}
