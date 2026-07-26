import { useFocusEffect } from "expo-router";
import { startTransition, useCallback, useRef, useState } from "react";

export const usePromise = <T,>(
  inputPromise: () => Promise<T>,
): [Promise<T>, () => void] => {
  // We need to cache the promise here so it doesn't get recreated on every render.
  const [promise, setPromise] = useState(() => inputPromise());
  const isFirstFocus = useRef(true);

  // Re-fetch on every focus except the first. Kept above the Suspense boundary
  // so this effect isn't torn down and re-run each time the child suspends.
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      setPromise(inputPromise());
    }, []),
  );

  const refreshPromise = useCallback(() => {
    startTransition(() => setPromise(inputPromise()));
  }, []);

  return [promise, refreshPromise];
};
