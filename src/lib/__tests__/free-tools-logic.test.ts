import { parseResponseToneAnalysis, validateResponseToneMessage } from "@/lib/response-tone-checker";
import { calculateResponseTimeGrade } from "@/lib/response-time-tool";
import { generateWelcomeMessage, generateWelcomeMessageVariants } from "@/lib/welcome-message-generator";

describe("free tool logic", () => {
  it("grades strong response times highly", () => {
    const result = calculateResponseTimeGrade("ecommerce", 5, 2);
    expect(result.grade).toBe("B");
    expect(result.averageBenchmark).toBe(12);
  });

  it("generates a welcome message from scenario and tone", () => {
    expect(generateWelcomeMessage("pricing", "friendly")).toContain("Hey there");
  });

  it("returns multiple welcome message variations", () => {
    const variants = generateWelcomeMessageVariants("pricing", "friendly", 1);
    expect(variants).toHaveLength(3);
    expect(new Set(variants.map((variant) => variant.message)).size).toBe(3);
  });

  it("parses a structured tone-analysis response", () => {
    const result = parseResponseToneAnalysis(`{
      "overall_score": 8,
      "overall_label": "Good",
      "dimensions": {
        "friendliness": { "score": 8, "note": "Warm." },
        "professionalism": { "score": 7, "note": "Clear." },
        "empathy": { "score": 6, "note": "Could go further." },
        "clarity": { "score": 9, "note": "Very clear." },
        "helpfulness": { "score": 8, "note": "Actionable." }
      },
      "issues": [{ "text": "Unfortunately", "issue": "Negative framing", "suggestion": "Here is what I can do" }],
      "strengths": ["Clear next steps"],
      "rewritten": "Hi there! Here's what I can do."
    }`);

    expect(result.overall_score).toBe(8);
    expect(result.dimensions.empathy.score).toBe(6);
    expect(result.issues).toHaveLength(1);
    expect(result.rewritten).toContain("Here's what I can do");
  });

  it("validates message length boundaries", () => {
    expect(validateResponseToneMessage("short")).toBe("MESSAGE_TOO_SHORT");
    expect(validateResponseToneMessage("This is long enough to analyze.")).toBeNull();
  });
});
