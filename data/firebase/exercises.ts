import { db } from '@/data/firebase/firebaseConfig';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { isPermissionDenied } from './helpers';
import { exerciseSearchKeywords, toSearchTerm } from './searchKeywords';
import { Exercise, ExerciseId, GLOBAL_OWNER } from './types';

const EXERCISES_COLLECTION = 'exercises';

export type ExerciseWithId = { id: ExerciseId } & Exercise;

/** What a caller supplies; `searchKeywords` is derived on write. */
export type NewExercise = Omit<Exercise, 'searchKeywords'>;

export const getExercises = async (
  userId: string
): Promise<ExerciseWithId[]> => {
  try {
    // The built-in catalog plus this user's own movements. Single-field `in`
    // with no orderBy, so no composite index is required.
    const q = query(
      collection(db, EXERCISES_COLLECTION),
      where('ownerId', 'in', [GLOBAL_OWNER, userId])
    );
    const querySnapshot = await getDocs(q);

    const exercises = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Exercise),
    }));

    return exercises;
  } catch (error) {
    console.error('Error getting exercises:', error);
    throw new Error('Failed to fetch exercises');
  }
};

/**
 * Server-side search over name and tag prefixes (`searchKeywords`), scoped to
 * the same owners as getExercises. Needs the ownerId/searchKeywords index in
 * firestore.indexes.json.
 */
export const searchExercises = async (
  userId: string,
  rawTerm: string
): Promise<ExerciseWithId[]> => {
  const term = toSearchTerm(rawTerm);
  if (!term) return getExercises(userId);

  try {
    const q = query(
      collection(db, EXERCISES_COLLECTION),
      where('ownerId', 'in', [GLOBAL_OWNER, userId]),
      where('searchKeywords', 'array-contains', term)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Exercise),
    }));
  } catch (error) {
    console.error('Error searching exercises:', error);
    throw new Error('Failed to search exercises');
  }
};

export const getExerciseById = async (
  exerciseId: ExerciseId,
  userId: string
): Promise<Exercise | null> => {
  try {
    const docRef = doc(db, EXERCISES_COLLECTION, exerciseId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    // A document read bypasses the `where` clause above, so readability is
    // re-checked here: built-ins are public, custom movements are not.
    const exercise = docSnap.data() as Exercise;
    const readable =
      exercise.ownerId === GLOBAL_OWNER || exercise.ownerId === userId;
    return readable ? exercise : null;
  } catch (error) {
    if (isPermissionDenied(error)) return null;
    console.error('Error getting exercise:', error);
    throw new Error(`Failed to fetch exercise with ID: ${exerciseId}`);
  }
};

export const addExercise = async (
  exercise: NewExercise
): Promise<ExerciseId> => {
  try {
    const docRef = await addDoc(collection(db, EXERCISES_COLLECTION), {
      ...exercise,
      searchKeywords: exerciseSearchKeywords(exercise),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding exercise:', error);
    throw new Error('Failed to add exercise');
  }
};

export const updateExercise = async (
  exerciseId: ExerciseId,
  exercise: Partial<NewExercise>
): Promise<void> => {
  try {
    const docRef = doc(db, EXERCISES_COLLECTION, exerciseId);

    if (!('name' in exercise) && !('tags' in exercise)) {
      await updateDoc(docRef, exercise);
      return;
    }

    // Rebuild keywords from the merged result. Entries keep the old name in
    // their own keywords until scripts/backfill-search-keywords.ts is re-run.
    const current = (await getDoc(docRef)).data() as Exercise;
    const merged = { ...current, ...exercise };
    await updateDoc(docRef, {
      ...exercise,
      searchKeywords: exerciseSearchKeywords(merged),
    });
  } catch (error) {
    console.error('Error updating exercise:', error);
    throw new Error(`Failed to update exercise with ID: ${exerciseId}`);
  }
};

export const deleteExercise = async (exerciseId: ExerciseId): Promise<void> => {
  try {
    const docRef = doc(db, EXERCISES_COLLECTION, exerciseId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting exercise:', error);
    throw new Error(`Failed to delete exercise with ID: ${exerciseId}`);
  }
};
