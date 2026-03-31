export type VisitorNoteDeeplink = {
  focusNote: boolean;
  mention: string | null;
  note: string | null;
};

function findMatchIndex(value: string, query: string) {
  return value.toLowerCase().indexOf(query.toLowerCase());
}

export function readVisitorNoteDeeplink(conversationId?: string | null): VisitorNoteDeeplink | null {
  return readVisitorNoteDeeplinkFromSearch(
    conversationId,
    typeof window === "undefined" ? "" : window.location.search
  );
}

export function readVisitorNoteDeeplinkFromSearch(
  conversationId: string | null | undefined,
  search: string
): VisitorNoteDeeplink | null {
  if (!conversationId) {
    return null;
  }

  const params = new URLSearchParams(search);
  if (params.get("id") !== conversationId || params.get("focus") !== "note") {
    return null;
  }

  return {
    focusNote: true,
    mention: params.get("mention")?.trim().toLowerCase() || null,
    note: params.get("note")?.trim() || null
  };
}

export function getVisitorNoteSelection(note: string, deeplink: VisitorNoteDeeplink | null) {
  if (!deeplink?.focusNote || !note) {
    return null;
  }

  if (deeplink.note) {
    const noteIndex = findMatchIndex(note, deeplink.note);
    if (noteIndex >= 0) {
      return { start: noteIndex, end: noteIndex + deeplink.note.length };
    }
  }

  if (deeplink.mention) {
    const mentionText = `@${deeplink.mention}`;
    const mentionIndex = findMatchIndex(note, mentionText);
    if (mentionIndex >= 0) {
      return { start: mentionIndex, end: mentionIndex + mentionText.length };
    }
  }

  return { start: 0, end: note.length };
}
