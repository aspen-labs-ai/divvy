"use client";

import { use, useState } from "react";
import Header from "@/components/Header";
import MemberAvatar from "@/components/MemberAvatar";

const mockMembers = [
  { id: "1", name: "Trey", avatar_color: "#22c55e" },
  { id: "2", name: "Alex", avatar_color: "#3b82f6" },
  { id: "3", name: "Sam", avatar_color: "#f59e0b" },
  { id: "4", name: "Jordan", avatar_color: "#ef4444" },
];

const mockExpenses = [
  {
    id: "1",
    amount: 120.0,
    paid_by: "1",
    split_between: ["1", "2", "3", "4"],
  },
  {
    id: "2",
    amount: 35.5,
    paid_by: "2",
    split_between: ["1", "2", "3"],
  },
  {
    id: "3",
    amount: 67.8,
    paid_by: "3",
    split_between: ["1", "2", "3", "4"],
  },
];

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

function calcSettlements(): Settlement[] {
  const bal: Record<string, number> = {};
  mockMembers.forEach((m) => (bal[m.id] = 0));

  mockExpenses.forEach((exp) => {
    const share = exp.amount / exp.split_between.length;
    bal[exp.paid_by] += exp.amount;
    exp.split_between.forEach((id) => (bal[id] -= share));
  });

  // Greedy settlement algorithm
  const debtors = mockMembers
    .filter((m) => bal[m.id] < -0.005)
    .map((m) => ({ id: m.id, amount: -bal[m.id] }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = mockMembers
    .filter((m) => bal[m.id] > 0.005)
    .map((m) => ({ id: m.id, amount: bal[m.id] }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];

  let d = 0;
  let c = 0;
  while (d < debtors.length && c < creditors.length) {
    const transfer = Math.min(debtors[d].amount, creditors[c].amount);
    if (transfer > 0.005) {
      settlements.push({
        from: debtors[d].id,
        to: creditors[c].id,
        amount: Math.round(transfer * 100) / 100,
      });
    }
    debtors[d].amount -= transfer;
    creditors[c].amount -= transfer;
    if (debtors[d].amount < 0.005) d++;
    if (creditors[c].amount < 0.005) c++;
  }

  return settlements;
}

export default function SettlePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const settlements = calcSettlements();
  const [settled, setSettled] = useState<Set<number>>(new Set());

  const toggleSettled = (i: number) => {
    setSettled((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const remaining = settlements.length - settled.size;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header title="Settle Up" backHref={`/trip/${code}`} />

      <div className="max-w-md mx-auto px-4 pt-6 pb-10">
        {/* Summary */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mb-6 text-center">
          {remaining === 0 ? (
            <>
              <div className="w-12 h-12 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg">All settled up!</p>
              <p className="text-[#a1a1aa] text-sm mt-1">Everyone is even.</p>
            </>
          ) : (
            <>
              <p className="text-[#a1a1aa] text-sm uppercase tracking-wider font-medium">
                To settle everything
              </p>
              <p className="text-white text-4xl font-black mt-1">{remaining}</p>
              <p className="text-[#a1a1aa] text-sm mt-1">
                payment{remaining !== 1 ? "s" : ""} needed
              </p>
            </>
          )}
        </div>

        {/* Settlement list */}
        {settlements.length === 0 ? (
          <p className="text-[#a1a1aa] text-center text-sm py-8">
            No payments needed — everyone is even!
          </p>
        ) : (
          <div className="space-y-3">
            {settlements.map((s, i) => {
              const from = mockMembers.find((m) => m.id === s.from)!;
              const to = mockMembers.find((m) => m.id === s.to)!;
              const isDone = settled.has(i);

              return (
                <div
                  key={i}
                  className={`bg-[#1a1a1a] border rounded-xl p-4 transition-all ${
                    isDone ? "border-[#22c55e]/30 opacity-60" : "border-[#2a2a2a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* From */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <MemberAvatar name={from.name} color={from.avatar_color} size="md" />
                      <span className="text-[#a1a1aa] text-xs">{from.name}</span>
                    </div>

                    {/* Arrow + amount */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[#22c55e] font-bold text-lg">
                        ${s.amount.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1 w-full">
                        <div className="flex-1 h-px bg-[#22c55e]/40" />
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3 8h10M9 4l4 4-4 4"
                            stroke="#22c55e"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex-1 h-px bg-[#22c55e]/40" />
                      </div>
                    </div>

                    {/* To */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <MemberAvatar name={to.name} color={to.avatar_color} size="md" />
                      <span className="text-[#a1a1aa] text-xs">{to.name}</span>
                    </div>
                  </div>

                  {/* Mark settled button */}
                  <button
                    onClick={() => toggleSettled(i)}
                    className={`mt-3 w-full rounded-lg py-2 text-sm font-medium transition-colors ${
                      isDone
                        ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30"
                        : "bg-[#2a2a2a] text-[#a1a1aa] hover:text-white"
                    }`}
                  >
                    {isDone ? "✓ Marked as settled" : "Mark as settled"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
