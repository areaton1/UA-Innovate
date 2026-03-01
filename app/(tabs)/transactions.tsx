import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MOCK_ACCOUNTS,
  MOCK_TRANSACTIONS,
  MOCK_SUBSCRIPTIONS,
  type Transaction,
  type SubscriptionCategory,
} from '../data/mockData';
import { colors, spacing, typography } from '@/constants/theme';
import SubscriptionRow from '@/components/SubscriptionRow';
import SpendingBar from '@/components/SpendingBar';
import MiniBarChart from '@/components/MiniBarChart';

type ScreenMode = 'transactions' | 'radar';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ─── constants ───────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Groceries', 'Food & Dining', 'Shopping', 'Subscriptions', 'Gas', 'Income', 'Transfer', 'Interest'];

const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  Streaming: '#0069aa',
  Music:     '#f58025',
  Software:  '#414e58',
  Gaming:    '#2e7d32',
  Fitness:   '#7b1fa2',
  News:      '#795548',
};

const TREND_MONTHS = [
  { key: '2025-09', label: 'Sep' },
  { key: '2025-10', label: 'Oct' },
  { key: '2025-11', label: 'Nov' },
  { key: '2025-12', label: 'Dec' },
  { key: '2026-01', label: 'Jan' },
  { key: '2026-02', label: 'Feb' },
];

// ─── Radar view ──────────────────────────────────────────────────────────────

