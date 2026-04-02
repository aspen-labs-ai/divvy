import type { Member, Expense, ExpenseSplit, BalanceEntry, Settlement } from './types'

export function calculateBalances(
  members: Member[],
  expenses: Expense[],
  splits: ExpenseSplit[],
): BalanceEntry[] {
  // Map memberId → net balance
  const balanceMap = new Map<string, number>(members.map((m) => [m.id, 0]))

  for (const expense of expenses) {
    const expenseSplits = splits.filter((s) => s.expense_id === expense.id)
    if (expenseSplits.length === 0) continue

    const share = Number(expense.amount) / expenseSplits.length

    // Payer is credited the full amount
    const current = balanceMap.get(expense.paid_by) ?? 0
    balanceMap.set(expense.paid_by, current + Number(expense.amount))

    // Each participant (including payer) owes their share
    for (const split of expenseSplits) {
      const memberBalance = balanceMap.get(split.member_id) ?? 0
      balanceMap.set(split.member_id, memberBalance - share)
    }
  }

  return members.map((member) => ({
    member,
    balance: Math.round((balanceMap.get(member.id) ?? 0) * 100) / 100,
  }))
}

export function calculateSettlements(balances: BalanceEntry[]): Settlement[] {
  const settlements: Settlement[] = []

  // Work with mutable copies, scaled to cents to avoid float issues
  const debtors = balances
    .filter((b) => b.balance < -0.005)
    .map((b) => ({ member: b.member, amount: Math.round(b.balance * 100) }))
    .sort((a, b) => a.amount - b.amount) // most negative first

  const creditors = balances
    .filter((b) => b.balance > 0.005)
    .map((b) => ({ member: b.member, amount: Math.round(b.balance * 100) }))
    .sort((a, b) => b.amount - a.amount) // largest first

  let di = 0
  let ci = 0

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di]
    const creditor = creditors[ci]

    const transferCents = Math.min(Math.abs(debtor.amount), creditor.amount)

    if (transferCents > 0) {
      settlements.push({
        from: debtor.member,
        to: creditor.member,
        amount: Math.round(transferCents) / 100,
      })
    }

    debtor.amount += transferCents
    creditor.amount -= transferCents

    if (debtor.amount === 0) di++
    if (creditor.amount === 0) ci++
  }

  return settlements
}
