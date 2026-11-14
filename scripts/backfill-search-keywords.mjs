// Writes `searchKeywords` onto every existing exercise and entry, so documents
// created before search existed show up in it. Safe to re-run: keywords are
// recomputed from the current fields each time (re-run after renaming an
// exercise, since entries carry a copy of its name).
//
// Uses the Admin SDK because the built-in catalog (ownerId "global") is not
// writable from the client by design (see firestore.rules).
//
// Usage (Node 22.18+, which runs the imported .ts file natively):
//   yarn add -D firebase-admin
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
//     node scripts/backfill-search-keywords.mjs [--dry-run]

import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import {
  entrySearchKeywords,
  exerciseSearchKeywords,
} from "../data/firebase/searchKeywords.ts";

const PROJECT_ID = "fit-benchmark-app";
const BATCH_SIZE = 400; // Firestore caps a batch at 500 writes.
const dryRun = process.argv.includes("--dry-run");

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const db = getFirestore();

const sameKeywords = (a = [], b) =>
  a.length === b.length && a.every((k, i) => k === b[i]);

async function writeAll(updates) {
  if (dryRun) return;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = db.batch();
    for (const { ref, searchKeywords } of updates.slice(i, i + BATCH_SIZE)) {
      batch.update(ref, { searchKeywords });
    }
    await batch.commit();
  }
}

const exercisesSnap = await db.collection("exercises").get();
const exerciseNames = new Map();
const exerciseUpdates = [];
for (const doc of exercisesSnap.docs) {
  const data = doc.data();
  exerciseNames.set(doc.id, data.name ?? "");
  const searchKeywords = exerciseSearchKeywords({
    name: data.name ?? "",
    tags: data.tags ?? [],
  });
  if (!sameKeywords(data.searchKeywords, searchKeywords)) {
    exerciseUpdates.push({ ref: doc.ref, searchKeywords });
  }
}
await writeAll(exerciseUpdates);
console.log(
  `exercises: ${exerciseUpdates.length}/${exercisesSnap.size} updated`
);

const entriesSnap = await db.collection("entries").get();
const entryUpdates = [];
for (const doc of entriesSnap.docs) {
  const data = doc.data();
  const searchKeywords = entrySearchKeywords({
    exerciseName: exerciseNames.get(data.exerciseId) ?? "",
    tags: data.tags ?? [],
    notes: data.notes ?? "",
  });
  if (!sameKeywords(data.searchKeywords, searchKeywords)) {
    entryUpdates.push({ ref: doc.ref, searchKeywords });
  }
}
await writeAll(entryUpdates);
console.log(`entries: ${entryUpdates.length}/${entriesSnap.size} updated`);
if (dryRun) console.log("(dry run: nothing written)");
