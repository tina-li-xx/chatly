export type ChangelogEntry = { period: string; title: string; summary: string; bullets: string[] };

const entry = (period: string, title: string, summary: string, bullets: string[]): ChangelogEntry => ({
  period,
  title,
  summary,
  bullets
});

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  entry("April 2026", "Chatting now has a React Native and Expo package", "Teams can now add Chatting to Expo and React Native apps with a published package instead of building their own mobile chat client from scratch.", [
    "The new package includes session storage, live conversation sync, and a drop-in support screen for mobile apps.",
    "Expo apps can register push tokens through the package so team replies can bring people back into the conversation after the app is backgrounded.",
    "The public guides library now includes a matching Expo and React Native setup guide with the exact install, client setup, and push registration flow."
  ]),
  entry("April 2026", "Shared links now show the current Chatting preview card", "Links to Chatting pages now do a better job of showing the right preview image and positioning when shared in places like LinkedIn.", [
    "Homepage and author-page social metadata now point at a refreshed preview-image URL so networks can pick up the current card instead of holding onto a stale blank image.",
    "The default homepage social card now uses clearer headline and subtitle copy that matches Chatting's current positioning for small teams."
  ]),
  entry("April 2026", "Chatting now has a native iOS SDK", "Teams can now bring Chatting into native iPhone and iPad apps with a first-party SDK that supports the same visitor conversation flow already used on the web.", [
    "The new iOS SDK supports visitor session storage, conversation creation and resume, live conversation refresh, typing updates, email capture, and contact identify flows.",
    "Teams can ship the SDK either through Swift Package Manager or CocoaPods, depending on how their app is already managed.",
    "A lightweight SwiftUI wrapper makes it faster to drop in a native chat surface without rebuilding the whole conversation flow from scratch."
  ]),
  entry("April 2026", "Integrations now connect to real external workflows", "Chatting now has a dedicated integrations area for teams that want Slack notifications, Zapier automations, Shopify context, and outbound webhooks wired to live backend connections.", [
    "Slack, Zapier, Shopify, and webhooks now live together in one settings area with real saved connection state instead of placeholder UI.",
    "Zapier can now be used as both a trigger source and an action target, including live support for new conversations, resolved conversations, new contacts, tags, contact creation, contact tagging, and sending messages.",
    "Shopify now connects through a real OAuth flow so inbox teammates can pull customer order context from connected stores.",
    "The public guides library now includes dedicated setup walkthroughs for Slack, Zapier, Shopify, and webhooks so teams can get each connection live faster.",
    "Zapier setup docs now include a dedicated API reference plus a starter-workflow guide, so teams can connect Chatting faster and copy proven first-use automations without guessing through setup.",
    "Starter Zap examples now cover Slack alerts, Google Sheets contact logging, lead imports with tagging, and automatic first replies inside Chatting.",
    "Locked integration cards now open the Growth confirmation modal in place, so teams can review member count and billing before unlocking Zapier, Slack, Shopify, or webhooks.",
    "Zapier setup inside settings now includes direct guide links, the available trigger and action list, and starter workflow recipes in one clearer setup view."
  ]),
  entry("Early April 2026", "AI Assist is now built into the inbox", "Chatting now includes AI Assist to help teams reply faster, with suggestions that stay human-controlled and grounded in the live conversation.", [
    "Teams can now generate reply suggestions, summarize longer threads, rewrite drafts, and get suggested tags directly inside the inbox.",
    "Starter workspaces get 5 AI Assist requests per billing cycle, and usage is tracked across the full set of AI features.",
    "AI Assist also includes recent activity, a full usage log with filters and CSV export, and visibility controls so detailed activity stays scoped to the right teammates."
  ]),
  entry("Early April 2026", "People now gives teams real contact memory, not just live sessions", "Chatting can now keep track of who a visitor is across conversations so teams have useful context the moment they open the inbox.", [
    "Contact profiles now bring together identity, activity, tags, notes, conversations, and custom fields in one place.",
    "Teams can create and manage their own contact statuses and custom fields from settings.",
    "Notes, tags, and custom field values can now be updated directly from each contact profile.",
    "Contact tags now update immediately in the inbox sidebar and contact drawer, and the thread tag area is easier to scan while editing live conversations."
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
  entry("Early March 2026", "Joining your team got easier", "Teammates can get into the right Chatting workspace faster, and account setup is less likely to stall along the way.", [
    "Invite links now take teammates straight into the workspace that invited them.",
    "Teammates can finish signup without losing the invite that brought them there.",
    "Email verification and password recovery now make it easier to finish setup and get back in."
  ]),
  entry("Early March 2026", "Upgrading got clearer for growing teams", "Chatting now makes it easier to compare plans, understand what extra seats will cost, and keep referral rewards in view.", [
    "Starter and Growth plans now show clearer monthly and annual pricing before checkout.",
    "Team-size pricing updates on the page so it is easier to see what a larger team will cost before you upgrade.",
    "Referral links, signups, and reward progress now live together in one billing view."
  ]),
  entry("February 2026", "Important updates started showing up by email", "Chatting began emailing teams the updates that matter most, so keeping up with conversations and weekly performance takes less dashboard checking.", [
    "Daily digests and weekly performance emails can now arrive automatically for each teammate.",
    "Daily digests, weekly reports, and reminder emails are now less likely to go missing, so teams can rely on routine updates showing up when expected.",
    "Reminder emails help teams catch setup gaps, slow activity, and other moments that need attention.",
    "Conversation and notification emails now feel more polished and easier to scan."
  ]),
  entry("February 2026", "The dashboard became easier to run day to day", "Chatting brought inbox, visitors, analytics, settings, and growth views into one workspace so teams could manage chat without bouncing between scattered screens.", [
    "Inbox, visitors, analytics, team, settings, and widget controls now live together in the dashboard.",
    "The home view now highlights workspace activity and trends instead of acting like a blank landing page.",
    "Teams can move from live conversations to visitor context and setup controls without losing their place."
  ]),
  entry("January 2026", "Getting your widget live took fewer steps", "New teams got a more guided setup flow so they could customize the widget, install it, and confirm everything was working faster.", [
    "Setup now walks owners through widget customization, install, and go-live checks.",
    "New workspaces start with a more sensible default site name based on the signup email domain.",
    "Onboarding stays focused on the next step instead of extra setup friction."
  ]),
  entry("Start of 2026", "Chatting launched with the essentials for live chat", "The first release gave small teams a branded website widget, a shared inbox, and email follow-up in one place.", [
    "Teams can add a chat widget to their site and start collecting visitor context right away.",
    "A shared inbox gives teammates one place to read, reply to, and tag conversations.",
    "Email follow-up keeps conversations moving after a visitor leaves the site."
  ])
];
