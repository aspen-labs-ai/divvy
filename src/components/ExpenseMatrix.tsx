"use client";

import { useState } from "react";
import type { Expense, Member, Trip } from "@/lib/types";
import { isSettledSplit } from "@/lib/storage";
import MemberAvatar from "./MemberAvatar";

interface ExpenseMatrixProps {
  trip: Trip;
  expenses: Expense[];
  members: Member[];
  onSettleSplit?: (expenseId: string, memberId: string) => void;
}

export default function ExpenseMatrix({
  trip,
  expenses,
  members,
  onSettleSplit,
}: ExpenseMatrixProps) {
  const [confirmTarget, setConfirmTarget] = useState<{
    expenseId: string;
    memberId: string;
    memberName: string;
    expenseDesc: string;
    amount: number;
    isSettled: boolean;
  } | null>(null);

  if (expenses.length === 0 || members.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🧾</p>
        <p className="text-white font-medium mb-1">No expenses yet</p>
        <p className="text-sm text-[#a1a1aa]">
          {members.length < 2
            ? "Add at least 2 members first"
            : "Tap + to add the first expense"}
        </p>
      </div>
    );
  }

  const sorted = [...expenses].reverse();

  // Calculate net balances factoring in settled splits
  const memberPaid: Record<string, number> = {};
  const memberOwes: Record<string, number> = {};
  for (const m of members) {
    memberPaid[m.id] = 0;
    memberOwes[m.id] = 0;
  }
  for (const expense of expenses) {
    const perPerson = expense.amount / expense.split_between.length;
    // Credit the payer
    if (memberPaid[expense.paid_by] !== undefined) {
      memberPaid[expense.paid_by] += expense.amount;
    }
    // Debit each splitter (skip if they've already settled this split)
    for (const id of expense.split_between) {
      if (memberOwes[id] !== undefined) {
        const settled = isSettledSplit(trip, expense.id, id);
        if (!settled) {
          memberOwes[id] += perPerson;
        }
      }
    }
  }

  const handleCellClick = (
    expenseId: string,
    memberId: string,
    memberName: string,
    expenseDesc: string,
    splitAmount: number,
    settled: boolean
  ) => {
    setConfirmTarget({
      expenseId,
      memberId,
      memberName,
      expenseDesc,
      amount: splitAmount,
      isSettled: settled,
    });
  };

  const handleConfirm = () => {
    if (confirmTarget && onSettleSplit) {
      onSettleSplit(confirmTarget.expenseId, confirmTarget.memberId);
    }
    setConfirmTarget(null);
  };

  return (
    <>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[400px] border-collapse">
          {/* Header */}
          <thead>
            <tr>
              <th className="text-left text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider py-2 pr-3 sticky left-0 bg-[#0a0a0a] z-10">
                Expense
              </th>
              {members.map((m) => (
                <th key={m.id} className="py-2 px-1 text-center w-10">
                  <div className="flex flex-col items-center gap-1">
                    <MemberAvatar name={m.name} color={m.avatar_color} size="sm" />
                    <span className="text-[#a1a1aa] text-[10px] max-w-[40px] truncate block">
                      {m.name.split(" ")[0]}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sorted.map((expense) => {
              const splitAmount = expense.amount / expense.split_between.length;

              return (
                <tr key={expense.id} className="border-t border-[#1a1a1a]">
                  {/* Expense info */}
                  <td className="py-3 pr-3 sticky left-0 bg-[#0a0a0a] z-10">
                    <div className="min-w-[120px]">
                      <p className="text-white text-sm font-medium truncate max-w-[140px]">
                        {expense.description}
                      </p>
                      <p className="text-[#22c55e] text-xs font-bold">
                        ${expense.amount.toFixed(2)}
                      </p>
                    </div>
                  </td>

                  {/* Member cells */}
                  {members.map((m) => {
                    const isPayer = expense.paid_by === m.id;
                    const isSplitting = expense.split_between.includes(m.id);
                    const settled = isSettledSplit(trip, expense.id, m.id);

                    if (isPayer) {
                      // Payer: bold filled circle with star icon
                      return (
                        <td key={m.id} className="py-3 px-1 text-center">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center mx-auto text-white relative"
                            style={{ backgroundColor: m.avatar_color }}
                            title={`${m.name} paid $${expense.amount.toFixed(2)}`}
                          >
                            <span className="text-sm">💳</span>
                          </div>
                        </td>
                      );
                    }

                    if (isSplitting) {
                      // Splitter: clickable, shows settled state
                      return (
                        <td key={m.id} className="py-3 px-1 text-center">
                          <button
                            onClick={() =>
                              handleCellClick(
                                expense.id,
                                m.id,
                                m.name,
                                expense.description,
                                splitAmount,
                                settled
                              )
                            }
                            className="transition-transform active:scale-90"
                            title={
                              settled
                                ? `${m.name} paid their share`
                                : `${m.name} owes $${splitAmount.toFixed(2)} — tap to mark paid`
                            }
                          >
                            {settled ? (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto bg-[#22c55e]/20 border-2 border-[#22c55e]">
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                >
                                  <path
                                    d="M2.5 7L5.5 10L11.5 4"
                                    stroke="#22c55e"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center mx-auto border-2 hover:bg-white/5 transition-colors"
                                style={{ borderColor: m.avatar_color }}
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: m.avatar_color }}
                                />
                              </div>
                            )}
                          </button>
                        </td>
                      );
                    }

                    // Not involved
                    return (
                      <td key={m.id} className="py-3 px-1 text-center">
                        <div className="w-8 h-8 flex items-center justify-center mx-auto">
                          <span className="text-[#2a2a2a] text-xs">—</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Net balance row */}
            <tr className="border-t-2 border-[#2a2a2a]">
              <td className="py-3 pr-3 sticky left-0 bg-[#0a0a0a] z-10">
                <p className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider">
                  Net
                </p>
              </td>
              {members.map((m) => {
                const net =
                  Math.round((memberPaid[m.id] - memberOwes[m.id]) * 100) / 100;
                const isPositive = net > 0.005;
                const isNegative = net < -0.005;

                return (
                  <td key={m.id} className="py-3 px-1 text-center">
                    <p
                      className={`text-xs font-bold ${
                        isPositive
                          ? "text-[#22c55e]"
                          : isNegative
                          ? "text-[#ef4444]"
                          : "text-[#a1a1aa]"
                      }`}
                    >
                      {isPositive ? "+" : ""}${net.toFixed(2)}
                    </p>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#1a1a1a] text-[10px] text-[#a1a1aa] uppercase tracking-wider flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💳</span>
            <span>Paid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border-2 border-[#a1a1aa] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#a1a1aa]" />
            </div>
            <span>Owes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e] flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span>Settled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#2a2a2a]">—</span>
            <span>Not involved</span>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setConfirmTarget(null)}
        >
          <div
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white font-semibold text-lg mb-2">
              {confirmTarget.isSettled ? "Undo settlement?" : "Mark as paid?"}
            </p>
            <p className="text-[#a1a1aa] text-sm mb-6">
              {confirmTarget.isSettled ? (
                <>
                  Unmark <span className="text-white font-medium">{confirmTarget.memberName}</span>{"'s "}
                  <span className="text-[#22c55e] font-medium">${confirmTarget.amount.toFixed(2)}</span> share
                  of <span className="text-white font-medium">{confirmTarget.expenseDesc}</span> as unpaid?
                </>
              ) : (
                <>
                  Mark <span className="text-white font-medium">{confirmTarget.memberName}</span>{"'s "}
                  <span className="text-[#22c55e] font-medium">${confirmTarget.amount.toFixed(2)}</span> share
                  of <span className="text-white font-medium">{confirmTarget.expenseDesc}</span> as paid?
                </>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 bg-[#2a2a2a] text-[#a1a1aa] font-medium rounded-xl py-3 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 font-bold rounded-xl py-3 transition-colors ${
                  confirmTarget.isSettled
                    ? "bg-[#ef4444] hover:bg-[#dc2626] text-white"
                    : "bg-[#22c55e] hover:bg-[#16a34a] text-black"
                }`}
              >
                {confirmTarget.isSettled ? "Undo" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
