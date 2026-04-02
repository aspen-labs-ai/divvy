export interface Member {
  id: string;
  name: string;
  avatar_color: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number; // in dollars
  paid_by: string; // member id
  split_between: string[]; // member ids
  created_at: string;
}

export interface Trip {
  id: string;
  code: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  created_at: string;
}

export interface Settlement {
  from: Member;
  to: Member;
  amount: number; // in dollars
}

export interface TripIndex {
  code: string;
  name: string;
  created_at: string;
}

export interface Balance {
  member: Member;
  amount: number; // positive = gets back, negative = owes
}
