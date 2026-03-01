import { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Polyline, Rect, Circle } from 'react-native-svg';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS } from '../../data/mockData';
import { runFullMonteCarlo } from '../../lib/monteCarlo';
import type { FullForecastResult, HistogramBin, MonthRiskLabel, BalanceDistributionAtPeriod } from '../../lib/monteCarlo';
import { colors, spacing, typography } from '../../constants/theme';

const CHART_HEIGHT = 220;
const CHART_INNER_PADDING = { top: 20, right: 16, bottom: 28, left: 52 };
const HISTOGRAM_HEIGHT = 140;
const Y_PADDING_PCT = 0.08;

function formatCurrency(amount: number) {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

type ForecastPoint = FullForecastResult['forecastByMonth'][0];

function ProjectionChart({ data }: { data: FullForecastResult['forecastByMonth'] }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setContainerWidth(w);
  }, []);

  const chartWidth = Math.max(0, containerWidth - CHART_INNER_PADDING.left - CHART_INNER_PADDING.right);
  const chartHeight = CHART_HEIGHT - CHART_INNER_PADDING.top - CHART_INNER_PADDING.bottom;

  const allValues = data.flatMap((d) => [d.p10, d.p50, d.p90]);
  const dataMinY = Math.min(...allValues, 0);
  const dataMaxY = Math.max(...allValues);
  const dataRange = dataMaxY - dataMinY || 1;
  const pad = dataRange * Y_PADDING_PCT;
  const minY = dataMinY - pad;
  const maxY = dataMaxY + pad;
  const rangeY = maxY - minY || 1;

  const scaleY = (v: number) =>
    CHART_INNER_PADDING.top + chartHeight - ((v - minY) / rangeY) * chartHeight;
  const scaleX = (i: number) =>
    CHART_INNER_PADDING.left + (i / Math.max(1, data.length - 1)) * chartWidth;

  const bandPath =
    data.length > 0
      ? [
          `M ${scaleX(0)} ${scaleY(data[0].p90)}`,
          ...data.slice(1).map((d, i) => `L ${scaleX(i + 1)} ${scaleY(d.p90)}`),
          `L ${scaleX(data.length - 1)} ${scaleY(data[data.length - 1].p10)}`,
          ...data
            .slice(0, -1)
            .reverse()
            .map((d, i) => `L ${scaleX(data.length - 2 - i)} ${scaleY(d.p10)}`),
          'Z',
        ].join(' ')
      : '';

  const medianPoints = data.map((d, i) => `${scaleX(i)},${scaleY(d.p50)}`).join(' ');
  const yTicks = [minY, minY + rangeY * 0.25, minY + rangeY * 0.5, minY + rangeY * 0.75, maxY].filter(
    (_, i, arr) => arr.indexOf(_) === i
  );
  const xGridMonths = [0, 3, 6, 9, 12].filter((m) => m < data.length);
  const chartBottomY = CHART_INNER_PADDING.top + chartHeight;
  const chartTopY = CHART_INNER_PADDING.top;

  const handlePress = useCallback(
    (e: { nativeEvent: { locationX: number } }) => {
      if (containerWidth <= 0) return;
      const x = e.nativeEvent.locationX - CHART_INNER_PADDING.left;
      if (x < 0 || x > chartWidth) {
        setSelectedMonth(null);
        return;
      }
      const monthIndex = Math.round((x / chartWidth) * (data.length - 1));
      const clamped = Math.max(0, Math.min(monthIndex, data.length - 1));
      setSelectedMonth(clamped);
    },
    [containerWidth, chartWidth, data.length]
  );

  const selectedPoint: ForecastPoint | null = selectedMonth !== null ? data[selectedMonth] ?? null : null;

  return (
    <View style={chartStyles.wrapper}>
      <Text style={chartStyles.title}>12‑month balance projection</Text>
      <Text style={chartStyles.subtitle}>Tap the chart to see a month’s range · Shaded: 10th–90th · Line: median</Text>
      <View style={chartStyles.chartContainer} onLayout={onLayout}>
        {containerWidth > 0 && (
          <>
            <Pressable style={chartStyles.chartPressable} onPress={handlePress}>
              <Svg width={containerWidth} height={CHART_HEIGHT} style={chartStyles.svg}>
                <Defs>
                  <LinearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.25} />
                    <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.05} />
                  </LinearGradient>
                </Defs>
                {yTicks.map((tick, i) => (
                  <Line
                    key={`h-${i}`}
                    x1={CHART_INNER_PADDING.left}
                    y1={scaleY(tick)}
                    x2={CHART_INNER_PADDING.left + chartWidth}
                    y2={scaleY(tick)}
                    stroke={colors.border}
                    strokeWidth={1}
                    strokeDasharray="4,4"
                  />
                ))}
                {xGridMonths.map((monthIdx) => (
                  <Line
                    key={`v-${monthIdx}`}
                    x1={scaleX(monthIdx)}
                    y1={chartTopY}
                    x2={scaleX(monthIdx)}
                    y2={chartBottomY}
                    stroke={colors.border}
                    strokeWidth={1}
                    strokeDasharray="4,4"
                  />
                ))}
                <Path d={bandPath} fill="url(#bandFill)" />
                <Polyline
                  points={medianPoints}
                  fill="none"
                  stroke={colors.primary}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {selectedMonth !== null && selectedPoint !== null && (
                  <Circle
                    cx={scaleX(selectedMonth)}
                    cy={scaleY(selectedPoint.p50)}
                    r={5}
                    fill={colors.white}
                    stroke={colors.primary}
                    strokeWidth={2}
                  />
                )}
              </Svg>
            </Pressable>
            <View style={[chartStyles.yAxisLabels, { height: CHART_HEIGHT }]} pointerEvents="none">
              {yTicks.map((tick, i) => (
                <Text
                  key={i}
                  style={[chartStyles.yLabel, { top: scaleY(tick) - 8 }]}
                  numberOfLines={1}
                >
                  {formatCurrency(tick)}
                </Text>
              ))}
            </View>
            <View style={chartStyles.xAxis}>
              <Text style={chartStyles.xLabel}>Now</Text>
              <Text style={chartStyles.xLabel}>12 mo</Text>
            </View>
          </>
        )}
      </View>
      {selectedPoint !== null && selectedMonth !== null && (
        <View style={chartStyles.tooltip}>
          <Text style={chartStyles.tooltipTitle}>
            {selectedMonth === 0 ? 'Today' : `Month ${selectedMonth}`}
          </Text>
          <Text style={chartStyles.tooltipRow}>Median: {formatCurrency(selectedPoint.p50)}</Text>
          <Text style={chartStyles.tooltipRow}>Best case (90th): {formatCurrency(selectedPoint.p90)}</Text>
          <Text style={chartStyles.tooltipRow}>Worst case (10th): {formatCurrency(selectedPoint.p10)}</Text>
        </View>
      )}
    </View>
  );
}

