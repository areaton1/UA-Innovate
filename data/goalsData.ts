/**
 * Savings goals data model and suggestion engine.
 * Used by the Goals tab in Compass for timeline and "how to reach" suggestions.
 */

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  /** Optional target date (e.g. trip) — drives timeline and monthly required. */
  targetDate: string | null;
  createdAt: string; // ISO date
  icon?: string; // e.g. 'airplane-outline', 'home-outline'
};

export type GoalTimeline = {
  /** Amount still needed to reach the goal. */
  amountNeeded: number;
  /** Months between now and target date (null if no target date). */
  monthsRemaining: number | null;
  /** Days remaining until target date (null if no target date). */
  daysRemaining: number | null;
  /** Suggested monthly savings to hit goal by target date (null if no date or impossible). */
  monthlyRequired: number | null;
  /** Progress 0–100. */
  progressPercent: number;
  /** Whether the target date is feasible with typical savings (rough heuristic). */
  onTrack: boolean;
};

export type GoalSuggestion = {
  id: string;
  type: 'savings' | 'cut_spending' | 'timeline' | 'automate' | 'windfall';
  title: string;
  description: string;
  impact: string; // e.g. "Reach goal 2 months earlier"
  icon: string;
};

/** Compute timeline and feasibility for a goal. */
export function getGoalTimeline(
  goal: SavingsGoal,
  options?: { monthlyIncome?: number; monthlySavingsCapacity?: number }
): GoalTimeline {
  const amountNeeded = Math.max(0, goal.targetAmount - goal.currentAmount);
  const progressPercent =
    goal.targetAmount <= 0
      ? 100
      : Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);

  if (!goal.targetDate) {
    return {
      amountNeeded,
      monthsRemaining: null,
      daysRemaining: null,
      monthlyRequired: null,
      progressPercent: Math.round(progressPercent * 10) / 10,
      onTrack: true,
    };
  }

  const now = new Date();
  const target = new Date(goal.targetDate + 'T23:59:59');
  if (target <= now) {
    return {
      amountNeeded,
      monthsRemaining: 0,
      daysRemaining: 0,
      monthlyRequired: amountNeeded,
      progressPercent: Math.round(progressPercent * 10) / 10,
      onTrack: amountNeeded <= 0,
    };
  }

  const daysRemaining = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const monthsRemaining = Math.max(0.5, daysRemaining / 30.44); // approximate
  const monthlyRequired = amountNeeded / monthsRemaining;

  const capacity = options?.monthlySavingsCapacity ?? options?.monthlyIncome ?? 0;
  const feasible = capacity >= 0 && monthlyRequired <= capacity * 1.2; // 20% buffer

  return {
    amountNeeded,
    monthsRemaining: Math.round(monthsRemaining * 10) / 10,
    daysRemaining,
    monthlyRequired: Math.round(monthlyRequired * 100) / 100,
    progressPercent: Math.round(progressPercent * 10) / 10,
    onTrack: feasible,
  };
}

