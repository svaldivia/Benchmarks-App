import { Timestamp } from 'firebase/firestore';

export type Exercise = {
  name: string;
  tags: string[];
  link: string;
  description: string;
};

export type ExerciseId = string;

export type Entry = {
  exerciseId: string;
  unit: string;
  value: number;
  repMax: number;
  createdDate: Timestamp;
  tags: string[];
  notes: string;
};

export type EntryId = string;

export const commonExerciseTags = [
  'compound',
  'isolation',
  'upper body',
  'lower body',
  'full body',
  'strength',
  'explosive',
  'cardio',
  'mobility',
  'core',
];
