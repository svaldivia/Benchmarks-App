import { useFocusEffect } from "expo-router";
import { startTransition, useCallback, useRef, useState } from "react";

export const usePromise = <T,>(
  inputPromise: () => Promise<T>,
): [Promise<T>, () => void] => {
  // Hold the latest fetcher in a ref: the callbacks below must keep a stable
  // identity (an unstable useFocusEffect callback re-fires on every render),
  // but they still need to read current props/params when they run.
  const inputPromiseRef = useRef(inputPromise);
  inputPromiseRef.current = inputPromise;

  // We need to cache the promise here so it doesn't get recreated on every render.
  const [promise, setPromise] = useState(() => inputPromise());
  const isFirstFocus = useRef(true);

  const refreshPromise = useCallback(() => {
    // In a transition, so the screen that is already rendered stays on screen
    // while the new data loads. Without this, replacing the promise re-suspends
    // the child and React swaps the whole view out for the Suspense fallback,
    // flashing a spinner on every single navigation.
    startTransition(() => setPromise(inputPromiseRef.current()));
  }, []);

  // Re-fetch on every focus except the first. Kept above the Suspense boundary
  // so this effect isn't torn down and re-run each time the child suspends.
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refreshPromise();
    }, [refreshPromise]),
  );

  return [promise, refreshPromise];
};