/** Generate personalized suggestions for reaching a goal. */
export function getGoalSuggestions(
  goal: SavingsGoal,
  timeline: GoalTimeline,
  context: {
    monthlyIncome: number;
    monthlySpending: number;
    diningSpending?: number;
    subscriptionSpending?: number;
  }
): GoalSuggestion[] {
  const suggestions: GoalSuggestion[] = [];
  const { amountNeeded, monthlyRequired, monthsRemaining, onTrack } = timeline;
  const surplus = context.monthlyIncome - context.monthlySpending;

  if (amountNeeded <= 0) {
    suggestions.push({
      id: 'done',
      type: 'savings',
      title: 'Goal reached!',
      description: "You've hit your target. Consider adding a new goal or celebrating.",
      impact: 'Keep the momentum going',
      icon: 'checkmark-circle',
    });
    return suggestions;
  }

  // Monthly savings target
  if (monthlyRequired != null && monthlyRequired > 0) {
    suggestions.push({
      id: 'monthly-target',
      type: 'savings',
      title: 'Set a monthly savings target',
      description: `Save $${monthlyRequired.toFixed(0)} per month to reach your goal${monthsRemaining != null ? ` in ${Math.ceil(monthsRemaining)} months` : ''}.`,
      impact: `$${monthlyRequired.toFixed(0)}/mo`,
      icon: 'calendar',
    });
  }

  // Feasibility nudge
  if (!onTrack && monthlyRequired != null && surplus > 0 && monthlyRequired > surplus) {
    const gap = monthlyRequired - surplus;
    suggestions.push({
      id: 'timeline-adjust',
      type: 'timeline',
      title: 'Consider extending your timeline',
      description: `You need $${monthlyRequired.toFixed(0)}/mo but have ~$${surplus.toFixed(0)} available. Pushing the date out by ${Math.ceil(gap / (surplus || 1))} months would make the goal achievable.`,
      impact: 'More realistic pace',
      icon: 'time',
    });
  }

  // Cut dining
  if (context.diningSpending != null && context.diningSpending > 40) {
    const cut = Math.min(context.diningSpending * 0.3, 80);
    suggestions.push({
      id: 'cut-dining',
      type: 'cut_spending',
      title: 'Trim dining out',
      description: `You're spending ~$${context.diningSpending.toFixed(0)}/mo on dining. Cutting back by $${cut.toFixed(0)}/mo (e.g. 2–3 fewer meals out) could go straight to this goal.`,
      impact: `+$${cut.toFixed(0)}/mo toward goal`,
      icon: 'restaurant',
    });
  }

  // Subscriptions
  if (context.subscriptionSpending != null && context.subscriptionSpending > 30) {
    suggestions.push({
      id: 'cut-subs',
      type: 'cut_spending',
      title: 'Review subscriptions',
      description: `$${context.subscriptionSpending.toFixed(0)}/mo on subscriptions. Canceling one or two could free $20–40/mo for this goal.`,
      impact: '+$20–40/mo possible',
      icon: 'card-outline',
    });
  }

  // Automate
  if (monthlyRequired != null && monthlyRequired >= 25) {
    suggestions.push({
      id: 'automate',
      type: 'automate',
      title: 'Automate transfers to savings',
      description: 'Set up a recurring transfer on payday so you save before you spend. Even $50–100 per paycheck adds up.',
      impact: 'Consistent progress',
      icon: 'repeat',
    });
  }

  // Windfall
  suggestions.push({
    id: 'windfall',
    type: 'windfall',
    title: 'Put windfalls toward this goal',
    description: 'Tax refunds, bonuses, or side income can jump-start progress. Allocate a portion to this goal when they come in.',
    impact: 'Faster timeline',
    icon: 'gift-outline',
  });

  return suggestions;
}

/** Default/example goals for first-time users (optional). */
export const DEFAULT_GOAL_ICONS: Record<string, string> = {
  travel: 'airplane-outline',
  emergency: 'shield-checkmark-outline',
  home: 'home-outline',
  car: 'car-outline',
  wedding: 'heart-outline',
  education: 'school-outline',
  general: 'wallet-outline',
};

/** Pre-populated goals for demo (Compass → Goals tab). */
export const DEMO_GOALS: SavingsGoal[] = [
  {
    id: 'demo_europe_trip',
    name: 'Europe trip',
    targetAmount: 5_000,
    currentAmount: 1_200,
    targetDate: '2026-12-31',
    createdAt: '2026-01-15',
    icon: 'airplane-outline',
  },
  {
    id: 'demo_emergency_fund',
    name: 'Emergency fund',
    targetAmount: 10_000,
    currentAmount: 3_500,
    targetDate: null,
    createdAt: '2026-01-01',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'demo_car_down',
    name: 'New car down payment',
    targetAmount: 4_000,
    currentAmount: 800,
    targetDate: '2027-06-15',
    createdAt: '2026-02-01',
    icon: 'car-outline',
  },
  {
    id: 'demo_wedding',
    name: 'Wedding savings',
    targetAmount: 8_000,
    currentAmount: 5_200,
    targetDate: '2026-09-01',
    createdAt: '2025-11-01',
    icon: 'heart-outline',
  },
];

export function createGoalId(): string {
  return 'goal_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}
