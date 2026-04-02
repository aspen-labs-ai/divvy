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

// Internal shape required by @supabase/supabase-js GenericTable
type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}

// --- Supabase Database type for typed client (matches Supabase CLI generated shape) ---
export type Database = {
  public: {
    Tables: {
      trips: {
        Row: Trip
        Insert: { name: string; code: string; id?: string; created_at?: string }
        Update: { name?: string; code?: string; id?: string; created_at?: string }
        Relationships: Relationship[]
      }
      members: {
        Row: Member
        Insert: { trip_id: string; name: string; avatar_color?: string; id?: string; created_at?: string }
        Update: { trip_id?: string; name?: string; avatar_color?: string; id?: string; created_at?: string }
        Relationships: Relationship[]
      }
      expenses: {
        Row: Expense
        Insert: { trip_id: string; paid_by: string; description: string; amount: number; id?: string; created_at?: string }
        Update: { trip_id?: string; paid_by?: string; description?: string; amount?: number; id?: string; created_at?: string }
        Relationships: Relationship[]
      }
      expense_splits: {
        Row: ExpenseSplit
        Insert: { expense_id: string; member_id: string; id?: string }
        Update: { expense_id?: string; member_id?: string; id?: string }
        Relationships: Relationship[]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
