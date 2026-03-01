import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, Transaction } from './mockData';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getThisMonthTransactions(): Transaction[] {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  return MOCK_TRANSACTIONS.filter((t) => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getMonth() === month && d.getFullYear() === year;
  });
}

function getTotalIncome(txs: Transaction[]): number {
  return txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
}

function getTotalSpending(txs: Transaction[]): number {
  return Math.abs(txs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));
}

function getCheckingBalance(): number {
  return MOCK_ACCOUNTS.find((a) => a.type === 'Checking')?.available ?? 0;
}

function getSavingsBalance(): number {
  return MOCK_ACCOUNTS.find((a) => a.type === 'Savings')?.balance ?? 0;
}

function getCreditUtilization(): number {
  const credit = MOCK_ACCOUNTS.find((a) => a.type === 'Credit');
  if (!credit || !credit.creditLimit) return 0;
  return Math.abs(credit.balance) / credit.creditLimit;
}

// ─── Confidence Score ────────────────────────────────────────────────────────

export type ScoreBreakdown = {
  label: string;
  score: number; // 0–100 for this factor
  weight: number;
  insight: string;
};

export type ConfidenceResult = {
  score: number;          // 0–100
  grade: string;          // A, B, C, D, F
  tier: string;           // label like "On Track"
  color: string;
  breakdown: ScoreBreakdown[];
};

export function calculateConfidenceScore(): ConfidenceResult {
  const txs = getThisMonthTransactions();
  const income = getTotalIncome(txs) || 2450; // fallback to known mock income
  const spending = getTotalSpending(txs);
  const savings = getSavingsBalance();
  const creditUtil = getCreditUtilization();

  // Factor 1: Spending ratio (spending / income), lower is better
  const spendRatio = spending / income;
  const spendScore = Math.max(0, Math.min(100, (1 - spendRatio) * 100));

  // Factor 2: Savings cushion (months of expenses covered)
  const monthsOfCushion = savings / (spending || 1);
  const savingsScore = Math.min(100, (monthsOfCushion / 6) * 100); // 6 months = perfect

  // Factor 3: Credit utilization (under 30% is ideal)
  const creditScore = creditUtil <= 0.3
    ? 100
    : Math.max(0, 100 - ((creditUtil - 0.3) / 0.7) * 100);

  // Factor 4: Subscription load (subscriptions as % of spending)
  const subSpending = txs
    .filter((t) => t.category === 'Subscriptions')
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const subRatio = subSpending / (income || 1);
  const subScore = Math.max(0, Math.min(100, (1 - subRatio * 10) * 100));

  const breakdown: ScoreBreakdown[] = [
    {
      label: 'Spending Control',
      score: Math.round(spendScore),
      weight: 0.35,
      insight: spendRatio < 0.7
        ? 'Spending well within income'
        : spendRatio < 0.9
        ? 'Spending is getting close to income'
        : 'Spending exceeds income this month',
    },
    {
      label: 'Savings Cushion',
      score: Math.round(savingsScore),
      weight: 0.30,
      insight: monthsOfCushion >= 6
        ? 'Strong emergency fund'
        : monthsOfCushion >= 3
        ? 'Emergency fund is growing'
        : 'Less than 3 months of savings — build this up',
    },
    {
      label: 'Credit Health',
      score: Math.round(creditScore),
      weight: 0.20,
      insight: creditUtil <= 0.1
        ? 'Excellent credit utilization'
        : creditUtil <= 0.3
        ? 'Good credit utilization'
        : 'High credit utilization — try to pay down balance',
    },
    {
      label: 'Subscription Load',
      score: Math.round(subScore),
      weight: 0.15,
      insight: subSpending < 50
        ? 'Subscriptions are under control'
        : subSpending < 100
        ? 'Moderate subscription spending'
        : 'High subscription load — review recurring charges',
    },
  ];

  const score = Math.round(
    breakdown.reduce((s, f) => s + f.score * f.weight, 0)
  );

  let grade: string;
  let tier: string;
  let color: string;

  if (score >= 85) { grade = 'A'; tier = 'Financial Champion'; color = '#2E7D32'; }
  else if (score >= 70) { grade = 'B'; tier = 'On Track'; color = '#558B2F'; }
  else if (score >= 55) { grade = 'C'; tier = 'Needs Attention'; color = '#EF7622'; }
  else if (score >= 40) { grade = 'D'; tier = 'At Risk'; color = '#E65100'; }
  else { grade = 'F'; tier = 'Critical'; color = '#C62828'; }

  return { score, grade, tier, color, breakdown };
}

