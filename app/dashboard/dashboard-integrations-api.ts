type IntegrationRoutePayload<T, K extends string> =
  | ({ ok: true } & Record<K, T>)
  | { ok: false; error: string };

type ReadRouteOptions<K extends string> = {
  method?: "GET" | "POST" | "DELETE";
  key: K;
  body?: string;
};

export async function readIntegrationRouteState<T, K extends string>(
  route: string,
  options: ReadRouteOptions<K>
) {
  const response = await fetch(route, {
    method: options.method ?? "GET",
    cache: options.method === "GET" ? "no-store" : undefined,
    credentials: "same-origin",
    headers: options.body ? { "content-type": "application/json" } : undefined,
    body: options.body
  });
  const payload = (await response.json()) as IntegrationRoutePayload<T, K>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.ok ? `${route}-failed` : payload.error);
  }

  return payload[options.key];
}

export function createIntegrationRouteReader<T, K extends string>(
  route: string,
  key: K
) {
  return {
    load() {
      return readIntegrationRouteState<T, K>(route, { key });
    },
    post(body?: string) {
      return readIntegrationRouteState<T, K>(route, {
        method: "POST",
        key,
        body
      });
    },
    remove() {
      return readIntegrationRouteState<T, K>(route, {
        method: "DELETE",
        key
      });
    }
  };
}
