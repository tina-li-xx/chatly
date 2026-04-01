import { mapAttachment, mapMessage, mapSite, mapSummary } from "@/lib/data/shared";

describe("data shared edge cases", () => {
  it("falls back to default site widget settings when stored values are missing", () => {
    const site = mapSite({
      id: "site_1",
      user_id: "user_1",
      name: "Main site",
      domain: null,
      brand_color: "#bad",
      widget_title: null,
      greeting_text: null,
      launcher_position: null,
      avatar_style: null,
      team_photo_url: "",
      show_online_status: null,
      require_email_offline: null,
      offline_title: "",
      offline_message: "",
      away_title: "",
      away_message: "",
      sound_notifications: null,
      auto_open_paths: null,
      response_time_mode: null,
      operating_hours_enabled: null,
      operating_hours_timezone: "",
      operating_hours_json: null,
      widget_install_verified_at: null,
      widget_install_verified_url: "",
      widget_last_seen_at: null,
      widget_last_seen_url: "",
      created_at: "2026-03-29T10:00:00.000Z",
      conversation_count: "0"
    } as never);

    expect(site).toMatchObject({
      widgetTitle: null,
      greetingText: null,
      launcherPosition: "right",
      avatarStyle: "initials",
      offlineTitle: "We're not online right now",
      offlineMessage: "Leave a message and we'll get back to you via email.",
      awayTitle: "We're away right now",
      awayMessage: "Leave a message and we'll get back to you via email.",
      showOnlineStatus: true,
      requireEmailOffline: false,
      soundNotifications: false,
      autoOpenPaths: []
    });
  });

  it("maps summaries, attachments, and messages through their fallback paths", () => {
    const summary = mapSummary({
      id: "conv_1",
      site_id: "site_1",
      site_name: "Main site",
      email: null,
      session_id: "session_1",
      status: "open",
      created_at: "2026-03-29T10:00:00.000Z",
      updated_at: "2026-03-29T10:01:00.000Z",
      page_url: null,
      recorded_page_url: null,
      referrer: null,
      user_agent: null,
      country: null,
      region: null,
      city: null,
      timezone: null,
      locale: null,
      last_message_at: null,
      last_message_preview: null,
      unread_count: null,
      rating: "not-a-rating",
      tags: null
    } as never);
    const attachment = mapAttachment({
      id: "att_1",
      file_name: "notes.pdf",
      content_type: "application/pdf",
      size_bytes: 42
    } as never, "https://cdn.example/notes.pdf");
    const message = mapMessage({
      id: "msg_1",
      conversation_id: "conv_1",
      sender: "user",
      content: "",
      created_at: "2026-03-29T10:01:00.000Z"
    } as never);

    expect(summary).toMatchObject({ unreadCount: 0, rating: null, tags: [] });
    expect(attachment.isImage).toBe(false);
    expect(message.attachments).toEqual([]);
  });
});
