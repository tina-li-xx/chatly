import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getRequiredServerEnv } from "@/lib/env.server";

const TEAM_PHOTO_MAX_BYTES = 2 * 1024 * 1024;
const TEAM_PHOTO_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp"
]);

let r2Client: S3Client | null = null;

function getR2Client() {
  if (r2Client) {
    return r2Client;
  }

  const accountId = getRequiredServerEnv("R2_ACCOUNT_ID", { errorCode: "R2_NOT_CONFIGURED" });
  const accessKeyId = getRequiredServerEnv("R2_ACCESS_KEY_ID", { errorCode: "R2_NOT_CONFIGURED" });
  const secretAccessKey = getRequiredServerEnv("R2_SECRET_ACCESS_KEY", {
    errorCode: "R2_NOT_CONFIGURED"
  });

  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });

  return r2Client;
}

function getBucketName() {
  return getRequiredServerEnv("R2_BUCKET_NAME", { errorCode: "R2_NOT_CONFIGURED" });
}

function getPublicBaseUrl() {
  return getRequiredServerEnv("R2_PUBLIC_BASE_URL", { errorCode: "R2_NOT_CONFIGURED" }).replace(
    /\/+$/,
    ""
  );
}

function getImageExtension(contentType: string) {
  if (contentType === "image/png") {
    return "png";
  }

  if (contentType === "image/jpeg") {
    return "jpg";
  }

  if (contentType === "image/gif") {
    return "gif";
  }

  return "webp";
}

export function getTeamPhotoConstraints() {
  return {
    maxBytes: TEAM_PHOTO_MAX_BYTES,
    acceptedContentTypes: Array.from(TEAM_PHOTO_CONTENT_TYPES)
  };
}

export async function uploadSiteTeamPhotoToR2(input: {
  siteId: string;
  fileName: string;
  contentType: string;
  content: Buffer;
}) {
  if (!TEAM_PHOTO_CONTENT_TYPES.has(input.contentType)) {
    throw new Error("INVALID_IMAGE_TYPE");
  }

  if (input.content.length > TEAM_PHOTO_MAX_BYTES) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  const key = `sites/${input.siteId}/team-photos/${Date.now()}-${randomUUID()}.${getImageExtension(
    input.contentType
  )}`;

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: input.content,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable"
    })
  );

  return {
    key,
    url: `${getPublicBaseUrl()}/${key}`
  };
}

export async function deleteR2Object(key: string) {
  if (!key) {
    return;
  }

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key
    })
  );
}
