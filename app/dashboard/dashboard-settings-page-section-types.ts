import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";
import type {
  BillingInterval,
  BillingPlanKey,
  DashboardBillingSummary
} from "@/lib/data/billing-types";
import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import type { DashboardAiAssistUsageSnapshot } from "@/lib/data/settings-ai-assist-usage";
import type {
  DashboardAutomationContext,
  DashboardAutomationSettings,
  DashboardTeamMember
} from "@/lib/data/settings-types";
import type { DashboardNoticeState } from "./dashboard-controls";
import type { EditableSettings, SettingsSection } from "./dashboard-settings-shared";

export type PasswordDraft = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type PasswordMeter = {
  label: string;
  widthClass: string;
  toneClass: string;
};

export type RenderSettingsPageSectionInput = {
  activeSection: SettingsSection;
  billing: DashboardBillingSummary;
  billingPlanPending: string | null;
  billingPortalPending: boolean;
  billingSyncPending: boolean;
  aiAssistUsage?: DashboardAiAssistUsageSnapshot;
  automationContext?: DashboardAutomationContext;
  currentProfileName: string;
  draftSettings: EditableSettings;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isDirty: boolean;
  isSaving: boolean;
  onChangePlan: (
    planKey: BillingPlanKey,
    billingInterval: BillingInterval,
    seatQuantity?: number
  ) => Promise<void>;
  onDiscard: () => void;
  onNotice: (notice: DashboardNoticeState) => void;
  onOpenBillingPortal: () => Promise<void>;
  onSave: () => void;
  onSetPasswordDraft: Dispatch<SetStateAction<PasswordDraft>>;
  onSetPasswordExpanded: Dispatch<SetStateAction<boolean>>;
  onSetSelectedInterval: Dispatch<SetStateAction<BillingInterval>>;
  onSyncBilling: () => void;
  onUpdateEmail: <K extends keyof EditableSettings["email"]>(
    key: K,
    value: EditableSettings["email"][K]
  ) => void;
  onUpdateContacts: (value: EditableSettings["contacts"]) => void;
  onUpdateAutomation: (
    updater: (current: DashboardAutomationSettings) => DashboardAutomationSettings
  ) => void;
  onUpdateAiAssist: <K extends keyof DashboardAiAssistSettings>(
    key: K,
    value: DashboardAiAssistSettings[K]
  ) => void;
  onUpdateNotifications: <K extends keyof EditableSettings["notifications"]>(
    key: K,
    value: EditableSettings["notifications"][K]
  ) => void;
  onUpdateReports: <K extends keyof NonNullable<EditableSettings["reports"]>>(
    key: K,
    value: NonNullable<EditableSettings["reports"]>[K]
  ) => void;
  onUpdateProfile: <K extends keyof EditableSettings["profile"]>(
    key: K,
    value: EditableSettings["profile"][K]
  ) => void;
  onUpdateTeamName: (value: string) => void;
  onAvatarPick: (event: ChangeEvent<HTMLInputElement>) => void;
  pageCopy: { title: string; subtitle: string };
  passwordDraft: PasswordDraft;
  passwordExpanded: boolean;
  passwordMeter: PasswordMeter;
  selectedBillingInterval: BillingInterval;
  canManageSavedReplies: boolean;
  teamMembers: DashboardTeamMember[];
};
