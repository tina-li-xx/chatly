export type ResponseToneContext = "general" | "greeting" | "apology" | "closing";
export type ResponseToneLabel = "Excellent" | "Good" | "Needs Work" | "Poor";
export type ResponseToneDimensionKey = "friendliness" | "professionalism" | "empathy" | "clarity" | "helpfulness";
export type ResponseToneDimension = { score: number; note: string };
export type ResponseToneIssue = { text: string; issue: string; suggestion: string };
export type ResponseToneAnalysis = {
  overall_score: number;
  overall_label: ResponseToneLabel;
  dimensions: Record<ResponseToneDimensionKey, ResponseToneDimension>;
  issues: ResponseToneIssue[];
  strengths: string[];
  rewritten: string;
};

export const responseToneContexts: Array<{ value: ResponseToneContext; label: string }> = [
  { value: "general", label: "General" },
  { value: "greeting", label: "Greeting" },
  { value: "apology", label: "Apology" },
  { value: "closing", label: "Closing" }
];

const toneLabels: ResponseToneLabel[] = ["Excellent", "Good", "Needs Work", "Poor"];
const toneDimensions: ResponseToneDimensionKey[] = ["friendliness", "professionalism", "empathy", "clarity", "helpfulness"];

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function clampScore(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? Math.min(10, Math.max(1, Math.round(numeric))) : 1;
}

function labelFromScore(score: number): ResponseToneLabel {
  return score >= 9 ? "Excellent" : score >= 7 ? "Good" : score >= 5 ? "Needs Work" : "Poor";
}

function extractJson(raw: string) {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/```\s*([\s\S]*?)```/i);
  return (fenced?.[1] || raw).trim();
}

export function normalizeResponseToneContext(value: string): ResponseToneContext {
  return responseToneContexts.some((context) => context.value === value) ? (value as ResponseToneContext) : "general";
}

export function validateResponseToneMessage(message: string) {
  const trimmed = message.trim();
  if (!trimmed) {
    return "MISSING_MESSAGE";
  }

  if (trimmed.length < 10) {
    return "MESSAGE_TOO_SHORT";
  }

  if (trimmed.length > 2000) {
    return "MESSAGE_TOO_LONG";
  }

  return null;
}

export function parseResponseToneAnalysis(raw: string): ResponseToneAnalysis {
  const parsed = JSON.parse(extractJson(raw)) as Record<string, unknown>;
  const dimensionsSource = asRecord(parsed.dimensions);
  const overallScore = clampScore(parsed.overall_score);
  const overallLabel = toneLabels.includes(parsed.overall_label as ResponseToneLabel)
    ? (parsed.overall_label as ResponseToneLabel)
    : labelFromScore(overallScore);

  const dimensions = Object.fromEntries(
    toneDimensions.map((key) => {
      const item = asRecord(dimensionsSource[key]);
      return [key, { score: clampScore(item.score), note: asString(item.note) || "No note returned." }];
    })
  ) as Record<ResponseToneDimensionKey, ResponseToneDimension>;

  const issues = (Array.isArray(parsed.issues) ? parsed.issues : [])
    .map((item) => {
      const source = asRecord(item);
      return {
        text: asString(source.text),
        issue: asString(source.issue),
        suggestion: asString(source.suggestion)
      };
    })
    .filter((item) => item.text && item.issue && item.suggestion);

  const strengths = (Array.isArray(parsed.strengths) ? parsed.strengths : [])
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .slice(0, 5);

  return {
    overall_score: overallScore,
    overall_label: overallLabel,
    dimensions,
    issues,
    strengths,
    rewritten: asString(parsed.rewritten)
  };
}
