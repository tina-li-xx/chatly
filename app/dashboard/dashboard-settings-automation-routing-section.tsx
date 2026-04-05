"use client";

import { useState } from "react";
import type { DashboardBillingSummary } from "@/lib/data/billing-types";
import type { DashboardAutomationSettings, DashboardTeamMember } from "@/lib/data/settings-types";
import { getAutomationRuleLimit } from "@/lib/plan-limits";
import { BranchIcon } from "./dashboard-ui";
import { createAutomationId } from "./dashboard-settings-automation-options";
import { AutomationAssignActionField } from "./dashboard-settings-automation-routing-action-fields";
import { AutomationTagPicker } from "./dashboard-settings-automation-tag-picker";
import {
  getAssignRuleErrors,
  getRoutingTagActionOptions,
  getRoutingVisitorTagOptions,
  getTagRuleErrors,
  moveRoutingItem,
  reorderRoutingItems,
  updateRoutingItemById
} from "./dashboard-settings-automation-routing-helpers";
import {
  AutomationRoutingRulesList,
  type RoutingDragState,
  type RoutingListKey
} from "./dashboard-settings-automation-routing-list";
import { AutomationSectionCard, AutomationUpgradeCard } from "./dashboard-settings-automation-ui";

export function SettingsAutomationRoutingSection({
  automation,
  billing,
  teamMembers,
  tagOptions,
  onChange,
  onAnnounce
}: {
  automation: DashboardAutomationSettings;
  billing: DashboardBillingSummary;
  teamMembers: DashboardTeamMember[];
  tagOptions: string[];
  onChange: (updater: (current: DashboardAutomationSettings) => DashboardAutomationSettings) => void;
  onAnnounce: (message: string) => void;
}) {
  const limit = getAutomationRuleLimit(billing.planKey);
  const locked = false;
  const tagActionOptions = getRoutingTagActionOptions(tagOptions);
  const suggestedTagOptions = tagActionOptions.filter(
    (option) => !tagOptions.some((tag) => tag.toLowerCase() === option.toLowerCase())
  );
  const visitorTagOptions = getRoutingVisitorTagOptions(tagOptions);
  const assignRules = automation.routing.assignRules;
  const tagRules = automation.routing.tagRules;
  const [addedRuleId, setAddedRuleId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<RoutingDragState>(null);
  const updateRouting = (
    updater: (
      current: DashboardAutomationSettings["routing"]
    ) => DashboardAutomationSettings["routing"]
  ) => onChange((current) => ({ ...current, routing: updater(current.routing) }));
  const updateAssignRules = (
    updater: (
      current: DashboardAutomationSettings["routing"]["assignRules"]
    ) => DashboardAutomationSettings["routing"]["assignRules"]
  ) =>
    updateRouting((current) => ({
      ...current,
      assignRules: updater(current.assignRules)
    }));
  const updateTagRules = (
    updater: (
      current: DashboardAutomationSettings["routing"]["tagRules"]
    ) => DashboardAutomationSettings["routing"]["tagRules"]
  ) =>
    updateRouting((current) => ({
      ...current,
      tagRules: updater(current.tagRules)
    }));
  const patchAssignRule = (
    ruleId: string,
    updater: (rule: DashboardAutomationSettings["routing"]["assignRules"][number]) => DashboardAutomationSettings["routing"]["assignRules"][number]
  ) => updateAssignRules((current) => updateRoutingItemById(current, ruleId, updater));
  const patchTagRule = (
    ruleId: string,
    updater: (rule: DashboardAutomationSettings["routing"]["tagRules"][number]) => DashboardAutomationSettings["routing"]["tagRules"][number]
  ) => updateTagRules((current) => updateRoutingItemById(current, ruleId, updater));

  const addAssignRule = () => {
    const id = createAutomationId("assign");
    setAddedRuleId(id);
    updateAssignRules((current) => [
      ...current,
      { id, condition: "page_url_contains", value: "", target: { type: "round_robin" } }
    ]);
    onAnnounce("Auto-assign rule added.");
  };
  const addTagRule = () => {
    const id = createAutomationId("tag");
    setAddedRuleId(id);
    updateTagRules((current) => [
      ...current,
      { id, condition: "page_url_contains", value: "", tag: "" }
    ]);
    onAnnounce("Auto-tag rule added.");
  };
  const reorderList = (list: RoutingListKey, ruleId: string, targetIndex: number) => {
    if (list === "assignRules") {
      updateAssignRules((current) => reorderRoutingItems(current, ruleId, targetIndex));
    } else {
      updateTagRules((current) => reorderRoutingItems(current, ruleId, targetIndex));
    }
    setDragState(null);
  };

  return (
    <AutomationSectionCard title="Routing" description="Route the right chats to the right person" icon={BranchIcon}>
      {locked ? <AutomationUpgradeCard title="Routing rules unlock on Growth" description="Upgrade to create auto-assign and auto-tag rules for incoming conversations." actionLabel="Upgrade now →" /> : null}

      <AutomationRoutingRulesList
        listKey="assignRules"
        title="Auto-assign rules"
        description="Automatically assign conversations to team members"
        actionLabel="Then assign to"
        emptyTitle="No auto-assign rules yet"
        emptyDescription="Route conversations to the right person based on page, location, or topic."
        hintText="Rules are checked top to bottom. First match wins."
        rules={assignRules}
        limit={limit}
        locked={locked}
        addedRuleId={addedRuleId}
        dragState={dragState}
        setDragState={setDragState}
        onAdd={addAssignRule}
        onReorder={reorderList}
        onUpdateCondition={(ruleId, condition) => patchAssignRule(ruleId, (rule) => ({ ...rule, condition }))}
        onUpdateValue={(ruleId, value) => patchAssignRule(ruleId, (rule) => ({ ...rule, value }))}
        onDelete={(ruleId) => {
          updateAssignRules((current) => current.filter((rule) => rule.id !== ruleId));
          onAnnounce("Auto-assign rule deleted.");
        }}
        onMoveUp={(index) => updateAssignRules((current) => moveRoutingItem(current, index, -1))}
        onMoveDown={(index) => updateAssignRules((current) => moveRoutingItem(current, index, 1))}
        getValueError={(rule) => getAssignRuleErrors(rule).value}
        renderActionControl={(rule) => (
          <AutomationAssignActionField
            rule={rule}
            members={teamMembers}
            onChange={(nextRule) => patchAssignRule(rule.id, () => nextRule)}
          />
        )}
      />

      <AutomationRoutingRulesList
        listKey="tagRules"
        title="Auto-tag rules"
        description="Automatically tag conversations based on conditions"
        actionLabel="Then add tag"
        emptyTitle="No auto-tag rules yet"
        emptyDescription="Automatically label chats based on page, referrer, visitor location, or topic."
        hintText="Matching tag rules can stack on the same conversation."
        rules={tagRules}
        limit={limit}
        locked={locked}
        addedRuleId={addedRuleId}
        dragState={dragState}
        setDragState={setDragState}
        onAdd={addTagRule}
        onReorder={reorderList}
        onUpdateCondition={(ruleId, condition) => patchTagRule(ruleId, (rule) => ({ ...rule, condition }))}
        onUpdateValue={(ruleId, value) => patchTagRule(ruleId, (rule) => ({ ...rule, value }))}
        onDelete={(ruleId) => {
          updateTagRules((current) => current.filter((rule) => rule.id !== ruleId));
          onAnnounce("Auto-tag rule deleted.");
        }}
        onMoveUp={(index) => updateTagRules((current) => moveRoutingItem(current, index, -1))}
        onMoveDown={(index) => updateTagRules((current) => moveRoutingItem(current, index, 1))}
        getValueError={(rule) => getTagRuleErrors(rule).value}
        getActionError={(rule) => getTagRuleErrors(rule).action}
        renderActionControl={(rule) => (
          <AutomationTagPicker
            value={rule.tag}
            options={tagActionOptions}
            primaryOptions={tagOptions}
            secondaryOptions={suggestedTagOptions}
            hasError={Boolean(getTagRuleErrors(rule).action)}
            placeholder="Search or create a tag"
            onChange={(value) => patchTagRule(rule.id, (current) => ({ ...current, tag: value }))}
          />
        )}
      />
      <datalist id="automation-routing-value-tags">{visitorTagOptions.map((tag) => <option key={tag} value={tag} />)}</datalist>
    </AutomationSectionCard>
  );
}
