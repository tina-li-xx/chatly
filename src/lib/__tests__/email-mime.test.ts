import { buildMimeMessage } from "@/lib/email-mime";

describe("email mime", () => {
  it("encodes the html alternative part as base64", () => {
    const bodyHtml =
      "<div><table><tr><td>" + "A".repeat(1400) + "</td></tr></table></div>";
    const raw = buildMimeMessage({
      to: "tina@usechatting.com",
      from: "Chatting <hello@usechatting.com>",
      subject: "Monthly cap",
      bodyText: "Plain body",
      bodyHtml
    });

    expect(raw).toContain("Content-Type: text/html; charset=utf-8");
    expect(raw).toContain("Content-Transfer-Encoding: base64");
    expect(raw).not.toContain(bodyHtml);
    const encodedHtml = raw.match(
      /Content-Type: text\/html; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n([\s\S]*?)\r\n--=_alt_/
    )?.[1];

    expect(encodedHtml).toBeTruthy();
    expect(Buffer.from(encodedHtml?.replace(/\r\n/g, "") ?? "", "base64").toString("utf8")).toBe(
      bodyHtml
    );
  });
});
