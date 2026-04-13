export type RouteFormData = {
  get(name: string): FormDataEntryValue | null;
};

export function asRouteFormData(formData: unknown) {
  return formData as RouteFormData | null;
}

export async function readRouteFormData(request: Request) {
  return asRouteFormData(await request.formData()) as RouteFormData;
}

export async function readOptionalRouteFormData(request: Request) {
  return request.formData().then(asRouteFormData).catch(() => null) as Promise<RouteFormData | null>;
}