const PERIOD_OPTIONS: { months: number; label: string }[] = [
  { months: 3, label: '3 mo' },
  { months: 6, label: '6 mo' },
  { months: 9, label: '9 mo' },
  { months: 12, label: '12 mo' },
];

function HistogramChart({
  bins,
  endDateLabel,
  median,
  p10,
  p90,
}: {
  bins: HistogramBin[];
  endDateLabel?: string;
  median?: number;
  p10?: number;
  p90?: number;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedBin, setSelectedBin] = useState<number | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setContainerWidth(w);
  }, []);

  const chartWidth = Math.max(0, containerWidth - 24);
  const gap = 2;
  const barWidth = bins.length ? (chartWidth - (bins.length - 1) * gap) / bins.length : 0;
  const maxPct = Math.max(...bins.map((b) => b.pct), 0.01);
  const barAreaHeight = HISTOGRAM_HEIGHT - 32;

  const handleHistogramPress = useCallback(
    (e: { nativeEvent: { locationX: number } }) => {
      const pressX = e.nativeEvent.locationX;
      const offset = (containerWidth - chartWidth) / 2;
      const x = pressX - Math.max(0, offset);
      if (x < 0 || barWidth <= 0) {
        setSelectedBin(null);
        return;
      }
      const i = Math.floor(x / (barWidth + gap));
      const clamped = Math.max(0, Math.min(i, bins.length - 1));
      setSelectedBin(selectedBin === clamped ? null : clamped);
    },
    [containerWidth, chartWidth, barWidth, gap, bins.length, selectedBin]
  );

  return (
    <View style={histogramStyles.wrapper} onLayout={onLayout}>
      {endDateLabel && (
        <Text style={histogramStyles.endDateLabel}>By {endDateLabel}</Text>
      )}
      <View style={histogramStyles.histogramContainer}>
        {containerWidth > 0 && (
          <Pressable onPress={handleHistogramPress} style={histogramStyles.histogramPressable}>
            <Svg width={chartWidth} height={HISTOGRAM_HEIGHT}>
              {bins.map((bin, i) => {
                const h = (bin.pct / maxPct) * barAreaHeight;
                const isSelected = selectedBin === i;
                return (
                  <Rect
                    key={i}
                    x={i * (barWidth + gap)}
                    y={HISTOGRAM_HEIGHT - 28 - h}
                    width={barWidth}
                    height={h}
                    fill={colors.primary}
                    opacity={isSelected ? 1 : 0.65}
                    rx={2}
                  />
                );
              })}
            </Svg>
          </Pressable>
        )}
      </View>
      <Text style={histogramStyles.caption}>Tap a bar to see balance range · % of simulations in that range</Text>
      {(median !== undefined && p10 !== undefined && p90 !== undefined) && (
        <View style={histogramStyles.summaryRow}>
          <Text style={histogramStyles.summaryItem}>Median: {formatCurrency(median)}</Text>
          <Text style={histogramStyles.summaryItem}>10th: {formatCurrency(p10)}</Text>
          <Text style={histogramStyles.summaryItem}>90th: {formatCurrency(p90)}</Text>
        </View>
      )}
      {selectedBin !== null && bins[selectedBin] && (
        <View style={histogramStyles.binTooltip}>
          <Text style={histogramStyles.binTooltipRange}>
            {formatCurrency(bins[selectedBin].min)} – {formatCurrency(bins[selectedBin].max)}
          </Text>
          <Text style={histogramStyles.binTooltipPct}>
            {Math.round(bins[selectedBin].pct * 100)}% of simulations
          </Text>
        </View>
      )}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4, width: '100%' },
  subtitle: { fontSize: 11, color: colors.textMuted, marginBottom: 8, width: '100%' },
  chartContainer: {
    width: '100%',
    maxWidth: 400,
    height: CHART_HEIGHT + 24,
    overflow: 'hidden',
    alignItems: 'center',
  },
  chartPressable: { width: '100%', height: CHART_HEIGHT },
  svg: { overflow: 'visible' },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: CHART_INNER_PADDING.left - 4,
  },
  yLabel: { fontSize: 10, color: colors.textMuted, position: 'absolute', right: 4 },
  xAxis: {
    position: 'absolute',
    bottom: 4,
    left: CHART_INNER_PADDING.left,
    right: CHART_INNER_PADDING.right,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xLabel: { fontSize: 11, color: colors.textMuted },
  tooltip: {
    width: '100%',
    maxWidth: 400,
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.offWhite,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  tooltipTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 },
  tooltipRow: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});

