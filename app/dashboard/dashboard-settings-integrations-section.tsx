"use client";

import { useState } from "react";
import type { BillingInterval, BillingPlanKey, DashboardBillingSummary } from "@/lib/data/billing-types";
import { isPaidPlan } from "@/lib/billing-plans";
import { useToast } from "../ui/toast-provider";
import {
  ShopifyIntegrationCard,
  SlackIntegrationCard,
  WebhooksIntegrationCard,
  ZapierIntegrationCard
} from "./dashboard-settings-integrations-cards";
import { type BillingPlanIntent, DashboardSettingsBillingPlanModal } from "./dashboard-settings-billing-modals";
import { SettingsSectionHeader } from "./dashboard-settings-shared";
import { SettingsIntegrationsConfirmModal } from "./dashboard-settings-integrations-confirm-modal";
import { IntegrationsSkeletonGrid } from "./dashboard-settings-integrations-primitives";
import { SettingsIntegrationsShopifyModal } from "./dashboard-settings-integrations-shopify-modal";
import { SettingsIntegrationsSlackModal } from "./dashboard-settings-integrations-slack-modal";
import { SettingsIntegrationsZapierModal } from "./dashboard-settings-integrations-zapier-modal";
import { useDashboardIntegrationsOAuthPopup } from "./use-dashboard-integrations-oauth-popup";
import { useDashboardIntegrationsState } from "./use-dashboard-integrations-state";

type ModalState = "slack-connect" | "slack-settings" | "zapier" | "shopify" | "disconnect-slack" | "disconnect-zapier" | "disconnect-shopify" | null;

