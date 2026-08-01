/**
 * Firestore reads do not fail fast. When the connection stalls the web SDK
 * keeps retrying in the background instead of rejecting, so a read can stay
 * pending indefinitely. Under Suspense that surfaces as a spinner that never
 * resolves, with no way out except navigating away.
 *
 * Racing every read against a deadline turns that dead end into a rejection an
 * error boundary can catch and offer a retry for.
 */
export const FETCH_TIMEOUT_MS = 15000;

export class FetchTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} timed out after ${ms / 1000}s`);
    this.name = "FetchTimeoutError";
  }
}

export function withTimeout<T>(
  work: Promise<T>,
  label: string,
  ms: number = FETCH_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;

  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new FetchTimeoutError(label, ms)), ms);
  });

  return Promise.race([work, deadline]).finally(() => clearTimeout(timer));
}
