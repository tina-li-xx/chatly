import { consumeSseMessages } from "../../../apps/mobile/src/live-sse";

describe("mobile live sse parser", () => {
  it("parses connected and dashboard events from a streamed buffer", () => {
    const result = consumeSseMessages(
      [
        'data: {"type":"connected"}',
        "",
        'data: {"type":"message.created","conversationId":"conv_1","sender":"user","createdAt":"2026-04-10T10:00:00.000Z"}',
        "",
        ""
      ].join("\n")
    );

    expect(result.messages).toEqual([
      { type: "connected" },
      {
        type: "message.created",
        conversationId: "conv_1",
        sender: "user",
        createdAt: "2026-04-10T10:00:00.000Z"
      }
    ]);
    expect(result.rest).toBe("");
  });

  it("ignores ping events and keeps incomplete chunks buffered", () => {
    const result = consumeSseMessages(
      [
        "event: ping",
        "data: {}",
        "",
        'data: {"type":"conversation.updated"',
        ""
      ].join("\n")
    );

    expect(result.messages).toEqual([]);
    expect(result.rest).toBe('data: {"type":"conversation.updated"\n');
  });
});
