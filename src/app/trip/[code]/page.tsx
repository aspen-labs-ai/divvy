"use client";

import { use, useState } from "react";
import Link from "next/link";
import MemberAvatar from "@/components/MemberAvatar";
import ExpenseCard from "@/components/ExpenseCard";
import BalanceCard from "@/components/BalanceCard";
import AddMemberModal from "@/components/AddMemberModal";

const AVATAR_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#14b8a6",
];

const initialMembers = [
  { id: "1", name: "Trey", avatar_color: "#22c55e" },
  { id: "2", name: "Alex", avatar_color: "#3b82f6" },
  { id: "3", name: "Sam", avatar_color: "#f59e0b" },
  { id: "4", name: "Jordan", avatar_color: "#ef4444" },
];

const mockExpenses = [
  {
    id: "1",
    description: "Dinner at Joe's",
    amount: 120.0,
    paid_by: "1",
    split_between: ["1", "2", "3", "4"],
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    description: "Uber to hotel",
    amount: 35.5,
    paid_by: "2",
    split_between: ["1", "2", "3"],
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    description: "Groceries",
    amount: 67.8,
    paid_by: "3",
    split_between: ["1", "2", "3", "4"],
    created_at: new Date().toISOString(),
  },
];

function calcBalances(
  members: typeof initialMembers,
  expenses: typeof mockExpenses
): Record<string, number> {
  const bal: Record<string, number> = {};
  members.forEach((m) => (bal[m.id] = 0));
  expenses.forEach((exp) => {
    const share = exp.amount / exp.split_between.length;
    bal[exp.paid_by] = (bal[exp.paid_by] ?? 0) + exp.amount;
    exp.split_between.forEach((id) => {
      bal[id] = (bal[id] ?? 0) - share;
    });
  });
  return bal;
}

export default function TripPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [members, setMembers] = useState(initialMembers);
  const [showAddMember, setShowAddMember] = useState(false);

  const balances = calcBalances(members, mockExpenses);
  const totalSpend = mockExpenses.reduce((s, e) => s + e.amount, 0);

  const handleAddMember = (name: string) => {
    const color = AVATAR_COLORS[members.length % AVATAR_COLORS.length];
    setMembers((prev) => [
      ...prev,
      { id: String(prev.length + 1), name, avatar_color: color },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#2a2a2a]">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-white font-bold text-xl truncate">Weekend Trip</h1>
            <p className="text-[#a1a1aa] text-xs font-mono">/{code}</p>
          </div>
          <Link
            href={`/trip/${code}/settle`}
            className="flex-shrink-0 bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#22c55e]/20 transition-colors"
          >
            Settle Up
          </Link>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pb-28">
        {/* Total spend card */}
        <div className="mt-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 text-center">
          <p className="text-[#a1a1aa] text-sm uppercase tracking-wider font-medium">
            Total Spent
          </p>
          <p className="text-white text-5xl font-black mt-2 tracking-tight">
            ${totalSpend.toFixed(2)}
          </p>
          <p className="text-[#a1a1aa] text-sm mt-2">
            {mockExpenses.length} expenses · {members.length} people
          </p>
        </div>

        {/* Members */}
        <div className="mt-8">
          <h2 className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider mb-3">
            Members
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            {members.map((member) => (
              <div key={member.id} className="flex flex-col items-center gap-1.5">
                <MemberAvatar name={member.name} color={member.avatar_color} size="md" />
                <span className="text-[#a1a1aa] text-xs">{member.name}</span>
              </div>
            ))}
            <button
              onClick={() => setShowAddMember(true)}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a] flex items-center justify-center text-[#a1a1aa] hover:text-[#22c55e] hover:border-[#22c55e] transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[#a1a1aa] text-xs">Add</span>
            </button>
          </div>
        </div>

        {/* Balances */}
        <div className="mt-8">
          <h2 className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider mb-3">
            Balances
          </h2>
          <div className="space-y-2">
            {members.map((member) => (
              <BalanceCard
                key={member.id}
                member={member}
                balance={balances[member.id] ?? 0}
              />
            ))}
          </div>
        </div>

        {/* Expenses */}
        <div className="mt-8">
          <h2 className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider mb-3">
            Expenses
          </h2>
          <div className="space-y-3">
            {mockExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} members={members} />
            ))}
          </div>
        </div>
      </div>

      {/* FAB — add expense */}
      <Link
        href={`/trip/${code}/add`}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#22c55e] rounded-full flex items-center justify-center shadow-lg shadow-[#22c55e]/25 hover:bg-[#16a34a] active:scale-95 transition-all"
        aria-label="Add expense"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </Link>

      {showAddMember && (
        <AddMemberModal onAdd={handleAddMember} onClose={() => setShowAddMember(false)} />
      )}
    </div>
  );
}
