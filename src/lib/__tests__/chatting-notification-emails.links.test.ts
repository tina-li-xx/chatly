import { renderNewMessageNotificationEmail } from "@/lib/chatting-notification-emails";

describe("chatting notification email page links", () => {
  it("hides hosted conversation URLs when the inbox CTA already covers the thread", () => {
    const message = renderNewMessageNotificationEmail({
      visitorName: "tina@letterflow.so",
      visitorEmail: "tina@letterflow.so",
      currentPage:
        "http://localhost:3983/conversation/eyJzaXRlSWQiOiIzOThiNDNiYi1kYzU0LTQwM2MtYmVkZC01ZjM4N2JhMDcwOTIiLCJzZXNzaW9uSWQiOiIyZjU0NmRjMy05ZmRkLTQyOTQtOTNjMi04ZDY2MjA0ZTk3ZGYiLCJjb252ZXJzYXRpb25JZCI6ImJkZjBkMmY3LTRhZDUtNDU1OC1iNWQ2LTk0YjgzNzM3NzkxNSIsInYiOjF9.Y0XIcKzme2f97g05VIL_KTeEdKbK1sb6i3CTrGynwsc",
      messagePreview: "ok",
      replyNowUrl: "https://chatting.example/dashboard?id=conv_1",
      inboxUrl: "https://chatting.example/dashboard?id=conv_1"
    });

    expect(message.bodyHtml).toContain("tina@letterflow.so");
    expect(message.bodyHtml).not.toContain("Hosted conversation");
    expect(message.bodyHtml).not.toContain("Current page:");
    expect(message.bodyHtml).not.toContain("localhost:3983/conversation/");
    expect(message.bodyText).not.toContain("Current page:");
    expect(message.bodyText).not.toContain("localhost:3983/conversation/");
  });

  it("leaves non-http page values as escaped plain text", () => {
    const message = renderNewMessageNotificationEmail({
      visitorName: "Alex",
      visitorEmail: "alex@example.com",
      currentPage: "/pricing",
      messagePreview: "hello",
      replyNowUrl: "https://chatting.example/dashboard?id=conv_1",
      inboxUrl: "https://chatting.example/dashboard?id=conv_1"
    });

    expect(message.bodyHtml).toContain("alex@example.com");
    expect(message.bodyHtml).toContain("/pricing");
    expect(message.bodyHtml).not.toContain('href="/pricing"');
  });
});
