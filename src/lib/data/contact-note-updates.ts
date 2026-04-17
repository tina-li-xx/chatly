import { randomUUID } from "node:crypto";
import type { ContactNote } from "@/lib/contact-types";
import { findAuthUserById } from "@/lib/repositories/auth-user-repository";
import { displayNameFromEmail } from "@/lib/user-display";

export async function resolveUpdatedContactNotes(input: {
  userId: string;
  workspaceRole: string;
  notes: ContactNote[];
  note?: { id?: string | null; body: string } | null;
  deleteNoteId?: string | null;
}) {
  let notes = [...input.notes];

  if (input.note?.body?.trim()) {
    const existingNote = input.note.id ? notes.find((note) => note.id === input.note?.id) : null;
    const canEdit =
      !existingNote ||
      input.workspaceRole !== "member" ||
      existingNote.authorUserId === input.userId;
    if (!canEdit) {
      throw new Error("CONTACT_NOTE_FORBIDDEN");
    }

    const now = new Date().toISOString();
    if (existingNote) {
      notes = notes.map((note) =>
        note.id === existingNote.id
          ? { ...note, body: input.note?.body.trim() || note.body, updatedAt: now }
          : note
      );
    } else {
      const authorEmail = (await findAuthUserById(input.userId))?.email ?? "";

      notes.unshift({
        id: randomUUID(),
        body: input.note.body.trim(),
        authorUserId: input.userId,
        authorName: displayNameFromEmail(authorEmail),
        createdAt: now,
        updatedAt: now
      });
    }
  }

  if (input.deleteNoteId) {
    const note = notes.find((entry) => entry.id === input.deleteNoteId);
    if (note && input.workspaceRole === "member" && note.authorUserId !== input.userId) {
      throw new Error("CONTACT_NOTE_FORBIDDEN");
    }
    notes = notes.filter((note) => note.id !== input.deleteNoteId);
  }

  return notes;
}
