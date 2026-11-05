import { db } from "@/data/firebase/firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  orderBy,
  query,
  QuerySnapshot,
  updateDoc,
  where,
} from "firebase/firestore";
import { isPermissionDenied } from "./helpers";
import { Entry, EntryId, ExerciseId } from "./types";

const ENTRIES_COLLECTION = "entries";

export type EntryWithId = { id: EntryId } & Entry;

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

export const addEntry = async (entry: Entry): Promise<EntryId> => {
  try {
    const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), entry);
    return docRef.id;
  } catch (error) {
    console.error("Error adding entry:", error);
    throw new Error("Failed to add entry");
  }
};

export const updateEntry = async (
  entryId: EntryId,
  entry: Partial<Entry>,
): Promise<void> => {
  try {
    const docRef = doc(db, ENTRIES_COLLECTION, entryId);
    await updateDoc(docRef, entry);
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
