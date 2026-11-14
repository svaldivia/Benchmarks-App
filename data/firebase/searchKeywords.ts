/**
 * Firestore has no full-text search, so search is done against a precomputed
 * `searchKeywords` array stored on each document and matched server-side with
 * `array-contains`. The array holds every prefix of every word (and of the
 * whole phrase), lowercased and accent-stripped, so typing "squ", "back sq" or
 * "squat" all hit a "Back Squat" document without reading anything else.
 *
 * This file has no imports on purpose: scripts/backfill-search-keywords.ts
 * runs it directly under Node, outside the Metro bundle.
 */

/** Longest prefix stored. Search terms are truncated to the same length. */
export const MAX_KEYWORD_LENGTH = 24;

/** Cap per document; Firestore indexes every array element. */
const MAX_KEYWORDS = 300;

export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The value queried with `array-contains`, or null when there is nothing to search. */
export function toSearchTerm(input: string): string | null {
  const term = normalizeSearchText(input).slice(0, MAX_KEYWORD_LENGTH).trim();
  return term.length > 0 ? term : null;
}

function addPrefixes(into: Set<string>, text: string) {
  const limit = Math.min(text.length, MAX_KEYWORD_LENGTH);
  for (let i = 1; i <= limit; i++) {
    const prefix = text.slice(0, i).trim();
    if (prefix) into.add(prefix);
  }
}

/**
 * Builds the keyword array for a set of searchable strings. Earlier inputs win
 * when the cap is reached, so pass the most important text (a name) first.
 */
export function buildSearchKeywords(
  ...sources: (string | null | undefined)[]
): string[] {
  const keywords = new Set<string>();

  for (const source of sources) {
    if (!source) continue;
    const phrase = normalizeSearchText(source);
    if (!phrase) continue;

    // Prefixes of the phrase starting at each word: i = 0 is the whole
    // phrase ("back sq" matches "Back Squat"), later ones let a term start
    // mid-phrase ("squat" and "squat to" match "Back Squat to Box").
    const words = phrase.split(" ");
    for (let i = 0; i < words.length; i++) {
      addPrefixes(keywords, words.slice(i).join(" "));
    }
  }

  return Array.from(keywords).slice(0, MAX_KEYWORDS);
}

export function exerciseSearchKeywords(exercise: {
  name: string;
  tags: readonly string[];
}): string[] {
  return buildSearchKeywords(exercise.name, ...exercise.tags);
}

/**
 * Entries have no name of their own, so the exercise name is denormalized in.
 * Notes go last: they are the least specific and the first dropped at the cap.
 */
export function entrySearchKeywords(entry: {
  exerciseName: string;
  tags: readonly string[];
  notes: string;
}): string[] {
  return buildSearchKeywords(entry.exerciseName, ...entry.tags, entry.notes);
}
