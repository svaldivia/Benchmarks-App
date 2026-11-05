import { Timestamp, type FirestoreError } from 'firebase/firestore';

export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

/**
 * firestore.rules denies a document read the caller does not own, and also a
 * read of a missing document (`resource` is null there). Single-document
 * getters treat this as "not found", so a guessed ID behaves the same whether
 * it belongs to someone else or does not exist.
 *
 * Matches on `code` rather than `instanceof FirestoreError`: on web the thrown
 * error is not an instance of the class `firebase/firestore` exports.
 */
export const isPermissionDenied = (error: unknown): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as Partial<FirestoreError>).code === 'permission-denied'
  );
};
