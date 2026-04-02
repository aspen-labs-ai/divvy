import type { Trip, Member, Expense, TripIndex } from "./types";
import { getNextAvatarColor } from "./utils";

const TRIP_PREFIX = "divvy_trip_";
const TRIPS_INDEX_KEY = "divvy_trips";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function generateTripCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function tripKey(code: string): string {
  return `${TRIP_PREFIX}${code.toUpperCase()}`;
}

export function getTrip(code: string): Trip | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(tripKey(code));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Trip;
  } catch {
    return null;
  }
}

function saveTrip(trip: Trip): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(tripKey(trip.code), JSON.stringify(trip));
}

export function createTrip(name: string): Trip {
  let code = generateTripCode();
  while (getTrip(code) !== null) {
    code = generateTripCode();
  }
  const trip: Trip = {
    id: generateId(),
    code,
    name: name.trim(),
    members: [],
    expenses: [],
    created_at: new Date().toISOString(),
  };
  saveTrip(trip);
  upsertTripIndex({ code, name: trip.name, created_at: trip.created_at });
  return trip;
}

function upsertTripIndex(entry: TripIndex): void {
  if (typeof window === "undefined") return;
  const existing = getRecentTrips().filter((t) => t.code !== entry.code);
  localStorage.setItem(
    TRIPS_INDEX_KEY,
    JSON.stringify([entry, ...existing])
  );
}

export function getRecentTrips(): TripIndex[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(TRIPS_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TripIndex[];
  } catch {
    return [];
  }
}

export function addMember(trip: Trip, name: string): Trip {
  const member: Member = {
    id: generateId(),
    name: name.trim(),
    avatar_color: getNextAvatarColor(trip.members),
  };
  const updated = { ...trip, members: [...trip.members, member] };
  saveTrip(updated);
  return updated;
}

export function deleteMember(trip: Trip, memberId: string): Trip {
  const updated: Trip = {
    ...trip,
    members: trip.members.filter((m) => m.id !== memberId),
    expenses: trip.expenses.filter(
      (e) =>
        e.paid_by !== memberId && !e.split_between.includes(memberId)
    ),
  };
  saveTrip(updated);
  return updated;
}

export function addExpense(
  trip: Trip,
  description: string,
  amount: number,
  paid_by: string,
  split_between: string[]
): Trip {
  const expense: Expense = {
    id: generateId(),
    description: description.trim(),
    amount,
    paid_by,
    split_between,
    created_at: new Date().toISOString(),
  };
  const updated = { ...trip, expenses: [...trip.expenses, expense] };
  saveTrip(updated);
  return updated;
}

export function deleteExpense(trip: Trip, expenseId: string): Trip {
  const updated = {
    ...trip,
    expenses: trip.expenses.filter((e) => e.id !== expenseId),
    settled_splits: (trip.settled_splits ?? []).filter(
      (key) => !key.startsWith(`${expenseId}:`)
    ),
  };
  saveTrip(updated);
  return updated;
}

/** Mark or unmark an individual split as paid */
export function toggleSettledSplit(
  trip: Trip,
  expenseId: string,
  memberId: string
): Trip {
  const key = `${expenseId}:${memberId}`;
  const current = trip.settled_splits ?? [];
  const settled = current.includes(key)
    ? current.filter((k) => k !== key)
    : [...current, key];
  const updated = { ...trip, settled_splits: settled };
  saveTrip(updated);
  return updated;
}

export function isSettledSplit(
  trip: Trip,
  expenseId: string,
  memberId: string
): boolean {
  return (trip.settled_splits ?? []).includes(`${expenseId}:${memberId}`);
}

/** Mark or unmark a settlement between two members */
export function toggleSettlement(
  trip: Trip,
  fromId: string,
  toId: string
): Trip {
  const key = `${fromId}>${toId}`;
  const current = trip.settled_settlements ?? [];
  const settlements = current.includes(key)
    ? current.filter((k) => k !== key)
    : [...current, key];
  const updated = { ...trip, settled_settlements: settlements };
  saveTrip(updated);
  return updated;
}

export function isSettledSettlement(
  trip: Trip,
  fromId: string,
  toId: string
): boolean {
  return (trip.settled_settlements ?? []).includes(`${fromId}>${toId}`);
}
