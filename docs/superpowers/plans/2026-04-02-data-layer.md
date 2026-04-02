# Data Layer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete data/logic layer for Divvy — Supabase client, TypeScript types, utilities, settlement algorithm, and React hooks.

**Architecture:** Five focused files in `src/lib/`, each with a single responsibility. Types flow from `types.ts` → consumed by `settlement.ts` and `hooks.ts`. Utils (`utils.ts`) and Supabase client (`supabase.ts`) are leaf dependencies with no internal imports.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, @supabase/supabase-js v2, nanoid, React hooks (useState/useEffect)

---

## Chunk 1: Foundation Files

### Task 1: Supabase Client (`src/lib/supabase.ts`)

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Create the Supabase client**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 2: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: PASS (types.ts will define Database once created)

---

### Task 2: TypeScript Types (`src/lib/types.ts`)

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Write all types matching DB schema**

```typescript
// src/lib/types.ts

// --- DB Row types ---
export interface Trip {
  id: string
  code: string
  name: string
  created_at: string
}

export interface Member {
  id: string
  trip_id: string
  name: string
  avatar_color: string
  created_at: string
}

export interface Expense {
  id: string
  trip_id: string
  paid_by: string
  description: string
  amount: number
  created_at: string
}

export interface ExpenseSplit {
  id: string
  expense_id: string
  member_id: string
}

// --- Helper types ---
export interface Balance {
  member: Member
  amount: number  // positive = owed money, negative = owes money
}

export interface Settlement {
  from: Member
  to: Member
  amount: number  // always positive
}

// --- Supabase Database type for typed client ---
export type Database = {
  public: {
    Tables: {
      trips: {
        Row: Trip
        Insert: Omit<Trip, 'id' | 'created_at'>
        Update: Partial<Omit<Trip, 'id' | 'created_at'>>
      }
      members: {
        Row: Member
        Insert: Omit<Member, 'id' | 'created_at'>
        Update: Partial<Omit<Member, 'id' | 'created_at'>>
      }
      expenses: {
        Row: Expense
        Insert: Omit<Expense, 'id' | 'created_at'>
        Update: Partial<Omit<Expense, 'id' | 'created_at'>>
      }
      expense_splits: {
        Row: ExpenseSplit
        Insert: Omit<ExpenseSplit, 'id'>
        Update: Partial<Omit<ExpenseSplit, 'id'>>
      }
    }
  }
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: PASS

---

### Task 3: Utilities (`src/lib/utils.ts`)

**Files:**
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Write utilities**

```typescript
// src/lib/utils.ts
import { customAlphabet } from 'nanoid'

// 6-char alphanumeric, URL-safe trip codes
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6)

