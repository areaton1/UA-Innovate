import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SavingsGoal } from '../data/goalsData';
import { createGoalId, DEMO_GOALS } from '../data/goalsData';

type GoalsContextType = {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
};

const GoalsContext = createContext<GoalsContextType>({
  goals: [],
  addGoal: () => {},
  updateGoal: () => {},
  deleteGoal: () => {},
});

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<SavingsGoal[]>(DEMO_GOALS);

  const addGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString().slice(0, 10);
    setGoals((prev) => [
      ...prev,
      {
        ...goal,
        id: createGoalId(),
        createdAt: now,
      },
    ]);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return (
    <GoalsContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal }}>
      {children}
    </GoalsContext.Provider>
  );
}

export const useGoals = () => useContext(GoalsContext);
