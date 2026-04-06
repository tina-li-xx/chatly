"use client";

import { useState, type FormEvent } from "react";
import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import { encodeContactId } from "@/lib/contact-utils";
import type { DashboardTeamMember } from "@/lib/data/settings-types";
import type { ConversationThread } from "@/lib/types";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { DashboardAiConversationSummary } from "./dashboard-ai-conversation-summary";
import { DASHBOARD_TAGS } from "./dashboard-client.utils";
import { conversationIdentity, conversationPageUrl } from "./dashboard-conversation-display";
import {
  SidebarDivider,
  SidebarKeyValueRows,
  SidebarSection
} from "./dashboard-side-panel-ui";
import { ThreadContactNotes, ThreadContactTags, ThreadCustomerContext } from "./dashboard-thread-detail-contact-panels";
import { DashboardThreadAssignmentControls } from "./dashboard-thread-assignment-controls";
import {
  ThreadContactNoteModalSection,
  ThreadConversationTagsSection,
  ThreadRecentHistorySection,
  ThreadSharedVisitorNotesSection,
  ThreadSidebarIdentity
} from "./dashboard-thread-detail-sidebar-sections";
import { useDashboardThreadContact } from "./use-dashboard-thread-contact";
import {
  browserLabel,
  locationLabel,
  referrerLabel
} from "./dashboard-thread-detail.utils";

export function DashboardThreadDetailSidebar({
  activeConversation,
  savingEmail,
  assigningConversation,
  aiAssistSettings,
  teamMembers,
  onSaveConversationEmail,
  onConversationAssignmentChange,
  onToggleTag
}: {
  activeConversation: ConversationThread;
  savingEmail: boolean;
  assigningConversation: boolean;
  aiAssistSettings: DashboardAiAssistSettings;
  teamMembers: DashboardTeamMember[];
  onSaveConversationEmail: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onConversationAssignmentChange: (assignedUserId: string | null) => Promise<void>;
  onToggleTag: (tag: string) => Promise<void>;
}) {
  const visitor = conversationIdentity(activeConversation.email, "No email saved yet");
  const visitorLocation = locationLabel(activeConversation);
  const visitorActivity = activeConversation.visitorActivity;
  const showConversationSummary =
    activeConversation.messages.length >= 4 &&
    aiAssistSettings.conversationSummariesEnabled;
  const availableTags = DASHBOARD_TAGS.filter((tag) => !activeConversation.tags.includes(tag));
  const currentPageUrl = conversationPageUrl(activeConversation);
  const [contactTagDraft, setContactTagDraft] = useState("");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const contactId = activeConversation.email
    ? encodeContactId(activeConversation.siteId, activeConversation.email)
    : null;
  const { contact, contactStatuses, saveContactPatch } =
    useDashboardThreadContact(contactId);
  const conversationCount = visitorActivity ? visitorActivity.otherConversationsTotal + 1 : 1;
  const contactRows = [
    { label: "Record", value: activeConversation.email ? "Email" : "Session" },
    { label: "Session", value: activeConversation.sessionId },
    { label: "First seen", value: formatDateTime(activeConversation.createdAt) },
    {
      label: "Last seen",
      value: formatRelativeTime(visitorActivity?.lastSeenAt ?? activeConversation.updatedAt)
    },
    { label: "Conversations", value: String(conversationCount) }
  ] as const;
  const sessionRows = [
    { label: "Page", value: currentPageUrl, valueClassName: "text-blue-600" },
    { label: "Referrer", value: referrerLabel(activeConversation.referrer) },
    { label: "Location", value: visitorLocation || "Unknown" },
    { label: "Browser", value: browserLabel(activeConversation.userAgent) },
    { label: "Timezone", value: activeConversation.timezone || "Unknown" }
  ] as const;

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <ThreadSidebarIdentity
          visitor={visitor}
          conversationId={activeConversation.id}
          hasEmail={Boolean(activeConversation.email)}
          savingEmail={savingEmail}
          onSaveConversationEmail={onSaveConversationEmail}
        />
        <SidebarDivider />

        {showConversationSummary ? (
          <>
            <DashboardAiConversationSummary
              activeConversation={activeConversation}
              aiAssist={aiAssistSettings}
            />

            <SidebarDivider />
          </>
        ) : null}

        {activeConversation.email ? (
          <>
            <ThreadCustomerContext contact={contact} statuses={contactStatuses} />

            <SidebarDivider />
          </>
        ) : null}

        <SidebarSection title="Contact profile">
          <SidebarKeyValueRows rows={contactRows} />
        </SidebarSection>

        <SidebarDivider />

        <SidebarSection title="Current session">
          <SidebarKeyValueRows rows={sessionRows} />
        </SidebarSection>

        <SidebarDivider />

        {contact ? (
          <>
            <ThreadContactTags
              contact={contact}
              draftTag={contactTagDraft}
              onDraftTagChange={setContactTagDraft}
              onSavePatch={saveContactPatch}
            />

            <SidebarDivider />

            <ThreadContactNotes
              contact={contact}
              onAddNote={() => setActiveNoteId("new")}
              onEditNote={setActiveNoteId}
            />

            <SidebarDivider />
          </>
        ) : null}

        <DashboardThreadAssignmentControls
          assignedUserId={activeConversation.assignedUserId}
          teamMembers={teamMembers}
          assigningConversation={assigningConversation}
          onAssignConversation={onConversationAssignmentChange}
        />

        <SidebarDivider />

        <ThreadConversationTagsSection
          tags={activeConversation.tags}
          availableTags={availableTags}
          onToggleTag={onToggleTag}
        />

        <SidebarDivider />

        <ThreadSharedVisitorNotesSection conversationId={activeConversation.id} />

        <ThreadRecentHistorySection visitorActivity={visitorActivity} />
      </div>
      <ThreadContactNoteModalSection
        contact={contact}
        activeNoteId={activeNoteId}
        onClose={() => setActiveNoteId(null)}
        onSavePatch={saveContactPatch}
      />
    </>
  );
}
