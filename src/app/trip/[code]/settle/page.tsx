"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTrip } from "@/lib/useTrip";
import { calculateBalances, calculateSettlements } from "@/lib/settlement";
import type { Settlement } from "@/lib/types";
import Header from "@/components/Header";
import MemberAvatar from "@/components/MemberAvatar";

export default function SettlePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const { trip, notFound } = useTrip(code);
  const [settled, setSettled] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (notFound) {
      router.replace(`/trip/${code}`);
    }
  }, [notFound, router, code]);

  const toggleSettled = (i: number) => {
    setSettled((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  if (!trip) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const balances = calculateBalances(trip.members, trip.expenses);
  const settlements: Settlement[] = calculateSettlements(balances);
  const remaining = settlements.length - settled.size;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header title="Settle Up" backHref={`/trip/${code}`} />

      <div className="max-w-md mx-auto px-4 pt-6 pb-10">
        {/* Summary card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mb-6 text-center">
          {remaining === 0 ? (
            <>
              <div className="w-12 h-12 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
                      <MemberAvatar name={s.from.name} color={s.from.avatar_color} size="md" />
                      <span className="text-[#a1a1aa] text-xs">{s.from.name}</span>
                    </div>

                    {/* Arrow + amount */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[#22c55e] font-bold text-lg">
                        ${s.amount.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1 w-full">
                        <div className="flex-1 h-px bg-[#22c55e]/40" />
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex-1 h-px bg-[#22c55e]/40" />
                      </div>
                    </div>

                    {/* To */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <MemberAvatar name={s.to.name} color={s.to.avatar_color} size="md" />
                      <span className="text-[#a1a1aa] text-xs">{s.to.name}</span>
                    </div>
                  </div>

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
