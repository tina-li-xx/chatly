import { useState } from "react";
import { captureReplyImage, pickReplyImages } from "./attachment-picker";
import type { ReplyAttachmentDraft } from "./types";

export function useReplyAttachments() {
  const [attachments, setAttachments] = useState<ReplyAttachmentDraft[]>([]);

  async function addFromCamera() {
    const nextAttachments = await captureReplyImage(attachments.length);
    setAttachments((current) => [...current, ...nextAttachments]);
  }

  async function addFromLibrary() {
    const nextAttachments = await pickReplyImages(attachments.length);
    setAttachments((current) => [...current, ...nextAttachments]);
  }

  function clearAttachments() {
    setAttachments([]);
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
  }

  return {
    addFromCamera,
    addFromLibrary,
    attachments,
    clearAttachments,
    removeAttachment,
  };
}
