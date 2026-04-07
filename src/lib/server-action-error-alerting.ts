import "server-only";

import { notifyServerActionErrorAlert } from "@/lib/error-alerts/reporters";

type ServerActionOnError<TArgs extends unknown[], TResult> = (
  error: unknown,
  ...args: TArgs
) => TResult | Promise<TResult>;

type ServerActionOptions<TArgs extends unknown[], TResult> = {
  actionId: string;
  onError: ServerActionOnError<TArgs, TResult>;
  shouldReport?: (error: unknown) => boolean;
};

type ServerAction<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;

function swallowAlertFailure<T>(promise: Promise<T> | T) {
  void Promise.resolve(promise).catch(() => {});
}

export function withServerActionErrorAlerting<TArgs extends unknown[], TResult>(
  action: ServerAction<TArgs, TResult>,
  options: ServerActionOptions<TArgs, TResult>
): ServerAction<TArgs, TResult> {
  return (async (...args: TArgs) => {
    try {
      return await action(...args);
    } catch (error) {
      if (options.shouldReport?.(error) ?? true) {
        swallowAlertFailure(
          notifyServerActionErrorAlert({
            actionId: options.actionId,
            error
          })
        );
      }

      return options.onError(error, ...args);
    }
  }) as ServerAction<TArgs, TResult>;
}