function RadarView() {
  const monthlyTotal = useMemo(
    () => MOCK_SUBSCRIPTIONS.reduce((sum, s) => sum + s.amount, 0),
    []
  );
  const annualTotal = monthlyTotal * 12;

  const categoryTotals = useMemo(() => {
    const map: Partial<Record<SubscriptionCategory, number>> = {};
    for (const sub of MOCK_SUBSCRIPTIONS) {
      map[sub.subCategory] = (map[sub.subCategory] ?? 0) + sub.amount;
    }
    return Object.entries(map)
      .map(([cat, amt]) => ({ cat: cat as SubscriptionCategory, amt: amt! }))
      .sort((a, b) => b.amt - a.amt);
  }, []);

  const trendData = useMemo(() => {
    return TREND_MONTHS.map(({ key, label }) => {
      const total = MOCK_TRANSACTIONS.filter(
        (tx) => tx.category === 'Subscriptions' && tx.date.startsWith(key)
      ).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      return { label, value: total };
    });
  }, []);

  const insights = useMemo(() => {
    const list: string[] = [];
    const topCat = categoryTotals[0];
    if (topCat) {
      const pct = Math.round((topCat.amt / monthlyTotal) * 100);
      list.push(`${topCat.cat} makes up ${pct}% of your monthly subscriptions ($${topCat.amt.toFixed(2)}/mo).`);
    }
    list.push(`You're spending $${annualTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/yr on subscriptions — that's ${Math.round((annualTotal / 2450) * 100)}% of one paycheck.`);
    const newest = [...MOCK_SUBSCRIPTIONS].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
    if (newest) {
      list.push(`${newest.name} is your newest subscription, added ${new Date(newest.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}.`);
    }
    const firstVal = trendData[0]?.value ?? 0;
    const lastVal = trendData[trendData.length - 1]?.value ?? 0;
    if (firstVal > 0) {
      const growth = Math.round(((lastVal - firstVal) / firstVal) * 100);
      list.push(`Subscription spending has grown ${growth}% over the last 6 months (+$${(lastVal - firstVal).toFixed(2)}/mo).`);
    }
    return list;
  }, [categoryTotals, monthlyTotal, annualTotal, trendData]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={radarStyles.scroll}>
      {/* Hero */}
      <View style={radarStyles.heroCard}>
        <View style={radarStyles.heroStat}>
          <Text style={radarStyles.heroValue}>
            ${monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={radarStyles.heroLabel}>per month</Text>
        </View>
        <View style={radarStyles.heroDivider} />
        <View style={radarStyles.heroStat}>
          <Text style={radarStyles.heroValue}>${Math.round(annualTotal).toLocaleString()}</Text>
          <Text style={radarStyles.heroLabel}>per year</Text>
        </View>
        <View style={radarStyles.heroDivider} />
        <View style={radarStyles.heroStat}>
          <Text style={radarStyles.heroValue}>{MOCK_SUBSCRIPTIONS.length}</Text>
          <Text style={radarStyles.heroLabel}>active</Text>
        </View>
      </View>

      {/* Category breakdown */}
      <View style={radarStyles.section}>
        <Text style={radarStyles.sectionTitle}>Category Breakdown</Text>
        <View style={radarStyles.card}>
          {categoryTotals.map(({ cat, amt }) => (
            <SpendingBar
              key={cat}
              label={cat}
              amount={amt}
              maxAmount={monthlyTotal}
              color={CATEGORY_COLORS[cat]}
              percentage={(amt / monthlyTotal) * 100}
            />
          ))}
        </View>
      </View>

      {/* Active subscriptions */}
      <View style={radarStyles.section}>
        <Text style={radarStyles.sectionTitle}>Active Subscriptions</Text>
        {MOCK_SUBSCRIPTIONS.map((sub) => (
          <SubscriptionRow key={sub.id} subscription={sub} />
        ))}
      </View>

      {/* 6-month trend */}
      <View style={radarStyles.section}>
        <Text style={radarStyles.sectionTitle}>6-Month Trend</Text>
        <View style={radarStyles.card}>
          <MiniBarChart data={trendData} color={colors.primary} highlightLast />
        </View>
      </View>

      {/* Insights */}
      <View style={radarStyles.section}>
        <Text style={radarStyles.sectionTitle}>Insights</Text>
        {insights.map((insight, i) => (
          <View key={i} style={radarStyles.insightCard}>
            <Text style={radarStyles.insightBullet}>💡</Text>
            <Text style={radarStyles.insightText}>{insight}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function TransactionsScreen() {
  const [mode, setMode] = useState<ScreenMode>('transactions');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      const matchAccount = selectedAccount === 'all' || tx.accountId === selectedAccount;
      const matchCategory = selectedCategory === 'All' || tx.category === selectedCategory;
      const matchSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchAccount && matchCategory && matchSearch;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedAccount, selectedCategory, searchQuery]);

  const totalDebit = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const totalCredit = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  function renderItem({ item }: { item: Transaction }) {
    const isPositive = item.amount > 0;
    return (
      <View style={styles.txCard}>
        <View style={[styles.txIconContainer, isPositive ? styles.positiveIcon : styles.negativeIcon]}>
          <Text style={styles.txIcon}>{isPositive ? '↓' : '↑'}</Text>
        </View>
        <View style={styles.txDetails}>
          <View style={styles.txRow}>
            <Text style={styles.txDescription} numberOfLines={1}>{item.description}</Text>
            <Text style={[styles.txAmount, isPositive ? styles.positiveAmt : styles.negativeAmt]}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
          <View style={styles.txMeta}>
            <Text style={styles.txCategory}>{item.category}</Text>
            <Text style={styles.txDot}> · </Text>
            <Text style={styles.txDate}>{formatDate(item.date)}</Text>
            {item.pending && (
              <>
                <Text style={styles.txDot}> · </Text>
                <Text style={styles.pendingText}>Pending</Text>
              </>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with segment toggle */}
      <View style={styles.header}>
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segment, mode === 'transactions' && styles.segmentActive]}
            onPress={() => setMode('transactions')}
          >
            <Text style={[styles.segmentText, mode === 'transactions' && styles.segmentTextActive]}>
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, mode === 'radar' && styles.segmentActive]}
            onPress={() => setMode('radar')}
          >
            <Text style={[styles.segmentText, mode === 'radar' && styles.segmentTextActive]}>
              ◉  Subscription Radar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {mode === 'radar' ? (
        <RadarView />
      ) : (
        <>
          <View style={styles.accountTabs}>
            <TouchableOpacity
              style={[styles.accountTab, selectedAccount === 'all' && styles.accountTabActive]}
              onPress={() => setSelectedAccount('all')}
            >
              <Text style={[styles.accountTabText, selectedAccount === 'all' && styles.accountTabTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {MOCK_ACCOUNTS.map((acct) => (
              <TouchableOpacity
                key={acct.id}
                style={[styles.accountTab, selectedAccount === acct.id && styles.accountTabActive]}
                onPress={() => setSelectedAccount(acct.id)}
              >
                <Text style={[styles.accountTabText, selectedAccount === acct.id && styles.accountTabTextActive]}>
                  {acct.type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === item && styles.categoryChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Money In</Text>
              <Text style={[styles.summaryValue, styles.positiveAmt]}>{formatCurrency(totalCredit)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Money Out</Text>
              <Text style={[styles.summaryValue, styles.negativeAmt]}>{formatCurrency(totalDebit)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Net</Text>
              <Text style={[styles.summaryValue, (totalCredit + totalDebit) >= 0 ? styles.positiveAmt : styles.negativeAmt]}>
                {formatCurrency(totalCredit + totalDebit)}
              </Text>
            </View>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No transactions found</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Radar styles ─────────────────────────────────────────────────────────────

const radarStyles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  heroCard: {
    backgroundColor: colors.navBg,
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroValue: { color: colors.white, fontSize: 22, fontWeight: '800' },
  heroLabel: { color: '#b0bec5', fontSize: 11, marginTop: 3, fontWeight: '500' },
  heroDivider: { width: 1, height: 40, backgroundColor: '#5a6a76' },
  section: { marginBottom: spacing.md },
  sectionTitle: { ...typography.headline, color: colors.text, marginBottom: 10 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  insightCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  insightBullet: { fontSize: 16, marginTop: 1 },
  insightText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 20 },
});

// ─── Transactions styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray },
  header: {
    backgroundColor: colors.navBg,
    paddingHorizontal: spacing.md,
    paddingTop: 14,
    paddingBottom: 10,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#2d3943',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: colors.white },
  segmentText: { fontSize: 13, fontWeight: '700', color: '#b0bec5' },
  segmentTextActive: { color: colors.navBg },
  accountTabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accountTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.offWhite,
  },
  accountTabActive: { backgroundColor: colors.navBg },
  accountTabText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  accountTabTextActive: { color: colors.white },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  clearSearch: { color: '#888', fontSize: 16, padding: 4 },
  categoryList: { paddingHorizontal: spacing.md, paddingBottom: 10, gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  categoryChipTextActive: { color: colors.white },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: colors.textMuted, fontSize: 11, marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: '700' },
  summaryDivider: { width: 1, backgroundColor: colors.border },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  txCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  txIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  positiveIcon: { backgroundColor: '#e8f5e9' },
  negativeIcon: { backgroundColor: '#fff3f3' },
  txIcon: { fontSize: 18, fontWeight: '700' },
  txDetails: { flex: 1 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txDescription: { fontWeight: '600', color: colors.text, fontSize: 14, flex: 1, marginRight: 8 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  positiveAmt: { color: '#2e7d32' },
  negativeAmt: { color: '#c62828' },
  txMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  txCategory: { color: colors.textMuted, fontSize: 12 },
  txDot: { color: '#bbb', fontSize: 12 },
  txDate: { color: colors.textMuted, fontSize: 12 },
  pendingText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: colors.textMuted, fontSize: 15 },
});
