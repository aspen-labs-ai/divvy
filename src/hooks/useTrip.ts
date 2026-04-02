'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getTripByCode } from '@/lib/api'
import { calculateBalances, calculateSettlements } from '@/lib/settlement'
import type { Trip, Member, Expense, ExpenseSplit, BalanceEntry, Settlement } from '@/lib/types'

interface UseTripResult {
  trip: Trip | null
  members: Member[]
  expenses: Expense[]
  balances: BalanceEntry[]
  settlements: Settlement[]
  loading: boolean
  error: string | null
}

export function useTrip(code: string): UseTripResult {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [splits, setSplits] = useState<ExpenseSplit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const data = await getTripByCode(code)
      if (!data) {
        setError('Trip not found')
        return
      }
      setTrip(data.trip)
      setMembers(data.members)
      setExpenses(data.expenses)
      setSplits(data.splits)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trip')
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!trip) return

    const channel = supabase
      .channel(`trip:${trip.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members', filter: `trip_id=eq.${trip.id}` },
        () => fetchData(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `trip_id=eq.${trip.id}` },
        () => fetchData(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expense_splits' },
        () => fetchData(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [trip, fetchData])

  const balances = calculateBalances(members, expenses, splits)
  const settlements = calculateSettlements(balances)

  return { trip, members, expenses, balances, settlements, loading, error }
}
