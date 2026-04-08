export type ChangelogEntry = { period: string; title: string; summary: string; bullets: string[] };

const entry = (period: string, title: string, summary: string, bullets: string[]): ChangelogEntry => ({
  period,
  title,
  summary,
  bullets
});

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  entry("April 2026", "Integrations now connect to real external workflows", "Chatting now has a dedicated integrations area for teams that want Slack notifications, Zapier automations, Shopify context, and outbound webhooks wired to live backend connections.", [
    "Slack, Zapier, Shopify, and webhooks now live together in one settings area with real saved connection state instead of placeholder UI.",
    "Zapier can now be used as both a trigger source and an action target, including live support for new conversations, resolved conversations, new contacts, tags, contact creation, contact tagging, and sending messages.",
    "Shopify now connects through a real OAuth flow so inbox teammates can pull customer order context from connected stores."
  ]),
  entry("Early April 2026", "AI Assist is now built into the inbox", "Chatting now includes AI Assist to help teams reply faster, with suggestions that stay human-controlled and grounded in the live conversation.", [
    "Teams can now generate reply suggestions, summarize longer threads, rewrite drafts, and get suggested tags directly inside the inbox.",
    "Starter workspaces get 5 AI Assist requests per billing cycle, and usage is tracked across the full set of AI features.",
    "AI Assist also includes recent activity, a full usage log with filters and CSV export, and visibility controls so detailed activity stays scoped to the right teammates."
  ]),
  entry("Early April 2026", "People now gives teams real contact memory, not just live sessions", "Chatting can now keep track of who a visitor is across conversations so teams have useful context the moment they open the inbox.", [
    "Contact profiles now bring together identity, activity, tags, notes, conversations, and custom fields in one place.",
    "Teams can create and manage their own contact statuses and custom fields from settings.",
    "Notes, tags, and custom field values can now be updated directly from each contact profile."
  ]),
  entry("Early April 2026", "Automation can now do much more before a teammate jumps in", "Teams can now shape more of the visitor journey from settings, with better routing, FAQ suggestions, and proactive outreach that feel much closer to the live widget experience.", [
    "Automation settings now cover offline behavior, routing rules, FAQ suggestions, and page-based proactive messages in one place.",
    "FAQ suggestions can match a visitor's first message and show help before handoff.",
    "Auto-routing now works for live incoming conversations across page, message, referrer, location, visitor tags, and custom fields when that profile data is available.",
    "Proactive messages now support wildcard paths, delays, auto-open behavior, drag-and-drop ordering, and live widget triggering.",
    "Routing rules now handle empty tags and incomplete custom-field values more gracefully, so visitor-based automations are less likely to miss."
  ]),
  entry("April 2026", "Weekly performance reports got a major upgrade", "Monday reports now give teams a clearer, more useful view of how chat is trending without needing to open the dashboard.", [
    "Reports now arrive on each teammate's local Monday morning schedule.",
    "Each email includes a richer snapshot of conversations, response trends, busiest hours, and top pages.",
    "Teams can control report settings more directly, and the written insight now does a better job of summarizing what changed."
  ]),
  entry("Late March 2026", "Reporting now matches each teammate's local time", "Reports and conversation trends now line up more closely with when work actually happened for each teammate.", [
    "Daily and weekly emails use teammate-local time windows.",
    "Dashboard conversation trends use rolling local ranges instead of a one-size-fits-all calendar slice."
  ]),
  entry("Mid March 2026", "Conversation emails now bring visitors back into the same thread", "Email follow-ups now feel like a continuation of the same conversation, not a side channel.", [
    "Visitor emails can bring people back into the same hosted thread.",
    "Teammate mention emails link more directly to the right context.",
    "Visitor follow-up templates now avoid repeating extra conversation-link instructions when that guidance is already in the email."
  ]),
  entry("Earlier 2026", "Invites, referrals, and billing are easier to manage as a team", "Joining a team, sharing referrals, and tracking rewards now feel more connected.", [
    "Invite flows make it easier for teammates to join the right workspace and land in the right place."
  ])
];
