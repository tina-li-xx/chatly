import { renderToStaticMarkup } from "react-dom/server";
import {
  SETTINGS_NAV,
  SettingsCard,
  SettingsNavIcon,
  SettingsSectionHeader,
  ToggleRow,
  ToggleSwitch,
  billingErrorMessage,
  buildOwnerName,
  editableSignature,
  formatMoney,
  passwordStrength,
  settingsErrorMessage
} from "./dashboard-settings-shared";

describe("dashboard settings shared", () => {
  it("formats settings helpers and error messages", () => {
    expect(SETTINGS_NAV).toHaveLength(3);
    expect(editableSignature({ profile: { a: 1 }, notifications: { b: 2 }, email: { c: 3 } } as never)).toContain(
      '"a":1'
    );
    expect(buildOwnerName({ firstName: "Tina", lastName: "Bauer", email: "tina@example.com" } as never)).toBe(
      "Tina Bauer"
    );
    expect(passwordStrength("")).toMatchObject({ label: "Use at least 8 characters.", widthClass: "w-0" });
    expect(passwordStrength("Hello123!")).toMatchObject({ label: "Strong", widthClass: "w-full" });
    expect(settingsErrorMessage("email_taken")).toContain("already in use");
    expect(billingErrorMessage("contact_sales_required")).toContain("50 or more members");
    expect(billingErrorMessage("stripe_price_config_invalid")).toContain("expected seat tiers");
    expect(formatMoney(2900, "usd")).toContain("29.00");
  });

  it("renders shared settings shells and toggle controls", () => {
    const html = renderToStaticMarkup(
      <>
        <SettingsCard title="Profile" description="Manage account details." actions={<button type="button">Edit</button>}>
          <div>content</div>
        </SettingsCard>
        <SettingsSectionHeader title="Notifications" subtitle="Fine-tune alerts" />
        <ToggleSwitch checked onChange={() => {}} label="Browser notifications" />
        <ToggleRow
          label="Sound alerts"
          description="Play a sound for new messages."
          checked={false}
          onChange={() => {}}
        />
        <SettingsNavIcon icon={() => <svg><path d="M0 0h1" /></svg>} />
      </>
    );

    expect(html).toContain("Profile");
    expect(html).toContain("Manage account details.");
    expect(html).toContain("Notifications");
    expect(html).toContain('role="switch"');
    expect(html).toContain("Sound alerts");
    expect(html).toContain("<svg");
  });
});
