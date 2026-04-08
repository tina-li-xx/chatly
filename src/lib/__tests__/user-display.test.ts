import {
  displayNameFromEmail,
  firstNameFromDisplayName,
  initialsFromLabel
} from "@/lib/user-display";

describe("user display helpers", () => {
  it("builds display names from email local parts", () => {
    expect(displayNameFromEmail("sarah.chen@example.com")).toBe("Sarah Chen");
    expect(displayNameFromEmail("alex_park@example.com")).toBe("Alex Park");
    expect(displayNameFromEmail("   @example.com")).toBe("Visitor");
  });

  it("extracts first names safely", () => {
    expect(firstNameFromDisplayName("Sarah Chen")).toBe("Sarah");
    expect(firstNameFromDisplayName("  ")).toBe("there");
  });

  it("builds initials from labels", () => {
    expect(initialsFromLabel("Sarah Chen")).toBe("SC");
    expect(initialsFromLabel("chatting")).toBe("C");
    expect(initialsFromLabel("   ")).toBe("??");
  });
});
