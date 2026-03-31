"use client";

import type { FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { FormInput } from "../ui/form-controls";
import { ConversationResumeMessage } from "./[token]/conversation-resume-message";
import { ConversationThreadNav } from "./conversation-thread-nav";
import type { MessageAttachment } from "@/lib/types";

export type ConversationThreadMessage = {
  id: string;
  content: string;
  createdAt: string;
  sender: "team" | "user";
  attachments: MessageAttachment[];
};

type ConversationThreadShellProps = {
  brandingLabel: string;
  brandingUrl: string;
  brandColor: string;
  content: string;
  messages: ConversationThreadMessage[];
  onChangeContent: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  sending: boolean;
  showBranding: boolean;
  teamPhotoUrl: string | null;
  teamTyping?: boolean;
  widgetTitle: string;
};

export function ConversationThreadShell({
  brandingLabel,
  brandingUrl,
  brandColor,
  content,
  messages,
  onChangeContent,
  onSubmit,
  sending,
  showBranding,
  teamPhotoUrl,
  teamTyping = false,
  widgetTitle
}: ConversationThreadShellProps) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <section className="glass-panel mx-auto flex min-h-[70vh] max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <ConversationThreadNav
          brandingLabel={brandingLabel}
          brandingUrl={brandingUrl}
          brandColor={brandColor}
          showBranding={showBranding}
          teamPhotoUrl={teamPhotoUrl}
          widgetTitle={widgetTitle}
        />
        <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_100%)] px-4 py-5 sm:px-6">
          {messages.map((message) => (
            <ConversationResumeMessage key={message.id} {...message} teamColor={brandColor} />
          ))}
          {teamTyping ? (
            <div className="flex justify-start">
              <div className="rounded-[18px] rounded-bl-md bg-white px-4 py-3 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
                <span className="typing-dot inline-block h-2 w-2 rounded-full bg-slate-300" />
                <span className="typing-dot ml-1 inline-block h-2 w-2 rounded-full bg-slate-300" />
                <span className="typing-dot ml-1 inline-block h-2 w-2 rounded-full bg-slate-300" />
              </div>
            </div>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <FormInput
              value={content}
              onChange={(event) => onChangeContent(event.target.value)}
              placeholder="Type your reply"
              className="min-w-0 flex-1"
            />
            <Button
              type="submit"
              disabled={sending || !content.trim()}
              className="w-full shrink-0 whitespace-nowrap px-6 sm:w-auto sm:min-w-[190px] glow-send"
              style={{ backgroundColor: brandColor }}
            >
              {sending ? "Sending..." : "Send message"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
