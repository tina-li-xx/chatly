import {
  getMobileProfile,
  updateMobileProfile
} from "@/lib/data/mobile-profile";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  return jsonOk({ profile: await getMobileProfile(auth.user.id) });
}

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  if (
    typeof body?.firstName !== "string" ||
    typeof body?.lastName !== "string" ||
    typeof body?.jobTitle !== "string" ||
    !(typeof body?.avatarDataUrl === "string" || body?.avatarDataUrl === null)
  ) {
    return jsonError("missing-fields", 400);
  }

  return jsonOk({
    profile: await updateMobileProfile(auth.user.id, {
      firstName: body.firstName,
      lastName: body.lastName,
      jobTitle: body.jobTitle,
      avatarDataUrl: body.avatarDataUrl
    })
  });
}

export const GET = withRouteErrorAlerting(
  handleGET,
  "app/api/mobile/profile/route.ts:GET"
);
export const POST = withRouteErrorAlerting(
  handlePOST,
  "app/api/mobile/profile/route.ts:POST"
);
