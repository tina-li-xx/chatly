export type WeeklyPerformanceMetric = {
  label: string;
  value: string;
  trendLabel: string;
  trendTone: "positive" | "negative" | "neutral";
  trendDirection: "up" | "down" | "flat" | "none";
};

export type WeeklyPerformanceHeatmapCell = {
  count: number;
  intensity: "empty" | "low" | "medium" | "high" | "peak";
};

export type WeeklyPerformanceHeatmapRow = {
  label: string;
  cells: WeeklyPerformanceHeatmapCell[];
};

export type WeeklyPerformanceTopPage = {
  label: string;
  count: number;
  widthPercent: number;
};

export type WeeklyPerformanceTip = {
  text: string;
  href: string;
  label: string;
};

export type WeeklyPerformanceTeamPerformance = {
  userId: string;
  name: string;
  initials: string;
  conversationsLabel: string;
  avgResponseLabel: string;
  resolutionLabel: string;
  satisfactionLabel: string | null;
  conversationCount: number;
};

export type WeeklyPerformancePersonalPerformance = {
  userId: string;
  name: string;
  conversationsLabel: string;
  avgResponseLabel: string;
  resolutionLabel: string;
  satisfactionLabel: string | null;
  teamAverageLabel: string;
};

export type WeeklyPerformanceSnapshot = {
  teamName: string;
  dateRange: string;
  previewText: string;
  reportUrl: string;
  settingsUrl: string;
  widgetUrl: string;
  quietWeek: boolean;
  metrics: WeeklyPerformanceMetric[];
  heatmapHours: string[];
  heatmapRows: WeeklyPerformanceHeatmapRow[];
  peakLabel: string | null;
  topPages: WeeklyPerformanceTopPage[];
  insight: string | null;
  tip: WeeklyPerformanceTip;
  teamPerformance: WeeklyPerformanceTeamPerformance[];
  personalPerformanceByUserId: Record<string, WeeklyPerformancePersonalPerformance>;
};

export type WeeklyPerformanceEmailInput = WeeklyPerformanceSnapshot & {
  recipientUserId: string;
  personalPerformance: WeeklyPerformancePersonalPerformance | null;
};