// ─── Safe-to-Spend ───────────────────────────────────────────────────────────

export type SafeToSpendResult = {
  dailyAmount: number;
  weeklyAmount: number;
  daysLeftInMonth: number;
  reasoning: string;
};

export function calculateSafeToSpend(): SafeToSpendResult {
  const txs = getThisMonthTransactions();
  const income = getTotalIncome(txs) || 2450;
  const spending = getTotalSpending(txs);
  const checking = getCheckingBalance();

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysLeftInMonth = daysInMonth - dayOfMonth;

  // Estimate upcoming fixed costs (bills, subscriptions) for rest of month
  const estimatedFixedCosts = 450; // mock: rent portion, bills due
  const savingsGoalBuffer = 200;   // amount to set aside for savings

  const spendable = checking - estimatedFixedCosts - savingsGoalBuffer;
  const dailyAmount = Math.max(0, spendable / Math.max(daysLeftInMonth, 1));
  const weeklyAmount = dailyAmount * 7;

  let reasoning: string;
  if (dailyAmount > 80) {
    reasoning = "You're in great shape this month.";
  } else if (dailyAmount > 40) {
    reasoning = 'On track — keep spending mindful.';
  } else if (dailyAmount > 10) {
    reasoning = 'Budget is tight. Avoid non-essentials.';
  } else {
    reasoning = 'Very little room to spend — focus on essentials only.';
  }

  return {
    dailyAmount: Math.round(dailyAmount * 100) / 100,
    weeklyAmount: Math.round(weeklyAmount * 100) / 100,
    daysLeftInMonth,
    reasoning,
  };
}

// ─── Action Plan ─────────────────────────────────────────────────────────────

export type ActionPriority = 'high' | 'medium' | 'low';

export type Action = {
  id: string;
  priority: ActionPriority;
  icon: string;
  title: string;
  description: string;
  impact: string;       // e.g. "Save $25/mo"
  category: string;
};

