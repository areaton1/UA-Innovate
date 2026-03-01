import type { Transaction } from '../data/mockData';

const NUM_SIMS = 600;
const MONTHS_AHEAD = 12;
const LOW_PERCENTILE = 10;
const HIGH_PERCENTILE = 90;
const STABILITY_BUFFER = 500;
const TIGHT_MONTH_THRESHOLD = 500;
const CREDIT_UTIL_WARN = 0.8;
const OVERDRAFT_BLEND_END = 0.45;
/** Avoid 0% and 100% in display so probabilities reflect cash volatility and uncertainty */
const DISPLAY_PROB_MIN = 0.03;
const DISPLAY_PROB_MAX = 0.97;
function clampDisplayProb(p: number): number {
  return Math.max(DISPLAY_PROB_MIN, Math.min(DISPLAY_PROB_MAX, p));
}

const RECURRING_CATEGORIES = new Set(['Subscriptions', 'Utilities', 'Interest']);
const DISCRETIONARY_CATEGORIES = new Set(['Food & Dining', 'Shopping', 'Groceries', 'Gas', 'Transfer']);

const TARGET_SAVINGS_RATE = 0.08;
const MIN_SAVINGS_RATE = 0.03;
const INCOME_CV = 0.06;
const EXPENSE_CV_MAX = 0.35;
const MONTHLY_INTEREST_RATE = 0.0002;

/** Scale short-period totals to monthly and calibrate for realistic balance growth */
function monthlyStatsFromTransactions(transactions: Transaction[]) {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const byCategory: Record<string, number[]> = {};
  const income: number[] = [];
  const firstDate = new Date(sorted[0]?.date ?? Date.now());
  const lastDate = new Date(sorted[sorted.length - 1]?.date ?? Date.now());
  const daysSpan = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

  for (const t of sorted) {
    const amt = t.amount;
    if (amt > 0) {
      income.push(amt);
    } else {
      if (!byCategory[t.category]) byCategory[t.category] = [];
      byCategory[t.category].push(Math.abs(amt));
    }
  }

  const scaleToMonth = 30 / Math.max(daysSpan, 7);
  const incomeSum = income.reduce((a, b) => a + b, 0);
  const avgPaycheck = income.length ? incomeSum / income.length : 2450;
  const monthlyIncomeMean = income.length === 0 ? 4900 : avgPaycheck * 2;
  const monthlyIncome = {
    mean: monthlyIncomeMean,
    std: monthlyIncomeMean * INCOME_CV,
  };

  const categoryParams: Record<string, { mean: number; std: number }> = {};
  for (const [cat, amounts] of Object.entries(byCategory)) {
    const total = amounts.reduce((a, b) => a + b, 0);
    // Monthly total for this category = period total scaled to 30 days (matches actual spending)
    const mean = total * scaleToMonth;
    const avgPerTx = total / Math.max(1, amounts.length);
    const sampleVariance =
      amounts.length > 1
        ? amounts.reduce((s, x) => s + (x - avgPerTx) ** 2, 0) / amounts.length
        : avgPerTx * avgPerTx * 0.15;
    const sampleStd = Math.sqrt(sampleVariance);
    const cv = avgPerTx > 0 ? sampleStd / avgPerTx : 0.3;
    const std = Math.min(mean * Math.min(cv, EXPENSE_CV_MAX), mean * EXPENSE_CV_MAX);
    categoryParams[cat] = { mean, std };
  }

  const totalExpenseMean = Object.values(categoryParams).reduce((s, c) => s + c.mean, 0);
  const impliedSavingsRate = 1 - totalExpenseMean / monthlyIncome.mean;
  const targetExpenseRatio = 1 - Math.max(MIN_SAVINGS_RATE, Math.min(TARGET_SAVINGS_RATE, impliedSavingsRate + 0.05));
  if (totalExpenseMean > 0 && totalExpenseMean > monthlyIncome.mean * (1 - MIN_SAVINGS_RATE)) {
    const scale = (monthlyIncome.mean * targetExpenseRatio) / totalExpenseMean;
    for (const k of Object.keys(categoryParams)) {
      categoryParams[k] = {
        mean: categoryParams[k].mean * scale,
        std: categoryParams[k].std * scale,
      };
    }
  }

  return { monthlyIncome, categoryParams };
}

