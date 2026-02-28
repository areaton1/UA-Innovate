import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MOCK_USER, MOCK_ACCOUNTS, MOCK_TRANSACTIONS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '@/constants/theme';
import ConfidenceScoreCard from '@/components/ConfidenceScoreCard';
import SafeToSpendWidget from '@/components/SafeToSpendWidget';
import ActionPlanCard from '@/components/ActionPlanCard';

const PncLogo = require('@/assets/pnc-logo-rev.svg').default;

function formatCurrency(amount: number) {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HomeScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [balancesHidden, setBalancesHidden] = useState(false);

  const recentTransactions = MOCK_TRANSACTIONS.filter((t) => t.accountId === '1').slice(0, 4);

  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navbar}>
        <PncLogo width={80} height={32} />
        <Text style={styles.greeting}>Good morning, {MOCK_USER.name.split(' ')[0]}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Financial Pulse Section */}
        <View style={styles.pulseBanner}>
          <View>
            <Text style={styles.pulseTitle}>✦ Financial Pulse</Text>
            <Text style={styles.pulseSubtitle}>AI-powered insights just for you</Text>
          </View>
          <View style={styles.pulseBadge}>
            <Text style={styles.pulseBadgeText}>SMART</Text>
          </View>
        </View>
        <ConfidenceScoreCard />
        <SafeToSpendWidget />
        <ActionPlanCard />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Accounts</Text>
          <TouchableOpacity onPress={() => setBalancesHidden((v) => !v)}>
            <Text style={styles.actionLink}>{balancesHidden ? 'Show' : 'Hide'} Balances</Text>
          </TouchableOpacity>
        </View>

        {MOCK_ACCOUNTS.map((account) => (
          <TouchableOpacity key={account.id} style={styles.accountCard} activeOpacity={0.8}>
            <View style={styles.accountCardLeft}>
              <View style={[styles.accountTypeBadge, account.type === 'Credit' && styles.creditBadge]}>
                <Text style={styles.accountTypeBadgeText}>{account.type.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountNumber}>{account.number}</Text>
              </View>
            </View>
            <View style={styles.accountCardRight}>
              <Text style={styles.balanceLabel}>
                {account.type === 'Credit' ? 'Balance Due' : 'Available'}
              </Text>
              <Text
                style={[
                  styles.balanceAmount,
                  account.balance < 0 && styles.negativeBalance,
                ]}
              >
                {balancesHidden
                  ? '••••••'
                  : formatCurrency(account.type === 'Credit' ? account.balance : account.available)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: spacing.md, marginBottom: 12 }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActions}>
          {[
            { label: 'Transfer', icon: '↔' },
            { label: 'Pay Bills', icon: '📄' },
            { label: 'Deposit', icon: '📱' },
            { label: 'Zelle®', icon: '⚡' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionBtn}
              onPress={() => Alert.alert(action.label, 'This feature is coming soon!')}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={styles.actionLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <View style={styles.txLeft}>
              {tx.pending && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>Pending</Text>
                </View>
              )}
              <Text style={styles.txDescription}>{tx.description}</Text>
              <Text style={styles.txDate}>{tx.category} · {formatDate(tx.date)}</Text>
            </View>
            <Text style={[styles.txAmount, tx.amount > 0 && styles.positiveAmount]}>
              {formatCurrency(tx.amount)}
            </Text>
          </View>
        ))}

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pulseBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#003087',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  pulseTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pulseSubtitle: {
    color: '#A8C8E8',
    fontSize: 12,
    marginTop: 2,
  },
  pulseBadge: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pulseBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  container: { flex: 1, backgroundColor: colors.gray },
  navbar: {
    backgroundColor: colors.navBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  greeting: { flex: 1, color: colors.white, fontWeight: '600', fontSize: 15, marginLeft: 10 },
  signOutBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  signOutText: { color: '#b0bec5', fontSize: 13, fontWeight: '600' },
  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  alertBanner: {
    backgroundColor: '#e8f0f7',
    borderLeftWidth: 4,
    borderLeftColor: colors.navBg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 18,
  },
  alertText: { color: colors.navBg, fontSize: 13, fontWeight: '500' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { ...typography.headline, color: colors.text },
  actionLink: { color: colors.link, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  accountCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  accountCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountTypeBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.navBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditBadge: { backgroundColor: colors.primary },
  accountTypeBadgeText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  accountName: { fontWeight: '600', color: colors.text, fontSize: 14 },
  accountNumber: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  accountCardRight: { alignItems: 'flex-end' },
  balanceLabel: { color: colors.textMuted, fontSize: 11, marginBottom: 2 },
  balanceAmount: { ...typography.titleSmall, color: colors.text },
  negativeBalance: { color: '#c62828' },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: colors.navBg },
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
  txDate: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700', color: '#c62828' },
  positiveAmount: { color: '#2e7d32' },
});
