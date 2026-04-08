import {
  joinEmailText,
  renderChattingEmailPage,
  renderParagraph,
  renderSmallText,
  renderStack
} from "@/lib/chatting-email-foundation";
import { initialsFromLabel } from "@/lib/user-display";
import { escapeHtml } from "@/lib/utils";

type RenderedEmail = {
  subject: string;
  bodyText: string;
  bodyHtml: string;
};

function renderTeamCard(teamName: string, teamWebsite: string | null, _memberCount: number) {
  const initials = escapeHtml(initialsFromLabel(teamName));
  const website = teamWebsite ? `<tr><td style="padding-top:2px;color:#64748B;">${escapeHtml(teamWebsite)}</td></tr>` : "";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #E2E8F0;border-radius:12px;background:#F8FAFC;"><tr><td style="padding:20px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;"><tr><td width="56" valign="middle" style="width:56px;padding-right:16px;"><table role="presentation" cellpadding="0" cellspacing="0" width="48" height="48" style="width:48px;height:48px;border-radius:999px;background:#DBEAFE;"><tr><td align="center" valign="middle" style="font:600 18px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1D4ED8;">${initials}</td></tr></table></td><td valign="middle" style="font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="font-weight:600;color:#0F172A;">${escapeHtml(teamName)}</td></tr>${website}</table></td></tr></table></td></tr></table>`;
}

export function renderAccountWelcomeEmail(input: {
  firstName: string;
  dashboardUrl: string;
}): RenderedEmail {
  const greeting = input.firstName.trim() || "there";

  return {
    subject: "Welcome to Chatting — let's get you set up",
    bodyText: joinEmailText([
      `Welcome to Chatting, ${greeting}!`,
      "You're about to transform how you connect with visitors. No more missed questions. No more lost leads. Just real conversations that turn browsers into buyers.",
      "Here's what happens next:\n1. Install the widget — One line of code, 3 minutes max\n2. Customize your message — Make it sound like you\n3. Start chatting — We'll notify you the moment someone says hi",
      `Go to Dashboard → ${input.dashboardUrl}`,
      "Questions? Just reply to this email — we read every one.\n\n— The Chatting Team"
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: "You're 3 minutes away from talking to your first visitor.",
      title: `Welcome to Chatting, ${greeting}! \u{1F44B}`,
      sections: [
        {
          kind: "copy",
          html: `You're about to transform how you connect with visitors. No more missed questions. No more lost leads. Just real conversations that turn browsers into buyers.`,
          padding: "0 32px 24px"
        },
        {
          kind: "panel",
          html: renderStack(
            [
              renderParagraph("<strong style=\"color:#0F172A;\">1. Install the widget</strong> — One line of code, 3 minutes max"),
              renderParagraph("<strong style=\"color:#0F172A;\">2. Customize your message</strong> — Make it sound like you"),
              renderParagraph("<strong style=\"color:#0F172A;\">3. Start chatting</strong> — We'll notify you the moment someone says hi")
            ],
            { gap: "10px" }
          ),
          padding: "0 32px 32px"
        },
        {
          kind: "html",
          html: renderSmallText("Questions? Just reply to this email — we read every one. — The Chatting Team", "center"),
          padding: "0 32px 24px"
        }
      ],
      actions: { primary: { href: input.dashboardUrl, label: "Go to Dashboard \u2192" }, padding: "0 32px 32px", borderTopColor: undefined }
    })
  };
}

export function renderEmailVerificationEmail(input: {
  verifyUrl: string;
}): RenderedEmail {
  const fallback = escapeHtml(input.verifyUrl);

  return {
    subject: "Verify your email address",
    bodyText: joinEmailText([
      "Verify your email",
      "Click the button below to verify your email address and activate your Chatting account.",
      `Verify Email Address: ${input.verifyUrl}`,
      `Or copy this link: ${input.verifyUrl}`,
      "This link expires in 24 hours."
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: "Click to activate your Chatting account.",
      title: "Verify your email",
      description: "Click the button below to verify your email address and activate your Chatting account.",
      align: "center",
      sections: [
        {
          kind: "html",
          html: renderSmallText(
            `Or copy this link: <a href="${fallback}" style="color:#2563EB;text-decoration:underline;">${fallback}</a><br /><br />This link expires in 24 hours.`,
            "center"
          ),
          padding: "0 32px 24px"
        }
      ],
      actions: { primary: { href: input.verifyUrl, label: "Verify Email Address" }, padding: "0 32px 32px", borderTopColor: undefined }
    })
  };
}

export function renderPasswordResetEmail(input: {
  resetUrl: string;
}): RenderedEmail {
  return {
    subject: "Reset your password",
    bodyText: joinEmailText([
      "Reset your password",
      "We received a request to reset your password. Click below to choose a new one.",
      `Reset Password: ${input.resetUrl}`,
      "If you didn't request this, you can safely ignore this email. Your password won't change until you click the link above.",
      "This link expires in 1 hour."
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: "Choose a new password for your Chatting account.",
      title: "Reset your password",
      description: "We received a request to reset your password. Click below to choose a new one.",
      align: "center",
      sections: [
        {
          kind: "html",
          html: renderSmallText(
            "If you didn't request this, you can safely ignore this email. Your password won't change until you click the link above.<br /><br />This link expires in 1 hour.",
            "center"
          ),
          padding: "0 32px 24px"
        }
      ],
      actions: { primary: { href: input.resetUrl, label: "Reset Password" }, padding: "0 32px 32px", borderTopColor: undefined }
    })
  };
}

export function renderTeamInvitationEmail(input: {
  inviterName: string;
  teamName: string;
  teamWebsite: string | null;
  memberCount: number;
  inviteUrl: string;
}): RenderedEmail {
  const isChattingTeam = input.teamName.trim().toLowerCase() === "chatting";
  const inviteSubject = isChattingTeam
    ? `${input.inviterName} invited you to join the Chatting team`
    : `${input.inviterName} invited you to join ${input.teamName} on Chatting`;
  const inviteDescription = isChattingTeam
    ? `${input.inviterName} has invited you to join the Chatting team.`
    : `${input.inviterName} has invited you to join their team on Chatting, the live chat tool for small teams.`;

  return {
    subject: inviteSubject,
    bodyText: joinEmailText([
      `You're invited to join ${input.teamName}`,
      inviteDescription,
      `${input.teamName}${input.teamWebsite ? `\n${input.teamWebsite}` : ""}`,
      `Continue to Invitation: ${input.inviteUrl}`,
      "This invitation expires in 7 days."
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: inviteSubject,
      title: `You're invited to join ${input.teamName}`,
      description: inviteDescription,
      sections: [
        { kind: "html", html: renderTeamCard(input.teamName, input.teamWebsite, input.memberCount), padding: "0 32px 32px" },
        {
          kind: "html",
          html: renderSmallText("This invitation expires in 7 days.", "center"),
          padding: "0 32px 24px"
        }
      ],
      actions: { primary: { href: input.inviteUrl, label: "Continue to Invitation" }, padding: "0 32px 32px", borderTopColor: undefined }
    })
  };
}