function sampleNormal(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + std * z;
}

function sampleIncome(mean: number, std: number): number {
  const draw = sampleNormal(mean, std);
  return Math.max(mean * 0.75, Math.min(mean * 1.25, draw));
}

function sampleExpense(mean: number, std: number): number {
  const draw = sampleNormal(mean, std);
  return Math.max(mean * 0.5, Math.min(mean * 1.6, draw));
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const i = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (i - lo) * (sorted[hi] - sorted[lo]);
}

function spendingVolatilityIndex(categoryParams: Record<string, { mean: number; std: number }>): number {
  const entries = Object.entries(categoryParams).filter(([, p]) => p.mean > 10);
  if (entries.length === 0) return 0.5;
  const totalMean = entries.reduce((s, [, p]) => s + p.mean, 0);
  const weightedCv =
    entries.reduce((s, [, p]) => s + (p.mean / totalMean) * (p.std / p.mean), 0) * 100;
  return Math.min(1.5, Math.max(0.2, weightedCv / 40));
}

export type ForecastPoint = {
  monthIndex: number;
  p10: number;
  p50: number;
  p90: number;
};

export type RiskFactor = {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  impactPercent: number;
  category?: string;
};

export type CategorySpending = {
  category: string;
  expectedMonthly: number;
  volatilityPct: number;
  isRecurring: boolean;
};

export type MonthRiskLabel = 'Stable' | 'At risk' | 'High volatility' | 'Crisis-prone';

export type BehavioralMode = {
  mode: string;
  description: string;
  probability: number;
};

export type ScenarioDelta = {
  name: string;
  description: string;
  deltaOverdraftPct: number;
  deltaMedianBalance: number;
  deltaStabilityPct: number;
};

export type StressTestResult = {
  name: string;
  description: string;
  survivalProbability: number;
  medianMinBalance: number;
  medianRecoveryMonths: number;
};

export type GoalForecast = {
  goalName: string;
  targetAmount: number;
  targetMonths: number;
  probabilityHitByTarget: number;
  medianMonthsToHit: number;
  worstCaseMonthsToHit: number;
  atRisk: boolean;
};

export type KeyDriver = {
  id: string;
  statement: string;
  severity: 'high' | 'medium' | 'low';
};

export type Recommendation = {
  id: string;
  text: string;
  impactSummary?: string;
};

export type HistogramBin = { min: number; max: number; count: number; pct: number };

export type BalanceDistributionAtPeriod = {
  monthIndex: number;
  endDateLabel: string;
  histogram: HistogramBin[];
  median: number;
  p10: number;
  p90: number;
};

export type FullForecastResult = {
  startingBalance: number;
  forecastByMonth: ForecastPoint[];
  medianBalanceAt12Months: number;
  probStaysPositive: number;
  probAboveStabilityBuffer: number;
  probAbove1000: number;
  probAbove5000: number;
  monthRiskLabels: { monthIndex: number; label: MonthRiskLabel }[];
  spendingByCategory: CategorySpending[];
  recurringMonthly: number;
  discretionaryMonthly: number;
  paycheckLinkedSpikeNote: string | null;
  seasonalNote: string | null;
  riskOverdraft: number;
  riskMissBill: number;
  riskTightMonth: number;
  riskDipIntoSavings: number;
  riskHighCreditUtil: number;
  riskFactors: RiskFactor[];
  behavioralModes: BehavioralMode[];
  scenarioDeltas: ScenarioDelta[];
  stressTests: StressTestResult[];
  goalForecast: GoalForecast | null;
  endingBalanceHistogram: HistogramBin[];
  balanceDistributionsByPeriod: BalanceDistributionAtPeriod[];
  keyDrivers: KeyDriver[];
  recommendations: Recommendation[];
};

type SimParams = {
  monthlyIncome: { mean: number; std: number };
  categoryParams: Record<string, { mean: number; std: number }>;
  totalBalance: number;
  numSims?: number;
  stress?: { incomeDelayMonths?: number; oneTimeExpense?: number; spendingBoostPct?: number; spendingBoostMonths?: number };
};

type RunSimOptions = SimParams & { extraSavingsPerMonth?: number };