export function generateActionPlan(): Action[] {
  const txs = getThisMonthTransactions();
  const income = getTotalIncome(txs) || 2450;
  const spending = getTotalSpending(txs);
  const savings = getSavingsBalance();
  const creditUtil = getCreditUtilization();
  const creditBalance = Math.abs(MOCK_ACCOUNTS.find((a) => a.type === 'Credit')?.balance ?? 0);

  const subTransactions = txs.filter((t) => t.category === 'Subscriptions');
  const subSpending = subTransactions.reduce((s, t) => s + Math.abs(t.amount), 0);

  const diningSpending = txs
    .filter((t) => t.category === 'Food & Dining')
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const monthsOfCushion = savings / (spending || 1);
  const spendRatio = spending / income;

  const actions: Action[] = [];

  // High priority: spending exceeds 85% of income
  if (spendRatio > 0.85) {
    actions.push({
      id: 'spending-high',
      priority: 'high',
      icon: 'warning-outline',
      title: 'Reduce monthly spending',
      description: `You've spent $${spending.toFixed(0)} of your $${income.toFixed(0)} income this month — that's ${Math.round(spendRatio * 100)}%. Try to stay under 80%.`,
      impact: `Free up ~$${Math.round((spendRatio - 0.8) * income)}/mo`,
      category: 'Spending',
    });
  }

  // High priority: credit utilization above 30%
  if (creditUtil > 0.3) {
    actions.push({
      id: 'credit-high',
      priority: 'high',
      icon: 'card-outline',
      title: 'Pay down your credit card',
      description: `Your credit utilization is ${Math.round(creditUtil * 100)}%. Keeping it below 30% improves your credit score and reduces interest charges.`,
      impact: `Pay $${Math.max(0, Math.round(creditBalance - 300))} to reach 30%`,
      category: 'Credit',
    });
  }

  // Medium priority: savings cushion under 3 months
  if (monthsOfCushion < 3) {
    const targetSavings = spending * 3;
    const needed = Math.max(0, targetSavings - savings);
    actions.push({
      id: 'savings-low',
      priority: monthsOfCushion < 1 ? 'high' : 'medium',
      icon: 'business-outline',
      title: 'Build your emergency fund',
      description: `You have ${monthsOfCushion.toFixed(1)} months of expenses saved. A 3-month cushion protects you from unexpected costs like car repairs or medical bills.`,
      impact: `Save $${Math.round(needed / 6)}/mo for 6 months to reach goal`,
      category: 'Savings',
    });
  }

  // Medium priority: high subscription spending
  if (subSpending > 50) {
    actions.push({
      id: 'subscriptions',
      priority: 'medium',
      icon: 'cellular-outline',
      title: 'Audit your subscriptions',
      description: `You're spending $${subSpending.toFixed(2)}/mo on subscriptions. Review each one — canceling even one unused service adds up over the year.`,
      impact: `Cancel 1 service = ~$${Math.round(subSpending / subTransactions.length * 12)}/yr saved`,
      category: 'Subscriptions',
    });
  }

  // Medium priority: dining spending above $60
  if (diningSpending > 60) {
    actions.push({
      id: 'dining',
      priority: 'medium',
      icon: 'restaurant-outline',
      title: 'Cut back on dining out',
      description: `You've spent $${diningSpending.toFixed(2)} on dining this month. Cooking at home even 2 extra nights per week can meaningfully reduce this.`,
      impact: `Could save $${Math.round(diningSpending * 0.3)}/mo`,
      category: 'Spending',
    });
  }

  // Low priority: positive reinforcement if savings are strong
  if (monthsOfCushion >= 3 && spendRatio < 0.75) {
    actions.push({
      id: 'invest',
      priority: 'low',
      icon: 'trending-up-outline',
      title: 'Start investing your surplus',
      description: `Your finances are in great shape. Consider putting extra savings into an index fund or high-yield savings account to make your money work for you.`,
      impact: 'Grow wealth passively over time',
      category: 'Growth',
    });
  }

  // Always suggest automated savings if not saving enough
  if (monthsOfCushion < 6) {
    actions.push({
      id: 'automate',
      priority: monthsOfCushion < 2 ? 'medium' : 'low',
      icon: 'refresh-outline',
      title: 'Automate a weekly savings transfer',
      description: `Set up a recurring $25–$50 weekly transfer to your savings account. Automating removes the temptation to spend it and builds your cushion without thinking.`,
      impact: '$50/wk = $2,600 saved in a year',
      category: 'Savings',
    });
  }

  // Sort: high → medium → low
  const order: Record<ActionPriority, number> = { high: 0, medium: 1, low: 2 };
  return actions.sort((a, b) => order[a.priority] - order[b.priority]);
}

// ─── Financial context for goals (suggestions) ───────────────────────────────

export type FinancialContextForGoals = {
  monthlyIncome: number;
  monthlySpending: number;
  diningSpending: number;
  subscriptionSpending: number;
};

export function getFinancialContextForGoals(): FinancialContextForGoals {
  const txs = getThisMonthTransactions();
  const monthlyIncome = getTotalIncome(txs) || 2450;
  const monthlySpending = getTotalSpending(txs);
  const diningSpending = txs
    .filter((t) => t.category === 'Food & Dining')
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const subscriptionSpending = txs
    .filter((t) => t.category === 'Subscriptions')
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  return {
    monthlyIncome,
    monthlySpending,
    diningSpending,
    subscriptionSpending,
  };
}
