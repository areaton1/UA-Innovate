export type ChallengeStatus = 'completed' | 'active' | 'available';

export type Challenge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  category: string;
  duration: string;
  status: ChallengeStatus;
  progress: number; // 0–100
  progressLabel: string;
};

export type Tier = {
  name: string;
  minXP: number;
  color: string;
  badge: string;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  avatarColor: string;
  xp: number;
  tierName: string;
  isCurrentUser?: boolean;
};

export const TIERS: Tier[] = [
  { name: 'Bronze',   minXP: 0,    color: '#CD7F32', badge: '🥉' },
  { name: 'Silver',   minXP: 500,  color: '#9E9E9E', badge: '🥈' },
  { name: 'Gold',     minXP: 1000, color: '#FFB300', badge: '🥇' },
  { name: 'Platinum', minXP: 2000, color: '#0069aa', badge: '💎' },
  { name: 'Diamond',  minXP: 4000, color: '#7C4DFF', badge: '💠' },
];

export function getTier(xp: number): Tier {
  return [...TIERS].reverse().find((t) => xp >= t.minXP) ?? TIERS[0];
}

export function getNextTier(xp: number): Tier | null {
  return TIERS.find((t) => t.minXP > xp) ?? null;
}

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Open your Financial Pulse dashboard and review your confidence score.',
    icon: '🚀',
    xp: 50,
    category: 'Getting Started',
    duration: 'One-time',
    status: 'completed',
    progress: 100,
    progressLabel: 'Completed',
  },
  {
    id: 'budget-aware',
    title: 'Budget Aware',
    description: 'Review your spending breakdown for the current month.',
    icon: '📊',
    xp: 100,
    category: 'Awareness',
    duration: 'One-time',
    status: 'completed',
    progress: 100,
    progressLabel: 'Completed',
  },
  {
    id: 'credit-crusher',
    title: 'Credit Crusher',
    description: 'Make a payment toward your credit card balance this week — any amount counts.',
    icon: '💳',
    xp: 200,
    category: 'Credit',
    duration: 'This week',
    status: 'active',
    progress: 0,
    progressLabel: 'Not started',
  },
  {
    id: 'subscription-detox',
    title: 'Subscription Detox',
    description: 'Review all your recurring subscriptions and cancel at least one you no longer use.',
    icon: '📡',
    xp: 150,
    category: 'Spending',
    duration: 'This week',
    status: 'active',
    progress: 0,
    progressLabel: 'Not started',
  },
  {
    id: 'savings-streak',
    title: 'Savings Streak',
    description: 'Transfer money into your savings account 3 weeks in a row.',
    icon: '🔥',
    xp: 250,
    category: 'Savings',
    duration: '3 weeks',
    status: 'available',
    progress: 0,
    progressLabel: '0 of 3 weeks',
  },
  {
    id: 'no-spend-weekend',
    title: 'No-Spend Weekend',
    description: 'Go the entire weekend without any dining out or entertainment purchases.',
    icon: '🏠',
    xp: 100,
    category: 'Spending',
    duration: 'Weekend',
    status: 'available',
    progress: 0,
    progressLabel: 'Not started',
  },
  {
    id: 'emergency-builder',
    title: 'Emergency Builder',
    description: 'Grow your savings account balance to $1,000 or more.',
    icon: '🏦',
    xp: 300,
    category: 'Savings',
    duration: 'Ongoing',
    status: 'available',
    progress: 85,
    progressLabel: '$850 of $1,000',
  },
  {
    id: 'debt-warrior',
    title: 'Debt Warrior',
    description: 'Pay your credit card balance down to under 20% utilization.',
    icon: '⚔️',
    xp: 400,
    category: 'Credit',
    duration: 'This month',
    status: 'available',
    progress: 0,
    progressLabel: 'Current: 35%',
  },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Jordan',   avatarColor: '#7C4DFF', xp: 2340, tierName: 'Platinum' },
  { rank: 2, name: 'Taylor',   avatarColor: '#FFB300', xp: 1890, tierName: 'Gold'     },
  { rank: 3, name: 'Alex',     avatarColor: '#FFB300', xp: 1450, tierName: 'Gold'     },
  { rank: 4, name: 'Everett',  avatarColor: '#003087', xp: 150,  tierName: 'Bronze', isCurrentUser: true },
  { rank: 5, name: 'Casey',    avatarColor: '#9E9E9E', xp: 820,  tierName: 'Silver'   },
  { rank: 6, name: 'Morgan',   avatarColor: '#9E9E9E', xp: 640,  tierName: 'Silver'   },
  { rank: 7, name: 'Riley',    avatarColor: '#CD7F32', xp: 390,  tierName: 'Bronze'   },
  { rank: 8, name: 'Avery',    avatarColor: '#CD7F32', xp: 210,  tierName: 'Bronze'   },
];
