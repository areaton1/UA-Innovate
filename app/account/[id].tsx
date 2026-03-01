import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_SUBSCRIPTIONS } from '../../data/mockData';
import { colors, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

function formatCurrency(amount: number) {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatCurrencyAbs(amount: number) {
  const abs = Math.abs(amount);
  return '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const account = MOCK_ACCOUNTS.find((a) => a.id === id);
  if (!account) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: colors.text, padding: spacing.md }}>Account not found.</Text>
      </SafeAreaView>
    );
  }

  const transactions = MOCK_TRANSACTIONS
    .filter((t) => t.accountId === id)
    .slice(0, 15);

  const subscriptions = MOCK_SUBSCRIPTIONS.filter((s) => s.accountId === id);

  const isCredit = account.type === 'Credit';
  const isSavings = account.type === 'Savings';
  const isChecking = account.type === 'Checking';

  const heroBg = isCredit ? colors.primary : colors.navBg;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navbar */}
      <View style={[styles.navbar, { backgroundColor: heroBg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>{account.name}</Text>
          <Text style={styles.navSubtitle}>{account.number}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero balance card ── */}
        <View style={[styles.heroCard, { backgroundColor: heroBg }]}>
          <View style={styles.heroRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroLabel}>
                {isCredit ? 'Balance Due' : 'Current Balance'}
              </Text>
              <Text style={styles.heroValue}>
                {isCredit ? formatCurrencyAbs(account.balance) : formatCurrency(account.balance)}
              </Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroLabel}>
                {isCredit ? 'Available Credit' : 'Available'}
              </Text>
              <Text style={styles.heroValue}>
                {formatCurrency(account.available)}
              </Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              {isCredit && (
                <>
                  <Text style={styles.heroLabel}>Credit Limit</Text>
                  <Text style={styles.heroValue}>{formatCurrency(account.creditLimit!)}</Text>
                </>
              )}
              {isSavings && (
                <>
                  <Text style={styles.heroLabel}>APY</Text>
                  <Text style={styles.heroValue}>{account.apy}%</Text>
                </>
              )}
              {isChecking && (
                <>
                  <Text style={styles.heroLabel}>APY</Text>
                  <Text style={styles.heroValue}>{account.apy}%</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* ── Account-type info strip ── */}
        {isChecking && (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Account Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Routing Number</Text>
              <Text style={styles.infoValue}>{account.routingNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Number</Text>
              <Text style={styles.infoValue}>{account.number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Type</Text>
              <Text style={styles.infoValue}>Virtual Wallet® — Performance Spend</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Interest Rate</Text>
              <Text style={styles.infoValue}>{account.apy}% APY</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Insurance</Text>
              <Text style={styles.infoValue}>FDIC Insured up to $250,000</Text>
            </View>
          </View>
        )}

        {isSavings && (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Account Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>APY</Text>
              <View style={styles.apyBadge}>
                <Text style={styles.apyBadgeText}>{account.apy}% APY</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Interest Earned YTD</Text>
              <Text style={[styles.infoValue, styles.positiveText]}>${account.interestEarnedYTD?.toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Type</Text>
              <Text style={styles.infoValue}>Virtual Wallet® — Performance Select</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Insurance</Text>
              <Text style={styles.infoValue}>FDIC Insured up to $250,000</Text>
            </View>

            {/* Savings goal progress bar */}
            {account.savingsGoal != null && (
              <View style={styles.goalSection}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalLabel}>Savings Goal</Text>
                  <Text style={styles.goalAmt}>
                    {formatCurrency(account.balance)} / {formatCurrency(account.savingsGoal)}
                  </Text>
                </View>
                <View style={styles.goalBarBg}>
                  <View
                    style={[
                      styles.goalBarFill,
                      { width: `${Math.min((account.balance / account.savingsGoal) * 100, 100)}%` as any },
                    ]}
                  />
                </View>
                <Text style={styles.goalPct}>
                  {((account.balance / account.savingsGoal) * 100).toFixed(1)}% of goal
                </Text>
              </View>
            )}
          </View>
        )}

        {isCredit && (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Payment Info</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Minimum Payment</Text>
                <Text style={[styles.infoValue, { color: '#c62828', fontWeight: '700' }]}>
                  ${account.minimumPayment?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Due Date</Text>
                <Text style={styles.infoValue}>{formatDateFull(account.paymentDueDate!)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Purchase APR</Text>
                <Text style={styles.infoValue}>{account.apr}% (variable)</Text>
              </View>
              {(() => {
                const utilPct = Math.abs(account.balance) / account.creditLimit! * 100;
                const utilColor =
                  utilPct < 10 ? '#2e7d32' :
                  utilPct < 30 ? '#F9A825' :
                  utilPct < 50 ? '#EF6C00' :
                  '#c62828';
                const utilLabel =
                  utilPct < 10 ? 'Excellent' :
                  utilPct < 30 ? 'Good' :
                  utilPct < 50 ? 'Fair' :
                  'High';
                return (
                  <View style={[styles.infoRow, styles.infoRowLast]}>
                    <Text style={styles.infoLabel}>Credit Utilization</Text>
                    <Text style={[styles.infoValue, { color: utilColor, fontWeight: '700' }]}>
                      {utilPct.toFixed(1)}% — {utilLabel}
                    </Text>
                  </View>
                );
              })()}
            </View>

            <View style={styles.infoCard}>
              <View style={styles.rewardsHeader}>
                <View>
                  <Text style={styles.infoCardTitle}>Cash Rewards</Text>
                  <Text style={styles.rewardsCashBack}>
                    ${account.rewardsCashBack?.toFixed(2)} available
                  </Text>
                </View>
                <View style={styles.rewardsBadge}>
                  <Text style={styles.rewardsBadgeText}>No Annual Fee</Text>
                </View>
              </View>
              <View style={styles.rewardsTierGrid}>
                <View style={styles.rewardsTier}>
                  <Text style={styles.rewardsTierRate}>4%</Text>
                  <Text style={styles.rewardsTierLabel}>Gas</Text>
                </View>
                <View style={styles.rewardsTier}>
                  <Text style={styles.rewardsTierRate}>3%</Text>
                  <Text style={styles.rewardsTierLabel}>Dining</Text>
                </View>
                <View style={styles.rewardsTier}>
                  <Text style={styles.rewardsTierRate}>2%</Text>
                  <Text style={styles.rewardsTierLabel}>Groceries</Text>
                </View>
                <View style={styles.rewardsTier}>
                  <Text style={styles.rewardsTierRate}>1%</Text>
                  <Text style={styles.rewardsTierLabel}>All Other</Text>
                </View>
              </View>
              <Text style={styles.rewardsCap}>
                4%/3%/2% rates apply to first $8,000 in combined annual purchases
              </Text>
            </View>
          </>
        )}

        {/* ── Recent Transactions ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions yet.</Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txLeft}>
                {tx.pending && (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Pending</Text>
                  </View>
                )}
                <Text style={styles.txDescription}>{tx.description}</Text>
                <Text style={styles.txMeta}>{tx.category} · {formatDate(tx.date)}</Text>
              </View>
              <Text style={[styles.txAmount, tx.amount > 0 && styles.positiveText]}>
                {formatCurrency(tx.amount)}
              </Text>
            </View>
          ))
        )}

        {/* ── Subscriptions ── */}
        {subscriptions.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: spacing.md }]}>
              <Text style={styles.sectionTitle}>Subscriptions</Text>
              <View style={styles.subCountBadge}>
                <Text style={styles.subCountText}>{subscriptions.length} active</Text>
              </View>
            </View>
            {subscriptions.map((sub) => (
              <View key={sub.id} style={styles.subRow}>
                <Ionicons name={sub.icon as any} size={18} color={colors.navBg} style={styles.subIcon} />
                <View style={styles.subInfo}>
                  <Text style={styles.subName}>{sub.name}</Text>
                  <Text style={styles.subNext}>Next billing: {formatDate(sub.nextBillingDate)}</Text>
                </View>
                <Text style={styles.subAmt}>-${sub.amount.toFixed(2)}/mo</Text>
              </View>
            ))}
            <View style={styles.subTotalRow}>
              <Text style={styles.subTotalLabel}>Monthly total</Text>
              <Text style={styles.subTotalAmt}>
                -${subscriptions.reduce((s, sub) => s + sub.amount, 0).toFixed(2)}/mo
              </Text>
            </View>
          </>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray },

  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  backBtn: { width: 60 },
  navCenter: { flex: 1, alignItems: 'center' },
  navTitle: { color: colors.white, fontWeight: '700', fontSize: 16 },
  navSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },

  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.md },

  heroCard: {
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginBottom: 4, textAlign: 'center' },
  heroValue: { color: colors.white, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  heroDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.25)' },

  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 4,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoRowLast: { marginBottom: spacing.sm },
  infoLabel: { color: colors.textMuted, fontSize: 13 },
  infoValue: { color: colors.text, fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: 8 },
  positiveText: { color: '#2e7d32' },

  apyBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  apyBadgeText: { color: '#2e7d32', fontWeight: '700', fontSize: 13 },

  goalSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    paddingBottom: spacing.sm,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalLabel: { color: colors.textMuted, fontSize: 13 },
  goalAmt: { color: colors.text, fontSize: 13, fontWeight: '600' },
  goalBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  goalBarFill: { height: 8, backgroundColor: colors.navBg, borderRadius: 4 },
  goalPct: { color: colors.textMuted, fontSize: 12, textAlign: 'right' },

  rewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rewardsCashBack: { fontSize: 22, fontWeight: '800', color: '#2e7d32', marginTop: 2 },
  rewardsBadge: {
    backgroundColor: colors.navBg + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rewardsBadgeText: { color: colors.navBg, fontWeight: '700', fontSize: 11 },
  rewardsTierGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginBottom: 10,
  },
  rewardsTier: { flex: 1, alignItems: 'center' },
  rewardsTierRate: { fontSize: 20, fontWeight: '800', color: colors.primary },
  rewardsTierLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  rewardsCap: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { ...typography.headline, color: colors.text },

  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyStateText: { color: colors.textMuted, fontSize: 14 },

  txRow: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  txLeft: { flex: 1, marginRight: 8 },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff3e0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  pendingText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  txDescription: { fontWeight: '600', color: colors.text, fontSize: 14 },
  txMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700', color: '#c62828' },

  subCountBadge: {
    backgroundColor: colors.navBg + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  subCountText: { color: colors.navBg, fontWeight: '700', fontSize: 12 },
  subRow: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 12,
  },
  subIcon: {},
  subInfo: { flex: 1 },
  subName: { fontWeight: '600', color: colors.text, fontSize: 14 },
  subNext: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  subAmt: { fontWeight: '700', color: '#c62828', fontSize: 14 },
  subTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  subTotalLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  subTotalAmt: { color: '#c62828', fontSize: 13, fontWeight: '800' },
});
