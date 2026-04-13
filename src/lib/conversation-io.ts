import type { UploadedAttachmentInput } from "@/lib/data/shared";
import { optionalText } from "@/lib/utils";
import {
  normalizeVisitorCustomFields,
  normalizeVisitorTags
} from "@/lib/visitor-routing-profile";

export const MAX_ATTACHMENT_COUNT = 3;
export const MAX_ATTACHMENT_SIZE_BYTES = 4 * 1024 * 1024;

type AttachmentFormData = {
  getAll(name: string): unknown[];
};

export async function extractUploadedAttachments(
  formData: AttachmentFormData,
  fieldName = "attachments"
): Promise<UploadedAttachmentInput[]> {
  const files = formData
    .getAll(fieldName)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length > MAX_ATTACHMENT_COUNT) {
    throw new Error("ATTACHMENT_LIMIT");
  }

  const attachments: UploadedAttachmentInput[] = [];

  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      throw new Error("ATTACHMENT_TOO_LARGE");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    attachments.push({
      fileName: file.name || "attachment",
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      content: buffer
    });
  }

  return attachments;
}

function firstHeader(headers: Headers, names: string[]) {
  for (const name of names) {
    const value = headers.get(name);
    if (value) {
      return value;
    }
  }

  return null;
}

export function extractVisitorMetadata(
  request: Request,
  input?: {
    pageUrl?: string | null;
    referrer?: string | null;
    timezone?: string | null;
    locale?: string | null;
    visitorTags?: unknown;
    customFields?: unknown;
  }
) {
  const country = optionalText(
    firstHeader(request.headers, ["x-vercel-ip-country", "cf-ipcountry", "x-country-code"])
  );
  const region = optionalText(
    firstHeader(request.headers, ["x-vercel-ip-country-region", "cf-region", "x-region"])
  );
  const city = optionalText(
    firstHeader(request.headers, ["x-vercel-ip-city", "cf-ipcity", "x-city"])
  );
  const timezone =
    optionalText(input?.timezone) ||
    optionalText(firstHeader(request.headers, ["x-vercel-ip-timezone", "cf-timezone", "x-timezone"]));
  const locale =
    optionalText(input?.locale) ||
    optionalText(firstHeader(request.headers, ["accept-language"]));

  return {
    pageUrl: optionalText(input?.pageUrl),
    referrer: optionalText(input?.referrer),
    userAgent: optionalText(request.headers.get("user-agent")),
    country,
    region,
    city,
    timezone,
    locale,
    visitorTags: normalizeVisitorTags(input?.visitorTags),
    customFields: normalizeVisitorCustomFields(input?.customFields)
  };
}
