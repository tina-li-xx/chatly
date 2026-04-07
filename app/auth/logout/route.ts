import { clearUserSession } from "@/lib/auth";
import { redirect303 } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  await clearUserSession();

  return redirect303(request, "/");
}

export const POST = withRouteErrorAlerting(handlePOST, "app/auth/logout/route.ts:POST");
