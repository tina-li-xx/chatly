export type ResponseTimeIndustry = "ecommerce" | "saas" | "services" | "agency";

export type ResponseTimeResult = {
  grade: "A" | "B" | "C" | "D";
  summary: string;
  averageBenchmark: number;
  topPerformerBenchmark: number;
  responseTimeMinutes: number;
  teamSize: number;
  tips: string[];
};

const benchmarks: Record<ResponseTimeIndustry, { average: number; top: number }> = {
  ecommerce: { average: 12, top: 3 },
  saas: { average: 18, top: 5 },
  services: { average: 25, top: 8 },
  agency: { average: 30, top: 10 }
};

export function calculateResponseTimeGrade(
  industry: ResponseTimeIndustry,
  responseTimeMinutes: number,
  teamSize: number
): ResponseTimeResult {
  const benchmark = benchmarks[industry];
  const ratio = responseTimeMinutes / benchmark.average;
  const grade = ratio <= 0.4 ? "A" : ratio <= 0.8 ? "B" : ratio <= 1.2 ? "C" : "D";
  const summary =
    grade === "A" ? "Top-tier" : grade === "B" ? "Above average" : grade === "C" ? "Needs tightening" : "Too slow";
  const tips = [
    "Create saved replies for pricing, setup, and feature questions.",
    "Turn on browser notifications so new chats never sit unseen.",
    "Assign explicit chat coverage blocks instead of leaving everyone half-watching."
  ];

  if (grade === "A") {
    tips[0] = "Keep your best-performing replies saved so speed stays consistent across the team.";
  }

  if (teamSize <= 2) {
    tips[2] = "Block dedicated chat windows into the day so a tiny team still replies quickly.";
  }

  return {
    grade,
    summary,
    averageBenchmark: benchmark.average,
    topPerformerBenchmark: benchmark.top,
    responseTimeMinutes,
    teamSize,
    tips
  };
}
