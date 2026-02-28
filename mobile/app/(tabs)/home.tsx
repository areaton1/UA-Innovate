import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MOCK_USER, MOCK_ACCOUNTS, MOCK_TRANSACTIONS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import ConfidenceScoreCard from '../components/ConfidenceScoreCard';
import SafeToSpendWidget from '../components/SafeToSpendWidget';
import ActionPlanCard from '../components/ActionPlanCard';

const PNC_ORANGE = '#EF7622';
const PNC_NAVY = '#003087';
const PNC_LIGHT_BLUE = '#E6F4FE';

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
      {/* Top Nav */}
      <View style={styles.navbar}>
        <Image
          source={require('../data/logo_pnc.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <Text style={styles.greeting}>Good morning, {MOCK_USER.name.split(' ')[0]}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Smart Insights Section */}
        <View style={styles.insightsBanner}>
          <View>
            <Text style={styles.insightsTitle}>✦ Financial Pulse</Text>
            <Text style={styles.insightsSubtitle}>AI-powered insights just for you</Text>
          </View>
          <View style={styles.insightsBadge}>
            <Text style={styles.insightsBadgeText}>SMART</Text>
          </View>
        </View>
        <ConfidenceScoreCard />
        <SafeToSpendWidget />
        <ActionPlanCard />

        {/* Accounts Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Accounts</Text>
          <TouchableOpacity onPress={() => setBalancesHidden((v) => !v)}>
            <Text style={styles.hideLink}>{balancesHidden ? 'Show' : 'Hide'} Balances</Text>
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
                {balancesHidden ? '••••••' : formatCurrency(account.type === 'Credit' ? account.balance : account.available)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 12 }]}>Quick Actions</Text>
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

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={styles.hideLink}>View All</Text>
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

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  insightsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PNC_NAVY,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  insightsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  insightsSubtitle: {
    color: '#A8C8E8',
    fontSize: 12,
    marginTop: 2,
  },
  insightsBadge: {
    backgroundColor: PNC_ORANGE,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  insightsBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  logoImage: {
    width: 120,
    height: 50,
    marginRight: 10,
  },
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  navbar: {
    backgroundColor: PNC_NAVY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoSmall: {
    backgroundColor: PNC_ORANGE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  logoSmallText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  greeting: { flex: 1, color: '#fff', fontWeight: '600', fontSize: 15 },
  signOutBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  signOutText: { color: '#A8C8E8', fontSize: 13, fontWeight: '600' },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  alertBanner: {
    backgroundColor: PNC_LIGHT_BLUE,
    borderLeftWidth: 4,
    borderLeftColor: PNC_NAVY,
    padding: 12,
    borderRadius: 8,
    marginBottom: 18,
  },
  alertText: { color: PNC_NAVY, fontSize: 13, fontWeight: '500' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  hideLink: { color: PNC_NAVY, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
    backgroundColor: PNC_NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditBadge: { backgroundColor: PNC_ORANGE },
  accountTypeBadgeText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  accountName: { fontWeight: '600', color: '#222', fontSize: 14 },
  accountNumber: { color: '#888', fontSize: 12, marginTop: 2 },
  accountCardRight: { alignItems: 'flex-end' },
  balanceLabel: { color: '#888', fontSize: 11, marginBottom: 2 },
  balanceAmount: { fontSize: 17, fontWeight: '700', color: '#222' },
  negativeBalance: { color: '#D32F2F' },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#fff',
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
  actionLabel: { fontSize: 11, fontWeight: '600', color: PNC_NAVY },
  txRow: {
    backgroundColor: '#fff',
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
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  pendingText: { color: PNC_ORANGE, fontSize: 10, fontWeight: '700' },
  txDescription: { fontWeight: '600', color: '#222', fontSize: 14 },
  txDate: { color: '#888', fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700', color: '#D32F2F' },
  positiveAmount: { color: '#2E7D32' },
});
