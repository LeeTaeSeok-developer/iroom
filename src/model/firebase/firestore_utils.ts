import {
  Timestamp,
  FieldValue,
  serverTimestamp,
} from "firebase/firestore";

export type FirestoreDate =
  | Timestamp
  | Date
  | string
  | number
  | null
  | undefined;

export function toDate(value: FirestoreDate): Date | null {
  if (!value) return null;

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function toTimestampOrNull(
  value?: FirestoreDate
): Timestamp | null {
  const date = toDate(value);
  return date ? Timestamp.fromDate(date) : null;
}

export function serverTime(): FieldValue {
  return serverTimestamp();
}