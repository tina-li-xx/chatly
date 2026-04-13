import * as ImagePicker from "expo-image-picker";
import type { ReplyAttachmentDraft } from "./types";

const MAX_REPLY_ATTACHMENTS = 3;
const MAX_ATTACHMENT_SIZE_BYTES = 4 * 1024 * 1024;

export async function pickReplyImages(existingCount: number) {
  return pickImages(existingCount, "library");
}

export async function captureReplyImage(existingCount: number) {
  return pickImages(existingCount, "camera");
}

async function pickImages(existingCount: number, source: "camera" | "library") {
  const remaining = MAX_REPLY_ATTACHMENTS - existingCount;
  if (remaining <= 0) {
    throw new Error("attachment-limit");
  }

  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error(source === "camera" ? "camera-permission" : "photo-permission");
  }

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.85
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsMultipleSelection: true,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.85,
          selectionLimit: remaining
        });

  if (result.canceled) {
    return [];
  }

  const drafts = result.assets.slice(0, remaining).map((asset, index) => {
    if (typeof asset.fileSize === "number" && asset.fileSize > MAX_ATTACHMENT_SIZE_BYTES) {
      throw new Error("attachment-too-large");
    }

    return {
      id: `attachment_${Date.now().toString(36)}_${index}`,
      uri: asset.uri,
      previewUri: asset.uri,
      fileName: asset.fileName?.trim() || `image-${Date.now().toString(36)}.jpg`,
      contentType: asset.mimeType?.trim() || "image/jpeg",
      sizeBytes: typeof asset.fileSize === "number" ? asset.fileSize : null
    } satisfies ReplyAttachmentDraft;
  });

  return drafts;
}
