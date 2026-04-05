import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  billingErrorMessage,
  buildOwnerName,
  formatMoney,
  passwordStrength,
  SettingsCard,
  settingsErrorMessage,
  SettingsSectionHeader,
  ToggleRow,
  ToggleSwitch
} from "./dashboard-settings-shared";

function collect(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collect(child, predicate));
  const element = node as ReactElement;
  if (typeof element.type === "function") {
    return collect((element.type as (props: unknown) => ReactNode)(element.props), predicate);
  }
  return [...(predicate(element) ? [element] : []), ...collect(element.props?.children, predicate)];
}

describe("dashboard settings shared helpers", () => {
  it("builds owner names and maps password strength tiers", () => {
    expect(buildOwnerName({ firstName: " Tina ", lastName: " Bauer ", email: "tina@example.com" })).toBe("Tina Bauer");
    expect(buildOwnerName({ firstName: " ", lastName: "", email: "tina@example.com" })).toBe("Tina");
    expect(passwordStrength("").label).toBe("Use at least 8 characters.");
    expect(passwordStrength("short").label).toBe("Weak");
    expect(passwordStrength("Password").label).toBe("Fair");
    expect(passwordStrength("Password1").label).toBe("Good");
    expect(passwordStrength("Password1!").label).toBe("Strong");
  });

  it("maps settings and billing errors to user-facing copy", () => {
    expect(settingsErrorMessage("missing_email")).toContain("Email is required");
    expect(settingsErrorMessage("email_taken")).toContain("already in use");
    expect(settingsErrorMessage("missing_current_password")).toContain("current password");
    expect(settingsErrorMessage("missing_password")).toContain("new password");
    expect(settingsErrorMessage("weak_password")).toContain("stronger password");
    expect(settingsErrorMessage("invalid_current_password")).toContain("incorrect");
    expect(settingsErrorMessage("password_confirm")).toContain("do not match");
    expect(settingsErrorMessage("unknown")).toContain("couldn't save");

    expect(billingErrorMessage("stripe_not_configured")).toContain("Stripe is not configured");
    expect(billingErrorMessage("contact_sales_required")).toContain("50 or more members");
    expect(billingErrorMessage("unknown")).toContain("couldn't update billing");
  });

  it("renders settings cards and toggle controls", () => {
    const onChange = vi.fn();
    const cardHtml = renderToStaticMarkup(
      <>
        <SettingsCard title="Profile" description="Manage your account" actions={<button>Action</button>}>
          <div>Card body</div>
        </SettingsCard>
        <SettingsCard>
          <div>Body only</div>
        </SettingsCard>
        <SettingsSectionHeader title="Profile" subtitle="Team defaults" />
        <SettingsSectionHeader title="Help center" />
      </>
    );

    expect(cardHtml).toContain("Manage your account");
    expect(cardHtml).toContain("Body only");
    expect(cardHtml).toContain("Team defaults");
    expect(cardHtml).toContain("Help center");
    expect(formatMoney(2900, "usd")).toContain("29");

    const toggleTree = (
      <>
        <ToggleSwitch checked onChange={onChange} label="Enabled" />
        <ToggleRow label="Alerts" description="Notify on mentions" checked={false} onChange={onChange} />
      </>
    );
    collect(toggleTree, (element) => element.type === "button").forEach((button) => button.props.onClick());
    expect(onChange).toHaveBeenCalledWith(false);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
