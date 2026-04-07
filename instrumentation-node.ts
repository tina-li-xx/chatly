import { registerServerErrorAlerting } from "@/lib/runtime/register-error-alerting";
import { startNodeRuntimeServices } from "@/lib/runtime/startup-orchestrator";

export async function registerNodeInstrumentation() {
  registerServerErrorAlerting();
  await startNodeRuntimeServices();
}
