import { customAlphabet } from 'nanoid'
import { supabase } from './supabase'
import { getNextColor } from './colors'
import type { Trip, Member, Expense, ExpenseSplit, TripData } from './types'

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6)

export async function createTrip(name: string): Promise<Trip> {
  const code = nanoid()
  const { data, error } = await supabase
    .from('trips')
    .insert({ name, code })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTripByCode(code: string): Promise<TripData | null> {
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (tripError) {
    if (tripError.code === 'PGRST116') return null
    throw tripError
  }

  const [membersResult, expensesResult] = await Promise.all([
    supabase.from('members').select('*').eq('trip_id', trip.id).order('created_at'),
    supabase.from('expenses').select('*').eq('trip_id', trip.id).order('created_at'),
  ])

  if (membersResult.error) throw membersResult.error
  if (expensesResult.error) throw expensesResult.error

  const members: Member[] = membersResult.data
  const expenses: Expense[] = expensesResult.data

  let splits: ExpenseSplit[] = []
  if (expenses.length > 0) {
    const expenseIds = expenses.map((e) => e.id)
    const { data: splitsData, error: splitsError } = await supabase
      .from('expense_splits')
      .select('*')
      .in('expense_id', expenseIds)

    if (splitsError) throw splitsError
    splits = splitsData
  }

  return { trip, members, expenses, splits }
}

export async function addMember(tripId: string, name: string): Promise<Member> {
  const { data: existing, error: fetchError } = await supabase
    .from('members')
    .select('avatar_color')
    .eq('trip_id', tripId)

  if (fetchError) throw fetchError

  const usedColors = (existing ?? []).map((m: { avatar_color: string }) => m.avatar_color)
  const avatar_color = getNextColor(usedColors)

  const { data, error } = await supabase
    .from('members')
    .insert({ trip_id: tripId, name, avatar_color })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addExpense(
  tripId: string,
  paidById: string,
  description: string,
  amount: number,
  splitMemberIds: string[],
): Promise<Expense> {
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({ trip_id: tripId, paid_by: paidById, description, amount })
    .select()
    .single()

  if (expenseError) throw expenseError

  const splits = splitMemberIds.map((member_id) => ({
    expense_id: expense.id,
    member_id,
  }))

  const { error: splitsError } = await supabase.from('expense_splits').insert(splits)
  if (splitsError) throw splitsError

  return expense
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId)
  if (error) throw error
}

export async function deleteMember(memberId: string): Promise<void> {
  const { data: expenses, error: checkError } = await supabase
    .from('expenses')
    .select('id')
    .eq('paid_by', memberId)
    .limit(1)

  if (checkError) throw checkError

  if (expenses && expenses.length > 0) {
    throw new Error('Cannot delete member who has paid for expenses')
  }

  const { error } = await supabase.from('members').delete().eq('id', memberId)
  if (error) throw error
}
