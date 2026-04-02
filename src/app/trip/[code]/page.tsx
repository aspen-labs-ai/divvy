"use client";

import { use, useState } from "react";
import Link from "next/link";
import { addMember, deleteMember, deleteExpense } from "@/lib/storage";
import { useTrip } from "@/lib/useTrip";
import { calculateBalances } from "@/lib/settlement";
import MemberAvatar from "@/components/MemberAvatar";
import ExpenseCard from "@/components/ExpenseCard";
import ExpenseMatrix from "@/components/ExpenseMatrix";
import BalanceCard from "@/components/BalanceCard";
import AddMemberModal from "@/components/AddMemberModal";

export default function TripPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { trip, setTrip, notFound } = useTrip(code);
  const [showAddMember, setShowAddMember] = useState(false);
  const [activeTab, setActiveTab] = useState<"expenses" | "balances">("expenses");
  const [expenseView, setExpenseView] = useState<"list" | "matrix">("matrix");

  const handleAddMember = (name: string) => {
    if (!trip) return;
    setTrip(addMember(trip, name));
    setShowAddMember(false);
  };

  const handleDeleteMember = (memberId: string) => {
    if (!trip) return;
    if (!confirm("Remove this member? Their expenses will also be removed.")) return;
    setTrip(deleteMember(trip, memberId));
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (!trip) return;
    setTrip(deleteExpense(trip, expenseId));
  };

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4">🤔</p>
          <h1 className="text-xl font-semibold text-white mb-2">Trip not found</h1>
          <p className="text-[#a1a1aa] mb-6">
            No trip with code <span className="font-mono text-white">{code}</span> on this device.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const balances = calculateBalances(trip.members, trip.expenses);
  const totalSpent = trip.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#2a2a2a]">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="text-[#a1a1aa] hover:text-white transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-xl truncate">{trip.name}</h1>
              <p className="text-[#a1a1aa] text-xs font-mono">{trip.code}</p>
            </div>
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
            ${totalSpent.toFixed(2)}
          </p>
          <p className="text-[#a1a1aa] text-sm mt-2">
            {trip.expenses.length} expense{trip.expenses.length !== 1 ? "s" : ""} · {trip.members.length} people
          </p>
        </div>

        {/* Members */}
        <div className="mt-8">
          <h2 className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider mb-3">
            Members
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            {trip.members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleDeleteMember(member.id)}
                className="flex flex-col items-center gap-1.5 group"
                title={`Remove ${member.name}`}
              >
                <div className="relative">
                  <MemberAvatar name={member.name} color={member.avatar_color} size="md" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] rounded-full items-center justify-center hidden group-hover:flex">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M1 1l6 6M7 1L1 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-[#a1a1aa] text-xs max-w-[48px] truncate">
                  {member.name.split(" ")[0]}
                </span>
              </button>
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

        {/* Tabs */}
        <div className="mt-8 flex gap-1 border-b border-[#2a2a2a] pb-0">
          {(["expenses", "balances"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? "border-[#22c55e] text-[#22c55e]"
                  : "border-transparent text-[#a1a1aa] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Expenses tab */}
        {activeTab === "expenses" && (
          <div className="mt-4">
            {/* View toggle */}
            {trip.expenses.length > 0 && (
              <div className="flex items-center justify-end mb-3">
                <div className="flex bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-0.5">
                  <button
                    onClick={() => setExpenseView("list")}
                    className={`p-1.5 rounded-md transition-colors ${
                      expenseView === "list"
                        ? "bg-[#2a2a2a] text-white"
                        : "text-[#a1a1aa] hover:text-white"
                    }`}
                    title="List view"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setExpenseView("matrix")}
                    className={`p-1.5 rounded-md transition-colors ${
                      expenseView === "matrix"
                        ? "bg-[#2a2a2a] text-white"
                        : "text-[#a1a1aa] hover:text-white"
                    }`}
                    title="Matrix view"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {expenseView === "list" ? (
              <div className="space-y-3">
                {trip.expenses.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-4xl mb-3">🧾</p>
                    <p className="text-white font-medium mb-1">No expenses yet</p>
                    <p className="text-sm text-[#a1a1aa]">
                      {trip.members.length < 2
                        ? "Add at least 2 members first"
                        : "Tap + to add the first expense"}
                    </p>
                  </div>
                ) : (
                  [...trip.expenses]
                    .reverse()
                    .map((expense) => (
                      <ExpenseCard
                        key={expense.id}
                        expense={expense}
                        members={trip.members}
                        onDelete={handleDeleteExpense}
                      />
                    ))
                )}
              </div>
            ) : (
              <ExpenseMatrix
                expenses={trip.expenses}
                members={trip.members}
              />
            )}
          </div>
        )}

        {/* Balances tab */}
        {activeTab === "balances" && (
          <div className="mt-4 space-y-2">
            {trip.members.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">👥</p>
                <p className="text-white font-medium mb-1">No members yet</p>
                <p className="text-sm text-[#a1a1aa]">Add members to track balances</p>
              </div>
            ) : (
              balances.map((balance) => (
                <BalanceCard key={balance.member.id} balance={balance} />
              ))
            )}
          </div>
        )}
      </div>

      {/* FAB — add expense */}
      {trip.members.length >= 2 && (
        <Link
          href={`/trip/${code}/add`}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#22c55e] rounded-full flex items-center justify-center shadow-lg shadow-[#22c55e]/25 hover:bg-[#16a34a] active:scale-95 transition-all z-40"
          aria-label="Add expense"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </Link>
      )}

      {showAddMember && (
        <AddMemberModal onAdd={handleAddMember} onClose={() => setShowAddMember(false)} />
      )}
    </div>
  );
}
