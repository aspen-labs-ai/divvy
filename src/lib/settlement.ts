import type { Member, Expense, ExpenseSplit, Balance, Settlement } from './types'

export function calculateBalances(
  members: Member[],
  expenses: Expense[],
  splits: ExpenseSplit[],
): Balance[] {
  // Map memberId → net balance in cents (integer to avoid float drift)
  const balanceMap = new Map<string, number>(members.map((m) => [m.id, 0]))

  for (const expense of expenses) {
    const expenseSplits = splits.filter((s) => s.expense_id === expense.id)
    if (expenseSplits.length === 0) continue

    const totalCents = Math.round(Number(expense.amount) * 100)
    const shareCents = Math.round(totalCents / expenseSplits.length)

    // Payer is credited the full amount
    const current = balanceMap.get(expense.paid_by) ?? 0
    balanceMap.set(expense.paid_by, current + totalCents)

    // Each participant owes their share
    for (const split of expenseSplits) {
      const memberBalance = balanceMap.get(split.member_id) ?? 0
      balanceMap.set(split.member_id, memberBalance - shareCents)
    }
  }

  return members.map((member) => ({
    member,
    amount: (balanceMap.get(member.id) ?? 0) / 100,
  }))
}

export function calculateSettlements(balances: Balance[]): Settlement[] {
  const settlements: Settlement[] = []

  // Work in cents to avoid float issues
  const debtors = balances
    .filter((b) => b.amount < -0.005)
    .map((b) => ({ member: b.member, cents: Math.round(Math.abs(b.amount) * 100) }))
    .sort((a, b) => b.cents - a.cents) // largest debt first

  const creditors = balances
    .filter((b) => b.amount > 0.005)
    .map((b) => ({ member: b.member, cents: Math.round(b.amount * 100) }))
    .sort((a, b) => b.cents - a.cents) // largest credit first

  let di = 0
  let ci = 0

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di]
    const creditor = creditors[ci]
    const transferCents = Math.min(debtor.cents, creditor.cents)

    if (transferCents > 0) {
      settlements.push({
        from: debtor.member,
        to: creditor.member,
        amount: transferCents / 100,
      })
    }

    debtor.cents -= transferCents
    creditor.cents -= transferCents

    if (debtor.cents === 0) di++
    if (creditor.cents === 0) ci++
  }

  return settlements
}
