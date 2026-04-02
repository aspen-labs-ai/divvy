interface Member {
  id: string;
  name: string;
  avatar_color: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paid_by: string;
  split_between: string[];
  created_at: string;
}

interface ExpenseCardProps {
  expense: Expense;
  members: Member[];
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ExpenseCard({ expense, members }: ExpenseCardProps) {
  const paidBy = members.find((m) => m.id === expense.paid_by);
  const splitMembers = members.filter((m) => expense.split_between.includes(m.id));

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{expense.description}</p>
          <p className="text-[#a1a1aa] text-sm mt-0.5">
            paid by{" "}
            <span
              className="font-medium"
              style={{ color: paidBy?.avatar_color ?? "#a1a1aa" }}
            >
              {paidBy?.name ?? "Unknown"}
            </span>
          </p>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="text-[#a1a1aa] text-xs">split:</span>
            <div className="flex items-center -space-x-1">
              {splitMembers.map((m) => (
                <div
                  key={m.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-[#0a0a0a]"
                  style={{ backgroundColor: m.avatar_color }}
                  title={m.name}
                >
                  {m.name[0].toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[#22c55e] font-bold text-xl">${expense.amount.toFixed(2)}</p>
          <p className="text-[#a1a1aa] text-xs mt-0.5">{timeAgo(expense.created_at)}</p>
        </div>
      </div>
    </div>
  );
}
