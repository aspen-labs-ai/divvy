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

export interface CreateTripInput {
  name: string
}

export interface CreateMemberInput {
  trip_id: string
  name: string
}

export interface CreateExpenseInput {
  trip_id: string
  paid_by: string
  description: string
  amount: number
  split_member_ids: string[]
}

export interface BalanceEntry {
  member: Member
  balance: number // positive = owed money, negative = owes money
}

export interface Settlement {
  from: Member
  to: Member
  amount: number
}

export interface TripData {
  trip: Trip
  members: Member[]
  expenses: Expense[]
  splits: ExpenseSplit[]
}
