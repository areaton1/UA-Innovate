export const MOCK_USER = {
  name: 'Everett Potter',
  email: 'ep@email.com',
  password: 'password123',
};

export const MOCK_ACCOUNTS = [
  {
    id: '1',
    type: 'Checking',
    name: 'Virtual Wallet',
    number: '****4821',
    balance: 3_241.87,
    available: 3_100.00,
  },
  {
    id: '2',
    type: 'Savings',
    name: 'Growth Savings',
    number: '****9034',
    balance: 850.00,
    available: 850.00,
  },
  {
    id: '3',
    type: 'Credit',
    name: 'Cash Rewards Visa',
    number: '****7712',
    balance: -3_500.00,
    available: 6_500.00,
    creditLimit: 10_000,
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
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', accountId: '1', date: '2026-02-28', description: 'Whole Foods Market', amount: -62.14, category: 'Groceries', pending: true },
  { id: 't2', accountId: '1', date: '2026-02-27', description: 'Netflix', amount: -15.99, category: 'Subscriptions', pending: false },
  { id: 't3', accountId: '1', date: '2026-02-27', description: 'Direct Deposit - Employer', amount: 2_450.00, category: 'Income', pending: false },
  { id: 't4', accountId: '1', date: '2026-02-26', description: "McDonald's", amount: -9.47, category: 'Food & Dining', pending: false },
  { id: 't5', accountId: '1', date: '2026-02-25', description: 'Amazon.com', amount: -34.99, category: 'Shopping', pending: false },
  { id: 't6', accountId: '1', date: '2026-02-24', description: 'Shell Gas Station', amount: -52.80, category: 'Gas', pending: false },
  { id: 't7', accountId: '1', date: '2026-02-23', description: 'Venmo Payment', amount: -100.00, category: 'Transfer', pending: false },
  { id: 't8', accountId: '1', date: '2026-02-22', description: 'Spotify', amount: -9.99, category: 'Subscriptions', pending: false },
  { id: 't9', accountId: '1', date: '2026-02-21', description: 'Target', amount: -47.23, category: 'Shopping', pending: false },
  { id: 't10', accountId: '1', date: '2026-02-20', description: 'Chipotle', amount: -13.85, category: 'Food & Dining', pending: false },
  { id: 't11', accountId: '2', date: '2026-02-15', description: 'Interest Payment', amount: 3.12, category: 'Interest', pending: false },
  { id: 't12', accountId: '3', date: '2026-02-28', description: 'Uber Eats', amount: -28.40, category: 'Food & Dining', pending: true },
  { id: 't13', accountId: '3', date: '2026-02-26', description: 'Apple Store', amount: -199.00, category: 'Shopping', pending: false },
  { id: 't14', accountId: '1', date: '2026-02-19', description: 'Hulu', amount: -17.99, category: 'Subscriptions', pending: false },
  { id: 't15', accountId: '1', date: '2026-02-18', description: 'YouTube Premium', amount: -13.99, category: 'Subscriptions', pending: false },
  { id: 't16', accountId: '1', date: '2026-02-17', description: 'Panera Bread', amount: -18.75, category: 'Food & Dining', pending: false },
  { id: 't17', accountId: '1', date: '2026-02-16', description: 'Chick-fil-A', amount: -12.30, category: 'Food & Dining', pending: false },
];
