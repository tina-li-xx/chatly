import type { MobileNotificationSound } from "./types";

export const notificationSoundOptions: Array<{
  description: string;
  label: string;
  value: MobileNotificationSound;
}> = [
  { value: "none", label: "None", description: "Mute push notification sounds" },
  { value: "chime", label: "Chime", description: "Soft default chat sound" },
  { value: "ding", label: "Ding", description: "Short bright alert" },
  { value: "pop", label: "Pop", description: "Friendly lightweight pop" },
  { value: "swoosh", label: "Swoosh", description: "Fast subtle swoosh" },
  { value: "default", label: "Default", description: "Use the system default sound" }
];

export function notificationSoundLabel(value: MobileNotificationSound) {
  return notificationSoundOptions.find((option) => option.value === value)?.label ?? "Default";
}
