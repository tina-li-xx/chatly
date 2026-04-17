import {
  getMobileAvailability,
  updateMobileAvailability
} from "@/lib/services/mobile";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  return jsonOk({
    availability: await getMobileAvailability(auth.user.id)
  });
}

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const availability =
    body?.availability === "offline" ? "offline" : body?.availability === "online" ? "online" : null;

  if (!availability) {
    return jsonError("missing-fields", 400);
  }

  return jsonOk({
    availability: await updateMobileAvailability(auth.user.id, availability)
  });
}

export const GET = withRouteErrorAlerting(
  handleGET,
  "app/api/mobile/availability/route.ts:GET"
);
export const POST = withRouteErrorAlerting(
  handlePOST,
  "app/api/mobile/availability/route.ts:POST"
);
