import { Timestamp } from 'firebase/firestore';

export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};
