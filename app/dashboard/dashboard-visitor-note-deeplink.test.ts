import {
  getVisitorNoteSelection,
  readVisitorNoteDeeplinkFromSearch
} from "./dashboard-visitor-note-deeplink";

describe("dashboard visitor note deeplink", () => {
  it("reads note-focused inbox deeplinks for the active conversation", () => {
    expect(
      readVisitorNoteDeeplinkFromSearch(
        "conv_1",
        "?id=conv_1&focus=note&mention=tina&note=%40Tina%20please%20check%20pricing"
      )
    ).toEqual({
      focusNote: true,
      mention: "tina",
      note: "@Tina please check pricing"
    });
    expect(
      readVisitorNoteDeeplinkFromSearch(
        "conv_2",
        "?id=conv_1&focus=note&mention=tina&note=%40Tina%20please%20check%20pricing"
      )
    ).toBeNull();
  });

  it("selects the exact note text first, then falls back to the mention token", () => {
    const exactNote = "@Tina can you confirm whether this customer qualifies for annual billing?";

    expect(
      getVisitorNoteSelection(exactNote, {
        focusNote: true,
        mention: "tina",
        note: exactNote
      })
    ).toEqual({ start: 0, end: exactNote.length });

    expect(
      getVisitorNoteSelection("Please ask @Tina Bauer to review the plan.", {
        focusNote: true,
        mention: "tina",
        note: exactNote
      })
    ).toEqual({ start: 11, end: 16 });
  });
});
