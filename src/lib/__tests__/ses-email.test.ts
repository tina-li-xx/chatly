const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  getSesClientConfig: vi.fn(() => ({
    region: "eu-west-2",
    credentials: {
      accessKeyId: "test-access-key",
      secretAccessKey: "test-secret-key"
    }
  }))
}));

vi.mock("@aws-sdk/client-ses", () => {
  class SendRawEmailCommand {
    input: unknown;

    constructor(input: unknown) {
      this.input = input;
    }
  }

  class SESClient {
    send = mocks.send;
  }

  return {
    SESClient,
    SendRawEmailCommand
  };
});

vi.mock("@/lib/env.server", () => ({
  getSesClientConfig: mocks.getSesClientConfig
}));

describe("ses email", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.send.mockReset();
    mocks.send.mockResolvedValue({ MessageId: "msg_123" });
  });

  it("preserves the display name in the from header for non-attachment emails", async () => {
    const { sendSesEmail } = await import("@/lib/ses-email");

    await sendSesEmail({
      to: "tina@usechatting.com",
      from: "Chatting <hello@usechatting.com>",
      subject: "Preview subject",
      bodyText: "Plain text body",
      bodyHtml: "<p>HTML body</p>"
    });

    expect(mocks.send).toHaveBeenCalledTimes(1);
    const command = mocks.send.mock.calls[0][0] as {
      input: {
        Source: string;
        RawMessage: {
          Data: Buffer;
        };
      };
    };
    const rawMessage = command.input.RawMessage.Data.toString("utf8");

    expect(command.input.Source).toBe("hello@usechatting.com");
    expect(rawMessage).toContain("From: Chatting <hello@usechatting.com>");
    expect(rawMessage).toContain("To: tina@usechatting.com");
    expect(rawMessage).toContain("Content-Type: multipart/alternative");
  });
});
