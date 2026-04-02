import type { Member, Expense, Balance, Settlement } from "./types";

export function calculateBalances(
  members: Member[],
  expenses: Expense[]
): Balance[] {
  const bal = new Map<string, number>(members.map((m) => [m.id, 0]));

  for (const expense of expenses) {
    const n = expense.split_between.length;
    if (n === 0) continue;

    const share = expense.amount / n;

    bal.set(expense.paid_by, (bal.get(expense.paid_by) ?? 0) + expense.amount);
    for (const memberId of expense.split_between) {
      bal.set(memberId, (bal.get(memberId) ?? 0) - share);
    }
  }

  return members.map((member) => ({
    member,
    amount: Math.round((bal.get(member.id) ?? 0) * 100) / 100,
  }));
}

export function calculateSettlements(balances: Balance[]): Settlement[] {
  const settlements: Settlement[] = [];

  const debtors = balances
    .filter((b) => b.amount < -0.005)
    .map((b) => ({ member: b.member, cents: Math.round(-b.amount * 100) }))
    .sort((a, b) => b.cents - a.cents);

  const creditors = balances
    .filter((b) => b.amount > 0.005)
    .map((b) => ({ member: b.member, cents: Math.round(b.amount * 100) }))
    .sort((a, b) => b.cents - a.cents);

  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const transfer = Math.min(debtors[di].cents, creditors[ci].cents);

    if (transfer > 0) {
      settlements.push({
        from: debtors[di].member,
        to: creditors[ci].member,
        amount: transfer / 100,
      });
    }

    debtors[di].cents -= transfer;
    creditors[ci].cents -= transfer;

    if (debtors[di].cents === 0) di++;
    if (creditors[ci].cents === 0) ci++;
  }

  return settlements;
}
