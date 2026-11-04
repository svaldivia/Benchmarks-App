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

/**
 * Sentinel `ownerId` for the built-in movement catalog. Every user can read
 * these; nobody can write them (enforced in firestore.rules, not here).
 */
export const GLOBAL_OWNER = 'global';

export type Exercise = {
  name: string;
  tags: ExerciseTag[];
  link: string;
  description: string;
  /** `GLOBAL_OWNER` for built-ins, otherwise the creating user's uid. */
  ownerId: string;
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
  /** Owning user's uid. Entries are never shared. */
  userId: string;
};

export type EntryId = string;
