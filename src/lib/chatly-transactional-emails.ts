import {
  joinEmailText,
  renderBrandLockup,
  renderButtonRow,
  renderChatlyEmailShell,
  renderDivider,
  renderEmailSection,
  renderHeadingBlock,
  renderPanel
} from "@/lib/chatly-email-foundation";
import { initialsFromLabel } from "@/lib/user-display";
import { escapeHtml } from "@/lib/utils";

type RenderedEmail = {
  subject: string;
  bodyText: string;
  bodyHtml: string;
};

function renderTeamCard(teamName: string, teamWebsite: string | null, memberCount: number) {
  const initials = escapeHtml(initialsFromLabel(teamName));
  const website = teamWebsite ? `<div style="margin-top:2px;color:#64748B;">${escapeHtml(teamWebsite)}</div>` : "";

  return renderPanel(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="56" valign="top"><div style="width:48px;height:48px;border-radius:50%;background:#DBEAFE;color:#1D4ED8;font:600 18px/48px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;text-align:center;">${initials}</div></td><td valign="middle" style="font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;"><div style="font-weight:600;color:#0F172A;">${escapeHtml(
      teamName
    )}</div>${website}<div style="margin-top:2px;">${memberCount} team member${memberCount === 1 ? "" : "s"}</div></td></tr></table>`
  );
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
      "Here's what happens next:\n1. Install the widget — One line of code, 5 minutes max\n2. Customize your message — Make it sound like you\n3. Start chatting — We'll notify you the moment someone says hi",
      `Go to Dashboard → ${input.dashboardUrl}`,
      "Questions? Just reply to this email — we read every one.\n\n— The Chatting Team"
    ]),
    bodyHtml: renderChatlyEmailShell({
      preheader: "You're 5 minutes away from talking to your first visitor.",
      rows: [
        renderEmailSection(renderBrandLockup()),
        renderDivider(),
        renderEmailSection(
          `${renderHeadingBlock({ title: `Welcome to Chatting, ${greeting}! \u{1F44B}` })}<div style="margin-top:16px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">You're about to transform how you connect with visitors. No more missed questions. No more lost leads. Just real conversations that turn browsers into buyers.</div>`
        ),
        renderEmailSection(
          renderPanel(
            `<div style="font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;"><div><strong style="color:#0F172A;">1. Install the widget</strong> — One line of code, 5 minutes max</div><div style="margin-top:10px;"><strong style="color:#0F172A;">2. Customize your message</strong> — Make it sound like you</div><div style="margin-top:10px;"><strong style="color:#0F172A;">3. Start chatting</strong> — We'll notify you the moment someone says hi</div></div>`
          ),
          { padding: "0 32px 32px" }
        ),
        renderEmailSection(renderButtonRow({ primary: { href: input.dashboardUrl, label: "Go to Dashboard \u2192" } }), {
          align: "center",
          padding: "0 32px 32px"
        }),
        renderDivider(),
        renderEmailSection(
          `<div style="font:400 13px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">Questions? Just reply to this email — we read every one.<br /><br />&mdash; The Chatting Team</div>`,
          { padding: "24px 32px 32px" }
        )
      ]
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
    bodyHtml: renderChatlyEmailShell({
      preheader: "Click to activate your Chatting account.",
      rows: [
        renderEmailSection(
          `${renderHeadingBlock({ title: "Verify your email", align: "center" })}<div style="margin:20px auto 0;width:64px;height:64px;border-radius:18px;background:#EFF6FF;color:#1D4ED8;font:600 32px/64px Georgia,'Times New Roman',serif;text-align:center;">&#9993;</div><div style="margin-top:20px;text-align:center;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">Click the button below to verify your email address and activate your Chatting account.</div>`,
          { align: "center" }
        ),
        renderEmailSection(renderButtonRow({ primary: { href: input.verifyUrl, label: "Verify Email Address" } }), {
          align: "center",
          padding: "0 32px 32px"
        }),
        renderDivider(),
        renderEmailSection(
          `<div style="font:400 13px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">Or copy this link:<br /><a href="${input.verifyUrl}" style="color:#2563EB;text-decoration:none;">${fallback}</a><br /><br />This link expires in 24 hours.</div>`,
          { align: "center", padding: "24px 32px 32px" }
        )
      ]
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
    bodyHtml: renderChatlyEmailShell({
      preheader: "Choose a new password for your Chatting account.",
      rows: [
        renderEmailSection(
          `${renderHeadingBlock({ title: "Reset your password", align: "center" })}<div style="margin:20px auto 0;width:64px;height:64px;border-radius:18px;background:#EFF6FF;color:#1D4ED8;font:600 32px/64px Georgia,'Times New Roman',serif;text-align:center;">&#128274;</div><div style="margin-top:20px;text-align:center;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">We received a request to reset your password. Click below to choose a new one.</div>`,
          { align: "center" }
        ),
        renderEmailSection(renderButtonRow({ primary: { href: input.resetUrl, label: "Reset Password" } }), {
          align: "center",
          padding: "0 32px 32px"
        }),
        renderDivider(),
        renderEmailSection(
          `<div style="font:400 13px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">If you didn't request this, you can safely ignore this email. Your password won't change until you click the link above.<br /><br />This link expires in 1 hour.</div>`,
          { align: "center", padding: "24px 32px 32px" }
        )
      ]
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
  return {
    subject: `${input.inviterName} invited you to join ${input.teamName} on Chatting`,
    bodyText: joinEmailText([
      `You're invited to join ${input.teamName}`,
      `${input.inviterName} has invited you to join their team on Chatting, the live chat tool for small teams.`,
      `${input.teamName}${input.teamWebsite ? `\n${input.teamWebsite}` : ""}\n${input.memberCount} team member${input.memberCount === 1 ? "" : "s"}`,
      `Accept Invitation: ${input.inviteUrl}`,
      "This invitation expires in 7 days."
    ]),
    bodyHtml: renderChatlyEmailShell({
      preheader: `${input.inviterName} invited you to join ${input.teamName} on Chatting.`,
      rows: [
        renderEmailSection(renderBrandLockup()),
        renderDivider(),
        renderEmailSection(
          `${renderHeadingBlock({ title: `You're invited to join ${input.teamName}` })}<div style="margin-top:16px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${escapeHtml(
            input.inviterName
          )} has invited you to join their team on Chatting, the live chat tool for small teams.</div>`
        ),
        renderEmailSection(renderTeamCard(input.teamName, input.teamWebsite, input.memberCount), {
          padding: "0 32px 32px"
        }),
        renderEmailSection(renderButtonRow({ primary: { href: input.inviteUrl, label: "Accept Invitation" } }), {
          align: "center",
          padding: "0 32px 32px"
        }),
        renderDivider(),
        renderEmailSection(
          `<div style="text-align:center;font:400 13px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">This invitation expires in 7 days.</div>`,
          { padding: "24px 32px 32px" }
        )
      ]
    })
  };
}
