import { queryOptions } from "@tanstack/react-query";

import { getEntries, getEntryById } from "./entries";
import { getExerciseById, getExercises } from "./exercises";
import { Entry, EntryId, Exercise } from "./types";

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
 * How long fetched data counts as fresh. Screens stay mounted behind the tab
 * bar, so this is what stops a tab switch from re-hitting Firestore for data
 * fetched moments ago. Shared by the QueryClient defaults and the focus
 * refresh in hooks/useRefreshOnFocus.ts — they have to agree.
 */
export const QUERY_STALE_TIME = 30_000;

/**
 * Module-level constants so the identities stay stable across renders — these
 * are used as effect dependencies.
 */
export const queryKeys = {
  entries: ["entries"] as const,
  exercises: ["exercises"] as const,
  // Nested under `entries` so invalidating the list also refreshes any open
  // detail view.
  entryDetail: (entryId: EntryId) => ["entries", entryId, "detail"] as const,
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

export type EntryDetail = (Entry & { exercise: Exercise }) | null;

async function fetchEntryDetail(entryId: EntryId): Promise<EntryDetail> {
  const entry = await getEntryById(entryId);
  if (!entry) return null;
  const exercise = await getExerciseById(entry.exerciseId);
  return exercise ? { ...entry, exercise } : null;
}

export const entryDetailQuery = (entryId: EntryId) =>
  queryOptions({
    queryKey: queryKeys.entryDetail(entryId),
    queryFn: () => withTimeout("Entry", fetchEntryDetail(entryId)),
  });