function runSimulation(params: RunSimOptions): { paths: number[][]; monthlySpend: number[][] } {
  const { monthlyIncome, categoryParams, totalBalance, numSims = NUM_SIMS, stress, extraSavingsPerMonth = 0 } = params;
  const paths: number[][] = [];
  const monthlySpend: number[][] = [];

  for (let s = 0; s < numSims; s++) {
    const path: number[] = [totalBalance];
    const spend: number[] = [];
    let balance = totalBalance;

    for (let m = 0; m < MONTHS_AHEAD; m++) {
      let income = sampleIncome(monthlyIncome.mean, monthlyIncome.std);
      if (stress?.incomeDelayMonths && m < stress.incomeDelayMonths) income = 0;
      let expenses = 0;
      for (const [cat, { mean, std }] of Object.entries(categoryParams)) {
        let draw = sampleExpense(mean, std);
        if (stress?.spendingBoostPct && stress?.spendingBoostMonths && m < stress.spendingBoostMonths) {
          draw *= 1 + (stress.spendingBoostPct ?? 0) / 100;
        }
        expenses += draw;
      }
      if (stress?.oneTimeExpense && m === 0) expenses += stress.oneTimeExpense;
      balance = balance + income - expenses + extraSavingsPerMonth;
      if (balance > 0) balance *= 1 + MONTHLY_INTEREST_RATE;
      path.push(balance);
      spend.push(expenses);
    }
    paths.push(path);
    monthlySpend.push(spend);
  }
  return { paths, monthlySpend };
}

function computeForecastFromPaths(paths: number[][]): ForecastPoint[] {
  const forecastByMonth: ForecastPoint[] = [];
  for (let m = 0; m <= MONTHS_AHEAD; m++) {
    const values = paths.map((p) => p[m]).sort((a, b) => a - b);
    forecastByMonth.push({
      monthIndex: m,
      p10: percentile(values, LOW_PERCENTILE),
      p50: percentile(values, 50),
      p90: percentile(values, HIGH_PERCENTILE),
    });
  }
  return forecastByMonth;
}

function getMonthLabel(p10: number, p50: number, p90: number): MonthRiskLabel {
  if (p10 < 0) return 'Crisis-prone';
  if (p10 < TIGHT_MONTH_THRESHOLD) return 'At risk';
  const range = p90 - p10;
  const cv = p50 !== 0 ? range / Math.abs(p50) : 0;
  if (cv > 0.6) return 'High volatility';
  return 'Stable';
}

function buildBehavioralModes(monthlySpend: number[][], meanSpend: number): BehavioralMode[] {
  const allSpends = monthlySpend.flat();
  const stdSpend = Math.sqrt(
    allSpends.reduce((s, x) => s + (x - meanSpend) ** 2, 0) / Math.max(1, allSpends.length - 1)
  );
  let normal = 0,
    splurge = 0,
    tight = 0,
    unexpected = 0;
  const total = monthlySpend.length * MONTHS_AHEAD;
  for (const row of monthlySpend) {
    for (const s of row) {
      if (s <= meanSpend - stdSpend) tight++;
      else if (s >= meanSpend + 1.5 * stdSpend) splurge++;
      else if (s >= meanSpend + stdSpend) unexpected++;
      else normal++;
    }
  }
  return [
    { mode: 'Normal month', description: 'Spending near your typical level', probability: normal / total },
    { mode: 'Splurge month', description: 'Spending well above average', probability: splurge / total },
    { mode: 'Tight month', description: 'Spending below average', probability: tight / total },
    { mode: 'Unexpected expense', description: 'Higher-than-usual one-off spending', probability: unexpected / total },
  ].filter((b) => b.probability > 0.02);
}

const FORECAST_START_MONTH = 1;
const FORECAST_START_YEAR = 2026;
const DISTRIBUTION_PERIODS = [3, 6, 9, 12] as const;
const HISTOGRAM_BINS = 18;

