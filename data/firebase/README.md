# Firebase Data Layer

This directory contains the Firebase data services for managing exercises and entries in Firestore.

## Structure

```
data/firebase/
├── index.ts        # Main exports
├── types.ts        # Firebase-compatible type definitions
├── exercises.ts    # Exercise CRUD operations
├── entries.ts      # Entry CRUD operations
└── README.md       # This file
```

## Types

### Exercise

- `name: string` - Name of the exercise
- `tags: string[]` - Array of tags for categorization
- `link: string` - Optional link to exercise instructions/video
- `description: string` - Exercise description

### Entry

- `exerciseId: string` - Reference to exercise document ID
- `unit: string` - Unit of measurement (lbs, kg, etc.)
- `value: number` - The weight/measurement value
- `repMax: number` - Number of reps performed
- `createdDate: Timestamp` - Firestore timestamp of entry creation
- `tags: string[]` - Array of tags for the entry
- `notes: string` - Additional notes about the entry

## Usage

```typescript
import {
  getExercises,
  addExercise,
  getEntries,
  addEntry,
  dateToTimestamp,
} from '@/data/firebase';

// Get all exercises
const exercises = await getExercises();

// Add a new exercise
const exerciseId = await addExercise({
  name: 'Bench Press',
  tags: ['compound', 'upper body'],
  link: '',
  description: 'Chest exercise...',
});

// Add a new entry
const entryId = await addEntry({
  exerciseId: 'some-exercise-id',
  unit: 'lbs',
  value: 185,
  repMax: 5,
  createdDate: dateToTimestamp(new Date()),
  tags: ['pr'],
  notes: 'New personal record!',
});
```

## Collections

- **exercises**: Stores exercise definitions
- **entries**: Stores workout entries/records

Each document is automatically assigned a unique ID by Firestore.
