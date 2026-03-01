export const MOCK_USER = {
  name: 'Everett Potter',
  email: 'ep@email.com',
  password: 'password123',
};

export type Account = {
  id: string;
  type: 'Checking' | 'Savings' | 'Credit';
  name: string;
  number: string;
  balance: number;
  available: number;
  // Checking
  apy?: number;
  routingNumber?: string;
  // Savings
  interestEarnedYTD?: number;
  savingsGoal?: number;
  // Credit
  creditLimit?: number;
  apr?: number;
  rewardsCashBack?: number;
  minimumPayment?: number;
  paymentDueDate?: string;
  rewardRates?: { gas: number; dining: number; groceries: number; other: number };
};

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: '1',
    type: 'Checking',
    name: 'Virtual Wallet',
    number: '****4821',
    balance: 3_241.87,
    available: 3_100.00,
    // Balance - Whole Foods pending ($62.14) - BP Gas pre-auth ($79.73) = $3,100.00
    apy: 0.01,           // PNC Performance Spend: 0.01% APY (pnc.com rate center)
    routingNumber: '043000096',
  },
  {
    id: '2',
    type: 'Savings',
    name: 'Growth Savings',
    number: '****9034',
    balance: 12_580.43,
    available: 12_580.43,
    // $12,580.43 × 0.05% / 12 = $0.52/mo interest
    apy: 0.05,           // PNC Performance Select $10k+ tier (pnc.com rate center)
    interestEarnedYTD: 1.05,
    savingsGoal: 15_000,
  },
  {
    id: '3',
    type: 'Credit',
    name: 'Cash Rewards Visa',
    number: '****7712',
    balance: -847.22,
    available: 9_152.78,
    creditLimit: 10_000,
    // Feb charges total exactly $847.22 (current billing cycle)
    // Jan + older transactions appear in history but were paid off
    apr: 24.24,           // Mid of 19.24–29.24% variable APR (pnc.com rates PDF)
    rewardsCashBack: 47.83,
    minimumPayment: 25.00,
    paymentDueDate: '2026-03-19',
    rewardRates: { gas: 4, dining: 3, groceries: 2, other: 1 },
  },
];

export type Transaction = {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  pending: boolean;
  isRecurring?: boolean;
};

