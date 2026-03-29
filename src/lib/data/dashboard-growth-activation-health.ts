import type { DashboardHomeGrowthData } from "@/lib/data/dashboard-growth-types";

function hoursBetween(start: string | Date, end: string | Date) {
  return (new Date(end).getTime() - new Date(start).getTime()) / (60 * 60 * 1000);
}

function formatHoursRemaining(hours: number) {
  if (hours <= 1) {
    return "less than 1 hour";
  }

  const rounded = Math.ceil(hours);
  return `${rounded} hour${rounded === 1 ? "" : "s"}`;
}

function formatResponseTime(seconds: number | null) {
  if (seconds == null) return "No reply data";
  if (seconds < 60) return `${seconds}s`;

  const minutes = seconds / 60;
  return `${minutes.toFixed(minutes >= 10 ? 0 : 1)}m`;
}

function formatVolumeDetail(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? "No conversation baseline yet" : "First conversation baseline is forming";
  }

  const delta = Math.round(((current - previous) / previous) * 100);
  return delta === 0 ? "Flat vs last week" : `${delta > 0 ? "+" : ""}${delta}% vs last week`;
}

function scoreConversationVolume(current: number, previous: number, total: number) {
  if (total === 0) return 50;
  if (previous === 0) return current > 0 ? 100 : 55;

  const delta = ((current - previous) / previous) * 100;
  if (delta >= 10) return 100;
  if (delta >= 0) return 88;
  if (delta >= -25) return 70;
  if (delta >= -50) return 42;
  return 18;
}

function scoreResponseTime(seconds: number | null) {
  if (seconds == null) return 60;
  if (seconds <= 300) return 100;
  if (seconds <= 900) return 84;
  if (seconds <= 1800) return 74;
  if (seconds <= 3600) return 58;
  if (seconds <= 14400) return 36;
  return 18;
}

function scoreLoginFrequency(loginsLast7Days: number, lastLoginAt: string | null) {
  if (loginsLast7Days >= 5) return 100;
  if (loginsLast7Days >= 3) return 84;
  if (loginsLast7Days >= 1) return 68;
  if (!lastLoginAt) return 20;
  return hoursBetween(lastLoginAt, new Date()) <= 14 * 24 ? 35 : 12;
}

function relativeDayLabel(value: string | null) {
  if (!value) return "No recent login history";

  const dayDelta = Math.round((new Date(value).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return `Last login ${new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(dayDelta, "day")}`;
}

function toneForScore(score: number): DashboardHomeGrowthData["health"]["tone"] {
  if (score >= 80) return "positive";
  if (score >= 60) return "neutral";
  return "warning";
}

export function buildActivation(
  userCreatedAt: string,
  hasWidgetInstalled: boolean,
  totalConversations: number,
  firstConversationAt: string | null,
  now: Date
): DashboardHomeGrowthData["activation"] {
  const signupDeadline = new Date(new Date(userCreatedAt).getTime() + 24 * 60 * 60 * 1000);

  if (totalConversations > 0) {
    const activatedWithinWindow =
      firstConversationAt != null && new Date(firstConversationAt).getTime() <= signupDeadline.getTime();

    return activatedWithinWindow
      ? {
          status: "activated-fast",
          tone: "positive",
          badge: "Activated fast",
          title: "First chat happened within the first 24 hours",
          description: "Your activation loop is working. Keep the widget visible on high-intent pages to sustain momentum.",
          helper: "Target met",
          action: { label: "Open inbox", href: "/dashboard/inbox" }
        }
      : {
          status: "activated-late",
          tone: "neutral",
          badge: "Activated",
          title: "The first chat landed, but it took longer than a day",
          description: "Tighten your welcome copy and placement so new workspaces reach value faster after signup.",
          helper: "Shorten time-to-first-chat",
          action: { label: "Tune widget", href: "/dashboard/widget" }
        };
  }

  if (!hasWidgetInstalled) {
    return {
      status: "needs-install",
      tone: "warning",
      badge: "Install blocker",
      title: "Activation is blocked until the widget is live",
      description: "No chats can happen until the widget is installed. Publish the snippet first, then test it on your site.",
      helper: "Finish installation to start the clock",
      action: { label: "Check installation", href: "/dashboard/widget" }
    };
  }

  const hoursRemaining = hoursBetween(now, signupDeadline);
  return hoursRemaining > 0
    ? {
        status: "countdown",
        tone: "neutral",
        badge: "First 24 hours",
        title: "The widget is live. Now push for the first conversation.",
        description: `You still have ${formatHoursRemaining(hoursRemaining)} to hit the first-chat activation target.`,
        helper: "Put the widget on pricing, demo, or contact pages and send yourself a test message.",
        action: { label: "Customize widget", href: "/dashboard/widget" }
      }
    : {
        status: "stalled",
        tone: "warning",
        badge: "Nudge needed",
        title: "The widget is installed, but there are still no conversations",
        description: "Move the widget to a higher-intent page, sharpen the welcome prompt, and trigger the first reply loop manually.",
        helper: "Activation slipped past the first-day goal",
        action: { label: "Improve placement", href: "/dashboard/widget" }
      };
}

export function buildHealth(
  totalConversations: number,
  currentVolume: number,
  previousVolume: number,
  avgResponseSeconds: number | null,
  loginsLast7Days: number,
  lastLoginAt: string | null
): DashboardHomeGrowthData["health"] {
  const volumeScore = scoreConversationVolume(currentVolume, previousVolume, totalConversations);
  const responseScore = scoreResponseTime(avgResponseSeconds);
  const loginScore = scoreLoginFrequency(loginsLast7Days, lastLoginAt);
  const score = Math.round(volumeScore * 0.4 + responseScore * 0.35 + loginScore * 0.25);
  const weakest = Math.min(volumeScore, responseScore, loginScore);

  return {
    status: score >= 80 ? "strong" : score >= 60 ? "watch" : "at-risk",
    tone: toneForScore(score),
    score,
    badge: score >= 80 ? "Healthy" : score >= 60 ? "Watchlist" : "Intervene now",
    title: "Customer health score",
    description:
      totalConversations === 0
        ? "Health will stabilize once you have a few real conversations to benchmark."
        : weakest === volumeScore
          ? "Conversation volume is the biggest risk right now. Step in before the drop becomes a habit."
          : weakest === responseScore
            ? "Response time is dragging the score down. Faster first replies usually recover retention quickest."
            : "Team login frequency is trailing. Consistent check-ins keep inbox coverage from going stale.",
    action: {
      label: weakest === loginScore ? "Review team coverage" : weakest === responseScore ? "Open inbox" : "Open analytics",
      href: weakest === loginScore ? "/dashboard/team" : weakest === responseScore ? "/dashboard/inbox" : "/dashboard/analytics"
    },
    metrics: [
      {
        label: "Conversation volume",
        value: `${currentVolume} this week`,
        detail: formatVolumeDetail(currentVolume, previousVolume),
        tone: volumeScore >= 80 ? "positive" : volumeScore >= 60 ? "neutral" : "warning"
      },
      {
        label: "Response time",
        value: formatResponseTime(avgResponseSeconds),
        detail: avgResponseSeconds == null ? "We need a few replied conversations first" : "Average first reply",
        tone: responseScore >= 80 ? "positive" : responseScore >= 60 ? "neutral" : "warning"
      },
      {
        label: "Login frequency",
        value: `${loginsLast7Days} this week`,
        detail: relativeDayLabel(lastLoginAt),
        tone: loginScore >= 80 ? "positive" : loginScore >= 60 ? "neutral" : "warning"
      }
    ]
  };
}
