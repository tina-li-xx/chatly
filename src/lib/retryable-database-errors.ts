const RETRYABLE_DATABASE_CONNECTION_MESSAGES = [
  "Authentication timed out",
  "ECONNRESET",
  "Connection terminated unexpectedly",
  "Connection terminated due to connection timeout",
  "timeout exceeded when trying to connect"
];
const RETRYABLE_DATABASE_CONNECTION_CODES = [
  "ECONNRESET",
  "EPIPE",
  "ETIMEDOUT"
] as const;
const IGNORABLE_DATABASE_CLEANUP_MESSAGES = [
  "Client has encountered a connection error and is not queryable"
] as const;

function readErrorCode(error: unknown) {
  if (!error || typeof error !== "object") {
    return null;
  }

  const { code } = error as { code?: unknown };
  return typeof code === "string" ? code : null;
}

export function isRetryableDatabaseConnectionError(error: unknown) {
  const errorCode = readErrorCode(error);
  if (
    errorCode &&
    RETRYABLE_DATABASE_CONNECTION_CODES.includes(
      errorCode as (typeof RETRYABLE_DATABASE_CONNECTION_CODES)[number]
    )
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  return RETRYABLE_DATABASE_CONNECTION_MESSAGES.some((message) =>
    error.message.includes(message)
  );
}

export function isIgnorableDatabaseConnectionCleanupError(error: unknown) {
  if (isRetryableDatabaseConnectionError(error)) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  return IGNORABLE_DATABASE_CLEANUP_MESSAGES.some((message) =>
    error.message.includes(message)
  );
}

export async function withRetryableDatabaseConnectionRetry<T>(
  task: () => Promise<T>,
  maxAttempts = 2
) {
  let attempt = 0;

  while (true) {
    try {
      return await task();
    } catch (error) {
      attempt += 1;
      if (
        attempt >= maxAttempts ||
        !isRetryableDatabaseConnectionError(error)
      ) {
        throw error;
      }
    }
  }
}
