import { palette } from "./shared.mjs";

export const outputs = [
  { key: "6.9-inch", width: 1320, height: 2868, deviceWidthRatio: 0.75, bottomInset: 96 },
  { key: "6.5-display", width: 1284, height: 2778, deviceWidthRatio: 0.74, bottomInset: 92 },
  { key: "5.5-inch", width: 1242, height: 2208, deviceWidthRatio: 0.63, bottomInset: 72 }
];

export const inboxRows = [
  { initials: "JM", name: "James Mitchell", preview: "Quick question about pricing...", meta: "/pricing · London", time: "2m", unread: true, bg: palette.blueLight, fg: palette.blueDark },
  { initials: "SC", name: "Sarah Chen", preview: "Is there a free trial?", meta: "/features · NYC", time: "8m", bg: palette.emerald50, fg: palette.greenDark },
  { initials: "MJ", name: "Mike Johnson", preview: "Thanks for the help!", meta: "/docs · Berlin", time: "24m", bg: palette.yellow50, fg: palette.yellow700 },
  { initials: "EW", name: "Emma Wilson", preview: "Do you integrate with...", meta: "/pricing · Toronto", time: "1h", bg: palette.pink50, fg: palette.pink700 }
];

export const teammateRows = {
  online: [
    { initials: "MC", name: "Mike Chen", email: "mike@company.com" },
    { initials: "LP", name: "Lisa Park", email: "lisa@company.com" }
  ],
  away: [{ initials: "TW", name: "Tom Wilson", email: "tom@company.com" }]
};

export const screenshots = [
  {
    id: "01",
    slug: "inbox",
    filename: "chatting-ios-screenshot-01-inbox.png",
    headline: ["Never miss", "a message"],
    bgStart: palette.blue,
    bgEnd: palette.blueDark,
    renderKey: "inbox"
  },
  {
    id: "02",
    slug: "chat",
    filename: "chatting-ios-screenshot-02-chat.png",
    headline: ["Reply in", "real-time"],
    bgStart: palette.blue,
    bgEnd: palette.blueDark,
    renderKey: "chat"
  },
  {
    id: "03",
    slug: "notification",
    filename: "chatting-ios-screenshot-03-notification.png",
    headline: ["Get notified", "instantly"],
    bgStart: palette.green,
    bgEnd: palette.greenDark,
    renderKey: "notification"
  },
  {
    id: "04",
    slug: "assign",
    filename: "chatting-ios-screenshot-04-assign.png",
    headline: ["Assign to", "your team"],
    bgStart: palette.purple,
    bgEnd: palette.purpleDark,
    renderKey: "assign"
  },
  {
    id: "05",
    slug: "settings",
    filename: "chatting-ios-screenshot-05-settings.png",
    headline: ["Go online", "anywhere"],
    bgStart: palette.amber,
    bgEnd: palette.amberDark,
    renderKey: "settings"
  }
];
