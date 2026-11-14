import { queryOptions, type QueryKey } from "@tanstack/react-query";

import {
  EntryWithId,
  getEntries,
  getEntryById,
  searchEntries,
} from "./entries";
import {
  ExerciseWithId,
  getExerciseById,
  getExercises,
  searchExercises,
} from "./exercises";
import { toSearchTerm } from "./searchKeywords";
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

/**
 * Every key is scoped by uid. Two users on one device must never share a cache
 * entry, and `queryClient.clear()` on sign-out (see app/settings.tsx) is a
 * belt-and-braces second line rather than the only defence.
 */
export const queryKeys = {
  entries: (userId: string) => ["entries", userId] as const,
  exercises: (userId: string) => ["exercises", userId] as const,
  // Nested under the user's entries key so invalidating the list also
  // refreshes any open detail view.
  entryDetail: (userId: string, entryId: EntryId) =>
    ["entries", userId, entryId, "detail"] as const,
  // Also nested under the list keys, so a new entry or exercise invalidates
  // every cached search result along with the full list.
  entrySearch: (userId: string, term: string) =>
    ["entries", userId, "search", term] as const,
  exerciseSearch: (userId: string, term: string) =>
    ["exercises", userId, "search", term] as const,
};

export const entriesQuery = (userId: string) =>
  queryOptions({
    queryKey: queryKeys.entries(userId),
    queryFn: () => withTimeout("Entries", getEntries(userId)),
  });

export const exercisesQuery = (userId: string) =>
  queryOptions({
    queryKey: queryKeys.exercises(userId),
    queryFn: () => withTimeout("Exercises", getExercises(userId)),
  });

/**
 * Entries matching `rawTerm`, queried in Firestore. A blank term is the full
 * list and shares its cache entry with entriesQuery, so clearing the search
 * box shows the list instantly. Terms are normalized before keying, so "Squat"
 * and "squat " are one request.
 */
export const entrySearchQuery = (userId: string, rawTerm: string) => {
  const term = toSearchTerm(rawTerm);
  // Same key and fetcher as entriesQuery, typed with a general key so both
  // branches share one return type.
  return queryOptions<EntryWithId[], Error, EntryWithId[], QueryKey>(
    term
      ? {
          queryKey: queryKeys.entrySearch(userId, term),
          queryFn: () => withTimeout("Search", searchEntries(userId, term)),
        }
      : {
          queryKey: queryKeys.entries(userId),
          queryFn: () => withTimeout("Entries", getEntries(userId)),
        },
  );
};

/** Exercises matching `rawTerm`, queried in Firestore. See entrySearchQuery. */
export const exerciseSearchQuery = (userId: string, rawTerm: string) => {
  const term = toSearchTerm(rawTerm);
  return queryOptions<ExerciseWithId[], Error, ExerciseWithId[], QueryKey>(
    term
      ? {
          queryKey: queryKeys.exerciseSearch(userId, term),
          queryFn: () => withTimeout("Search", searchExercises(userId, term)),
        }
      : {
          queryKey: queryKeys.exercises(userId),
          queryFn: () => withTimeout("Exercises", getExercises(userId)),
        },
  );
};

export type EntryDetail = (Entry & { exercise: Exercise }) | null;

async function fetchEntryDetail(
  entryId: EntryId,
  userId: string,
): Promise<EntryDetail> {
  const entry = await getEntryById(entryId, userId);
  if (!entry) return null;
  const exercise = await getExerciseById(entry.exerciseId, userId);
  return exercise ? { ...entry, exercise } : null;
}

export const entryDetailQuery = (userId: string, entryId: EntryId) =>
  queryOptions({
    queryKey: queryKeys.entryDetail(userId, entryId),
    queryFn: () => withTimeout("Entry", fetchEntryDetail(entryId, userId)),
  });
