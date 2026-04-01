import "server-only";

import { schedulerConfigs } from "@/lib/runtime/scheduler-lock-keys";
import { createWindowedScheduler } from "@/lib/runtime/windowed-scheduler";

export const conversationTemplateEmailScheduler = createWindowedScheduler(
  schedulerConfigs.conversationTemplateEmail,
  async () => {
    const { runScheduledConversationTemplateEmailRetries } = await import(
      "@/lib/conversation-template-email-runner"
    );
    await runScheduledConversationTemplateEmailRetries();
  }
);
