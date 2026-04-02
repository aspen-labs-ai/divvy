"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTrip, addExpense } from "@/lib/storage";
import type { Trip } from "@/lib/types";
import Header from "@/components/Header";
import MemberAvatar from "@/components/MemberAvatar";

export default function AddExpensePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState<string[]>([]);

  useEffect(() => {
    const t = getTrip(code);
    if (!t) {
      router.replace(`/trip/${code}`);
      return;
    }
    setTrip(t);
    if (t.members.length > 0) {
      setPaidBy(t.members[0].id);
      setSplitBetween(t.members.map((m) => m.id)); // all selected by default
    }
  }, [code, router]);

  const toggleSplit = (id: string) => {
    setSplitBetween((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const parsedAmount = parseFloat(amount);
  const isValid =
    amount.trim() !== "" &&
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    description.trim() !== "" &&
    paidBy !== "" &&
    splitBetween.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !trip) return;
    const updated = addExpense(
      trip,
      description,
      Math.round(parsedAmount * 100) / 100,
      paidBy,
      splitBetween
    );
    setTrip(updated);
    router.push(`/trip/${code}`);
  };

  if (!trip) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const members = trip.members;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header title="Add Expense" backHref={`/trip/${code}`} />

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 pt-6 pb-10 space-y-6">
        {/* Amount */}
        <div>
          <label className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider block mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#22c55e] text-3xl font-bold pointer-events-none">
              $
            </span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              inputMode="decimal"
              autoFocus
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl pl-12 pr-5 py-5 text-white text-4xl font-black placeholder-[#2a2a2a] focus:outline-none focus:border-[#22c55e] transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider block mb-2">
            Description
          </label>
          <input
            type="text"
            placeholder="What was it for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-4 text-white placeholder-[#a1a1aa] focus:outline-none focus:border-[#22c55e] transition-colors text-base"
          />
        </div>

        {/* Paid by */}
        <div>
          <label className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider block mb-3">
            Paid by
          </label>
          <div className="flex gap-2 flex-wrap">
            {members.map((member) => {
              const selected = paidBy === member.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setPaidBy(member.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                    selected
                      ? "border-[#22c55e] bg-[#22c55e]/10"
                      : "border-[#2a2a2a] bg-[#1a1a1a]"
                  }`}
                >
                  <MemberAvatar name={member.name} color={member.avatar_color} size="sm" />
                  <span className={`text-sm font-medium ${selected ? "text-white" : "text-[#a1a1aa]"}`}>
                    {member.name}
                  </span>
                  {selected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7L5.5 10L11.5 4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Split between */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider">
              Split between
            </label>
            <button
              type="button"
              onClick={() =>
                setSplitBetween(
                  splitBetween.length === members.length
                    ? []
                    : members.map((m) => m.id)
                )
              }
              className="text-[#22c55e] text-xs font-medium hover:underline"
            >
              {splitBetween.length === members.length ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {members.map((member) => {
              const selected = splitBetween.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleSplit(member.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                    selected
                      ? "border-[#22c55e] bg-[#22c55e]/10"
                      : "border-[#2a2a2a] bg-[#1a1a1a] opacity-50"
                  }`}
                >
                  <MemberAvatar name={member.name} color={member.avatar_color} size="sm" />
                  <span className={`text-sm font-medium ${selected ? "text-white" : "text-[#a1a1aa]"}`}>
                    {member.name}
                  </span>
                </button>
              );
            })}
          </div>
          {splitBetween.length === 0 && (
            <p className="text-[#ef4444] text-xs mt-2">Select at least one person</p>
          )}
          {splitBetween.length > 0 && parsedAmount > 0 && (
            <p className="text-[#a1a1aa] text-xs mt-2">
              ${(parsedAmount / splitBetween.length).toFixed(2)} per person
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid}
          className="w-full bg-[#22c55e] text-black font-bold text-lg rounded-2xl py-4 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#16a34a] active:scale-[0.98] transition-all shadow-lg shadow-[#22c55e]/20 mt-2"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}
