import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";
import { notifyHttpErrorResponse } from "@/lib/error-alerts/reporters";

type RouteAlertContext = {
  routeId: string;
};

type AppRouteHandler<TArgs extends unknown[] = unknown[]> = (
  ...args: TArgs
) => Response | Promise<Response>;

const routeAlertContextStore = new AsyncLocalStorage<RouteAlertContext>();

function isRequestLike(value: unknown): value is Request {
  return typeof Request !== "undefined" && value instanceof Request;
}

function extractRequest(args: unknown[]) {
  return args.find(isRequestLike) ?? null;
}

async function readResponseBody(response: Response) {
  if (response.bodyUsed) {
    return null;
  }

  try {
    const text = await response.clone().text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}

function swallowAlertFailure<T>(promise: Promise<T> | T) {
  void Promise.resolve(promise).catch(() => {});
}

export function isRouteErrorAlertingContextActive() {
  return Boolean(routeAlertContextStore.getStore());
}

export function withRouteErrorAlerting<TArgs extends unknown[]>(
  handler: AppRouteHandler<TArgs>,
  routeId: string
): AppRouteHandler<TArgs> {
  return (async (...args: TArgs) => {
    return routeAlertContextStore.run({ routeId }, async () => {
      const request = extractRequest(args);

      try {
        const response = await handler(...args);

        if (response instanceof Response && response.status >= 400) {
          swallowAlertFailure(
            readResponseBody(response).then((responseBody) =>
              notifyHttpErrorResponse({
                status: response.status,
                responseBody,
                request,
                source: routeId
              })
            )
          );
        }

        return response;
      } catch (error) {
        swallowAlertFailure(
          notifyHttpErrorResponse({
            status: 500,
            error,
            request,
            source: routeId
          })
        );
        throw error;
      }
    });
  }) as AppRouteHandler<TArgs>;
}
