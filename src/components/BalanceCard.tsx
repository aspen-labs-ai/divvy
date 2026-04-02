import MemberAvatar from "./MemberAvatar";

interface Member {
  id: string;
  name: string;
  avatar_color: string;
}

interface BalanceCardProps {
  member: Member;
  balance: number;
}

export default function BalanceCard({ member, balance }: BalanceCardProps) {
  const isPositive = balance >= 0;

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-3">
      <MemberAvatar name={member.name} color={member.avatar_color} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium">{member.name}</p>
        <p className={`text-sm font-medium mt-0.5 ${isPositive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
          {isPositive ? "+" : ""}${Math.abs(balance).toFixed(2)}
        </p>
      </div>
      <div
        className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
          isPositive
            ? "bg-[#22c55e]/10 text-[#22c55e]"
            : "bg-[#ef4444]/10 text-[#ef4444]"
        }`}
      >
        {isPositive ? "gets back" : "owes"}
      </div>
    </div>
  );
}
