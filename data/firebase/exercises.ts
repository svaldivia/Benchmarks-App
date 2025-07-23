import { db } from '@/data/firebase/firebaseConfig';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { Exercise, ExerciseId } from './types';

const EXERCISES_COLLECTION = 'exercises';

export type ExerciseWithId = { id: ExerciseId } & Exercise;

export const getExercises = async (): Promise<ExerciseWithId[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, EXERCISES_COLLECTION));

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
  exerciseId: ExerciseId
): Promise<Exercise | null> => {
  try {
    const docRef = doc(db, EXERCISES_COLLECTION, exerciseId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Exercise;
    } else {
      return null;
    }
  } catch (error) {
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
