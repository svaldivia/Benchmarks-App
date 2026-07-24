import { Timestamp } from 'firebase/firestore';

export const commonExerciseTags = [
  'Main',
  'Cardio',
  'Olympic Lift',
  'Workout',
] as const;

export type ExerciseTag = (typeof commonExerciseTags)[number];

export const commonEntryTags = [
  'pr',
  'strength',
  'technique',
  'explosive',
  'test',
  '1rm',
] as const;

export type EntryTag = (typeof commonEntryTags)[number];

export type Exercise = {
  name: string;
  tags: ExerciseTag[];
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
  tags: EntryTag[];
  notes: string;
};

export type EntryId = string;
