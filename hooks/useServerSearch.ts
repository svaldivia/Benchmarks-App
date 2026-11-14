import { useDeferredValue, useState } from "react";

import { useDebouncedValue } from "./useDebouncedValue";

/** Keystrokes to wait out before asking Firestore. */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * State for a search box whose results come from the server.
 *
 * - `text` is what the input shows and updates on every keystroke.
 * - `term` is what to query with: debounced, so typing "squat" is one
 *   request rather than five, and deferred, so when the new query suspends
 *   React keeps the previous results on screen instead of falling back to the
 *   boundary's spinner.
 * - `isSearching` is true from the first keystroke until the matching
 *   results render.
 */
export function useServerSearch() {
  const [text, setText] = useState("");
  const debounced = useDebouncedValue(text, SEARCH_DEBOUNCE_MS);
  const term = useDeferredValue(debounced);

  return {
    text,
    setText,
    term,
    isSearching: text !== debounced || debounced !== term,
  };
}