export type SubscriptionCategory = 'Streaming' | 'Music' | 'Software' | 'Gaming' | 'Fitness' | 'News';

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'annual';
  subCategory: SubscriptionCategory;
  icon: string;
  nextBillingDate: string;
  accountId: string;
  startDate: string;
};

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_netflix',
    name: 'Netflix',
    amount: 15.99,
    billingCycle: 'monthly',
    subCategory: 'Streaming',
    icon: '📺',
    nextBillingDate: '2026-03-27',
    accountId: '1',
    startDate: '2024-03-27',
  },
  {
    id: 'sub_spotify',
    name: 'Spotify',
    amount: 9.99,
    billingCycle: 'monthly',
    subCategory: 'Music',
    icon: '🎵',
    nextBillingDate: '2026-03-22',
    accountId: '1',
    startDate: '2024-06-22',
  },
  {
    id: 'sub_hulu',
    name: 'Hulu',
    amount: 17.99,
    billingCycle: 'monthly',
    subCategory: 'Streaming',
    icon: '📡',
    nextBillingDate: '2026-03-10',
    accountId: '1',
    startDate: '2024-09-10',
  },
  {
    id: 'sub_disney',
    name: 'Disney+',
    amount: 13.99,
    billingCycle: 'monthly',
    subCategory: 'Streaming',
    icon: '✨',
    nextBillingDate: '2026-03-05',
    accountId: '3',
    startDate: '2025-10-05',
  },
  {
    id: 'sub_appletv',
    name: 'Apple TV+',
    amount: 9.99,
    billingCycle: 'monthly',
    subCategory: 'Streaming',
    icon: '🍎',
    nextBillingDate: '2026-03-18',
    accountId: '3',
    startDate: '2024-09-18',
  },
  {
    id: 'sub_icloud',
    name: 'iCloud+',
    amount: 2.99,
    billingCycle: 'monthly',
    subCategory: 'Software',
    icon: '☁️',
    nextBillingDate: '2026-03-01',
    accountId: '1',
    startDate: '2023-11-01',
  },
  {
    id: 'sub_chatgpt',
    name: 'ChatGPT Plus',
    amount: 20.00,
    billingCycle: 'monthly',
    subCategory: 'Software',
    icon: '🤖',
    nextBillingDate: '2026-03-15',
    accountId: '3',
    startDate: '2026-01-15',
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  // ── February 2026 — Checking (accountId: 1) ─────────────────────────────────
  { id: 'chk_bp_pending',    accountId: '1', date: '2026-02-28', description: 'BP Gas Station',           amount: -79.73,    category: 'Gas',          pending: true },
  { id: 't1',                accountId: '1', date: '2026-02-28', description: 'Whole Foods Market',        amount: -62.14,    category: 'Groceries',    pending: true },
  { id: 't2',                accountId: '1', date: '2026-02-27', description: 'Netflix',                   amount: -15.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 't3',                accountId: '1', date: '2026-02-27', description: 'Direct Deposit - Employer', amount: 2_450.00,  category: 'Income',       pending: false },
  { id: 't4',                accountId: '1', date: '2026-02-26', description: "McDonald's",                amount: -9.47,     category: 'Food & Dining',pending: false },
  { id: 't5',                accountId: '1', date: '2026-02-25', description: 'Amazon.com',                amount: -34.99,    category: 'Shopping',     pending: false },
  { id: 't6',                accountId: '1', date: '2026-02-24', description: 'Shell Gas Station',         amount: -52.80,    category: 'Gas',          pending: false },
  { id: 't7',                accountId: '1', date: '2026-02-23', description: 'Venmo Payment',             amount: -100.00,   category: 'Transfer',     pending: false },
  { id: 't8',                accountId: '1', date: '2026-02-22', description: 'Spotify',                   amount: -9.99,     category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 't9',                accountId: '1', date: '2026-02-21', description: 'Target',                    amount: -47.23,    category: 'Shopping',     pending: false },
  { id: 't10',               accountId: '1', date: '2026-02-20', description: 'Chipotle',                  amount: -13.85,    category: 'Food & Dining',pending: false },

  // ── February 2026 — Checking subscriptions ──────────────────────────────────
  { id: 'sub_hulu_feb26',    accountId: '1', date: '2026-02-10', description: 'Hulu',                     amount: -17.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_icloud_feb26',  accountId: '1', date: '2026-02-01', description: 'iCloud+',                  amount: -2.99,     category: 'Subscriptions',pending: false, isRecurring: true },

  // ── February 2026 — Savings (accountId: 2) ──────────────────────────────────
  // $12,580.43 × 0.05% APY / 12 = $0.52/mo
  { id: 't11',               accountId: '2', date: '2026-02-15', description: 'Interest Payment',         amount: 0.52,      category: 'Interest',     pending: false },

  // ── January 2026 — Savings ──────────────────────────────────────────────────
  { id: 't11_jan',           accountId: '2', date: '2026-01-15', description: 'Interest Payment',         amount: 0.52,      category: 'Interest',     pending: false },

  // ── February 2026 — Credit Card (accountId: 3) ──────────────────────────────
  // These Feb charges total exactly $847.22 = current balance (billing cycle unpaid)
  { id: 't12',               accountId: '3', date: '2026-02-28', description: 'Uber Eats',                amount: -28.40,    category: 'Food & Dining',pending: true },
  { id: 'cc_bonefish_feb',   accountId: '3', date: '2026-02-26', description: 'Bonefish Grill',           amount: -35.84,    category: 'Food & Dining',pending: false },
  { id: 'cc_chevron_feb',    accountId: '3', date: '2026-02-23', description: 'Chevron',                  amount: -62.40,    category: 'Gas',          pending: false },
  { id: 'cc_chikfila_feb',   accountId: '3', date: '2026-02-21', description: "Chick-fil-A",              amount: -31.85,    category: 'Food & Dining',pending: false },
  { id: 't13',               accountId: '3', date: '2026-02-20', description: 'Apple Store',              amount: -199.00,   category: 'Shopping',     pending: false },
  { id: 'cc_kroger_feb',     accountId: '3', date: '2026-02-18', description: 'Kroger',                   amount: -103.27,   category: 'Groceries',    pending: false },
  { id: 'sub_appletv_feb26', accountId: '3', date: '2026-02-18', description: 'Apple TV+',                amount: -9.99,     category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'cc_capital_feb',    accountId: '3', date: '2026-02-14', description: 'Capital Grille',           amount: -118.64,   category: 'Food & Dining',pending: false },
  { id: 'sub_chatgpt_feb26', accountId: '3', date: '2026-02-15', description: 'ChatGPT Plus',             amount: -20.00,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'cc_shell_feb',      accountId: '3', date: '2026-02-09', description: 'Shell Gas Station',        amount: -58.90,    category: 'Gas',          pending: false },
  { id: 'cc_traderjoes_feb', accountId: '3', date: '2026-02-05', description: "Trader Joe's",             amount: -98.44,    category: 'Groceries',    pending: false },
  { id: 'sub_disney_feb26',  accountId: '3', date: '2026-02-05', description: 'Disney+',                  amount: -13.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'cc_target_feb',     accountId: '3', date: '2026-02-02', description: 'Target',                   amount: -66.50,    category: 'Shopping',     pending: false },

  // ── January 2026 — Credit Card (paid off, history only) ─────────────────────
  { id: 'cc_exxon_jan',      accountId: '3', date: '2026-01-24', description: 'Exxon',                    amount: -62.80,    category: 'Gas',          pending: false },
  { id: 'cc_olivegarden_jan',accountId: '3', date: '2026-01-18', description: 'Olive Garden',             amount: -45.32,    category: 'Food & Dining',pending: false },
  { id: 'sub_appletv_jan26', accountId: '3', date: '2026-01-18', description: 'Apple TV+',                amount: -9.99,     category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_chatgpt_jan26', accountId: '3', date: '2026-01-15', description: 'ChatGPT Plus',             amount: -20.00,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'cc_publix_jan',     accountId: '3', date: '2026-01-11', description: 'Publix',                   amount: -78.45,    category: 'Groceries',    pending: false },
  { id: 'sub_disney_jan26',  accountId: '3', date: '2026-01-05', description: 'Disney+',                  amount: -13.99,    category: 'Subscriptions',pending: false, isRecurring: true },

  // ── January 2026 — Checking subscriptions ───────────────────────────────────
  { id: 'sub_netflix_jan26', accountId: '1', date: '2026-01-27', description: 'Netflix',                  amount: -15.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_spotify_jan26', accountId: '1', date: '2026-01-22', description: 'Spotify',                  amount: -9.99,     category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_hulu_jan26',    accountId: '1', date: '2026-01-10', description: 'Hulu',                     amount: -17.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_icloud_jan26',  accountId: '1', date: '2026-01-01', description: 'iCloud+',                  amount: -2.99,     category: 'Subscriptions',pending: false, isRecurring: true },

  // ── December 2025 — Credit Card ─────────────────────────────────────────────
  { id: 'sub_disney_dec25',  accountId: '3', date: '2025-12-05', description: 'Disney+',                  amount: -13.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_appletv_dec25', accountId: '3', date: '2025-12-18', description: 'Apple TV+',                amount: -9.99,     category: 'Subscriptions',pending: false, isRecurring: true },

  // ── December 2025 — Checking subscriptions ──────────────────────────────────
  { id: 'sub_netflix_dec25', accountId: '1', date: '2025-12-27', description: 'Netflix',                  amount: -15.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_spotify_dec25', accountId: '1', date: '2025-12-22', description: 'Spotify',                  amount: -9.99,     category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_hulu_dec25',    accountId: '1', date: '2025-12-10', description: 'Hulu',                     amount: -17.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_icloud_dec25',  accountId: '1', date: '2025-12-01', description: 'iCloud+',                  amount: -2.99,     category: 'Subscriptions',pending: false, isRecurring: true },

  // ── November 2025 — Credit Card ─────────────────────────────────────────────
  { id: 'sub_disney_nov25',  accountId: '3', date: '2025-11-05', description: 'Disney+',                  amount: -13.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_appletv_nov25', accountId: '3', date: '2025-11-18', description: 'Apple TV+',                amount: -9.99,     category: 'Subscriptions',pending: false, isRecurring: true },

  // ── November 2025 — Checking subscriptions ──────────────────────────────────
  { id: 'sub_netflix_nov25', accountId: '1', date: '2025-11-27', description: 'Netflix',                  amount: -15.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_spotify_nov25', accountId: '1', date: '2025-11-22', description: 'Spotify',                  amount: -9.99,     category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_hulu_nov25',    accountId: '1', date: '2025-11-10', description: 'Hulu',                     amount: -17.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_icloud_nov25',  accountId: '1', date: '2025-11-01', description: 'iCloud+',                  amount: -2.99,     category: 'Subscriptions',pending: false, isRecurring: true },

  // ── October 2025 — Credit Card ──────────────────────────────────────────────
  { id: 'sub_disney_oct25',  accountId: '3', date: '2025-10-05', description: 'Disney+',                  amount: -13.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_appletv_oct25', accountId: '3', date: '2025-10-18', description: 'Apple TV+',                amount: -9.99,     category: 'Subscriptions',pending: false, isRecurring: true },

  // ── October 2025 — Checking subscriptions ───────────────────────────────────
  { id: 'sub_netflix_oct25', accountId: '1', date: '2025-10-27', description: 'Netflix',                  amount: -15.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_spotify_oct25', accountId: '1', date: '2025-10-22', description: 'Spotify',                  amount: -9.99,     category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_hulu_oct25',    accountId: '1', date: '2025-10-10', description: 'Hulu',                     amount: -17.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_icloud_oct25',  accountId: '1', date: '2025-10-01', description: 'iCloud+',                  amount: -2.99,     category: 'Subscriptions',pending: false, isRecurring: true },

  // ── September 2025 — Credit Card ────────────────────────────────────────────
  { id: 'sub_appletv_sep25', accountId: '3', date: '2025-09-18', description: 'Apple TV+',                amount: -9.99,     category: 'Subscriptions',pending: false, isRecurring: true },

  // ── September 2025 — Checking subscriptions ─────────────────────────────────
  { id: 'sub_netflix_sep25', accountId: '1', date: '2025-09-27', description: 'Netflix',                  amount: -15.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_spotify_sep25', accountId: '1', date: '2025-09-22', description: 'Spotify',                  amount: -9.99,     category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_hulu_sep25',    accountId: '1', date: '2025-09-10', description: 'Hulu',                     amount: -17.99,    category: 'Subscriptions',pending: false, isRecurring: true },
  { id: 'sub_icloud_sep25',  accountId: '1', date: '2025-09-01', description: 'iCloud+',                  amount: -2.99,     category: 'Subscriptions',pending: false, isRecurring: true },
];
