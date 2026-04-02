import type { Member } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";

interface BalanceCardProps {
  member: Member;
  balance: number;
}

export default function BalanceCard({ member, balance: amount }: BalanceCardProps) {
  const isPositive = amount > 0.005;
  const isNegative = amount < -0.005;

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-3">
      <MemberAvatar name={member.name} color={member.avatar_color} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium">{member.name}</p>
        <p
          className={`text-sm font-medium mt-0.5 ${
            isPositive
              ? "text-[#22c55e]"
              : isNegative
              ? "text-[#ef4444]"
              : "text-[#a1a1aa]"
          }`}
        >
          {isPositive
            ? `+$${amount.toFixed(2)}`
            : isNegative
            ? `-$${Math.abs(amount).toFixed(2)}`
            : "settled up"}
        </p>
      </div>
      <div
        className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
          isPositive
            ? "bg-[#22c55e]/10 text-[#22c55e]"
            : isNegative
            ? "bg-[#ef4444]/10 text-[#ef4444]"
            : "bg-[#2a2a2a] text-[#a1a1aa]"
        }`}
      >
        {isPositive ? "gets back" : isNegative ? "owes" : "even"}
      </div>
    </div>
  );
}
