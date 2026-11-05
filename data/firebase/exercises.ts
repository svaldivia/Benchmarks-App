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
import { Exercise, ExerciseId, GLOBAL_OWNER } from './types';

const EXERCISES_COLLECTION = 'exercises';

export type ExerciseWithId = { id: ExerciseId } & Exercise;

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

export const addExercise = async (exercise: Exercise): Promise<ExerciseId> => {
  try {
    const docRef = await addDoc(collection(db, EXERCISES_COLLECTION), exercise);
    return docRef.id;
  } catch (error) {
    console.error('Error adding exercise:', error);
    throw new Error('Failed to add exercise');
  }
};

export const updateExercise = async (
  exerciseId: ExerciseId,
  exercise: Partial<Exercise>
): Promise<void> => {
  try {
    const docRef = doc(db, EXERCISES_COLLECTION, exerciseId);
    await updateDoc(docRef, exercise);
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
