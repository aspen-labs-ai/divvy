"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import MemberAvatar from "@/components/MemberAvatar";

const mockMembers = [
  { id: "1", name: "Trey", avatar_color: "#22c55e" },
  { id: "2", name: "Alex", avatar_color: "#3b82f6" },
  { id: "3", name: "Sam", avatar_color: "#f59e0b" },
  { id: "4", name: "Jordan", avatar_color: "#ef4444" },
];

export default function AddExpensePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState(mockMembers[0].id);
  const [splitBetween, setSplitBetween] = useState<string[]>(
    mockMembers.map((m) => m.id)
  );

  const toggleSplit = (id: string) => {
    setSplitBetween((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isValid =
    amount.trim() !== "" &&
    parseFloat(amount) > 0 &&
    description.trim() !== "" &&
    splitBetween.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    console.log("Adding expense:", { amount, description, paidBy, splitBetween });
    router.push(`/trip/${code}`);
  };

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
            {mockMembers.map((member) => {
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
                  <span
                    className={`text-sm font-medium ${
                      selected ? "text-white" : "text-[#a1a1aa]"
                    }`}
                  >
                    {member.name}
                  </span>
                  {selected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="#22c55e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
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
                  splitBetween.length === mockMembers.length
                    ? []
                    : mockMembers.map((m) => m.id)
                )
              }
              className="text-[#22c55e] text-xs font-medium hover:underline"
            >
              {splitBetween.length === mockMembers.length ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {mockMembers.map((member) => {
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
                  <span
                    className={`text-sm font-medium ${
                      selected ? "text-white" : "text-[#a1a1aa]"
                    }`}
                  >
                    {member.name}
                  </span>
                </button>
              );
            })}
          </div>
          {splitBetween.length === 0 && (
            <p className="text-[#ef4444] text-xs mt-2">
              Select at least one person
            </p>
          )}
          {splitBetween.length > 0 && amount && parseFloat(amount) > 0 && (
            <p className="text-[#a1a1aa] text-xs mt-2">
              ${(parseFloat(amount) / splitBetween.length).toFixed(2)} per person
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
