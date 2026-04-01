import {
  mapAttachment,
  mapMessage,
  mapSite,
  mapSummary
} from "@/lib/data/shared";

describe("data shared mappers", () => {
  it("maps site rows into widget settings objects", () => {
    const site = mapSite({
      id: "site_1",
      user_id: "user_1",
      name: "Main site",
      domain: "https://example.com",
      brand_color: "#2563EB",
      widget_title: "Talk to us",
      greeting_text: "Hi there",
      launcher_position: "left",
      avatar_style: "photos",
      team_photo_url: "https://cdn.example/team.png",
      show_online_status: true,
      require_email_offline: false,
      offline_title: "We're not online right now",
      offline_message: "Leave a message and we'll get back to you via email.",
      away_title: "We're away right now",
      away_message: "Leave a message and we'll get back to you via email.",
      sound_notifications: true,
      auto_open_paths: ["/pricing"],
      response_time_mode: "hours",
      operating_hours_enabled: true,
      operating_hours_timezone: "UTC",
      operating_hours_json: JSON.stringify({
        monday: { enabled: true, from: "09:00", to: "17:00" }
      }),
      widget_install_verified_at: "2026-03-29T10:00:00.000Z",
      widget_install_verified_url: "https://example.com",
      widget_last_seen_at: "2026-03-29T10:05:00.000Z",
      widget_last_seen_url: "https://example.com/pricing",
      created_at: "2026-03-29T10:00:00.000Z",
      conversation_count: "12"
    } as never);

    expect(site).toMatchObject({
      id: "site_1",
      userId: "user_1",
      launcherPosition: "left",
      avatarStyle: "photos",
      offlineTitle: "We're not online right now",
      awayTitle: "We're away right now",
      responseTimeMode: "hours",
      conversationCount: 12
    });
  });

  it("maps conversation summaries, attachments, and thread messages", () => {
    const summary = mapSummary({
      id: "conv_1",
      site_id: "site_1",
      site_name: "Main site",
      email: "alex@example.com",
      session_id: "session_1",
      status: "open",
      created_at: "2026-03-29T10:00:00.000Z",
      updated_at: "2026-03-29T10:01:00.000Z",
      page_url: "https://example.com/pricing",
      recorded_page_url: "https://example.com/pricing",
      referrer: null,
      user_agent: null,
      country: "UK",
      region: "London",
      city: "London",
      timezone: "Europe/London",
      locale: "en-GB",
      last_message_at: "2026-03-29T10:01:00.000Z",
      last_message_preview: "Hello",
      unread_count: "2",
      rating: "5",
      tags: ["pricing"]
    } as never);
    const attachment = mapAttachment({
      id: "att_1",
      file_name: "screenshot.png",
      content_type: "image/png",
      size_bytes: 42
    } as never, "https://cdn.example/screenshot.png");
    const message = mapMessage({
      id: "msg_1",
      conversation_id: "conv_1",
      sender: "user",
      content: "Hello",
      created_at: "2026-03-29T10:01:00.000Z"
    } as never, [attachment]);

    expect(summary).toMatchObject({
      id: "conv_1",
      unreadCount: 2,
      tags: ["pricing"],
      recordedPageUrl: "https://example.com/pricing"
    });
    expect(attachment).toEqual({
      id: "att_1",
      fileName: "screenshot.png",
      contentType: "image/png",
      sizeBytes: 42,
      url: "https://cdn.example/screenshot.png",
      isImage: true
    });
    expect(message).toEqual({
      id: "msg_1",
      conversationId: "conv_1",
      sender: "user",
      content: "Hello",
      createdAt: "2026-03-29T10:01:00.000Z",
      attachments: [attachment]
    });
  });
});
