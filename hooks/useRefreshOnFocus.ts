import { QUERY_STALE_TIME } from "@/data/firebase/queries";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";

/**
 * Refetch the given queries when a screen regains focus, but only the ones that
 * have gone stale (see `staleTime` in app/_layout.tsx). Flipping between tabs no
 * longer re-hits Firestore on every tap, and a refetch that does run is a
 * background one: `useSuspenseQuery` keeps the data it already has, so the
 * screen never drops back to its spinner.
 *
 * Call this from the screen component *above* the Suspense boundary so the
 * effect isn't torn down while the content below is suspended.
 */
export function useRefreshOnFocus(...queryKeys: QueryKey[]) {
  const queryClient = useQueryClient();

  // The keys are read when the effect fires, not when it is created, so a
  // ref keeps the focus callback stable (an unstable useFocusEffect callback
  // re-fires on every render).
  const keysRef = useRef(queryKeys);
  useEffect(() => {
    keysRef.current = queryKeys;
  });

  useFocusEffect(
    useCallback(() => {
      const cache = queryClient.getQueryCache();

      for (const queryKey of keysRef.current) {
        for (const query of cache.findAll({ queryKey, type: "active" })) {
          // Staleness is checked here rather than with refetchQueries'
          // `stale: true` filter: that filter reads the observer's last
          // computed result, which keeps reporting "fresh" long after
          // staleTime has passed. isStaleByTime derives it from
          // dataUpdatedAt, so it doesn't drift.
          if (!query.isStaleByTime(QUERY_STALE_TIME)) continue;

          // A query still on its first fetch has no data yet, so it counts as
          // stale — but the refetch is deduped into that in-flight request
          // rather than restarting it.
          void queryClient.refetchQueries({
            queryKey: query.queryKey,
            exact: true,
          });
        }
      }
    }, [queryClient]),
  );
}
