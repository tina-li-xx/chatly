import { cta, list, paragraph, section } from "@/lib/blog-block-factories";
import {
  CHATTING_ZAPIER_SETUP_GUIDE_PATH,
  CHATTING_ZAPIER_SUPPORT_URL,
  CHATTING_ZAPIER_STARTER_WORKFLOWS
} from "@/lib/chatting-zapier-starter-workflows";

const workflowSections = CHATTING_ZAPIER_STARTER_WORKFLOWS.map((workflow) =>
  section(workflow.id, workflow.name, [
    paragraph(workflow.description),
    list([
      `Template name: \`${workflow.templateName}\``,
      `Template description: ${workflow.templateDescription}`,
      `Build with: \`${workflow.recipe}\``
    ])
  ])
);

export const chattingZapierStarterZapsGuideSections = [
  section("before-you-start", "Before you start", [
    list([
      "Connect Chatting to Zapier first",
      "Pick one alert workflow, one logging workflow, or one action workflow to publish first",
      "Test each Zap with one real conversation or contact before turning it on"
    ]),
    paragraph("Use this page as the shortlist of starter workflows after the main Zapier connection is already working.")
  ]),
  ...workflowSections,
  section("publish-these-zaps", "Publish these Zaps", [
    list([
      "Start with one alert workflow, one logging workflow, and one action workflow",
      "Use the template names exactly as written so docs and templates stay consistent",
      "Link back to the main Zapier setup guide before this list"
    ], true),
    cta(
      "Need the connection steps first?",
      "Open the main Zapier setup guide, connect Chatting, then come back here to pick the first starter Zap.",
      "Open setup guide",
      CHATTING_ZAPIER_SETUP_GUIDE_PATH
    )
  ]),
  section("support", "When a starter Zap breaks", [
    list([
      "Reconnect the Chatting account first if Zapier marks it stale or expired.",
      "Retest the trigger or action with a fresh Chatting sample before changing field mappings.",
      "If the Zap still fails in Zapier run history, send the user to Zapier support so their team can inspect the workflow directly."
    ], true),
    cta(
      "Need help with a live Zap?",
      "Broken Zap runs, editor issues, and Zapier account problems should go through Zapier support so they can debug the workflow with full context.",
      "Contact Zapier support",
      CHATTING_ZAPIER_SUPPORT_URL
    )
  ])
];
