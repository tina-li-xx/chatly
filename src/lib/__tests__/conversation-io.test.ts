import {
  extractUploadedAttachments,
  extractVisitorMetadata,
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE_BYTES
} from "@/lib/conversation-io";

describe("conversation io helpers", () => {
  it("extracts uploaded files and normalizes missing names or types", async () => {
    const formData = new FormData();
    formData.append("attachments", new File(["hello"], "notes.txt", { type: "text/plain" }));
    formData.append("attachments", new File(["a"], "", { type: "" }));

    const attachments = await extractUploadedAttachments(formData);

    expect(attachments).toHaveLength(2);
    expect(attachments[0]).toMatchObject({ fileName: "notes.txt", contentType: "text/plain", sizeBytes: 5 });
    expect(attachments[1]).toMatchObject({ fileName: "attachment", contentType: "application/octet-stream" });
  });

  it("rejects too many or too-large attachments", async () => {
    const tooMany = new FormData();
    for (let index = 0; index < MAX_ATTACHMENT_COUNT + 1; index += 1) {
      tooMany.append("attachments", new File(["a"], `file-${index}.txt`, { type: "text/plain" }));
    }

    const tooLarge = new FormData();
    tooLarge.append("attachments", new File([new Uint8Array(MAX_ATTACHMENT_SIZE_BYTES + 1)], "huge.bin"));

    await expect(extractUploadedAttachments(tooMany)).rejects.toThrow("ATTACHMENT_LIMIT");
    await expect(extractUploadedAttachments(tooLarge)).rejects.toThrow("ATTACHMENT_TOO_LARGE");
  });

  it("extracts visitor metadata from request headers and explicit overrides", () => {
    const request = new Request("https://chatting.test", {
      headers: {
        "user-agent": "Vitest",
        "x-vercel-ip-country": "GB",
        "x-vercel-ip-country-region": "England",
        "x-vercel-ip-city": "London",
        "x-vercel-ip-timezone": "Europe/London",
        "accept-language": "en-GB"
      }
    });

    expect(extractVisitorMetadata(request, { pageUrl: " /pricing ", referrer: " /home " })).toEqual({
      pageUrl: "/pricing",
      referrer: "/home",
      userAgent: "Vitest",
      country: "GB",
      region: "England",
      city: "London",
      timezone: "Europe/London",
      locale: "en-GB",
      visitorTags: [],
      customFields: {}
    });
  });

  it("normalizes visitor tags and custom fields from explicit overrides", () => {
    const request = new Request("https://chatting.test");

    expect(
      extractVisitorMetadata(request, {
        visitorTags: '["Enterprise", "vip", "enterprise"]',
        customFields: '{"Plan":"Growth"," seats ":" 3 "}'
      })
    ).toEqual({
      pageUrl: null,
      referrer: null,
      userAgent: null,
      country: null,
      region: null,
      city: null,
      timezone: null,
      locale: null,
      visitorTags: ["enterprise", "vip"],
      customFields: { plan: "Growth", seats: "3" }
    });
  });
});
