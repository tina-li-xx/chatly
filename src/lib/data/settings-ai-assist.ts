export type DashboardAiAssistSettings = {
  replySuggestionsEnabled: boolean;
  conversationSummariesEnabled: boolean;
  rewriteAssistanceEnabled: boolean;
  suggestedTagsEnabled: boolean;
};

export type DashboardAiAssistSettingKey = keyof DashboardAiAssistSettings;

const DEFAULT_DASHBOARD_AI_ASSIST_SETTINGS: DashboardAiAssistSettings = {
  replySuggestionsEnabled: true,
  conversationSummariesEnabled: true,
  rewriteAssistanceEnabled: true,
  suggestedTagsEnabled: true
};

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function createDefaultDashboardAiAssistSettings(): DashboardAiAssistSettings {
  return { ...DEFAULT_DASHBOARD_AI_ASSIST_SETTINGS };
}

export function normalizeDashboardAiAssistSettings(
  value: Partial<DashboardAiAssistSettings> | null | undefined
): DashboardAiAssistSettings {
  const input = value ?? {};

  return {
    replySuggestionsEnabled: readBoolean(
      input.replySuggestionsEnabled,
      DEFAULT_DASHBOARD_AI_ASSIST_SETTINGS.replySuggestionsEnabled
    ),
    conversationSummariesEnabled: readBoolean(
      input.conversationSummariesEnabled,
      DEFAULT_DASHBOARD_AI_ASSIST_SETTINGS.conversationSummariesEnabled
    ),
    rewriteAssistanceEnabled: readBoolean(
      input.rewriteAssistanceEnabled,
      DEFAULT_DASHBOARD_AI_ASSIST_SETTINGS.rewriteAssistanceEnabled
    ),
    suggestedTagsEnabled: readBoolean(
      input.suggestedTagsEnabled,
      DEFAULT_DASHBOARD_AI_ASSIST_SETTINGS.suggestedTagsEnabled
    )
  };
}

export function parseDashboardAiAssistSettings(
  value: string | null | undefined
): DashboardAiAssistSettings {
  if (!value) {
    return createDefaultDashboardAiAssistSettings();
  }

  try {
    return normalizeDashboardAiAssistSettings(
      JSON.parse(value) as Partial<DashboardAiAssistSettings>
    );
  } catch {
    return createDefaultDashboardAiAssistSettings();
  }
}

export function serializeDashboardAiAssistSettings(
  value: Partial<DashboardAiAssistSettings> | null | undefined
) {
  return JSON.stringify(normalizeDashboardAiAssistSettings(value));
}
