'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import type { Trip, Member, Expense, ExpenseSplit } from './types'
import { generateTripCode, getNextAvatarColor } from './utils'

// ---------------------------------------------------------------------------
// useTrip — fetch trip + members + expenses + splits, with realtime updates
// ---------------------------------------------------------------------------

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

      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('code', code.toUpperCase())
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

      const [membersRes, expensesRes] = await Promise.all([
        supabase.from('members').select('*').eq('trip_id', tripId).order('created_at'),
        supabase.from('expenses').select('*').eq('trip_id', tripId).order('created_at'),
      ])

      if (cancelled) return

      if (membersRes.error) { setError(membersRes.error.message); setLoading(false); return }
      if (expensesRes.error) { setError(expensesRes.error.message); setLoading(false); return }

      setMembers(membersRes.data ?? [])
      setExpenses(expensesRes.data ?? [])

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
      } else {
        if (!cancelled) setSplits([])
      }

      if (!cancelled) setLoading(false)
    }

    fetchAll()

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

// ---------------------------------------------------------------------------
// useCreateTrip
// ---------------------------------------------------------------------------

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

    const { data, error: err } = await supabase
      .from('trips')
      .insert({ name: name.trim(), code: generateTripCode() })
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

// ---------------------------------------------------------------------------
// useAddMember
// ---------------------------------------------------------------------------

export interface AddMemberResult {
  addMember: (name: string) => Promise<Member | null>
  loading: boolean
  error: string | null
}

export function useAddMember(tripId: string): AddMemberResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addMember = useCallback(async (name: string): Promise<Member | null> => {
    setLoading(true)
    setError(null)

    const { data: existingMembers } = await supabase
      .from('members')
      .select('avatar_color')
      .eq('trip_id', tripId)

    const avatar_color = getNextAvatarColor(existingMembers ?? [])

    const { data, error: err } = await supabase
      .from('members')
      .insert({ trip_id: tripId, name: name.trim(), avatar_color })
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

// ---------------------------------------------------------------------------
// useAddExpense
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// useDeleteExpense
// ---------------------------------------------------------------------------

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

    // Splits deleted by cascade (ON DELETE CASCADE in schema)
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
