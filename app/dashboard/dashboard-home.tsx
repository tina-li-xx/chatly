import { getDashboardHomeData } from "@/lib/data/dashboard-home";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { displayNameFromEmail, firstNameFromDisplayName, initialsFromLabel } from "@/lib/user-display";
import { DashboardLink } from "./dashboard-shell";
import { pageLabelFromUrl } from "./dashboard-ui";
import { DashboardWidgetInstallCard } from "./dashboard-widget-install-card";

function metricBadge(value: number | null, positiveLabel = true) {
  if (value == null) {
    return {
      text: "No data",
      tone: "neutral" as const
    };
  }

  if (value === 0) {
    return {
      text: "0",
      tone: "neutral" as const
    };
  }

  return {
    text: `${value > 0 && positiveLabel ? "+" : ""}${value}%`,
    tone: value > 0 ? ("positive" as const) : ("neutral" as const)
  };
}

function integerBadge(value: number) {
  if (value === 0) {
    return {
      text: "0",
      tone: "neutral" as const
    };
  }

  return {
    text: `${value > 0 ? "+" : ""}${value}`,
    tone: value > 0 ? ("positive" as const) : ("neutral" as const)
  };
}

function statBadgeClass(tone: "positive" | "neutral") {
  return tone === "positive"
    ? "bg-green-50 text-green-600 ring-1 ring-green-200"
    : "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
}

function formatResponseTime(seconds: number | null) {
  if (seconds == null) {
    return "--";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = seconds / 60;
  return `${minutes.toFixed(minutes >= 10 ? 0 : 1)}m`;
}

function conversationLabel(email: string | null, fallback: string) {
  return email ? displayNameFromEmail(email) : fallback;
}

function conversationInitials(email: string | null, fallback: string) {
  return initialsFromLabel(conversationLabel(email, fallback));
}

export async function DashboardHome({ userEmail, userId }: { userEmail: string; userId: string }) {
  const data = await getDashboardHomeData(userId);
  const profileName = displayNameFromEmail(userEmail);
  const firstName = firstNameFromDisplayName(profileName);
  const openBadge = integerBadge(data.openConversationsDelta);
  const resolvedBadge = integerBadge(data.resolvedTodayDelta);
  const responseBadge = metricBadge(data.avgResponseDeltaPercent);
  const satisfactionBadge = metricBadge(data.satisfactionDeltaPercent);
  const chartBadge = metricBadge(data.chart.changePercent);
  const chartMax = Math.max(...data.chart.points.map((point) => point.count), 1);
  const teamRows = [
    {
      name: firstName,
      initials: initialsFromLabel(profileName),
      status: "Online",
      tone: "bg-green-500",
      activeCount: Math.max(data.openConversations, 0)
    },
    {
      name: "Add teammate",
      initials: "+",
      status: "Invite",
      tone: "bg-slate-400",
      activeCount: null
    }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-normal text-slate-500">Open conversations</p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statBadgeClass(openBadge.tone)}`}>
              {openBadge.text}
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{data.openConversations}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-normal text-slate-500">Resolved today</p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statBadgeClass(resolvedBadge.tone)}`}>
              {resolvedBadge.text}
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{data.resolvedToday}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-normal text-slate-500">Avg response time</p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statBadgeClass(responseBadge.tone)}`}>
              {responseBadge.text}
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {formatResponseTime(data.avgResponseSeconds)}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-normal text-slate-500">Visitor satisfaction</p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${statBadgeClass(satisfactionBadge.tone)}`}
            >
              {satisfactionBadge.text}
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {data.satisfactionPercent == null ? "--" : `${data.satisfactionPercent}%`}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <article className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent conversations</h2>
              <p className="mt-1 text-sm font-normal text-slate-500">The latest threads that need a quick glance.</p>
            </div>
            <DashboardLink href="/dashboard/inbox" className="text-sm font-medium text-blue-600 transition hover:text-blue-700">
              View all
            </DashboardLink>
          </div>

          <div className="divide-y divide-slate-200">
            {data.recentConversations.length ? (
              data.recentConversations.map((conversation) => {
                const unread = conversation.unreadCount > 0;
                const displayName = conversationLabel(conversation.email, "Visitor");

                return (
                  <DashboardLink
                    key={conversation.id}
                    href={`/dashboard/inbox?id=${conversation.id}`}
                    className="flex items-start gap-4 px-4 py-4 transition hover:bg-slate-50"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        unread ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {conversationInitials(conversation.email, "Visitor")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {unread ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
                            <p
                              className={`truncate text-sm ${
                                unread ? "font-semibold text-slate-900" : "font-normal text-slate-700"
                              }`}
                            >
                              {displayName}
                            </p>
                          </div>
                          <p className="mt-1 truncate text-xs font-normal text-slate-400">
                            {conversation.email || "Anonymous visitor"}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-normal text-slate-400">
                          {formatRelativeTime(conversation.lastMessageAt || conversation.updatedAt)}
                        </span>
                      </div>

                      <p
                        className={`mt-1.5 truncate text-sm font-normal ${
                          unread ? "text-slate-700" : "text-slate-500"
                        }`}
                      >
                        {truncate(conversation.lastMessagePreview || "No message preview yet", 88)}
                      </p>

                      <div className="mt-3">
                        <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-normal text-slate-400">
                          {pageLabelFromUrl(conversation.pageUrl)}
                        </span>
                      </div>
                    </div>
                  </DashboardLink>
                );
              })
            ) : (
              <div className="px-5 py-10 text-sm text-slate-500">New conversations will show up here once visitors start chatting.</div>
            )}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-slate-900">Team status</h2>
            <div className="mt-4 space-y-4">
              {teamRows.map((member, index) => (
                <div key={`${member.name}-${index}`} className="flex items-center gap-3">
                  <div className="relative">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                      {member.initials}
                    </span>
                    <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${member.tone}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
                    <p className="text-xs font-normal text-slate-500">{member.status}</p>
                  </div>
                  {member.activeCount != null && member.activeCount > 0 ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {member.activeCount} active
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">Conversations</h2>
              <label className="sr-only" htmlFor="dashboard-range">
                Time period
              </label>
              <select
                id="dashboard-range"
                defaultValue="7"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            <div className="mt-5 flex h-32 items-end gap-3">
              {data.chart.points.map((point) => (
                <div key={point.label} className="flex w-8 flex-col items-center gap-2">
                  <div className="flex h-[100px] w-8 items-end">
                    <div
                      className="w-8 rounded-t-sm bg-blue-600"
                      style={{ height: `${Math.max((point.count / chartMax) * 100, point.count > 0 ? 12 : 4)}px` }}
                    />
                  </div>
                  <span className="text-xs font-normal text-slate-400">{point.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-4">
              <div>
                <p className="text-2xl font-bold tracking-tight text-slate-900">{data.chart.total}</p>
                <p className="mt-1 text-xs font-normal text-slate-500">Total this week</p>
              </div>
              <div className="text-right">
                <p className={chartBadge.tone === "positive" ? "text-xs font-medium text-green-600" : "text-xs font-medium text-slate-500"}>
                  {chartBadge.text}
                </p>
                <p className="mt-1 text-xs font-normal text-slate-500">vs last week</p>
              </div>
            </div>
          </article>

          <DashboardWidgetInstallCard
            initialInstalled={data.hasWidgetInstalled}
            siteIds={data.widgetSiteIds}
          />
        </div>
      </section>
    </div>
  );
}
