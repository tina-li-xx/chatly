import { removeSiteTeamPhoto, updateSiteTeamPhoto } from "@/lib/data";
import { getTeamPhotoConstraints } from "@/lib/r2";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export const runtime = "nodejs";

function mapPhotoErrorMessage(code: string) {
  if (code === "R2_NOT_CONFIGURED") {
    return "storage-not-configured";
  }

  if (code === "INVALID_IMAGE_TYPE") {
    return "invalid-image-type";
  }

  if (code === "IMAGE_TOO_LARGE") {
    return "image-too-large";
  }

  return "team-photo-upload-failed";
}

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const siteId = String(formData.get("siteId") ?? "").trim();
    const file = formData.get("file");

    if (!siteId) {
      return jsonError("site-id-missing", 400);
    }

    if (!(file instanceof File)) {
      return jsonError("file-missing", 400);
    }

    const { acceptedContentTypes, maxBytes } = getTeamPhotoConstraints();
    if (!acceptedContentTypes.includes(file.type)) {
      return jsonError("invalid-image-type", 400);
    }

    if (file.size > maxBytes) {
      return jsonError("image-too-large", 400);
    }

    const updated = await updateSiteTeamPhoto(siteId, auth.user.id, {
      fileName: file.name,
      contentType: file.type,
      content: Buffer.from(await file.arrayBuffer())
    });

    if (!updated) {
      return jsonError("site-not-found", 404);
    }

    return jsonOk({ site: updated });
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(mapPhotoErrorMessage(error.message), error.message === "R2_NOT_CONFIGURED" ? 500 : 400);
    }

    return jsonError("team-photo-upload-failed", 500);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const siteId = String(payload.siteId ?? "").trim();

    if (!siteId) {
      return jsonError("site-id-missing", 400);
    }

    const updated = await removeSiteTeamPhoto(siteId, auth.user.id);
    if (!updated) {
      return jsonError("site-not-found", 404);
    }

    return jsonOk({ site: updated });
  } catch (error) {
    return jsonError("team-photo-delete-failed", 500);
  }
}
