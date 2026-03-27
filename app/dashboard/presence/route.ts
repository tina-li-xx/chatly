import { recordUserPresence } from "@/lib/data";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function POST() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  await recordUserPresence(auth.user.id);
  return jsonOk({ recorded: true });
}
