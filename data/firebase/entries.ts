import { db } from "@/data/firebase/firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QuerySnapshot,
  updateDoc,
  where,
} from "firebase/firestore";
import { isPermissionDenied } from "./helpers";
import { entrySearchKeywords, toSearchTerm } from "./searchKeywords";
import { Entry, EntryId, Exercise, ExerciseId } from "./types";

const ENTRIES_COLLECTION = "entries";
const EXERCISES_COLLECTION = "exercises";

/** Upper bound on search hits, so a one-letter term cannot pull every entry. */
const SEARCH_LIMIT = 50;

export type EntryWithId = { id: EntryId } & Entry;

/** What a caller supplies; `searchKeywords` is derived on write. */
export type NewEntry = Omit<Entry, "searchKeywords">;

export const getEntries = async (userId: string): Promise<EntryWithId[]> => {
  try {
    // Composite query (equality + orderBy) — needs the userId/createdDate
    // index declared in firestore.indexes.json.
    const q = query(
      collection(db, ENTRIES_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdDate", "desc"),
    );
    const querySnapshot = await getDocs(q);
    const entries = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Entry),
    }));

    return entries;
  } catch (error) {
    console.error("Error getting entries:", error);
    throw new Error("Failed to fetch entries");
  }
};

/**
 * Server-side search: matches `searchKeywords` (exercise name, tags and notes
 * prefixes) in Firestore rather than filtering a downloaded list. Needs the
 * userId/searchKeywords/createdDate index in firestore.indexes.json.
 */
export const searchEntries = async (
  userId: string,
  rawTerm: string,
): Promise<EntryWithId[]> => {
  const term = toSearchTerm(rawTerm);
  if (!term) return getEntries(userId);

  try {
    const q = query(
      collection(db, ENTRIES_COLLECTION),
      where("userId", "==", userId),
      where("searchKeywords", "array-contains", term),
      orderBy("createdDate", "desc"),
      limit(SEARCH_LIMIT),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Entry),
    }));
  } catch (error) {
    console.error("Error searching entries:", error);
    throw new Error("Failed to search entries");
  }
};

export const getEntriesForExercise = async (
  exerciseId: ExerciseId,
  userId: string,
): Promise<Record<EntryId, Entry>> => {
  try {
    const q = query(
      collection(db, ENTRIES_COLLECTION),
      where("userId", "==", userId),
      where("exerciseId", "==", exerciseId),
      orderBy("createdDate", "desc"),
    );
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    const entries: Record<EntryId, Entry> = querySnapshot.docs.reduce(
      (result, doc) => {
        result[doc.id] = doc.data() as Entry;
        return result;
      },
      {} as Record<EntryId, Entry>,
    );

    return entries;
  } catch (error) {
    console.error("Error getting entries for exercise:", error);
    throw new Error(`Failed to fetch entries for exercise: ${exerciseId}`);
  }
};

export const getEntryById = async (
  entryId: EntryId,
  userId: string,
): Promise<Entry | null> => {
  try {
    const docRef = doc(db, ENTRIES_COLLECTION, entryId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    // A document read bypasses any `where` clause, so ownership is checked
    // here as well. Reported as "not found" rather than "forbidden" so a
    // guessed ID cannot confirm that someone else's entry exists.
    const entry = docSnap.data() as Entry;
    return entry.userId === userId ? entry : null;
  } catch (error) {
    if (isPermissionDenied(error)) return null;
    console.error("Error getting entry:", error);
    throw new Error(`Failed to fetch entry with ID: ${entryId}`);
  }
};

export const addEntry = async ({
  entry,
  exerciseName,
}: {
  entry: NewEntry;
  /** Denormalized into `searchKeywords` so the entry is findable by exercise. */
  exerciseName: string;
}): Promise<EntryId> => {
  try {
    const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), {
      ...entry,
      searchKeywords: entrySearchKeywords({ ...entry, exerciseName }),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding entry:", error);
    throw new Error("Failed to add entry");
  }
};

export const updateEntry = async (
  entryId: EntryId,
  entry: Partial<NewEntry>,
): Promise<void> => {
  try {
    const docRef = doc(db, ENTRIES_COLLECTION, entryId);
    const touchesSearch =
      "exerciseId" in entry || "tags" in entry || "notes" in entry;

    if (!touchesSearch) {
      await updateDoc(docRef, entry);
      return;
    }

    // Keywords cover several fields, so rebuild them from the merged result.
    const current = (await getDoc(docRef)).data() as Entry;
    const merged = { ...current, ...entry };
    const exerciseSnap = await getDoc(
      doc(db, EXERCISES_COLLECTION, merged.exerciseId),
    );
    const exerciseName = (exerciseSnap.data() as Exercise | undefined)?.name;
    await updateDoc(docRef, {
      ...entry,
      searchKeywords: entrySearchKeywords({
        exerciseName: exerciseName ?? "",
        tags: merged.tags ?? [],
        notes: merged.notes ?? "",
      }),
    });
  } catch (error) {
    console.error("Error updating entry:", error);
    throw new Error(`Failed to update entry with ID: ${entryId}`);
  }
};

export const deleteEntry = async (entryId: EntryId): Promise<void> => {
  try {
    const docRef = doc(db, ENTRIES_COLLECTION, entryId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting entry:", error);
    throw new Error(`Failed to delete entry with ID: ${entryId}`);
  }
};
