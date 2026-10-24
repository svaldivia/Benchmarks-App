import { queryOptions } from "@tanstack/react-query";

import { getEntries } from "./entries";
import { getExercises } from "./exercises";

/**
 * Firestore reads resolve through a long-lived stream. When that stream stalls
 * (flaky network, a backgrounded browser tab) `getDocs` neither resolves nor
 * rejects, and a promise that never settles parks a Suspense boundary on its
 * fallback with no way out — the infinite spinner. Racing every read against a
 * deadline turns that dead end into an error the boundary can retry.
 */
const READ_TIMEOUT_MS = 15_000;

function withTimeout<T>(label: string, promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} took too long to load. Check your connection.`)),
      READ_TIMEOUT_MS,
    );
  });

  return Promise.race([promise, deadline]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * How long fetched data counts as fresh, and the app's only freshness knob.
 * Tab screens stay mounted, so nothing refetches while you move between them;
 * a stale query is refreshed when the browser tab or app regains focus, when
 * the network reconnects, or when a mutation invalidates it.
 *
 * Keep this at or above one second: React Query clamps suspense queries to a
 * 1s minimum (`ensureSuspenseTimers`), so a smaller value here would silently
 * not be the value the observer uses.
 */
export const QUERY_STALE_TIME = 30_000;
export const queryKeys = {
  entries: ["entries"] as const,
  exercises: ["exercises"] as const,
};

export const entriesQuery = () =>
  queryOptions({
    queryKey: queryKeys.entries,
    queryFn: () => withTimeout("Entries", getEntries()),
  });

export const exercisesQuery = () =>
  queryOptions({
    queryKey: queryKeys.exercises,
    queryFn: () => withTimeout("Exercises", getExercises()),
  });
