import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Account } from '../data/mockData';
import { MOCK_ACCOUNTS } from '../data/mockData';

type AccountsContextType = {
  accounts: Account[];
  transfer: (fromId: string, toId: string, amount: number) => void;
  adjustBalance: (id: string, delta: number) => void;
};

const AccountsContext = createContext<AccountsContextType>({
  accounts: MOCK_ACCOUNTS,
  transfer: () => {},
  adjustBalance: () => {},
});

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS);

  const transfer = useCallback((fromId: string, toId: string, amount: number) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === fromId) {
          return { ...a, balance: a.balance - amount, available: a.available - amount };
        }
        if (a.id === toId) {
          return { ...a, balance: a.balance + amount, available: a.available + amount };
        }
        return a;
      })
    );
  }, []);

  const adjustBalance = useCallback((id: string, delta: number) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, balance: a.balance + delta, available: a.available + delta } : a
      )
    );
  }, []);

  return (
    <AccountsContext.Provider value={{ accounts, transfer, adjustBalance }}>
      {children}
    </AccountsContext.Provider>
  );
}

export const useAccounts = () => useContext(AccountsContext);
