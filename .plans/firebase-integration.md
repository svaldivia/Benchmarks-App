# Firebase Integration Plan

This plan outlines the steps to integrate Firebase into the application to store and manage `entries` and `exercises` data.

## Phase 1: Setup and Configuration

- [x] **Step 1: Firebase Project Setup**

  - Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/).
  - Enable Firestore database.
  - Set up Firestore security rules for development (allow read/write).
  - Obtain Firebase configuration credentials for your web app.

- [x] **Step 2: Install Firebase Dependencies**

  - Run `npx expo install firebase` to add the Firebase SDK to the project.

- [x] **Step 3: Configure Firebase in the App**
  - Create a new configuration file (e.g., `firebaseConfig.ts`).
  - Add your Firebase project credentials to this file.
  - Initialize Firebase in the app's root layout (`app/_layout.tsx`).

## Phase 2: Data Migration and Service Layer

- [x] **Step 4: Model Data for Firestore**

  - Review current `Entry` and `Exercise` types.
  - Adapt models for Firestore (e.g., `createdDate` should be a Firestore `Timestamp`).
  - The existing structures are a good starting point for our Firestore collections.

- [x] **Step 5: Create Data Service for Exercises**

  - Create a new file for exercise-related Firestore functions (e.g., `data/firebase/exercises.ts`).
  - Implement `getExercises` to fetch all exercises from a 'exercises' collection.
  - Implement `addExercise` to add a new exercise document.
  - Implement `getExercise` to fetch a single exercise by its ID.

- [x] **Step 6: Create Data Service for Entries**
  - Create a new file for entry-related Firestore functions (e.g., `data/firebase/entries.ts`).
  - Implement `getEntries` to fetch all entries from an 'entries' collection.
  - Implement `addEntry` to add a new entry document.
  - Implement `getEntry` to fetch a single entry by its ID.

## Phase 3: UI Integration

- [x] **Step 7: Update Exercise-related Screens**

  - Refactor `app/(tabs)/exercises.tsx` to fetch data using the new `getExercises` function.
  - If there's a screen to add exercises, update it to use `addExercise`.

- [x] **Step 8: Update Entry-related Screens**
  - Refactor `app/(tabs)/entries.tsx` to use the new `getEntries` function.
  - Refactor `app/(tabs)/new-entry.tsx` to save new entries using `addEntry`.
  - Refactor `app/entry-detail.tsx` to fetch data using `getEntry` or receive it via navigation props.

## Phase 4: Data Seeding and Cleanup

- [ ] **Step 9: Seed Initial Data (Optional but Recommended)**

  - Create a one-time script to migrate the initial data from `data/exercises.ts` and `data/entries.ts` into your Firestore database. This ensures you have data to work with during development.

- [x] **Step 10: Cleanup Old Data Files**
  - Once all parts of the app are successfully using Firebase for data, delete the mock data files: `data/entries.ts` and `data/exercises.ts`.
  - Remove any related import statements and old data-handling logic.
