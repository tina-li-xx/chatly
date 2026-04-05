import type {
  DashboardAutomationPagePrompt,
  DashboardAutomationSettings
} from "@/lib/data/settings-types";

export type WidgetProactivePrompt = {
  id: string;
  pagePath: string;
  message: string;
  delaySeconds: DashboardAutomationPagePrompt["delaySeconds"];
  autoOpenWidget: boolean;
};

function normalizeWidgetPathname(value: string | null | undefined) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "/";
  }

  try {
    const parsed = new URL(raw);
    return parsed.pathname || "/";
  } catch {
    return raw.startsWith("/") ? raw : `/${raw}`;
  }
}

function escapePatternSegment(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matchesWidgetProactivePagePath(pattern: string, pageUrl: string | null | undefined) {
  const normalizedPattern = pattern.trim();
  if (!normalizedPattern.startsWith("/")) {
    return false;
  }

  const pathname = normalizeWidgetPathname(pageUrl);
  const expression = `^${normalizedPattern.split("*").map(escapePatternSegment).join(".*")}$`;

  return new RegExp(expression).test(pathname);
}

export function getWidgetProactivePrompt(input: {
  automation: DashboardAutomationSettings;
  pageUrl: string | null | undefined;
}): WidgetProactivePrompt | null {
  for (const prompt of input.automation.proactive.pagePrompts) {
    if (!prompt.pagePath.trim() || !prompt.message.trim()) {
      continue;
    }

    if (!matchesWidgetProactivePagePath(prompt.pagePath, input.pageUrl)) {
      continue;
    }

    return {
      id: prompt.id,
      pagePath: prompt.pagePath,
      message: prompt.message,
      delaySeconds: prompt.delaySeconds,
      autoOpenWidget: prompt.autoOpenWidget
    };
  }

  return null;
}
