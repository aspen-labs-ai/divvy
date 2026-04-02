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

// --- Composite types ---
export type ExpenseWithSplits = Expense & {
  splits: ExpenseSplit[]
  paidByMember?: Member
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
        Relationships: []
      }
      members: {
        Row: Member
        Insert: Omit<Member, 'id' | 'created_at'>
        Update: Partial<Omit<Member, 'id' | 'created_at'>>
        Relationships: []
      }
      expenses: {
        Row: Expense
        Insert: Omit<Expense, 'id' | 'created_at'>
        Update: Partial<Omit<Expense, 'id' | 'created_at'>>
        Relationships: []
      }
      expense_splits: {
        Row: ExpenseSplit
        Insert: Omit<ExpenseSplit, 'id'>
        Update: Partial<Omit<ExpenseSplit, 'id'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