const histogramStyles = StyleSheet.create({
  wrapper: { marginTop: 8, width: '100%', alignItems: 'center' },
  histogramContainer: {
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    alignItems: 'center',
  },
  histogramPressable: { width: '100%', alignItems: 'center' },
  caption: { fontSize: 11, color: colors.textMuted, marginTop: 8, textAlign: 'center', width: '100%', maxWidth: 400 },
  endDateLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6, textAlign: 'center' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryItem: { fontSize: 12, fontWeight: '600', color: colors.text },
  binTooltip: {
    marginTop: 8,
    padding: 10,
    backgroundColor: colors.offWhite,
    borderRadius: 8,
    alignSelf: 'center',
    minWidth: 200,
    alignItems: 'center',
  },
  binTooltipRange: { fontSize: 13, fontWeight: '700', color: colors.text },
  binTooltipPct: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});

function getMonthName(monthIndex: number): string {
  const date = new Date(2026, 1 + monthIndex, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function labelColor(label: MonthRiskLabel): string {
  switch (label) {
    case 'Stable':
      return '#2e7d32';
    case 'At risk':
      return '#f9a825';
    case 'High volatility':
      return '#ef6c00';
    case 'Crisis-prone':
      return '#c62828';
    default:
      return colors.textMuted;
  }
}

export function ForecastContent() {
  const result = useMemo(() => {
    const totalBalance = MOCK_ACCOUNTS.reduce((sum, a) => sum + (a.balance ?? 0), 0);
    const credit = MOCK_ACCOUNTS.find((a) => a.type === 'Credit');
    const savings = MOCK_ACCOUNTS.find((a) => a.type === 'Savings');
    return runFullMonteCarlo(MOCK_TRANSACTIONS, totalBalance, {
      creditLimit: credit && 'creditLimit' in credit ? (credit as { creditLimit: number }).creditLimit : undefined,
      savingsBalance: savings?.balance ?? 0,
      emergencyFundGoal: 5000,
    });
  }, []) as FullForecastResult;

  const stabilityColor =
    result.probStaysPositive >= 0.8 ? '#2e7d32' : result.probStaysPositive >= 0.5 ? '#f9a825' : '#c62828';
  const maxCategorySpend = Math.max(
    400,
    ...result.spendingByCategory.map((x) => x.expectedMonthly),
    1
  );
  const [distributionPeriodMonths, setDistributionPeriodMonths] = useState(6);
  const selectedDistribution =
    result.balanceDistributionsByPeriod?.find((d) => d.monthIndex === distributionPeriodMonths) ?? null;

  return (
    <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Financial weather forecast */}
        <View style={styles.card}>
          <Text style={styles.sectionBadge}>Financial weather forecast</Text>
          <Text style={styles.cardTitle}>Balance projection</Text>
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: stabilityColor }]}>
                {Math.round(result.probStaysPositive * 100)}%
              </Text>
              <Text style={styles.metricLabel}>Chance balance stays positive</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{Math.round(result.probAboveStabilityBuffer * 100)}%</Text>
              <Text style={styles.metricLabel}>Above $500 buffer</Text>
            </View>
          </View>
          <View style={styles.probRow}>
            <Text style={styles.probText}>
              Median 12‑mo balance: {formatCurrency(result.medianBalanceAt12Months)} · Best/worst band: 10th–90th percentile
            </Text>
          </View>
          <ProjectionChart data={result.forecastByMonth} />
        </View>

        {/* 2. Spending behavior insights */}
        <View style={styles.card}>
          <Text style={styles.sectionBadge}>Spending behavior</Text>
          <Text style={styles.cardTitle}>Expected spending by category</Text>
          {result.spendingByCategory.map((c) => (
            <View key={c.category} style={styles.categoryRow}>
              <View style={styles.categoryLabelRow}>
                <Text style={styles.categoryName}>{c.category}</Text>
                <Text style={styles.categoryVolatility}>
                  {c.volatilityPct > 50 ? 'Variable' : 'Stable'} · {formatCurrency(c.expectedMonthly)}/mo
                </Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.min(100, (c.expectedMonthly / maxCategorySpend) * 100)}%` },
                  ]}
                />
              </View>
            </View>
          ))}
          <View style={styles.recurringRow}>
            <Text style={styles.recurringLabel}>Recurring (fixed):</Text>
            <Text style={styles.recurringValue}>{formatCurrency(result.recurringMonthly)}/mo</Text>
          </View>
          <View style={styles.recurringRow}>
            <Text style={styles.recurringLabel}>Discretionary:</Text>
            <Text style={styles.recurringValue}>{formatCurrency(result.discretionaryMonthly)}/mo</Text>
          </View>
          {result.paycheckLinkedSpikeNote && (
            <Text style={styles.note}>{result.paycheckLinkedSpikeNote}</Text>
          )}
        </View>

        {/* 3. Risk indicators */}
        <View style={styles.card}>
          <Text style={styles.sectionBadge}>Risk indicators</Text>
          <Text style={styles.cardTitle}>Probability of...</Text>
          <View style={styles.riskGrid}>
            <View style={styles.riskItem}>
              <Text style={styles.riskPct}>{Math.round(result.riskOverdraft * 100)}%</Text>
              <Text style={styles.riskLabel}>Overdraft</Text>
            </View>
            <View style={styles.riskItem}>
              <Text style={styles.riskPct}>{Math.round(result.riskMissBill * 100)}%</Text>
              <Text style={styles.riskLabel}>Missing a bill</Text>
            </View>
            <View style={styles.riskItem}>
              <Text style={styles.riskPct}>{Math.round(result.riskTightMonth * 100)}%</Text>
              <Text style={styles.riskLabel}>Tight month</Text>
            </View>
            <View style={styles.riskItem}>
              <Text style={styles.riskPct}>{Math.round(result.riskDipIntoSavings * 100)}%</Text>
              <Text style={styles.riskLabel}>Dipping into savings</Text>
            </View>
            <View style={styles.riskItem}>
              <Text style={styles.riskPct}>{Math.round(result.riskHighCreditUtil * 100)}%</Text>
              <Text style={styles.riskLabel}>High credit utilization</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Month-by-month outlook</Text>
          <View style={styles.monthLabels}>
            {result.monthRiskLabels.map(({ monthIndex, label }) => (
              <View key={monthIndex} style={styles.monthChip}>
                <Text style={styles.monthNum}>{getMonthName(monthIndex)}</Text>
                <Text style={[styles.monthLabel, { color: labelColor(label) }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 4. Behavioral modes */}
        <View style={styles.card}>
          <Text style={styles.sectionBadge}>Behavioral modes</Text>
          <Text style={styles.cardTitle}>What kind of month will it be?</Text>
          {result.behavioralModes.map((b) => (
            <View key={b.mode} style={styles.modeRow}>
              <Text style={styles.modeName}>{b.mode}</Text>
              <Text style={styles.modePct}>{Math.round(b.probability * 100)}%</Text>
            </View>
          ))}
          <Text style={styles.modeSubtext}>Based on spending vs. your typical level in the simulation.</Text>
        </View>

        {/* 5. Scenario comparisons */}
        <View style={styles.card}>
          <Text style={styles.sectionBadge}>Scenario comparisons</Text>
          <Text style={styles.cardTitle}>If you make a change...</Text>
          {result.scenarioDeltas.map((s) => (
            <View key={s.name} style={styles.scenarioCard}>
              <Text style={styles.scenarioName}>{s.name}</Text>
              <Text style={styles.scenarioDesc}>{s.description}</Text>
              <View style={styles.scenarioDeltas}>
                <Text style={styles.scenarioDelta}>
                  Overdraft risk: {s.deltaOverdraftPct <= 0 ? '' : '+'}{Math.round(s.deltaOverdraftPct)}%
                </Text>
                <Text style={styles.scenarioDelta}>
                  Median balance: {s.deltaMedianBalance >= 0 ? '+' : ''}{formatCurrency(s.deltaMedianBalance)}
                </Text>
                <Text style={styles.scenarioDelta}>
                  Stability (above $500): {s.deltaStabilityPct >= 0 ? '+' : ''}{Math.round(s.deltaStabilityPct)}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 6. Stress tests */}
        <View style={styles.card}>
          <Text style={styles.sectionBadge}>Stress tests</Text>
          <Text style={styles.cardTitle}>What if something goes wrong?</Text>
          {result.stressTests.map((t) => (
            <View key={t.name} style={styles.stressCard}>
              <Text style={styles.stressName}>{t.name}</Text>
              <Text style={styles.stressDesc}>{t.description}</Text>
              <View style={styles.stressMetrics}>
                <Text style={styles.stressMetric}>
                  Survival: {Math.round(t.survivalProbability * 100)}%
                </Text>
                <Text style={styles.stressMetric}>
                  Median min balance: {formatCurrency(t.medianMinBalance)}
                </Text>
                <Text style={styles.stressMetric}>
                  Recovery: ~{Math.round(t.medianRecoveryMonths)} months
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 7. Goal progress */}
        {result.goalForecast && (
          <View style={styles.card}>
            <Text style={styles.sectionBadge}>Goal forecast</Text>
            <Text style={styles.cardTitle}>{result.goalForecast.goalName}</Text>
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>Probability of hitting goal by 12 mo:</Text>
              <Text style={styles.goalValue}>{Math.round(result.goalForecast.probabilityHitByTarget * 100)}%</Text>
            </View>
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>Median months to reach goal:</Text>
              <Text style={styles.goalValue}>{Math.round(result.goalForecast.medianMonthsToHit)}</Text>
            </View>
            {result.goalForecast.atRisk && (
              <View style={styles.atRiskBanner}>
                <Text style={styles.atRiskText}>Goal at risk — consider saving more or extending timeline.</Text>
              </View>
            )}
          </View>
        )}

        {/* 8. Where you might end up by period */}
        <View style={styles.card}>
          <Text style={styles.sectionBadge}>Outcome distribution</Text>
          <Text style={styles.cardTitle}>Where you might end up in a specific period of time</Text>
          <Text style={styles.periodSubtitle}>Choose a time horizon to see the range of possible balances by that date.</Text>
          <View style={styles.periodSelector}>
            {PERIOD_OPTIONS.map((opt) => {
              const dist = result.balanceDistributionsByPeriod?.find((d) => d.monthIndex === opt.months);
              const isSelected = distributionPeriodMonths === opt.months;
              return (
                <Pressable
                  key={opt.months}
                  style={[styles.periodTab, isSelected && styles.periodTabActive]}
                  onPress={() => setDistributionPeriodMonths(opt.months)}
                >
                  <Text style={[styles.periodTabLabel, isSelected && styles.periodTabLabelActive]}>{opt.label}</Text>
                  {dist && (
                    <Text style={[styles.periodTabDate, isSelected && styles.periodTabDateActive]}>
                      By {dist.endDateLabel}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
          {selectedDistribution && (
            <HistogramChart
              bins={selectedDistribution.histogram}
              endDateLabel={selectedDistribution.endDateLabel}
              median={selectedDistribution.median}
              p10={selectedDistribution.p10}
              p90={selectedDistribution.p90}
            />
          )}
        </View>

        {/* 9. Key drivers */}
        <View style={styles.card}>
          <Text style={styles.sectionBadge}>Key drivers of instability</Text>
          <Text style={styles.cardTitle}>Why your forecast looks this way</Text>
          {result.keyDrivers.map((d) => (
            <View key={d.id} style={styles.driverRow}>
              <Text style={styles.driverBullet}>•</Text>
              <Text style={styles.driverText}>{d.statement}</Text>
            </View>
          ))}
        </View>

        {/* 10. Recommendations */}
        <View style={styles.card}>
          <Text style={styles.sectionBadge}>Recommendations</Text>
          <Text style={styles.cardTitle}>Personalized next steps</Text>
          {result.recommendations.map((r) => (
            <View key={r.id} style={styles.recRow}>
              <Text style={styles.recText}>{r.text}</Text>
              {r.impactSummary && (
                <Text style={styles.recImpact}>{r.impactSummary}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Behaviors adding risk */}
        <View style={styles.card}>
          <Text style={styles.sectionBadge}>From your data</Text>
          <Text style={styles.cardTitle}>Behaviors adding risk</Text>
          <Text style={styles.riskIntro}>
            These patterns are derived from your transaction history and spending volatility. Impact reflects share of income or variability.
          </Text>
          {result.riskFactors.map((r) => (
            <View key={r.id} style={styles.riskRow}>
              <View style={styles.riskBarBg}>
                <View
                  style={[
                    styles.riskBarFill,
                    r.severity === 'high' && styles.riskBarHigh,
                    r.severity === 'medium' && styles.riskBarMedium,
                    { width: `${Math.min(100, r.impactPercent)}%` },
                  ]}
                />
              </View>
              <View style={styles.riskTextRow}>
                <Text style={styles.riskTitle}>{r.title}</Text>
                <Text style={[styles.riskSeverity, r.severity === 'high' && styles.riskSeverityHigh]}>
                  {r.severity}
                </Text>
              </View>
              <Text style={styles.riskDesc}>{r.description}</Text>
            </View>
          ))}
          {result.riskFactors.length === 0 && (
            <Text style={styles.noRisk}>No major risk behaviors identified from your current transaction patterns.</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Monte Carlo simulation (600 paths) from your transactions. Model assumes a modest savings rate and small interest on positive balance.
          </Text>
          <Text style={styles.footerText}>Not financial advice.</Text>
        </View>
      </ScrollView>
  );
}

export default function FutureForecastScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Spending Forecast</Text>
      </View>
      <ForecastContent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray },
  header: {
    backgroundColor: colors.navBg,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  headerTitle: { color: colors.white, ...typography.titleSmall },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  metricRow: { flexDirection: 'row', alignItems: 'center' },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  metricLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  metricDivider: { width: 1, height: 36, backgroundColor: colors.border },
  probRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  probText: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  categoryRow: { marginBottom: 10 },
  categoryLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  categoryName: { fontSize: 13, fontWeight: '600', color: colors.text },
  categoryVolatility: { fontSize: 11, color: colors.textMuted },
  barBg: { height: 6, borderRadius: 3, backgroundColor: colors.offWhite, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
  recurringRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  recurringLabel: { fontSize: 13, color: colors.textMuted },
  recurringValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  note: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', marginTop: 8 },
  riskGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  riskItem: { minWidth: '28%', alignItems: 'center' },
  riskPct: { fontSize: 18, fontWeight: '800', color: colors.text },
  riskLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  monthLabels: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  monthChip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.offWhite, borderRadius: 8 },
  monthNum: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
  monthLabel: { fontSize: 11, fontWeight: '600' },
  modeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modeName: { fontSize: 14, color: colors.text },
  modePct: { fontSize: 14, fontWeight: '700', color: colors.text },
  modeSubtext: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  scenarioCard: {
    backgroundColor: colors.offWhite,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  scenarioName: { fontSize: 14, fontWeight: '700', color: colors.text },
  scenarioDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  scenarioDeltas: { marginTop: 8, gap: 4 },
  scenarioDelta: { fontSize: 12, color: colors.text },
  stressCard: {
    backgroundColor: colors.offWhite,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  stressName: { fontSize: 14, fontWeight: '700', color: colors.text },
  stressDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  stressMetrics: { marginTop: 8, gap: 4 },
  stressMetric: { fontSize: 12, color: colors.text },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalLabel: { fontSize: 13, color: colors.textMuted },
  goalValue: { fontSize: 13, fontWeight: '700', color: colors.text },
  atRiskBanner: { marginTop: 10, padding: 10, backgroundColor: '#fff3e0', borderRadius: 8 },
  atRiskText: { fontSize: 12, color: '#e65100', fontWeight: '600' },
  periodSubtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  periodSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  periodTab: {
    flex: 1,
    minWidth: 72,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
  },
  periodTabActive: { backgroundColor: colors.primary },
  periodTabLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  periodTabLabelActive: { color: colors.white },
  periodTabDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  periodTabDateActive: { color: colors.white, opacity: 0.9 },
  driverRow: { flexDirection: 'row', marginBottom: 6 },
  driverBullet: { marginRight: 8, fontSize: 14, color: colors.primary },
  driverText: { flex: 1, fontSize: 13, color: colors.text },
  recRow: { marginBottom: 12 },
  recText: { fontSize: 13, color: colors.text },
  recImpact: { fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 4 },
  riskIntro: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  riskRow: { marginBottom: 14 },
  riskBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.offWhite,
    overflow: 'hidden',
    marginBottom: 6,
  },
  riskBarFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
  riskBarHigh: { backgroundColor: '#c62828' },
  riskBarMedium: { backgroundColor: '#f9a825' },
  riskTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  riskTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  riskSeverity: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  riskSeverityHigh: { color: '#c62828' },
  riskDesc: { fontSize: 12, color: colors.textMuted },
  noRisk: { fontSize: 14, color: colors.textMuted, fontStyle: 'italic' },
  footer: { paddingVertical: spacing.md },
  footerText: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
});
