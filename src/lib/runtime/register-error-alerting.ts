import "server-only";

import {
  notifyProcessErrorAlert,
  notifyServerLogAlert
} from "@/lib/error-alerts/reporters";
import { isErrorAlertDispatching } from "@/lib/error-alerts/delivery";
import { isRouteErrorAlertingContextActive } from "@/lib/route-error-alerting";

type ErrorAlertRuntimeStore = typeof globalThis & {
  __chattingServerErrorAlertingInstalled?: boolean;
};

export function registerServerErrorAlerting() {
  const store = globalThis as ErrorAlertRuntimeStore;
  if (store.__chattingServerErrorAlertingInstalled) {
    return;
  }

  store.__chattingServerErrorAlertingInstalled = true;

  const originalConsoleError = console.error.bind(console);

  console.error = (...args: unknown[]) => {
    originalConsoleError(...args);

    if (
      process.env.NODE_ENV === "test" ||
      isErrorAlertDispatching() ||
      isRouteErrorAlertingContextActive()
    ) {
      return;
    }

    void notifyServerLogAlert(args, "console.error");
  };

  process.on("uncaughtException", (error) => {
    void notifyProcessErrorAlert("uncaughtException", error);
  });

  process.on("unhandledRejection", (reason) => {
    void notifyProcessErrorAlert("unhandledRejection", reason);
  });
}