function getEndDateLabel(monthsAhead: number): string {
  const d = new Date(FORECAST_START_YEAR, FORECAST_START_MONTH + monthsAhead, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function buildHistogram(values: number[], numBins: number): HistogramBin[] {
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0] ?? 0;
  const max = sorted[sorted.length - 1] ?? 0;
  const range = max - min || 1;
  const binWidth = range / numBins;
  const bins: HistogramBin[] = [];
  for (let i = 0; i < numBins; i++) {
    const binMin = min + i * binWidth;
    const binMax = min + (i + 1) * binWidth;
    const count = sorted.filter((v) => v >= binMin && (i === numBins - 1 ? v <= binMax : v < binMax)).length;
    bins.push({ min: binMin, max: binMax, count, pct: count / sorted.length });
  }
  return bins;
}

function buildRiskFactors(
  categoryParams: Record<string, { mean: number; std: number }>,
  monthlyIncome: { mean: number; std: number }
): RiskFactor[] {
  const factors: RiskFactor[] = [];
  const totalExpenseMean = Object.values(categoryParams).reduce((s, c) => s + c.mean, 0);
  const savingsRate = 1 - totalExpenseMean / monthlyIncome.mean;
  const incomeMean = monthlyIncome.mean;

  if (savingsRate < 0.1 && incomeMean > 0) {
    const spendPct = Math.round((totalExpenseMean / incomeMean) * 100);
    factors.push({
      id: 'low-savings',
      title: 'Low savings rate',
      description: `Based on your spending patterns, about ${spendPct}% of income goes to expenses, leaving little buffer for unexpected costs or income gaps.`,
      severity: savingsRate < 0 ? 'high' : 'medium',
      impactPercent: Math.round(Math.abs(savingsRate) * 100),
    });
  }

  const subs = categoryParams['Subscriptions'];
  if (subs && incomeMean > 0) {
    const subPct = (subs.mean / incomeMean) * 100;
    if (subPct > 4) {
      factors.push({
        id: 'subscriptions',
        title: 'Recurring subscriptions',
        description: `From your data, subscriptions run about $${Math.round(subs.mean)}/mo (${Math.round(subPct)}% of income). Fixed monthly costs reduce flexibility when money is tight.`,
        severity: subPct > 10 ? 'high' : 'medium',
        impactPercent: Math.round(subPct),
        category: 'Subscriptions',
      });
    }
  }

  const categoriesBySpend = Object.entries(categoryParams)
    .filter(([, p]) => p.mean > 15)
    .sort((a, b) => b[1].mean - a[1].mean);
  const seenCategories = new Set<string>();
  for (const [cat, p] of categoriesBySpend) {
    if (seenCategories.has(cat)) continue;
    const pct = incomeMean > 0 ? (p.mean / incomeMean) * 100 : 0;
    const cv = (p.std / p.mean) * 100;
    const isHighVariance = p.std > p.mean * 0.45;
    const isHighSpend = pct > 10;
    if (!isHighVariance && !isHighSpend) continue;
    seenCategories.add(cat);
    const severity: 'high' | 'medium' | 'low' =
      pct > 22 || cv > 75 ? 'high' : pct > 14 || cv > 50 ? 'medium' : 'low';
    let description: string;
    if (isHighVariance && isHighSpend) {
      description = `Your data shows $${Math.round(p.mean)}/mo in ${cat} (${Math.round(pct)}% of income) with high month‑to‑month variation (≈${Math.round(cv)}%). This combination increases financial uncertainty.`;
    } else if (isHighVariance) {
      description = `Spending in ${cat} varies a lot from month to month (≈${Math.round(cv)}% variability in your pattern). Harder to plan when this category swings.`;
    } else {
      description = `Based on recent activity, ${cat} is about $${Math.round(p.mean)}/mo (${Math.round(pct)}% of income). A large share of income in one area leaves less room for shocks.`;
    }
    factors.push({
      id: `category-${cat}`,
      title: isHighVariance && isHighSpend ? `High & variable: ${cat}` : isHighVariance ? `Variable spending: ${cat}` : `High spend: ${cat}`,
      description,
      severity,
      impactPercent: Math.round(Math.max(pct, cv)),
      category: cat,
    });
  }

  const utilities = categoryParams['Utilities'];
  if (utilities && utilities.mean > 50 && incomeMean > 0) {
    const utilPct = (utilities.mean / incomeMean) * 100;
    factors.push({
      id: 'utilities',
      title: 'Fixed utilities',
      description: `Utilities from your data are about $${Math.round(utilities.mean)}/mo (${Math.round(utilPct)}% of income). These fixed costs don’t scale down when income dips.`,
      severity: utilPct > 5 ? 'medium' : 'low',
      impactPercent: Math.round(utilPct),
      category: 'Utilities',
    });
  }

  const dining = categoryParams['Food & Dining'];
  if (dining && dining.mean > 80 && incomeMean > 0 && !seenCategories.has('Food & Dining')) {
    const diningPct = (dining.mean / incomeMean) * 100;
    const cv = (dining.std / dining.mean) * 100;
    factors.push({
      id: 'category-Food & Dining',
      title: cv > 40 ? 'Food & dining (variable)' : 'Food & dining',
      description: `Your pattern shows about $${Math.round(dining.mean)}/mo on food & dining (${Math.round(diningPct)}% of income)${cv > 40 ? ` with ${Math.round(cv)}% variability` : ''}. Small cuts here can free up cash.`,
      severity: diningPct > 15 ? 'high' : 'medium',
      impactPercent: Math.round(diningPct),
      category: 'Food & Dining',
    });
  }

  return factors
    .sort((a, b) => (b.severity === 'high' ? 1 : 0) - (a.severity === 'high' ? 1 : 0) || b.impactPercent - a.impactPercent)
    .slice(0, 8);
}

function buildKeyDrivers(
  categoryParams: Record<string, { mean: number; std: number }>,
  riskFactors: RiskFactor[]
): KeyDriver[] {
  const drivers: KeyDriver[] = [];
  const byVolatility = Object.entries(categoryParams)
    .filter(([, p]) => p.mean > 20)
    .sort((a, b) => b[1].std - a[1].std);
  if (byVolatility.length > 0) {
    drivers.push({
      id: 'volatility',
      statement: `${byVolatility[0][0]} is your largest source of spending volatility.`,
      severity: byVolatility[0][1].std > byVolatility[0][1].mean ? 'high' : 'medium',
    });
  }
  const totalRecurring = Object.entries(categoryParams)
    .filter(([c]) => RECURRING_CATEGORIES.has(c))
    .reduce((s, [, p]) => s + p.mean, 0);
  const totalMean = Object.values(categoryParams).reduce((s, c) => s + c.mean, 0);
  if (totalRecurring > totalMean * 0.2) {
    drivers.push({
      id: 'recurring',
      statement: 'Recurring subscriptions and bills add a high fixed baseline each month.',
      severity: 'medium',
    });
  }
  const dining = categoryParams['Food & Dining'];
  if (dining && dining.mean > 120) {
    drivers.push({
      id: 'dining',
      statement: 'Dining and delivery spending is sensitive to behavior changes.',
      severity: dining.std > dining.mean * 0.5 ? 'high' : 'medium',
    });
  }
  return drivers.slice(0, 5);
}

function buildRecommendations(
  baseOverdraft: number,
  scenarioDeltas: ScenarioDelta[],
  probAboveStability: number,
  keyDrivers: KeyDriver[]
): Recommendation[] {
  const recs: Recommendation[] = [];
  if (baseOverdraft > 0.1 && scenarioDeltas.length > 0) {
    const best = scenarioDeltas.reduce((a, b) => (a.deltaOverdraftPct < b.deltaOverdraftPct ? a : b));
    recs.push({
      id: 'scenario',
      text: best.name,
      impactSummary: `Cuts overdraft risk by ~${Math.round(Math.abs(best.deltaOverdraftPct))}% in our model.`,
    });
  }
  if (probAboveStability < 0.7) {
    recs.push({
      id: 'buffer',
      text: `Building a $${STABILITY_BUFFER} buffer would eliminate most worst-case scenarios in the simulation.`,
    });
  }
  const volatilityDriver = keyDrivers.find((d) => d.id === 'volatility' || d.id === 'dining');
  if (volatilityDriver) {
    recs.push({
      id: 'volatility',
      text: volatilityDriver.statement.replace('.', ' Reducing that variability could smooth your balance.'),
    });
  }
  return recs.slice(0, 4);
}

export function runFullMonteCarlo(
  transactions: Transaction[],
  totalBalance: number,
  options?: { creditLimit?: number; savingsBalance?: number; emergencyFundGoal?: number }
): FullForecastResult {
  const { monthlyIncome, categoryParams } = monthlyStatsFromTransactions(transactions);
  const totalExpenseMean = Object.values(categoryParams).reduce((s, c) => s + c.mean, 0);

  const { paths, monthlySpend } = runSimulation({
    monthlyIncome,
    categoryParams,
    totalBalance,
    numSims: NUM_SIMS,
  });

  const volatilityIndex = spendingVolatilityIndex(categoryParams);
  let forecastByMonth = computeForecastFromPaths(paths);
  const MEDIAN_VOL_NUDGE = 0.025;
  forecastByMonth = forecastByMonth.map((pt) => {
    const spread = pt.p50 - pt.p10;
    const nudgedP50 = pt.p50 - MEDIAN_VOL_NUDGE * Math.min(volatilityIndex, 1.2) * spread;
    return {
      ...pt,
      p50: Math.max(pt.p10, nudgedP50),
    };
  });
  const finalBalances = paths.map((p) => p[MONTHS_AHEAD]).sort((a, b) => a - b);
  const medianBalanceAt12Months = forecastByMonth[MONTHS_AHEAD]?.p50 ?? percentile(finalBalances, 50);

  // Raw simulation proportions, clamped so we never show 0% or 100% (reflects cash volatility)
  const probStaysPositive = clampDisplayProb(
    paths.filter((p) => p[MONTHS_AHEAD] > 0).length / NUM_SIMS
  );
  const probAboveStabilityBuffer = clampDisplayProb(
    paths.filter((p) => p[MONTHS_AHEAD] > STABILITY_BUFFER).length / NUM_SIMS
  );
  const probAbove1000 = paths.filter((p) => p[MONTHS_AHEAD] > 1000).length / NUM_SIMS;
  const probAbove5000 = paths.filter((p) => p[MONTHS_AHEAD] > 5000).length / NUM_SIMS;

  const monthRiskLabels = forecastByMonth.slice(1).map((d) => ({
    monthIndex: d.monthIndex,
    label: getMonthLabel(d.p10, d.p50, d.p90),
  }));

  const spendingByCategory: CategorySpending[] = Object.entries(categoryParams)
    .filter(([, p]) => p.mean > 5)
    .map(([cat, p]) => ({
      category: cat,
      expectedMonthly: p.mean,
      volatilityPct: (p.std / p.mean) * 100,
      isRecurring: RECURRING_CATEGORIES.has(cat),
    }))
    .sort((a, b) => b.expectedMonthly - a.expectedMonthly);

  const recurringMonthly = Object.entries(categoryParams)
    .filter(([c]) => RECURRING_CATEGORIES.has(c))
    .reduce((s, [, p]) => s + p.mean, 0);
  const discretionaryMonthly = Object.entries(categoryParams)
    .filter(([c]) => DISCRETIONARY_CATEGORIES.has(c) || !RECURRING_CATEGORIES.has(c))
    .reduce((s, [, p]) => s + p.mean, 0);

  const billMissThreshold = Math.max(300, Math.min(600, monthlyIncome.mean * 0.08));
  const probEverOverdraft = paths.filter((p) => p.some((b) => b < 0)).length / NUM_SIMS;
  const probEndOverdraft = paths.filter((p) => p[MONTHS_AHEAD] < 0).length / NUM_SIMS;
  // Each risk is its own share of paths; clamped so we never show 0% or 100% (reflects volatility)
  const riskOverdraft = clampDisplayProb(
    (1 - OVERDRAFT_BLEND_END) * probEverOverdraft + OVERDRAFT_BLEND_END * probEndOverdraft
  );
  const riskMissBill = clampDisplayProb(
    paths.filter((p) => p.some((b) => b < billMissThreshold)).length / NUM_SIMS
  );
  const riskTightMonth = clampDisplayProb(
    paths.filter((p) => p.some((b) => b < TIGHT_MONTH_THRESHOLD)).length / NUM_SIMS
  );
  const savingsBalance = options?.savingsBalance ?? 0;
  const dipIntoSavingsThreshold = totalBalance - savingsBalance * 0.4;
  const riskDipIntoSavings = clampDisplayProb(
    paths.filter((p) => p.some((b) => b < dipIntoSavingsThreshold)).length / NUM_SIMS
  );
  const creditLimit = options?.creditLimit ?? 10000;
  const riskHighCreditUtil = clampDisplayProb(
    paths.filter((p) => {
      const minBal = Math.min(...p);
      const impliedCreditUse = minBal < 0 ? Math.abs(minBal) : 0;
      return creditLimit > 0 && impliedCreditUse / creditLimit >= CREDIT_UTIL_WARN;
    }).length / NUM_SIMS
  );

  const riskFactors = buildRiskFactors(categoryParams, monthlyIncome);
  const meanSpend = monthlySpend.flat().reduce((a, b) => a + b, 0) / (NUM_SIMS * MONTHS_AHEAD);
  const behavioralModes = buildBehavioralModes(monthlySpend, meanSpend);

  const scenarioDeltas: ScenarioDelta[] = [];
  const baseOverdraft =
    (1 - OVERDRAFT_BLEND_END) * probEverOverdraft + OVERDRAFT_BLEND_END * probEndOverdraft;

  type ScenarioMod = {
    name: string;
    description: string;
    categoryParams: Record<string, { mean: number; std: number }>;
    extraSavingsPerMonth?: number;
  };
  const mods: ScenarioMod[] = [
    {
      name: 'Reduce discretionary spending by 10%',
      description: 'Cut non-essential spending 10%',
      categoryParams: Object.fromEntries(
        Object.entries(categoryParams).map(([c, p]) => [
          c,
          DISCRETIONARY_CATEGORIES.has(c) || !RECURRING_CATEGORIES.has(c)
            ? { mean: p.mean * 0.9, std: p.std * 0.95 }
            : p,
        ])
      ),
    },
    {
      name: 'Cancel 2 subscriptions (~$50/mo)',
      description: 'Remove ~$50/mo in subscriptions',
      categoryParams: (() => {
        const next = { ...categoryParams };
        if (next['Subscriptions']) {
          next['Subscriptions'] = {
            mean: Math.max(0, next['Subscriptions'].mean - 50),
            std: next['Subscriptions'].std,
          };
        }
        return next;
      })(),
    },
    {
      name: 'Save $50 more per paycheck',
      description: 'Add $100/mo to savings',
      categoryParams: Object.fromEntries(
        Object.entries(categoryParams).map(([c, p]) => [c, { mean: p.mean, std: p.std }])
      ),
      extraSavingsPerMonth: 100,
    },
  ];

  for (const mod of mods) {
    const extraSavings = mod.extraSavingsPerMonth ?? 0;
    const { paths: scenarioPaths } = runSimulation({
      monthlyIncome,
      categoryParams: mod.categoryParams,
      totalBalance,
      numSims: 300,
      extraSavingsPerMonth: extraSavings ?? 0,
    });
    const scenarioFinal = scenarioPaths.map((p) => p[MONTHS_AHEAD]).sort((a, b) => a - b);
    const scenarioOverdraft = scenarioPaths.filter((p) => p.some((b) => b < 0)).length / 300;
    const scenarioStability = scenarioPaths.filter((p) => p[MONTHS_AHEAD] > STABILITY_BUFFER).length / 300;
    scenarioDeltas.push({
      name: mod.name,
      description: mod.description,
      deltaOverdraftPct: (scenarioOverdraft - baseOverdraft) * 100,
      deltaMedianBalance: percentile(scenarioFinal, 50) - medianBalanceAt12Months,
      deltaStabilityPct: (scenarioStability - probAboveStabilityBuffer) * 100,
    });
  }

  const stressTests: StressTestResult[] = [];
  const stressConfigs: SimParams['stress'][] = [
    { incomeDelayMonths: 1 },
    { oneTimeExpense: 800 },
    { spendingBoostPct: 15, spendingBoostMonths: 2 },
  ];
  const stressNames = [
    { name: 'Income delayed 1 month', description: 'One paycheck missed or delayed' },
    { name: 'Unexpected $800 expense', description: 'e.g. car repair, medical' },
    { name: 'Spending +15% for 2 months', description: 'Temporary spending spike' },
  ];
  for (let i = 0; i < stressConfigs.length; i++) {
    const { paths: stressPaths } = runSimulation({
      monthlyIncome,
      categoryParams,
      totalBalance,
      numSims: 300,
      stress: stressConfigs[i],
    });
    const survival = stressPaths.filter((p) => p[MONTHS_AHEAD] > 0).length / 300;
    const minBalances = stressPaths.map((p) => Math.min(...p));
    const recoveryMonths = stressPaths.map((p) => {
      const minIdx = p.indexOf(Math.min(...p));
      let rec = 0;
      for (let m = minIdx; m < p.length; m++) {
        if (p[m] >= totalBalance * 0.9) {
          rec = m - minIdx;
          break;
        }
        rec = MONTHS_AHEAD - minIdx;
      }
      return rec;
    });
    stressTests.push({
      name: stressNames[i].name,
      description: stressNames[i].description,
      survivalProbability: survival,
      medianMinBalance: percentile(minBalances.sort((a, b) => a - b), 50),
      medianRecoveryMonths: percentile(recoveryMonths.sort((a, b) => a - b), 50),
    });
  }

  const emergencyGoal = options?.emergencyFundGoal ?? 5000;
  const goalHitCount = paths.filter((p) => p.some((b) => b >= emergencyGoal)).length;
  const monthsToHit = paths.map((path) => {
    const idx = path.findIndex((b) => b >= emergencyGoal);
    return idx === -1 ? MONTHS_AHEAD + 5 : idx;
  }).sort((a, b) => a - b);
  const goalForecast: GoalForecast = {
    goalName: 'Emergency fund ($5K)',
    targetAmount: emergencyGoal,
    targetMonths: MONTHS_AHEAD,
    probabilityHitByTarget: Math.min(1, paths.filter((p) => p[MONTHS_AHEAD] >= emergencyGoal).length / NUM_SIMS),
    medianMonthsToHit: percentile(monthsToHit, 50),
    worstCaseMonthsToHit: percentile(monthsToHit, 90),
    atRisk: percentile(monthsToHit, 50) > MONTHS_AHEAD,
  };

  const endingBalanceHistogram = buildHistogram(finalBalances, 12);
  const balanceDistributionsByPeriod: BalanceDistributionAtPeriod[] = DISTRIBUTION_PERIODS.map((monthIndex) => {
    const balances = paths.map((p) => p[monthIndex]).sort((a, b) => a - b);
    return {
      monthIndex,
      endDateLabel: getEndDateLabel(monthIndex),
      histogram: buildHistogram(balances, HISTOGRAM_BINS),
      median: percentile(balances, 50),
      p10: percentile(balances, 10),
      p90: percentile(balances, 90),
    };
  });
  const keyDrivers = buildKeyDrivers(categoryParams, riskFactors);
  const recommendations = buildRecommendations(
    baseOverdraft,
    scenarioDeltas,
    probAboveStabilityBuffer,
    keyDrivers
  );

  return {
    startingBalance: totalBalance,
    forecastByMonth,
    medianBalanceAt12Months,
    probStaysPositive,
    probAboveStabilityBuffer,
    probAbove1000,
    probAbove5000,
    monthRiskLabels,
    spendingByCategory,
    recurringMonthly,
    discretionaryMonthly,
    paycheckLinkedSpikeNote: transactions.filter((t) => t.amount > 0).length >= 2 ? 'Spending often rises after paydays.' : null,
    seasonalNote: null,
    riskOverdraft,
    riskMissBill,
    riskTightMonth,
    riskDipIntoSavings,
    riskHighCreditUtil,
    riskFactors,
    behavioralModes,
    scenarioDeltas,
    stressTests,
    goalForecast,
    endingBalanceHistogram,
    balanceDistributionsByPeriod,
    keyDrivers,
    recommendations,
  };
}

export function runMonteCarlo(transactions: Transaction[], totalBalance: number) {
  const full = runFullMonteCarlo(transactions, totalBalance);
  return {
    startingBalance: full.startingBalance,
    forecastByMonth: full.forecastByMonth,
    probStaysPositive: full.probStaysPositive,
    probAbove1000: full.probAbove1000,
    probAbove5000: full.probAbove5000,
    medianBalanceAt12Months: full.medianBalanceAt12Months,
    riskFactors: full.riskFactors,
  };
}
