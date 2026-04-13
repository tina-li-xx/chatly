import { friendlyErrorMessage } from "./formatting";

export function mapThreadError(value: string) {
  switch (value) {
    case "attachment-limit":
      return "You can attach up to three images per reply.";
    case "attachment-too-large":
      return "That image is too large. Keep each file under 4 MB.";
    case "camera-permission":
      return "Camera access is needed before you can attach a photo.";
    case "photo-permission":
      return "Photo library access is needed before you can attach images.";
    default:
      return friendlyErrorMessage(value);
  }
}