export function SettingsIntegrationsSection({
  title,
  subtitle,
  planKey,
  billing,
  billingPlanPending,
  selectedInterval,
  onChangePlan
}: {
  title: string;
  subtitle: string;
  planKey: BillingPlanKey;
  billing: DashboardBillingSummary;
  billingPlanPending: string | null;
  selectedInterval: BillingInterval;
  onChangePlan: (
    planKey: BillingPlanKey,
    billingInterval: BillingInterval,
    seatQuantity?: number
  ) => Promise<void>;
}) {
  const integrationsUnlocked = isPaidPlan(planKey);
  const { showToast } = useToast();
  const {
    state,
    hydrated,
    saveSlack,
    updateSlack,
    disconnectSlack,
    setSlackError,
    markSlackReconnect,
    activateZapier,
    disconnectZapier,
    connectShopify,
    disconnectShopify,
    setShopifyError
  } = useDashboardIntegrationsState();
  const [modal, setModal] = useState<ModalState>(null);
  const [planIntent, setPlanIntent] = useState<BillingPlanIntent>(null);
  const [pendingSlackWorkspace, setPendingSlackWorkspace] = useState<string | null>(null);
  const [zapierBusy, setZapierBusy] = useState(false);
  const { activeRequest, openAuthPopup } = useDashboardIntegrationsOAuthPopup({
    onSuccess: (message, request) => {
      if (message.provider === "slack") {
        setPendingSlackWorkspace(message.workspaceName);
        setModal("slack-connect");
        if (request.mode === "reconnect") {
          showToast("success", "Slack reauthorized", "Choose a channel to finish reconnecting Slack.");
        }
        return;
      }

      void connectShopify()
        .then(() => {
          setModal(null);
          showToast("success", "Shopify connected", `${message.domain} is ready in Chatting.`);
        })
        .catch(() => {
          setShopifyError("Please try again. If the problem continues, contact support.");
          showToast("error", "Couldn't connect to Shopify", "Please try again. If the problem continues, contact support.");
        });
    },
    onAbort: (request) => {
      if (request.provider === "slack") {
        if (request.mode === "reconnect") {
          markSlackReconnect();
          showToast("warning", "Slack still needs reconnecting", "Reconnect Slack to resume notifications and replies.");
          return;
        }

        setSlackError("Please try again. If the problem continues, contact support.");
        showToast("error", "Couldn't connect to Slack", "Please try again. If the problem continues, contact support.");
        return;
      }

      setShopifyError("Please try again. If the problem continues, contact support.");
      showToast("error", "Couldn't connect to Shopify", "Please try again. If the problem continues, contact support.");
    }
  });
  const slackBusy = activeRequest?.provider === "slack";
  const shopifyBusy = activeRequest?.provider === "shopify";

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <SettingsSectionHeader title={title} subtitle={subtitle} />
        <IntegrationsSkeletonGrid />
      </div>
    );
  }

  function startSlackAuth(mode: "connect" | "reconnect") {
    setModal(null);
    setPendingSlackWorkspace(null);
    openAuthPopup({
      provider: "slack",
      mode,
      url: `/api/integrations/slack/start?mode=${mode}`
    });
  }

  function startShopifyAuth(domain: string) {
    openAuthPopup({
      provider: "shopify",
      mode: "connect",
      url: `/api/integrations/shopify/start?shop=${encodeURIComponent(domain)}`
    });
  }

  function openUpgradeModal() {
    setPlanIntent({
      planKey: "growth",
      billingInterval: selectedInterval,
      mode: "upgrade",
      seatQuantity: Math.max(1, billing.usedSeats || 1)
    });
  }

  async function openZapierModal() {
    setZapierBusy(true);
    try {
      if (!state.zapier.apiKeyReady || !state.zapier.apiKey) {
        await activateZapier(false);
      }
      setModal("zapier");
    } catch {
      showToast("error", "Couldn't connect to Zapier", "Please try again. If the problem continues, contact support.");
    } finally {
      setZapierBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} />

      <div className="grid max-w-[700px] gap-5 md:grid-cols-2">
        <SlackIntegrationCard unlocked={integrationsUnlocked} slack={state.slack} busy={slackBusy} onConnect={() => startSlackAuth(state.slack.status === "reconnect" ? "reconnect" : "connect")} onSettings={() => setModal("slack-settings")} onDisconnect={() => setModal("disconnect-slack")} onUpgrade={openUpgradeModal} />
        <ZapierIntegrationCard unlocked={integrationsUnlocked} zapier={state.zapier} busy={zapierBusy} onConnect={() => void openZapierModal()} onDisconnect={() => setModal("disconnect-zapier")} onUpgrade={openUpgradeModal} />
        <WebhooksIntegrationCard unlocked={integrationsUnlocked} activeCount={state.webhooks.length} onUpgrade={openUpgradeModal} />
        <ShopifyIntegrationCard unlocked={integrationsUnlocked} shopify={state.shopify} busy={shopifyBusy} onConnect={() => setModal("shopify")} onDisconnect={() => setModal("disconnect-shopify")} onUpgrade={openUpgradeModal} />
      </div>

      {modal === "slack-connect" ? <SettingsIntegrationsSlackModal mode="connect" initialState={state.slack} workspaceName={pendingSlackWorkspace ?? undefined} onClose={() => { setPendingSlackWorkspace(null); setModal(null); }} onSave={async (nextState) => { try { await saveSlack(nextState); setPendingSlackWorkspace(null); setModal(null); showToast("success", "Slack connected", `Posting to ${nextState.channelName}.`); } catch { showToast("error", "Slack settings couldn't be saved", "Please try again in a moment."); } }} /> : null}
      {modal === "slack-settings" ? <SettingsIntegrationsSlackModal mode="settings" initialState={state.slack} onClose={() => setModal(null)} onSave={async (nextState) => { try { await updateSlack(nextState); setModal(null); showToast("success", "Slack settings saved"); } catch { showToast("error", "Slack settings couldn't be saved", "Please try again in a moment."); } }} /> : null}
      {modal === "zapier" ? <SettingsIntegrationsZapierModal apiKey={state.zapier.apiKey} onClose={() => setModal(null)} onActivate={async () => { await activateZapier(); }} /> : null}
      {modal === "shopify" ? <SettingsIntegrationsShopifyModal initialDomain={state.shopify.domain} onClose={() => setModal(null)} onBeginAuth={(domain) => { setModal(null); startShopifyAuth(domain); }} /> : null}
      {modal === "disconnect-slack" ? <SettingsIntegrationsConfirmModal title="Disconnect Slack?" description="You'll stop receiving notifications in Slack and won't be able to reply from there." confirmLabel="Yes, disconnect" note="You can reconnect anytime." onClose={() => setModal(null)} onConfirm={async () => { try { await disconnectSlack(); setModal(null); showToast("success", "Slack disconnected"); } catch { showToast("error", "Slack couldn't be disconnected", "Please try again in a moment."); } }} /> : null}
      {modal === "disconnect-zapier" ? <SettingsIntegrationsConfirmModal title="Disconnect Zapier?" description="You'll stop using Chatting as a Zapier app until you reconnect it." confirmLabel="Yes, disconnect" note="You can reconnect anytime." onClose={() => setModal(null)} onConfirm={async () => { try { await disconnectZapier(); setModal(null); showToast("success", "Zapier disconnected"); } catch { showToast("error", "Zapier couldn't be disconnected", "Please try again in a moment."); } }} /> : null}
      {modal === "disconnect-shopify" ? <SettingsIntegrationsConfirmModal title="Disconnect Shopify?" description="You'll stop seeing Shopify order history and customer context in the inbox." confirmLabel="Yes, disconnect" note="You can reconnect anytime." onClose={() => setModal(null)} onConfirm={async () => { try { await disconnectShopify(); setModal(null); showToast("success", "Shopify disconnected"); } catch { showToast("error", "Shopify couldn't be disconnected", "Please try again in a moment."); } }} /> : null}
      <DashboardSettingsBillingPlanModal
        billing={billing}
        intent={planIntent}
        pending={Boolean(billingPlanPending)}
        onClose={() => setPlanIntent(null)}
        onConfirm={() => {
          if (!planIntent) {
            return;
          }
          void onChangePlan(planIntent.planKey, planIntent.billingInterval, planIntent.seatQuantity);
        }}
      />
    </div>
  );
}
