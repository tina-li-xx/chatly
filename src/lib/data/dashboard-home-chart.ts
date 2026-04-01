export type DashboardHomeRangeDays = 7 | 30 | 90;

export type DashboardHomeChartRow = {
  dayKey: string;
  dayLabel: string;
  count: string;
};

export type DashboardHomeChartPoint = {
  label: string;
  count: number;
};

export type DashboardHomeChart = {
  rangeDays: DashboardHomeRangeDays;
  total: number;
  totalLabel: string;
  comparisonLabel: string;
  changePercent: number | null;
  points: DashboardHomeChartPoint[];
};

export const DASHBOARD_HOME_RANGE_OPTIONS: Array<{
  value: DashboardHomeRangeDays;
  label: string;
}> = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" }
];

const RANGE_BUCKET_SIZE: Record<DashboardHomeRangeDays, number> = {
  7: 1,
  30: 5,
  90: 15
};

export function calculatePercentChange(current: number | null, previous: number | null) {
  if (current == null || previous == null || previous === 0) {
    return null;
  }

  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

function formatShortDate(dayKey: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${dayKey}T00:00:00.000Z`));
}

function pointLabel(rows: DashboardHomeChartRow[]) {
  if (rows.length === 0) {
    return "";
  }

  return rows.length === 1 ? rows[0].dayLabel.trim() : formatShortDate(rows[0].dayKey);
}

function buildPoints(rows: DashboardHomeChartRow[], rangeDays: DashboardHomeRangeDays) {
  const size = RANGE_BUCKET_SIZE[rangeDays];
  const points: DashboardHomeChartPoint[] = [];

  for (let index = 0; index < rows.length; index += size) {
    const slice = rows.slice(index, index + size);
    points.push({
      label: pointLabel(slice),
      count: slice.reduce((total, row) => total + Number(row.count), 0)
    });
  }

  return points;
}

export function resolveDashboardHomeRange(
  value: string | string[] | null | undefined
): DashboardHomeRangeDays {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate === "30") {
    return 30;
  }

  if (candidate === "90") {
    return 90;
  }

  return 7;
}

export function buildDashboardHomeChart(
  rows: DashboardHomeChartRow[],
  previousTotal: number,
  rangeDays: DashboardHomeRangeDays
): DashboardHomeChart {
  const total = rows.reduce((sum, row) => sum + Number(row.count), 0);

  return {
    rangeDays,
    total,
    totalLabel: `Total last ${rangeDays} days`,
    comparisonLabel: `vs previous ${rangeDays} days`,
    changePercent: calculatePercentChange(total, previousTotal),
    points: buildPoints(rows, rangeDays)
  };
}