export function generateTripCode(): string {
  return nanoid()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// 12 distinct colors for member avatars
export const AVATAR_COLORS = [
  '#22c55e', // green (primary)
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#a855f7', // purple
  '#e11d48', // rose
] as const

export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: PASS

---

### Task 4: Settlement Algorithm (`src/lib/settlement.ts`)

**Files:**
- Create: `src/lib/settlement.ts`

- [ ] **Step 1: Write calculateBalances**

```typescript
// src/lib/settlement.ts
import type { Member, Expense, ExpenseSplit, Balance, Settlement } from './types'

export function calculateBalances(
  members: Member[],
  expenses: Expense[],
  splits: ExpenseSplit[]
): Balance[] {
  // net[memberId] = total paid - total owed
  const net: Record<string, number> = {}

  for (const member of members) {
    net[member.id] = 0
  }

  for (const expense of expenses) {
    // The payer gets credited the full amount
    net[expense.paid_by] = (net[expense.paid_by] ?? 0) + Number(expense.amount)

    // Each person in the split owes an equal share
    const splitMembers = splits.filter((s) => s.expense_id === expense.id)
    if (splitMembers.length > 0) {
      const share = Number(expense.amount) / splitMembers.length
      for (const split of splitMembers) {
        net[split.member_id] = (net[split.member_id] ?? 0) - share
      }
    }
  }

  return members.map((member) => ({
    member,
    amount: Math.round((net[member.id] ?? 0) * 100) / 100,
  }))
}
```

- [ ] **Step 2: Write calculateSettlements (greedy algorithm)**

```typescript
export function calculateSettlements(balances: Balance[]): Settlement[] {
  const settlements: Settlement[] = []

  // Separate into debtors (negative balance) and creditors (positive balance)
  const debtors = balances
    .filter((b) => b.amount < -0.005)
    .map((b) => ({ member: b.member, amount: Math.abs(b.amount) }))
    .sort((a, b) => b.amount - a.amount)

  const creditors = balances
    .filter((b) => b.amount > 0.005)
    .map((b) => ({ member: b.member, amount: b.amount }))
    .sort((a, b) => b.amount - a.amount)

  let di = 0
  let ci = 0

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di]
    const creditor = creditors[ci]
    const transfer = Math.min(debtor.amount, creditor.amount)

    if (transfer > 0.005) {
      settlements.push({
        from: debtor.member,
        to: creditor.member,
        amount: Math.round(transfer * 100) / 100,
      })
    }

    debtor.amount -= transfer
    creditor.amount -= transfer

    if (debtor.amount < 0.005) di++
    if (creditor.amount < 0.005) ci++
  }

  return settlements
}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: PASS

---

## Chunk 2: React Hooks

### Task 5: Data Hooks (`src/lib/hooks.ts`)

**Files:**
- Create: `src/lib/hooks.ts`

- [ ] **Step 1: Write useTrip hook with realtime subscriptions**

```typescript
// src/lib/hooks.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import type { Trip, Member, Expense, ExpenseSplit } from './types'
import { generateTripCode, getAvatarColor } from './utils'

export interface TripData {
  trip: Trip | null
  members: Member[]
  expenses: Expense[]
  splits: ExpenseSplit[]
  loading: boolean
  error: string | null
}

export function useTrip(code: string): TripData {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [splits, setSplits] = useState<ExpenseSplit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return

    let cancelled = false

    async function fetchAll() {
      setLoading(true)
      setError(null)

      // Fetch trip by code
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('code', code)
        .single()

      if (tripError || !tripData) {
        if (!cancelled) {
          setError(tripError?.message ?? 'Trip not found')
          setLoading(false)
        }
        return
      }

      if (cancelled) return
      setTrip(tripData)

      const tripId = tripData.id

      // Fetch members, expenses, splits in parallel
      const [membersRes, expensesRes] = await Promise.all([
        supabase.from('members').select('*').eq('trip_id', tripId).order('created_at'),
        supabase.from('expenses').select('*').eq('trip_id', tripId).order('created_at'),
      ])

      if (cancelled) return

      if (membersRes.error) { setError(membersRes.error.message); setLoading(false); return }
      if (expensesRes.error) { setError(expensesRes.error.message); setLoading(false); return }

      setMembers(membersRes.data ?? [])
      setExpenses(expensesRes.data ?? [])

      // Fetch splits for all expenses
      const expenseIds = (expensesRes.data ?? []).map((e) => e.id)
      if (expenseIds.length > 0) {
        const { data: splitsData, error: splitsError } = await supabase
          .from('expense_splits')
          .select('*')
          .in('expense_id', expenseIds)

        if (!cancelled) {
          if (splitsError) { setError(splitsError.message); setLoading(false); return }
          setSplits(splitsData ?? [])
        }
      }

      if (!cancelled) setLoading(false)
    }

    fetchAll()

    // Realtime subscriptions — refetch on any change in this trip
    const channel = supabase
      .channel(`trip:${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        if (!cancelled) fetchAll()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        if (!cancelled) fetchAll()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_splits' }, () => {
        if (!cancelled) fetchAll()
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [code])

  return { trip, members, expenses, splits, loading, error }
}
```

- [ ] **Step 2: Write useCreateTrip hook**

```typescript
export interface CreateTripResult {
  createTrip: (name: string) => Promise<Trip | null>
  loading: boolean
  error: string | null
}

export function useCreateTrip(): CreateTripResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTrip = useCallback(async (name: string): Promise<Trip | null> => {
    setLoading(true)
    setError(null)

    const code = generateTripCode()

    const { data, error: err } = await supabase
      .from('trips')
      .insert({ name: name.trim(), code })
      .select()
      .single()

    setLoading(false)

    if (err || !data) {
      setError(err?.message ?? 'Failed to create trip')
      return null
    }

    return data
  }, [])

  return { createTrip, loading, error }
}
```

- [ ] **Step 3: Write useAddMember hook**

```typescript
export interface AddMemberResult {
  addMember: (name: string, memberCount: number) => Promise<Member | null>
  loading: boolean
  error: string | null
}

export function useAddMember(tripId: string): AddMemberResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addMember = useCallback(async (name: string, memberCount: number): Promise<Member | null> => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('members')
      .insert({
        trip_id: tripId,
        name: name.trim(),
        avatar_color: getAvatarColor(memberCount),
      })
      .select()
      .single()

    setLoading(false)

    if (err || !data) {
      setError(err?.message ?? 'Failed to add member')
      return null
    }

    return data
  }, [tripId])

  return { addMember, loading, error }
}
```

- [ ] **Step 4: Write useAddExpense hook**

```typescript
export interface AddExpenseInput {
  description: string
  amount: number
  paidBy: string      // member id
  splitWith: string[] // member ids
}

export interface AddExpenseResult {
  addExpense: (input: AddExpenseInput) => Promise<Expense | null>
  loading: boolean
  error: string | null
}

export function useAddExpense(tripId: string): AddExpenseResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addExpense = useCallback(async (input: AddExpenseInput): Promise<Expense | null> => {
    setLoading(true)
    setError(null)

    const { data: expense, error: expErr } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
        paid_by: input.paidBy,
        description: input.description.trim(),
        amount: input.amount,
      })
      .select()
      .single()

    if (expErr || !expense) {
      setLoading(false)
      setError(expErr?.message ?? 'Failed to add expense')
      return null
    }

    // Insert splits
    const splitRows = input.splitWith.map((memberId) => ({
      expense_id: expense.id,
      member_id: memberId,
    }))

    const { error: splitErr } = await supabase.from('expense_splits').insert(splitRows)

    setLoading(false)

    if (splitErr) {
      setError(splitErr.message)
      return null
    }

    return expense
  }, [tripId])

  return { addExpense, loading, error }
}
```

- [ ] **Step 5: Write useDeleteExpense hook**

```typescript
export interface DeleteExpenseResult {
  deleteExpense: (expenseId: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useDeleteExpense(): DeleteExpenseResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteExpense = useCallback(async (expenseId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    // Splits are deleted by cascade (ON DELETE CASCADE in schema)
    const { error: err } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)

    setLoading(false)

    if (err) {
      setError(err.message)
      return false
    }

    return true
  }, [])

  return { deleteExpense, loading, error }
}
```

- [ ] **Step 6: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: PASS

---

### Task 6: Final commit

- [ ] **Step 1: Verify typecheck clean**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 2: Commit all data layer files**

```bash
git add src/lib/supabase.ts src/lib/types.ts src/lib/utils.ts src/lib/settlement.ts src/lib/hooks.ts docs/
git commit -m "feat: data layer - Supabase client, types, hooks, settlement algorithm"
```

- [ ] **Step 3: Notify**

Run: `openclaw system event --text "Done: Divvy data layer complete - Supabase client, types, hooks, settlement algorithm" --mode now`
