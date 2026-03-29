type GrowthTone = "positive" | "warning" | "neutral";
type GrowthAction = { label: string; href: string };

export type DashboardHomeGrowthMetric = {
  label: string;
  value: string;
  detail: string;
  tone: GrowthTone;
};

export type DashboardHomeGrowthData = {
  activation: {
    status: "needs-install" | "countdown" | "stalled" | "activated-fast" | "activated-late";
    tone: GrowthTone;
    badge: string;
    title: string;
    description: string;
    helper: string;
    action: GrowthAction;
  };
  health: {
    status: "strong" | "watch" | "at-risk";
    tone: GrowthTone;
    score: number;
    badge: string;
    title: string;
    description: string;
    action: GrowthAction;
    metrics: DashboardHomeGrowthMetric[];
  };
  expansion: {
    title: string;
    description: string;
    prompts: Array<{
      id: "team" | "conversations" | "analytics";
      tone: GrowthTone;
      title: string;
      description: string;
      action: GrowthAction;
    }>;
  };
};
