import type { Expense, Member } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";

interface ExpenseMatrixProps {
  expenses: Expense[];
  members: Member[];
}

export default function ExpenseMatrix({ expenses, members }: ExpenseMatrixProps) {
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

  // Calculate per-person share totals
  const memberTotals: Record<string, number> = {};
  for (const m of members) {
    memberTotals[m.id] = 0;
  }
  for (const expense of expenses) {
    const perPerson = expense.amount / expense.split_between.length;
    for (const id of expense.split_between) {
      if (memberTotals[id] !== undefined) {
        memberTotals[id] += perPerson;
      }
    }
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[400px] border-collapse">
        {/* Header: member avatars + total column */}
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
          {sorted.map((expense) => (
            <tr
              key={expense.id}
              className="border-t border-[#1a1a1a]"
            >
              {/* Expense name + amount */}
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

                return (
                  <td key={m.id} className="py-3 px-1 text-center">
                    {isPayer ? (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center mx-auto text-white text-xs font-bold"
                        style={{ backgroundColor: m.avatar_color }}
                        title={`${m.name} paid`}
                      >
                        $
                      </div>
                    ) : isSplitting ? (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center mx-auto border-2"
                        style={{ borderColor: m.avatar_color }}
                        title={`${m.name} splits`}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: m.avatar_color }}
                        />
                      </div>
                    ) : (
                      <div className="w-7 h-7 flex items-center justify-center mx-auto">
                        <span className="text-[#2a2a2a] text-xs">—</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Totals row */}
          <tr className="border-t-2 border-[#2a2a2a]">
            <td className="py-3 pr-3 sticky left-0 bg-[#0a0a0a] z-10">
              <p className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider">
                Total owed
              </p>
            </td>
            {members.map((m) => (
              <td key={m.id} className="py-3 px-1 text-center">
                <p
                  className="text-xs font-bold"
                  style={{ color: m.avatar_color }}
                >
                  ${memberTotals[m.id].toFixed(2)}
                </p>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#1a1a1a] text-[10px] text-[#a1a1aa] uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#a1a1aa] flex items-center justify-center text-white text-[8px] font-bold">
            $
          </div>
          <span>Paid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full border-2 border-[#a1a1aa] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#a1a1aa]" />
          </div>
          <span>Splits</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#2a2a2a]">—</span>
          <span>Not involved</span>
        </div>
      </div>
    </div>
  );
}
