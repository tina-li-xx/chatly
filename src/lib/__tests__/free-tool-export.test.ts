const mocks = vi.hoisted(() => ({
  insertToolExportRequestRecord: vi.fn(),
  markToolExportRequestSent: vi.fn(),
  sendFreeToolExportEmail: vi.fn()
}));

vi.mock("@/lib/repositories/free-tool-export-repository", () => ({
  insertToolExportRequestRecord: mocks.insertToolExportRequestRecord,
  markToolExportRequestSent: mocks.markToolExportRequestSent
}));

vi.mock("@/lib/free-tool-export-email", () => ({
  isSupportedFreeToolExportSlug: (slug: string) =>
    [
      "live-chat-roi-calculator",
      "response-time-calculator",
      "welcome-message-generator",
      "response-tone-checker"
    ].includes(slug),
  sendFreeToolExportEmail: mocks.sendFreeToolExportEmail
}));

import { requestFreeToolExport } from "@/lib/data/free-tool-export";

describe("free tool exports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists, sends, and marks a tool export", async () => {
    mocks.insertToolExportRequestRecord.mockResolvedValueOnce({ id: "export_1" });

    const result = await requestFreeToolExport({
      email: "Hello@Example.com ",
      toolSlug: "live-chat-roi-calculator",
      source: "free-tools-live-chat-roi",
      resultPayload: { result: { annualRevenueLift: 51000 } }
    });

    expect(result).toEqual({ ok: true });
    expect(mocks.insertToolExportRequestRecord).toHaveBeenCalledWith(expect.objectContaining({ email: "hello@example.com" }));
    expect(mocks.sendFreeToolExportEmail).toHaveBeenCalledWith(expect.objectContaining({ email: "hello@example.com" }));
    expect(mocks.markToolExportRequestSent).toHaveBeenCalledWith("export_1");
  });

  it("rejects invalid emails before persistence", async () => {
    await expect(
      requestFreeToolExport({ email: "bad-email", toolSlug: "live-chat-roi-calculator", source: "free-tools", resultPayload: {} })
    ).rejects.toThrow("INVALID_EMAIL");

    expect(mocks.insertToolExportRequestRecord).not.toHaveBeenCalled();
  });

  it("rejects unsupported tools before persistence", async () => {
    await expect(
      requestFreeToolExport({ email: "hello@example.com", toolSlug: "response-template-library", source: "free-tools", resultPayload: {} })
    ).rejects.toThrow("UNSUPPORTED_TOOL_EXPORT");

    expect(mocks.insertToolExportRequestRecord).not.toHaveBeenCalled();
  });

  it("maps delivery failures to a stable export error", async () => {
    mocks.insertToolExportRequestRecord.mockResolvedValueOnce({ id: "export_2" });
    mocks.sendFreeToolExportEmail.mockRejectedValueOnce(new Error("boom"));

    await expect(
      requestFreeToolExport({ email: "hello@example.com", toolSlug: "response-time-calculator", source: "free-tools", resultPayload: {} })
    ).rejects.toThrow("FREE_TOOL_EXPORT_DELIVERY_FAILED");
  });
});
